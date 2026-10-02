import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { isAuthenticated } from "@/lib/auth";
import { saveLocalUpload, STORAGE_MODE } from "@/lib/store";
import {
  ALLOWED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
  isAllowedUploadPathname,
} from "@/lib/upload-rules";

/*
 * Upload endpoint for the admin section.
 *
 * Vercel limits a serverless function's request body to ~4.5 MB, so files
 * must NOT be sent through Server Actions or this route there. In blob mode
 * this route only hands the browser a short-lived, scoped upload token
 * (@vercel/blob/client's handleUpload) and the browser then PUTs the file
 * straight to Blob storage — any size, with progress.
 *
 * In fs mode (local dev, no BLOB_READ_WRITE_TOKEN) there's no such limit,
 * so the file is posted here as multipart form data and written to public/.
 */

export async function POST(request: Request): Promise<Response> {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Not signed in." }, { status: 401 });
  }

  if (STORAGE_MODE === "blob") {
    let body: HandleUploadBody;
    try {
      body = (await request.json()) as HandleUploadBody;
    } catch {
      return Response.json({ error: "Invalid request." }, { status: 400 });
    }
    try {
      const result = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async (pathname) => {
          if (!isAllowedUploadPathname(pathname)) {
            throw new Error("Uploads are only allowed to images/projects/ or documents/.");
          }
          return {
            allowedContentTypes: ALLOWED_UPLOAD_TYPES,
            maximumSizeInBytes: MAX_UPLOAD_BYTES,
            addRandomSuffix: true,
            // Every upload gets a unique URL and is never overwritten.
            cacheControlMaxAge: 60 * 60 * 24 * 365,
          };
        },
      });
      return Response.json(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      return Response.json({ error: message }, { status: 400 });
    }
  }

  // ---- fs mode ----
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Invalid upload." }, { status: 400 });
  }
  const file = form.get("file");
  const pathname = String(form.get("pathname") ?? "");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "No file received." }, { status: 400 });
  }
  if (!isAllowedUploadPathname(pathname)) {
    return Response.json({ error: "Invalid upload path." }, { status: 400 });
  }
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    return Response.json({ error: `Unsupported file type: ${file.type || "unknown"}` }, { status: 400 });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return Response.json({ error: "File is too large." }, { status: 400 });
  }
  const url = await saveLocalUpload(pathname, Buffer.from(await file.arrayBuffer()));
  return Response.json({ url });
}
