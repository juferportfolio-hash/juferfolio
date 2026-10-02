import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // No Server Action body-size override: files are uploaded straight from the
  // browser to storage (see src/app/api/admin/upload/route.ts), so actions
  // only ever receive small JSON payloads. Raising the limit wouldn't help on
  // Vercel anyway — functions reject request bodies over ~4.5 MB.
  images: {
    // When storage runs on Vercel Blob (see BLOB_READ_WRITE_TOKEN in
    // src/lib/store.ts), uploaded images live at a
    // *.public.blob.vercel-storage.com URL instead of a local /images/...
    // path, and next/image refuses to optimize an external host unless it's
    // explicitly allow-listed here.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
    // Uploaded files get unique, never-overwritten URLs, so optimized
    // variants can be cached for a long time.
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
};

export default nextConfig;
