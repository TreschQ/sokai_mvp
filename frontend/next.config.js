/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  // Exclude blockchain directory from Next.js processing
  webpack: (config, { isServer }) => {
    // Ignore blockchain directory to avoid Babel conflicts with Hardhat
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/blockchain/**', '**/node_modules/**']
    }
    
    return config
  },
  // Ignore specific directories
  experimental: {
    appDir: true,
    externalDir: false,
  },
  // Don't process blockchain files at all
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  exclude: ['blockchain/**']
}

module.exports = nextConfig
