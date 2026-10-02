// Shared between the upload route (server) and the upload helper (browser).

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];
export const ALLOWED_UPLOAD_TYPES = [...ALLOWED_IMAGE_TYPES, "application/pdf"];

/** Hard cap per file (after the browser has downscaled big photos). */
export const MAX_UPLOAD_BYTES = 40 * 1024 * 1024;

const PATHNAME_RE = /^(images\/projects|documents)\/[a-z0-9][a-z0-9/_-]*\.[a-z0-9]{2,5}$/;

export function isAllowedUploadPathname(pathname: string): boolean {
  return PATHNAME_RE.test(pathname) && !pathname.includes("..") && pathname.length <= 200;
}
