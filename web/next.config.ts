import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const turbopackRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  serverExternalPackages: ["tesseract.js", "pdf-parse"],
  turbopack: {
    root: turbopackRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/aida-public/**",
      },
    ],
  },
};

export default nextConfig;
