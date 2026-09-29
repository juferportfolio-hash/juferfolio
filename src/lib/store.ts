import "server-only";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { del, head, list as blobList, put } from "@vercel/blob";
import type { Project, ProjectImage, Site } from "@/lib/data";

// Vercel's serverless functions run on a read-only filesystem, so the plain
// fs reads/writes below (which work great locally, or on any host with a
// persistent disk) fail there with EROFS. When a Blob read/write token is
// configured (set BLOB_READ_WRITE_TOKEN — automatic once a Blob store is
// connected to the Vercel project, or added by hand for local testing),
// every write — and every read once anything has actually been written —
// goes through Vercel Blob storage instead. The bundled data/*.json files
// still ship with the deployment and serve as the seed data until the first
// admin edit creates the real Blob copy.
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

const DATA_DIR = path.join(process.cwd(), "data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const SITE_FILE = path.join(DATA_DIR, "site.json");
export const IMAGES_DIR = path.join(process.cwd(), "public", "images", "projects");

const PROJECTS_BLOB_PATH = "data/projects.json";
const SITE_BLOB_PATH = "data/site.json";
const IMAGES_BLOB_PREFIX = "images/projects/";
const CV_BLOB_PATH = "documents/cv.pdf";

// ---- Low-level JSON read/write, fs or Blob -------------------------------

function readJsonFile<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function writeJsonFile(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

/** Reads JSON from Blob storage if it's been written there yet; otherwise
 * falls back to the bundled seed file (Blob is left untouched — the next
 * write creates it there). */
async function readJsonBlob<T>(blobPath: string, seedFile: string): Promise<T> {
  try {
    const info = await head(blobPath);
    // cache: "no-store" bypasses Next's own data cache; the query-string
    // cache-buster below additionally defeats any lingering CDN/browser
    // cache on the blob URL itself now that it's always written as
    // uncacheable (see cacheControlMaxAge above), belt and braces.
    const res = await fetch(`${info.url}?ts=${Date.now()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Blob fetch failed: ${res.status}`);
    return (await res.json()) as T;
  } catch {
    return readJsonFile<T>(seedFile);
  }
}

async function writeJsonBlob(blobPath: string, data: unknown) {
  await put(blobPath, JSON.stringify(data, null, 2), {
    access: "public",
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: "application/json",
    // These files change on every admin edit (e.g. toggling a project
    // active/inactive), unlike images/the CV. Vercel Blob's default is to
    // cache a file at the edge for a long time, which was making edits show
    // up only once that cache happened to expire. max-age 0 keeps every
    // read hitting fresh data instead.
    cacheControlMaxAge: 0,
  });
}

// ---- Projects -------------------------------------------------------------

export async function getAllProjects(): Promise<Project[]> {
  if (USE_BLOB) return readJsonBlob<Project[]>(PROJECTS_BLOB_PATH, PROJECTS_FILE);
  return readJsonFile<Project[]>(PROJECTS_FILE);
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

async function saveAllProjects(projects: Project[]) {
  if (USE_BLOB) {
    await writeJsonBlob(PROJECTS_BLOB_PATH, projects);
    return;
  }
  writeJsonFile(PROJECTS_FILE, projects);
}

export async function upsertProject(project: Project) {
  const all = await getAllProjects();
  const i = all.findIndex((p) => p.slug === project.slug);
  if (i === -1) all.push(project);
  else all[i] = project;
  await saveAllProjects(all);
}

export async function deleteProject(slug: string) {
  const all = (await getAllProjects()).filter((p) => p.slug !== slug);
  await saveAllProjects(all);

  if (USE_BLOB) {
    const { blobs } = await blobList({ prefix: `${IMAGES_BLOB_PREFIX}${slug}/` });
    await Promise.all(blobs.map((b) => del(b.url)));
    return;
  }
  const dir = path.join(/*turbopackIgnore: true*/ IMAGES_DIR, slug);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

export async function setProjectActive(slug: string, active: boolean) {
  const all = await getAllProjects();
  const p = all.find((x) => x.slug === slug);
  if (!p) return;
  p.active = active;
  await saveAllProjects(all);
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

/** Slugifies `base` and appends -2, -3, ... until the result is free. */
export async function uniqueSlug(base: string, excludeSlug?: string): Promise<string> {
  const all = await getAllProjects();
  const root = slugify(base);
  let slug = root;
  let n = 2;
  while (all.some((p) => p.slug === slug && p.slug !== excludeSlug)) {
    slug = `${root}-${n}`;
    n++;
  }
  return slug;
}

// ---- Site texts -------------------------------------------------------------

export async function getSite(): Promise<Site> {
  if (USE_BLOB) return readJsonBlob<Site>(SITE_BLOB_PATH, SITE_FILE);
  return readJsonFile<Site>(SITE_FILE);
}

export async function saveSite(site: Site) {
  if (USE_BLOB) {
    await writeJsonBlob(SITE_BLOB_PATH, site);
    return;
  }
  writeJsonFile(SITE_FILE, site);
}

// ---- Images -------------------------------------------------------------

/** Only meaningful in fs mode — Blob storage has no directories to create. */
export function ensureProjectImageDir(slug: string): string | null {
  if (USE_BLOB) return null;
  const dir = path.join(/*turbopackIgnore: true*/ IMAGES_DIR, slug);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Next free numeric filename (ignoring extension) inside a project's image folder. */
function nextImageIndexFs(dir: string): number {
  let next = 0;
  if (fs.existsSync(dir)) {
    for (const name of fs.readdirSync(dir)) {
      const n = parseInt(name, 10);
      if (!Number.isNaN(n) && n >= next) next = n + 1;
    }
  }
  return next;
}

async function nextImageIndexBlob(slug: string): Promise<number> {
  const prefix = `${IMAGES_BLOB_PREFIX}${slug}/`;
  const { blobs } = await blobList({ prefix });
  let next = 0;
  for (const b of blobs) {
    const n = parseInt(b.pathname.slice(prefix.length), 10);
    if (!Number.isNaN(n) && n >= next) next = n + 1;
  }
  return next;
}

/** Reads an uploaded image, stores it (Blob or disk), and returns its ProjectImage record. */
export async function saveProjectImage(slug: string, file: File): Promise<ProjectImage> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(buffer).metadata();
  const format = meta.format === "jpeg" ? "jpg" : meta.format || "jpg";
  const width = meta.width ?? 0;
  const height = meta.height ?? 0;

  if (USE_BLOB) {
    const index = await nextImageIndexBlob(slug);
    const blobPath = `${IMAGES_BLOB_PREFIX}${slug}/${index}.${format}`;
    const { url } = await put(blobPath, buffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: `image/${format === "jpg" ? "jpeg" : format}`,
    });
    return { src: url, width, height };
  }

  const dir = ensureProjectImageDir(slug)!;
  const index = nextImageIndexFs(dir);
  const filename = `${index}.${format}`;
  fs.writeFileSync(path.join(/*turbopackIgnore: true*/ dir, filename), buffer);
  return {
    src: `/images/projects/${slug}/${filename}`,
    width,
    height,
  };
}

/** Deletes a project image, from Blob storage or the per-project images folder. */
export async function deleteProjectImageFile(src: string) {
  if (USE_BLOB && /^https?:\/\//.test(src)) {
    await del(src);
    return;
  }
  if (!src.startsWith("/images/projects/")) return;
  const rel = src.replace("/images/projects/", "");
  const full = path.join(/*turbopackIgnore: true*/ IMAGES_DIR, rel);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

// ---- CV upload -------------------------------------------------------------

/** Saves the CV PDF (Blob or disk) and returns a cache-busted URL for it. */
export async function saveCv(buffer: Buffer): Promise<string> {
  if (USE_BLOB) {
    const { url } = await put(CV_BLOB_PATH, buffer, {
      access: "public",
      addRandomSuffix: false,
      allowOverwrite: true,
      contentType: "application/pdf",
    });
    return `${url}?v=${Date.now()}`;
  }
  const dir = path.join(process.cwd(), "public", "documents");
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "cv.pdf"), buffer);
  return `/documents/cv.pdf?v=${Date.now()}`;
}
