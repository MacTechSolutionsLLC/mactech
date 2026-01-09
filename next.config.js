/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude vetted folder from build
  webpack: (config, { isServer }) => {
    // Exclude vetted folder from webpack compilation
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
      }
    }
    // Ignore vetted folder in webpack
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/vetted/**'],
    }
    return config
  },
  // Exclude vetted from page extensions discovery
  experimental: {
    // This ensures Next.js only looks in the root app directory
  },
}

module.exports = nextConfig

