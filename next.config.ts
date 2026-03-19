import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Build failing after 16.1.2 to 16.2 upgrade
  // https://github.com/vercel/next.js/issues/91642
  serverExternalPackages: ["jspdf"],
};

export default nextConfig;
