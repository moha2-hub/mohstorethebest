/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: [
    "http://192.168.8.100:3000",
    "http://localhost:3000",
    "http://127.0.0.1:3000"
  ],
}

export default nextConfig
