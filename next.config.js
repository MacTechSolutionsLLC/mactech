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
    if (isServer && typeof globalThis.File === 'undefined') {
      try {
        const { Blob } = require('buffer')
        if (Blob) {
          globalThis.Blob = Blob
          globalThis.File = class File extends Blob {
            constructor(fileBits, fileName, options = {}) {
              super(fileBits, options)
              this.name = fileName
              this.lastModified = options.lastModified ?? Date.now()
            }
          }
        }
      } catch (e) {
        // Fallback
        globalThis.File = class File {
          constructor(fileBits, fileName, options = {}) {
            this.name = fileName
            this.lastModified = options.lastModified ?? Date.now()
            this.size = 0
            this.type = options.type || ''
          }
          arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)) }
          text() { return Promise.resolve('') }
        }
      }
    }

    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/vetted/**'],
    }
    return config
  },
}

module.exports = nextConfig

