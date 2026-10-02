// Browser-side upload helpers for the admin section. See
// src/app/api/admin/upload/route.ts for why files never go through Server
// Actions.

import { upload } from "@vercel/blob/client";
import { ALLOWED_IMAGE_TYPES } from "@/lib/upload-rules";

export type StorageMode = "blob" | "fs";

export class UploadError extends Error {}

const UPLOAD_ROUTE = "/api/admin/upload";

/** Photos larger than this (long edge, px) are downscaled before upload. */
const MAX_EDGE = 3200;
/** Files bigger than this are re-encoded even if their size in px is fine. */
const REENCODE_ABOVE_BYTES = 6 * 1024 * 1024;

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "application/pdf": "pdf",
};

function slugPart(name: string): string {
  return (
    name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-+|-+$)/g, "")
      .slice(0, 40) || "file"
  );
}

export function imagePathname(originalName: string, type: string): string {
  const d = new Date();
  const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `images/projects/${ym}/${slugPart(originalName)}.${EXT_BY_TYPE[type] ?? "jpg"}`;
}

export const CV_PATHNAME = "documents/cv.pdf";

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));
}

function dimensionsViaImg(file: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      reject(new UploadError("Couldn't read this image."));
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

export type PreparedImage = { body: Blob; type: string; width: number; height: number };

/**
 * Reads an image's size and, if it's very large, downscales/re-encodes it in
 * the browser so uploads stay quick on slow connections. Small, web-friendly
 * files are passed through untouched.
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (file.type === "image/gif") {
    const { width, height } = await dimensionsViaImg(file);
    return { body: file, type: file.type, width, height };
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new UploadError(`Can't read “${file.name}”. Please use JPG, PNG or WebP.`);
  }
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
  const webFriendly = ALLOWED_IMAGE_TYPES.includes(file.type);

  if (scale === 1 && webFriendly && file.size <= REENCODE_ABOVE_BYTES) {
    bitmap.close();
    return { body: file, type: file.type, width, height };
  }

  const w = Math.max(1, Math.round(width * scale));
  const h = Math.max(1, Math.round(height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    if (webFriendly) return { body: file, type: file.type, width, height };
    throw new UploadError(`Can't process “${file.name}”.`);
  }
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  // Keep transparency for PNG/WebP sources; photos become JPEG.
  const keepAlpha = file.type === "image/png" || file.type === "image/webp";
  const preferred = keepAlpha ? "image/webp" : "image/jpeg";
  let blob = await canvasToBlob(canvas, preferred, 0.9);
  // Some browsers can't encode WebP and silently return PNG instead.
  if (!blob || blob.type !== preferred) {
    blob = await canvasToBlob(canvas, keepAlpha ? "image/png" : "image/jpeg", 0.9);
  }
  if (!blob) throw new UploadError(`Can't process “${file.name}”.`);
  return { body: blob, type: blob.type, width: w, height: h };
}

/** Uploads a file and returns its public URL. */
export async function uploadFile(
  body: Blob,
  pathname: string,
  opts: {
    mode: StorageMode;
    contentType: string;
    onProgress?: (fraction: number) => void;
    signal?: AbortSignal;
  }
): Promise<string> {
  if (opts.mode === "blob") {
    const res = await upload(pathname, body, {
      access: "public",
      handleUploadUrl: UPLOAD_ROUTE,
      contentType: opts.contentType,
      multipart: body.size > 8 * 1024 * 1024,
      abortSignal: opts.signal,
      onUploadProgress: (e) => opts.onProgress?.(e.percentage / 100),
    });
    return res.url;
  }

  // fs mode: plain multipart POST to the upload route, via XHR for progress.
  return new Promise<string>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append("pathname", pathname);
    form.append("file", new File([body], pathname.split("/").pop()!, { type: opts.contentType }));
    xhr.open("POST", UPLOAD_ROUTE);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) opts.onProgress?.(e.loaded / e.total);
    };
    xhr.onload = () => {
      let data: { url?: string; error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && data.url) resolve(data.url);
      else reject(new UploadError(data.error || `Upload failed (${xhr.status}).`));
    };
    xhr.onerror = () => reject(new UploadError("Network error during upload."));
    xhr.onabort = () => reject(new DOMException("Aborted", "AbortError"));
    opts.signal?.addEventListener("abort", () => xhr.abort());
    xhr.send(form);
  });
}

/** Runs async jobs with a concurrency limit. */
export async function runWithConcurrency<T>(jobs: (() => Promise<T>)[], limit = 3) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, jobs.length) }, async () => {
    while (i < jobs.length) {
      const job = jobs[i++];
      await job();
    }
  });
  await Promise.all(workers);
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) {
    if (err.name === "AbortError") return "Cancelled.";
    return err.message.replace(/^Vercel Blob: /, "");
  }
  return "Something went wrong.";
}
