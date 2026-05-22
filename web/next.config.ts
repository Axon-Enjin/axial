import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

const turbopackRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["tesseract.js", "pdf-parse"],
  outputFileTracingIncludes: {
    "/app/api/**/*": [
      "./node_modules/tesseract.js-core/**/*",
      "./node_modules/tesseract.js/**/*",
    ],
  },
  turbopack: {
    root: turbopackRoot,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
