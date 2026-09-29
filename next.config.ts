import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Default Server Action body limit is 1MB — a single project photo
    // (let alone several uploaded together) is routinely bigger than that,
    // which previously failed as an opaque "Failed to fetch" on upload.
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
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
  },
};

export default nextConfig;
