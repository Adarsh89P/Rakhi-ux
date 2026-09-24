import type { NextConfig } from "next";

// Set NEXT_PUBLIC_BASE_PATH (e.g. "/Rakhi-ux") when deploying under a sub-path such as GitHub Pages
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
};

export default nextConfig;
