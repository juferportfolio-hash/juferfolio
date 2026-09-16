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
};

export default nextConfig;
