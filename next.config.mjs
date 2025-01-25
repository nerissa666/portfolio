/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    dynamicIO: true,
    ppr: true,
    newDevOverlay: true,
    inlineCss: true
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
