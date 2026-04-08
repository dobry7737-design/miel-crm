import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "https://preview-chat-8f0903a3-2014-4771-b90c-c5c76bed03b1.space.z.ai",
    "https://web-11eb2051-5598-466d-9b1f-e01033b6c1c6.space.z.ai",
  ],
};

export default nextConfig;
