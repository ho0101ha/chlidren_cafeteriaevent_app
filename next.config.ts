import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client", "prisma"],
  experimental: {
    cacheComponents: true, // Cache Componentsの有効化
  },
};
export default nextConfig;
