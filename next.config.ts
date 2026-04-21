import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Client-only app (all state lives in localStorage), so we ship it as
  // a fully static site. This makes any static host — Netlify, GitHub
  // Pages, S3 — serve it without needing server runtime support.
  output: "export",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
