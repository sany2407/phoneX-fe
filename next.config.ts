import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow images from any HTTPS source.
    // Category images, product photos, and user-uploaded assets can come
    // from arbitrary CDNs (Dreamstime, Cloudinary, S3, etc.) so we use a
    // wildcard pattern rather than enumerating every hostname.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
