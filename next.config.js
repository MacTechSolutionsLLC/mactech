/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Exclude vetted folder from webpack watch (for dev mode)
  webpack: (config) => {
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/vetted/**'],
    }
    return config
  },
}

module.exports = nextConfig

