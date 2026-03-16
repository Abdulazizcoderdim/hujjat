import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/sitemap.xml", destination: "/sitemap_index.xml" }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "f003.backblazeb2.com",
        pathname: "/file/doclab-public/**",
      },
      {
        protocol: "https",
        hostname: "**.backblazeb2.com",
        pathname: "/file/**",
      },
    ],
  },
};

export default nextConfig;
