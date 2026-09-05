import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fully static site — deployable to Vercel/Netlify with no Node server.
  output: "export",
  images: {
    // Static export has no image optimization server; add real photos with
    // next/image and this keeps them working as plain <img> output.
    unoptimized: true,
  },
};

export default nextConfig;
