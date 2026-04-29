import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [{ source: "/admin", destination: "/yonetim", permanent: true }];
  },
  async rewrites() {
    return [{ source: "/yonetim", destination: "/admin" }];
  },
};

export default nextConfig;
