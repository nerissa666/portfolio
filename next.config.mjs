/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    dynamicIO: true,
    ppr: true,
    newDevOverlay: true,
    inlineCss: true
  }
};

export default nextConfig;
