/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizations for faster builds
  webpack: (config, { dev, isServer }) => {
    // Ignore blockchain directory to avoid Babel conflicts with Hardhat
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/blockchain/**', '**/node_modules/**', '**/.git/**']
    }
    
    // Speed up builds in development
    if (dev) {
      config.optimization.splitChunks = false
      config.optimization.minimize = false
    }
    
    return config
  },
  
  // Reduce module resolution
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // SWC minification is now enabled by default in Next.js 15
  
  // Disable source maps in dev for speed
  productionBrowserSourceMaps: false
}

module.exports = nextConfig
