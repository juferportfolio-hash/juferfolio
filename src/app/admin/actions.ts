"use server";

import fs from "node:fs";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { MAX_IMAGES_PER_PROJECT, type Project, type Site, type TagId } from "@/lib/data";
import { checkPassword, createSession, destroySession, isAuthenticated } from "@/lib/auth";
import {
  deleteProject as deleteProjectStore,
  deleteProjectImageFile,
  ensureProjectImageDir,
  getProjectAny,
  getSite,
  saveProjectImage,
  saveSite,
  setProjectActive,
  uniqueSlug,
  upsertProject,
} from "@/lib/store";

export type FormState = { error?: string } | undefined;

function revalidateEverywhere(slug?: string) {
  revalidatePath("/");
  revalidatePath("/admin");
  if (slug) {
    revalidatePath(`/projects/${slug}`);
    revalidatePath(`/admin/projects/${slug}/edit`);
  }
}

// ---- Auth -------------------------------------------------------------

export async function loginAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (!checkPassword(password)) {
    return { error: "Wrong password." };
  }
  await createSession();
  redirect("/admin");
}

export async function logoutAction(_formData: FormData) {
  await destroySession();
  redirect("/admin/login");
}

// ---- Projects -------------------------------------------------------------

export async function createProjectAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAuthenticated())) return { error: "Not signed in." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const tags = formData.getAll("tags").map(String) as TagId[];
  const tool = String(formData.get("tool") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const active = formData.get("active") === "on";
  const slugInput = String(formData.get("slug") ?? "").trim();

  const mainImage = formData.get("mainImage");
  if (!(mainImage instanceof File) || mainImage.size === 0) {
    return { error: "A main image is required." };
  }
  const extraImages = formData.getAll("images").filter(
    (f): f is File => f instanceof File && f.size > 0
  );
  if (1 + extraImages.length > MAX_IMAGES_PER_PROJECT) {
    return { error: `Up to ${MAX_IMAGES_PER_PROJECT} images per project — remove some and try again.` };
  }

  const slug = uniqueSlug(slugInput || title);

  const images = [await saveProjectImage(slug, mainImage)];
  for (const f of extraImages) {
    images.push(await saveProjectImage(slug, f));
  }

  const project: Project = { slug, title, tags, tool, date, time, description, images, active };
  upsertProject(project);
  revalidateEverywhere(slug);
  redirect(`/admin/projects/${slug}/edit?created=1`);
}

export async function updateProjectAction(
  slug: string,
  _prevState: FormState,
  formData: FormData
): Promise<FormState> {
  if (!(await isAuthenticated())) return { error: "Not signed in." };

  const existing = getProjectAny(slug);
  if (!existing) return { error: "Project not found." };

  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { error: "Title is required." };

  const tags = formData.getAll("tags").map(String) as TagId[];
  const tool = String(formData.get("tool") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const active = formData.get("active") === "on";

  const updated: Project = { ...existing, title, tags, tool, date, time, description, active };
  upsertProject(updated);
  revalidateEverywhere(slug);
  redirect(`/admin/projects/${slug}/edit?saved=1`);
}

export async function deleteProjectAction(slug: string, _formData: FormData) {
  if (!(await isAuthenticated())) return;
  deleteProjectStore(slug);
  revalidateEverywhere();
  redirect("/admin");
}

export async function toggleActiveAction(slug: string, _formData: FormData) {
  if (!(await isAuthenticated())) return;
  const existing = getProjectAny(slug);
  if (!existing) return;
  setProjectActive(slug, !existing.active);
  revalidateEverywhere(slug);
}

// ---- Project images -------------------------------------------------------------

export async function addProjectImagesAction(slug: string, formData: FormData) {
  if (!(await isAuthenticated())) return;
  const existing = getProjectAny(slug);
  if (!existing) return;

  const files = formData.getAll("images").filter(
    (f): f is File => f instanceof File && f.size > 0
  );
  const room = MAX_IMAGES_PER_PROJECT - existing.images.length;
  const toAdd = files.slice(0, Math.max(0, room));

  ensureProjectImageDir(slug);
  for (const f of toAdd) {
    existing.images.push(await saveProjectImage(slug, f));
  }
  upsertProject(existing);
  revalidateEverywhere(slug);
}

export async function deleteProjectImageAction(slug: string, imageIndex: number, _formData: FormData) {
  if (!(await isAuthenticated())) return;
  const existing = getProjectAny(slug);
  if (!existing) return;
  if (existing.images.length <= 1) return; // always keep a cover image

  const [removed] = existing.images.splice(imageIndex, 1);
  if (removed) deleteProjectImageFile(removed.src);
  upsertProject(existing);
  revalidateEverywhere(slug);
}

export async function moveProjectImageAction(
  slug: string,
  imageIndex: number,
  direction: -1 | 1,
  _formData: FormData
) {
  if (!(await isAuthenticated())) return;
  const existing = getProjectAny(slug);
  if (!existing) return;

  const j = imageIndex + direction;
  if (j < 0 || j >= existing.images.length) return;
  const arr = existing.images;
  [arr[imageIndex], arr[j]] = [arr[j], arr[imageIndex]];
  upsertProject(existing);
  revalidateEverywhere(slug);
}

// ---- Site texts -------------------------------------------------------------

export async function updateSiteAction(_prevState: FormState, formData: FormData): Promise<FormState> {
  if (!(await isAuthenticated())) return { error: "Not signed in." };

  // The CV is a PDF upload, not a plain URL field: keep whatever's currently
  // set unless a new file was chosen, so re-saving the rest of the form
  // never accidentally clears it.
  let cvUrl = getSite().contact.cvUrl;
  const cvFile = formData.get("cvFile");
  if (cvFile instanceof File && cvFile.size > 0) {
    const isPdf =
      cvFile.type === "application/pdf" || cvFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) return { error: "CV must be a PDF file." };

    const dir = path.join(process.cwd(), "public", "documents");
    fs.mkdirSync(dir, { recursive: true });
    const buffer = Buffer.from(await cvFile.arrayBuffer());
    fs.writeFileSync(path.join(dir, "cv.pdf"), buffer);
    cvUrl = `/documents/cv.pdf?v=${Date.now()}`;
  }

  const site: Site = {
    name: String(formData.get("name") ?? "").trim(),
    heroLead: String(formData.get("heroLead") ?? "").trim(),
    heroSecondary: String(formData.get("heroSecondary") ?? "").trim(),
    about: String(formData.get("about") ?? "")
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean),
    contact: {
      tel: String(formData.get("tel") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      instagram: String(formData.get("instagram") ?? "").trim(),
      behance: String(formData.get("behance") ?? "").trim(),
      linkedin: String(formData.get("linkedin") ?? "").trim(),
      cvUrl,
    },
  };
  saveSite(site);
  revalidatePath("/");
  revalidatePath("/admin/site");
  redirect("/admin/site?saved=1");
}
