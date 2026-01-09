const path = require('path')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude vetted folder from build
  webpack: (config, { isServer }) => {
    // Exclude vetted folder from webpack compilation
    config.module = config.module || {}
    config.module.rules = config.module.rules || []
    
    // Add rule to ignore vetted folder
    config.module.rules.push({
      test: /\.(ts|tsx|js|jsx)$/,
      include: (filePath) => {
        return !filePath.includes(path.join(process.cwd(), 'vetted'))
      },
    })
    
    // Ignore vetted folder in webpack watch
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/vetted/**'],
    }
    
    return config
  },
}

module.exports = nextConfig

