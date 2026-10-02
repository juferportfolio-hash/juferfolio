import "server-only";
import fs from "node:fs/promises";
import path from "node:path";
import { unstable_cache } from "next/cache";
import { del, head, list, put } from "@vercel/blob";
import type { Project, ProjectImage, Site } from "@/lib/data";

/*
 * Content storage
 * ===============
 *
 * Two backends, picked by whether BLOB_READ_WRITE_TOKEN is set:
 *
 * - "fs"   (local dev without a token): data/*.json on disk, uploads under
 *          public/. Fine anywhere with a writable, persistent disk.
 * - "blob" (Vercel): Vercel Blob. Serverless functions have a read-only
 *          filesystem, so every write goes here.
 *
 * Why versioned files instead of overwriting data/projects.json:
 * a public Blob store serves files through a CDN that caches each URL for at
 * least 60 seconds (cacheControlMaxAge can't go lower), so overwriting the
 * same pathname meant reads could return the previous version for up to a
 * minute — edits "didn't stick", and a second edit made within that minute
 * read the stale copy and silently threw the first one away.
 *
 * Instead every save writes a NEW immutable file
 *   content/projects/<timestamp>-<random>.json
 * and reads pick the newest one via list() (an API call, not CDN-cached).
 * The immutable files themselves can then be cached forever. A handful of
 * previous versions are kept as an undo history; older ones are pruned.
 *
 * Reads used for rendering go through Next's data cache (tag "content"), so
 * the public site doesn't hit Blob on every request; every admin write calls
 * updateTag("content") so changes show up immediately.
 */

export const STORAGE_MODE: "blob" | "fs" = process.env.BLOB_READ_WRITE_TOKEN ? "blob" : "fs";
const USE_BLOB = STORAGE_MODE === "blob";

export const CONTENT_TAG = "content";

type Doc = "projects" | "site";
type Content = { projects: Project[]; site: Site };

const DATA_DIR = path.join(process.cwd(), "data");
const PUBLIC_DIR = path.join(process.cwd(), "public");
const SEED_FILES: Record<Doc, string> = {
  projects: path.join(DATA_DIR, "projects.json"),
  site: path.join(DATA_DIR, "site.json"),
};
/** Where the previous implementation kept the (overwritten) JSON in Blob. */
const LEGACY_BLOB_PATHS: Record<Doc, string> = {
  projects: "data/projects.json",
  site: "data/site.json",
};
const VERSION_ROOT = "content/";
const versionPrefix = (doc: Doc) => `${VERSION_ROOT}${doc}/`;
const KEEP_VERSIONS = 20;
const ONE_YEAR = 60 * 60 * 24 * 365;

// ---- Low-level reads -------------------------------------------------------

async function readSeed<T>(doc: Doc): Promise<T> {
  // Literal paths so the build traces exactly these two files into the
  // deployment (they're the fallback until the first save to Blob).
  const raw =
    doc === "projects"
      ? await fs.readFile(path.join(process.cwd(), "data", "projects.json"), "utf8")
      : await fs.readFile(path.join(process.cwd(), "data", "site.json"), "utf8");
  return JSON.parse(raw) as T;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Blob fetch failed (${res.status}) for ${url}`);
  return (await res.json()) as T;
}

type VersionBlob = { url: string; pathname: string };

/** All stored versions per document, newest first. One list() call total. */
async function listVersions(): Promise<Record<Doc, VersionBlob[]>> {
  const out: Record<Doc, VersionBlob[]> = { projects: [], site: [] };
  let cursor: string | undefined;
  do {
    const page = await list({ prefix: VERSION_ROOT, cursor, limit: 1000 });
    for (const b of page.blobs) {
      for (const doc of ["projects", "site"] as const) {
        if (b.pathname.startsWith(versionPrefix(doc))) out[doc].push(b);
      }
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  // Pathnames start with a zero-padded timestamp, so a string sort is a time sort.
  for (const doc of ["projects", "site"] as const) {
    out[doc].sort((a, b) => b.pathname.localeCompare(a.pathname));
  }
  return out;
}

/** Data written by the previous single-file implementation, if any. */
async function readLegacyBlob<T>(doc: Doc): Promise<T | null> {
  try {
    const info = await head(LEGACY_BLOB_PATHS[doc]);
    return await fetchJson<T>(`${info.url}?v=${info.uploadedAt.getTime()}`);
  } catch {
    return null;
  }
}

async function readDocFromBlob<T>(doc: Doc, versions: VersionBlob[]): Promise<T> {
  if (versions[0]) return fetchJson<T>(versions[0].url);
  return (await readLegacyBlob<T>(doc)) ?? (await readSeed<T>(doc));
}

/** Always hits storage — use for read-modify-write. */
async function readContentFresh(): Promise<Content> {
  if (!USE_BLOB) {
    const [projects, site] = await Promise.all([
      readSeed<Project[]>("projects"),
      readSeed<Site>("site"),
    ]);
    return { projects, site };
  }
  const versions = await listVersions();
  const [projects, site] = await Promise.all([
    readDocFromBlob<Project[]>("projects", versions.projects),
    readDocFromBlob<Site>("site", versions.site),
  ]);
  return { projects, site };
}

/**
 * Cached read for rendering. Invalidated by updateTag(CONTENT_TAG) on every
 * admin save; the hourly revalidate is only a safety net (e.g. for edits made
 * from a local dev server pointed at the same Blob store, which can't reach
 * the deployed app's cache).
 */
const readContentCached = unstable_cache(readContentFresh, ["content-v2", STORAGE_MODE], {
  tags: [CONTENT_TAG],
  revalidate: 3600,
});

// ---- Low-level writes ------------------------------------------------------

async function writeDoc(doc: Doc, data: unknown) {
  if (!USE_BLOB) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(/*turbopackIgnore: true*/ SEED_FILES[doc], JSON.stringify(data, null, 2) + "\n", "utf8");
    return;
  }
  const stamp = String(Date.now()).padStart(15, "0");
  await put(`${versionPrefix(doc)}${stamp}.json`, JSON.stringify(data), {
    access: "public",
    addRandomSuffix: true,
    contentType: "application/json",
    // Every version gets a unique URL and is never modified, so it's safe
    // (and fast) to let the CDN keep it.
    cacheControlMaxAge: ONE_YEAR,
  });
}

/** Deletes all but the newest KEEP_VERSIONS versions. Best effort. */
export async function pruneOldVersions() {
  if (!USE_BLOB) return;
  try {
    const versions = await listVersions();
    const stale = [
      ...versions.projects.slice(KEEP_VERSIONS),
      ...versions.site.slice(KEEP_VERSIONS),
    ].map((b) => b.url);
    if (stale.length) await del(stale);
  } catch (err) {
    console.error("[store] pruning old versions failed", err);
  }
}

// ---- Projects --------------------------------------------------------------

export async function getAllProjects(): Promise<Project[]> {
  return (await readContentCached()).projects;
}

export async function getActiveProjects(): Promise<Project[]> {
  return (await getAllProjects()).filter((p) => p.active);
}

/** Looks up a project regardless of active state (used by the admin section). */
export async function getProjectAny(slug: string): Promise<Project | undefined> {
  return (await getAllProjects()).find((p) => p.slug === slug);
}

/** Looks up a project the way the public site does: only if it's active. */
export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getActiveProjects()).find((p) => p.slug === slug);
}

export async function getAdjacentProjects(slug: string): Promise<{
  prev: Project | null;
  next: Project | null;
}> {
  const list = await getActiveProjects();
  const i = list.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  const prev = list[(i - 1 + list.length) % list.length];
  const next = list[(i + 1) % list.length];
  return { prev, next };
}

/**
 * Read-modify-write on the project list, always against fresh storage.
 * `fn` may mutate the array in place or return a new one. Returns the
 * previous and the saved list so callers can work out what changed.
 */
export async function mutateProjects(
  fn: (projects: Project[]) => Project[] | void | Promise<Project[] | void>
): Promise<{ before: Project[]; after: Project[] }> {
  const { projects } = await readContentFresh();
  const before = structuredClone(projects);
  const result = await fn(projects);
  const after = result ?? projects;
  await writeDoc("projects", after);
  return { before, after };
}

/** Fresh (uncached) project list — for slug checks right before a write. */
export async function getAllProjectsFresh(): Promise<Project[]> {
  return (await readContentFresh()).projects;
}

export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
  return base || "project";
}

/** Slugifies `base` and appends -2, -3, ... until it's free in `projects`. */
export function uniqueSlug(base: string, projects: Project[], excludeSlug?: string): string {
  const root = slugify(base);
  let slug = root;
  let n = 2;
  while (projects.some((p) => p.slug === slug && p.slug !== excludeSlug)) {
    slug = `${root}-${n}`;
    n++;
  }
  return slug;
}

// ---- Site texts ------------------------------------------------------------

export async function getSite(): Promise<Site> {
  return (await readContentCached()).site;
}

export async function saveSite(site: Site) {
  await writeDoc("site", site);
}

export async function getSiteFresh(): Promise<Site> {
  return (await readContentFresh()).site;
}

// ---- Uploaded files ----------------------------------------------------------

const BLOB_HOST_SUFFIX = ".public.blob.vercel-storage.com";

export function isBlobUrl(src: string): boolean {
  try {
    const u = new URL(src);
    return u.protocol === "https:" && u.hostname.endsWith(BLOB_HOST_SUFFIX);
  } catch {
    return false;
  }
}

/** Local public-folder paths the admin is allowed to reference / delete. */
function isManagedLocalPath(src: string): boolean {
  return (
    (src.startsWith("/images/projects/") || src.startsWith("/documents/")) &&
    !src.includes("..")
  );
}

/** Whether a URL is something our own storage could have produced. */
export function isAllowedAssetUrl(src: string): boolean {
  const bare = src.split("?")[0];
  return isBlobUrl(bare) || isManagedLocalPath(bare);
}

export function isValidImage(img: unknown): img is ProjectImage {
  if (!img || typeof img !== "object") return false;
  const { src, width, height } = img as Record<string, unknown>;
  return (
    typeof src === "string" &&
    isAllowedAssetUrl(src) &&
    typeof width === "number" &&
    typeof height === "number" &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    width > 0 &&
    height > 0
  );
}

/**
 * Deletes stored files that are no longer referenced anywhere. Files bundled
 * with the deployment (public/ on Vercel) can't be deleted and are skipped.
 */
export async function deleteFiles(srcs: string[]) {
  const unique = [...new Set(srcs.map((s) => s.split("?")[0]))];
  const blobUrls = unique.filter(isBlobUrl);
  const localPaths = unique.filter((s) => !isBlobUrl(s) && isManagedLocalPath(s));

  const tasks: Promise<unknown>[] = [];
  if (USE_BLOB && blobUrls.length) tasks.push(del(blobUrls));
  if (!USE_BLOB) {
    for (const p of localPaths) {
      tasks.push(fs.unlink(path.join(/*turbopackIgnore: true*/ PUBLIC_DIR, p)).catch(() => {}));
    }
  }
  const results = await Promise.allSettled(tasks);
  for (const r of results) {
    if (r.status === "rejected") console.error("[store] deleting files failed", r.reason);
  }
}

/** Every file URL currently referenced by content (images + CV). */
export function referencedFiles(projects: Project[], site?: Site): Set<string> {
  const refs = new Set<string>();
  for (const p of projects) for (const img of p.images) refs.add(img.src.split("?")[0]);
  if (site?.contact.cvUrl) refs.add(site.contact.cvUrl.split("?")[0]);
  return refs;
}

// ---- Local (fs mode) upload target -----------------------------------------

/**
 * fs mode only: stores an uploaded file under public/ and returns its URL.
 * (In blob mode the browser uploads straight to Blob instead.)
 */
export async function saveLocalUpload(pathname: string, data: Buffer): Promise<string> {
  if (USE_BLOB) throw new Error("saveLocalUpload is only available in fs mode");
  const ext = path.extname(pathname);
  const base = pathname.slice(0, pathname.length - ext.length);
  const rand = Math.random().toString(36).slice(2, 10);
  const rel = `${base}-${rand}${ext}`;
  const full = path.join(/*turbopackIgnore: true*/ PUBLIC_DIR, rel);
  if (!full.startsWith(PUBLIC_DIR + path.sep)) throw new Error("Invalid path");
  await fs.mkdir(path.dirname(full), { recursive: true });
  await fs.writeFile(full, data);
  return "/" + rel.split(path.sep).join("/");
}
