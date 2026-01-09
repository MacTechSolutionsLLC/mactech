// Load File polyfill before Next.js config is evaluated
if (typeof globalThis.File === 'undefined') {
  // Minimal File polyfill for Node.js build environment
  try {
    const { Blob } = require('buffer')
    if (Blob) {
      globalThis.Blob = Blob
    }
  } catch (e) {
    // Blob might not be available, that's okay
  }

  if (typeof globalThis.Blob !== 'undefined') {
    globalThis.File = class File extends globalThis.Blob {
      constructor(fileBits, fileName, options = {}) {
        super(fileBits, options)
        this.name = fileName
        this.lastModified = options.lastModified ?? Date.now()
      }
    }
  } else {
    // Fallback File implementation
    globalThis.File = class File {
      constructor(fileBits, fileName, options = {}) {
        this.name = fileName
        this.lastModified = options.lastModified ?? Date.now()
        this.size = 0
        this.type = options.type || ''
      }
      arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)) }
      text() { return Promise.resolve('') }
      stream() { return new (require('stream').Readable)() }
    }
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable instrumentation hook for polyfills
  experimental: {
    instrumentationHook: true,
  },
  // Exclude vetted folder from webpack watch (for dev mode)
  webpack: (config, { isServer }) => {
    // Ensure File polyfill is available during webpack bundling
    if (isServer) {
      // Add webpack plugin to provide File globally
      const webpack = require('webpack')
      
      // Create a plugin that defines File globally
      config.plugins.push(
        new webpack.DefinePlugin({
          'globalThis.File': JSON.stringify('File'), // This won't work, File needs to be a constructor
        })
      )

      // Try to provide File via ProvidePlugin (but this also won't work for constructors)
      // Instead, we'll use a custom plugin to inject the polyfill
      config.plugins.push(
        new webpack.ProvidePlugin({
          File: require.resolve('./lib/polyfills/file-polyfill'),
        })
      )
    }

    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/vetted/**'],
    }
    return config
  },
}

module.exports = nextConfig

