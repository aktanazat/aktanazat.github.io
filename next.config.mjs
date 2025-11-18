/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_BASE_PATH && process.env.NEXT_BASE_PATH !== '/' ? process.env.NEXT_BASE_PATH : ''

const nextConfig = {
  // output: 'export', // DISABLED to fix dev mode 404s and allow dynamic behavior
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
}

export default nextConfig
