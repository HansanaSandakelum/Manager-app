/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    turbo: {
      // Disable Turbo temporarily to avoid WASM binding issues
    },
  },
};

export default nextConfig;
