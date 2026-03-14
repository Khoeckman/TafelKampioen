import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: '/TafelKampioen',
  assetPrefix: '/docs/',
  distDir: 'docs',
  output: 'export',
}

export default nextConfig
