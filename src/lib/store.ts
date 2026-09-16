import "server-only";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
import type { Project, ProjectImage, Site } from "@/lib/data";

const DATA_DIR = path.join(process.cwd(), "data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const SITE_FILE = path.join(DATA_DIR, "site.json");
export const IMAGES_DIR = path.join(process.cwd(), "public", "images", "projects");

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(file, "utf8")) as T;
}

function writeJson(file: string, data: unknown) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + "\n", "utf8");
}

// ---- Projects -------------------------------------------------------------

export function getAllProjects(): Project[] {
  return readJson<Project[]>(PROJECTS_FILE);
}

export function getActiveProjects(): Project[] {
  return getAllProjects().filter((p) => p.active);
}

/** Looks up a project regardless of active state (used by the admin section). */
export function getProjectAny(slug: string): Project | undefined {
  return getAllProjects().find((p) => p.slug === slug);
}

/** Looks up a project the way the public site does: only if it's active. */
export function getProject(slug: string): Project | undefined {
  return getActiveProjects().find((p) => p.slug === slug);
}

export function getAdjacentProjects(slug: string): {
  prev: Project | null;
  next: Project | null;
} {
  const list = getActiveProjects();
  const i = list.findIndex((p) => p.slug === slug);
  if (i === -1) return { prev: null, next: null };
  const prev = list[(i - 1 + list.length) % list.length];
  const next = list[(i + 1) % list.length];
  return { prev, next };
}

function saveAllProjects(projects: Project[]) {
  writeJson(PROJECTS_FILE, projects);
}

export function upsertProject(project: Project) {
  const all = getAllProjects();
  const i = all.findIndex((p) => p.slug === project.slug);
  if (i === -1) all.push(project);
  else all[i] = project;
  saveAllProjects(all);
}

export function deleteProject(slug: string) {
  const all = getAllProjects().filter((p) => p.slug !== slug);
  saveAllProjects(all);
  const dir = path.join(IMAGES_DIR, slug);
  if (fs.existsSync(dir)) fs.rmSync(dir, { recursive: true, force: true });
}

export function setProjectActive(slug: string, active: boolean) {
  const all = getAllProjects();
  const p = all.find((x) => x.slug === slug);
  if (!p) return;
  p.active = active;
  saveAllProjects(all);
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
export function uniqueSlug(base: string, excludeSlug?: string): string {
  const all = getAllProjects();
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

export function getSite(): Site {
  return readJson<Site>(SITE_FILE);
}

export function saveSite(site: Site) {
  writeJson(SITE_FILE, site);
}

// ---- Images -------------------------------------------------------------

export function ensureProjectImageDir(slug: string): string {
  const dir = path.join(IMAGES_DIR, slug);
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

/** Next free numeric filename (ignoring extension) inside a project's image folder. */
function nextImageIndex(dir: string): number {
  let next = 0;
  if (fs.existsSync(dir)) {
    for (const name of fs.readdirSync(dir)) {
      const n = parseInt(name, 10);
      if (!Number.isNaN(n) && n >= next) next = n + 1;
    }
  }
  return next;
}

/** Reads an uploaded image, writes it to disk, and returns its ProjectImage record. */
export async function saveProjectImage(slug: string, file: File): Promise<ProjectImage> {
  const dir = ensureProjectImageDir(slug);
  const buffer = Buffer.from(await file.arrayBuffer());
  const meta = await sharp(buffer).metadata();
  const format = meta.format === "jpeg" ? "jpg" : meta.format || "jpg";
  const index = nextImageIndex(dir);
  const filename = `${index}.${format}`;
  fs.writeFileSync(path.join(dir, filename), buffer);
  return {
    src: `/images/projects/${slug}/${filename}`,
    width: meta.width ?? 0,
    height: meta.height ?? 0,
  };
}

/** Deletes an image file that lives under the per-project images folder (no-op otherwise). */
export function deleteProjectImageFile(src: string) {
  if (!src.startsWith("/images/projects/")) return;
  const rel = src.replace("/images/projects/", "");
  const full = path.join(IMAGES_DIR, rel);
  if (fs.existsSync(full)) fs.unlinkSync(full);
}
