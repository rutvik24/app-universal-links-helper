import type { NextConfig } from "next";

/**
 * GitHub project pages need a base path (e.g. `/app-links-helper`).
 * Leave unset for local `next dev` / root-domain hosting.
 */
const rawBase = process.env.NEXT_PUBLIC_BASE_PATH?.trim() ?? "";
const basePath = rawBase.replace(/\/$/, "");

const nextConfig: NextConfig = {
  output: "export",
  ...(basePath
    ? {
        basePath,
        assetPrefix: basePath,
      }
    : {}),
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
