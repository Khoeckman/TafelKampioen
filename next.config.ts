import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  basePath: '/TafelKampioen',
  assetPrefix: '/TafelKampioen/',
  distDir: 'docs',
  output: 'export',
}

export default nextConfig
