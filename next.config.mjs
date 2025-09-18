/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_BASE_PATH && process.env.NEXT_BASE_PATH !== '/' ? process.env.NEXT_BASE_PATH : ''

const nextConfig = {
  output: 'export',
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
