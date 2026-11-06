import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // No TypeScript errors are suppressed: `tsc --noEmit` must pass.
  typescript: {
    ignoreBuildErrors: false,
  },
  reactStrictMode: false,
  // Hide the development indicator bubble; it is dev-only but distracts.
  devIndicators: false,
};

export default nextConfig;
