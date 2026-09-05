import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "resources.premierleague.com" },
      { protocol: "https", hostname: "fantasy.premierleague.com" },
    ],
  },
  async redirects() {
    return [
      { source: "/historikk", destination: "/hall-of-fame", permanent: false },
    ];
  },
};

export default nextConfig;
