import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['storage.googleapis.com', 'blob.cloudcomputing.id', 'encrypted-tbn3.gstatic.com'],
  },
};

export default nextConfig;
