"use server";

import { redirect } from "next/navigation";
import { revalidatePath, updateTag } from "next/cache";
import { after } from "next/server";
import { MAX_IMAGES_PER_PROJECT, TAGS, type Project, type Site, type TagId } from "@/lib/data";
import { checkPassword, createSession, destroySession, isAuthenticated } from "@/lib/auth";
import {
  CONTENT_TAG,
  deleteFiles,
  getAllProjectsFresh,
  getSiteFresh,
  isAllowedAssetUrl,
  isValidImage,
  mutateProjects,
  pruneOldVersions,
  referencedFiles,
  saveSite,
  uniqueSlug,
} from "@/lib/store";

/*
 * All admin mutations. None of these receive file contents — images and the
 * CV are uploaded straight from the browser (see /api/admin/upload) and only
 * their URLs + dimensions arrive here, so request bodies stay tiny and well
 * under Vercel's 4.5 MB function limit.
 */

export type FormState = { error?: string } | undefined;
export type ActionResult = { ok: true; slug?: string } | { ok: false; error: string };

const VALID_TAGS = new Set<string>(TAGS.map((t) => t.id));

function contentChanged(slug?: string) {
  // Expire the cached content immediately so the next render — admin or
  // public — reads what was just written.
  updateTag(CONTENT_TAG);
  revalidatePath("/");
  revalidatePath("/admin");
  if (slug) revalidatePath(`/projects/${slug}`);
  // Old versions are only an undo history; trimming them on every save would
  // cost an extra list() call each time, so do it every few saves.
  if (Math.random() < 0.25) after(pruneOldVersions);
}

/** Deletes files that were dropped from content, once the response is sent. */
function cleanUpFilesLater(candidates: string[], projects: Project[], site?: Site) {
  if (!candidates.length) return;
  after(async () => {
    const stillUsed = referencedFiles(projects, site ?? (await getSiteFresh()));
    const orphaned = candidates.filter((src) => !stillUsed.has(src.split("?")[0]));
    if (orphaned.length) await deleteFiles(orphaned);
  });
}

function fail(error: string): ActionResult {
  return { ok: false, error };
}

function errorText(err: unknown) {
  console.error("[admin action]", err);
  return err instanceof Error ? err.message : "Something went wrong.";
}

// ---- Auth --------------------------------------------------------------------

export async function loginAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return { error: "Wrong password." };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

// ---- Projects ------------------------------------------------------------------

function readProjectFields(formData: FormData) {
  const str = (k: string) => String(formData.get(k) ?? "").trim();
  const tags = formData
    .getAll("tags")
    .map(String)
    .filter((t): t is TagId => VALID_TAGS.has(t));

  let images: unknown = [];
  try {
    images = JSON.parse(String(formData.get("images") ?? "[]"));
  } catch {
    images = null;
  }

  return {
    title: str("title"),
    slugInput: str("slug"),
    tool: str("tool"),
    date: str("date"),
    time: str("time"),
    description: str("description"),
    active: formData.get("active") === "on",
    tags: [...new Set(tags)],
    images,
  };
}

/**
 * Creates (originalSlug = null) or updates a project, including its ordered
 * image list. Images removed in the editor are deleted from storage after
 * the save succeeds.
 */
export async function saveProjectAction(
  originalSlug: string | null,
  formData: FormData
): Promise<ActionResult> {
  if (!(await isAuthenticated())) return fail("Your session expired — please sign in again.");

  const f = readProjectFields(formData);
  if (!f.title) return fail("Title is required.");
  if (!Array.isArray(f.images) || !f.images.every(isValidImage)) {
    return fail("The image list is invalid — please reload the page and try again.");
  }
  if (f.images.length === 0) return fail("Add at least one image.");
  if (f.images.length > MAX_IMAGES_PER_PROJECT) {
    return fail(`Up to ${MAX_IMAGES_PER_PROJECT} images per project.`);
  }
  const images = f.images.map(({ src, width, height }) => ({
    src,
    width: Math.round(width),
    height: Math.round(height),
  }));

  try {
    let slug = originalSlug ?? "";
    let removed: string[] = [];

    const { after: saved } = await mutateProjects((all) => {
      if (originalSlug === null) {
        slug = uniqueSlug(f.slugInput || f.title, all);
        const project: Project = {
          slug,
          title: f.title,
          tags: f.tags,
          tool: f.tool,
          date: f.date,
          time: f.time,
          description: f.description,
          images,
          active: f.active,
        };
        // Newest first, so a new project shows up at the top of the site.
        all.unshift(project);
        return;
      }

      const i = all.findIndex((p) => p.slug === originalSlug);
      if (i === -1) throw new Error("This project no longer exists.");
      const existing = all[i];
      const keep = new Set(images.map((img) => img.src));
      removed = existing.images.map((img) => img.src).filter((src) => !keep.has(src));
      all[i] = {
        ...existing,
        title: f.title,
        tags: f.tags,
        tool: f.tool,
        date: f.date,
        time: f.time,
        description: f.description,
        images,
        active: f.active,
      };
    });

    contentChanged(slug);
    cleanUpFilesLater(removed, saved);
    return { ok: true, slug };
  } catch (err) {
    return fail(errorText(err));
  }
}

export async function setProjectActiveAction(slug: string, active: boolean): Promise<ActionResult> {
  if (!(await isAuthenticated())) return fail("Your session expired — please sign in again.");
  try {
    await mutateProjects((all) => {
      const p = all.find((x) => x.slug === slug);
      if (!p) throw new Error("This project no longer exists.");
      p.active = active;
    });
    contentChanged(slug);
    return { ok: true };
  } catch (err) {
    return fail(errorText(err));
  }
}

export async function deleteProjectAction(slug: string): Promise<ActionResult> {
  if (!(await isAuthenticated())) return fail("Your session expired — please sign in again.");
  try {
    let removedFiles: string[] = [];
    const { after: saved } = await mutateProjects((all) => {
      const p = all.find((x) => x.slug === slug);
      removedFiles = p?.images.map((img) => img.src) ?? [];
      return all.filter((x) => x.slug !== slug);
    });
    contentChanged(slug);
    cleanUpFilesLater(removedFiles, saved);
    return { ok: true };
  } catch (err) {
    return fail(errorText(err));
  }
}

/** Saves a new project order (as shown on the public site). */
export async function reorderProjectsAction(slugs: string[]): Promise<ActionResult> {
  if (!(await isAuthenticated())) return fail("Your session expired — please sign in again.");
  try {
    await mutateProjects((all) => {
      const pos = new Map(slugs.map((s, i) => [s, i]));
      // Projects missing from `slugs` (e.g. created meanwhile) keep their
      // relative order and go after the explicitly ordered ones.
      return all
        .map((p, i) => ({ p, key: pos.has(p.slug) ? pos.get(p.slug)! : slugs.length + i }))
        .sort((a, b) => a.key - b.key)
        .map((x) => x.p);
    });
    contentChanged();
    return { ok: true };
  } catch (err) {
    return fail(errorText(err));
  }
}

/**
 * Deletes files that were uploaded in the editor but removed again before
 * saving. Anything still referenced by saved content is left alone.
 */
export async function discardUploadsAction(srcs: string[]): Promise<ActionResult> {
  if (!(await isAuthenticated())) return fail("Your session expired — please sign in again.");
  if (!Array.isArray(srcs) || !srcs.every((s) => typeof s === "string" && isAllowedAssetUrl(s))) {
    return fail("Invalid file list.");
  }
  const [projects, site] = await Promise.all([getAllProjectsFresh(), getSiteFresh()]);
  const used = referencedFiles(projects, site);
  const orphaned = srcs.filter((s) => !used.has(s.split("?")[0]));
  if (orphaned.length) await deleteFiles(orphaned);
  return { ok: true };
}

// ---- Site texts ------------------------------------------------------------------

export async function updateSiteAction(formData: FormData): Promise<ActionResult> {
  if (!(await isAuthenticated())) return fail("Your session expired — please sign in again.");

  const str = (k: string) => String(formData.get(k) ?? "").trim();
  const cvUrl = str("cvUrl");
  if (cvUrl && !isAllowedAssetUrl(cvUrl)) return fail("The CV link is invalid.");

  try {
    const previous = await getSiteFresh();
    const site: Site = {
      name: str("name"),
      heroLead: str("heroLead"),
      heroSecondary: str("heroSecondary"),
      about: String(formData.get("about") ?? "")
        .split(/\n\s*\n|\n/)
        .map((s) => s.trim())
        .filter(Boolean),
      contact: {
        tel: str("tel"),
        email: str("email"),
        instagram: str("instagram"),
        behance: str("behance"),
        linkedin: str("linkedin"),
        cvUrl,
      },
    };
    await saveSite(site);
    contentChanged();

    const oldCv = previous.contact.cvUrl;
    if (oldCv && oldCv.split("?")[0] !== cvUrl.split("?")[0]) {
      const projects = await getAllProjectsFresh();
      cleanUpFilesLater([oldCv], projects, site);
    }
    return { ok: true };
  } catch (err) {
    return fail(errorText(err));
  }
}
