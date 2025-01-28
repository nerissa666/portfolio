/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    dynamicIO: true,
    ppr: true,
    newDevOverlay: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
