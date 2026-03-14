const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'docs',
  basePath: isProd ? '/TafelKampioen' : '',
  assetPrefix: '/TafelKampioen/',
}

export default nextConfig
