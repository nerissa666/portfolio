/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    dynamicIO: true,
    ppr: true,
    newDevOverlay: true,
    inlineCss: true,
    reactCompiler: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
