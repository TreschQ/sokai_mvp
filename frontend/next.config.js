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
    
    // Configure WASM support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
    }
    
    return config
  },
  
  // Reduce module resolution
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  
  // Faster builds (swcMinify is enabled by default in Next.js 15)
  
  // Disable source maps in dev for speed
  productionBrowserSourceMaps: false,
  
  // Enable standalone output for Docker
  output: 'standalone',
  
  // Headers for WASM files
  async headers() {
    return [
      {
        source: '/:path*.(wasm)',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/wasm',
          },
        ],
      },
      {
        source: '/:path*.(mjs)',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
