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
  // Security headers for CMMC Level 1 compliance
  async headers() {
    const isProduction = process.env.NODE_ENV === "production"
    
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none';",
          },
          {
            key: "Permissions-Policy",
            value: "geolocation=(), microphone=(), camera=(), payment=(), usb=()",
          },
          ...(isProduction
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]
            : []),
        ],
      },
    ]
  },
  // Exclude vetted folder from webpack watch (for dev mode)
  webpack: (config, { isServer }) => {
    // Ensure File polyfill is available during webpack bundling
    if (isServer) {
      const webpack = require('webpack')
      
      // Inject File polyfill at the very start of ALL server chunks
      const filePolyfillCode = `
if (typeof globalThis.File === 'undefined') {
  try {
    const { Blob } = require('buffer');
    if (Blob) {
      globalThis.Blob = Blob;
      globalThis.File = class File extends Blob {
        constructor(fileBits, fileName, options = {}) {
          super(fileBits, options);
          this.name = fileName;
          this.lastModified = options.lastModified ?? Date.now();
        }
      };
    }
  } catch (e) {
    globalThis.File = class File {
      constructor(fileBits, fileName, options = {}) {
        this.name = fileName;
        this.lastModified = options.lastModified ?? Date.now();
        this.size = 0;
        this.type = options.type || '';
      }
      arrayBuffer() { return Promise.resolve(new ArrayBuffer(0)); }
      text() { return Promise.resolve(''); }
    };
  }
}
// Also define File on global scope (not just globalThis) for compatibility
if (typeof global !== 'undefined' && typeof global.File === 'undefined') {
  global.File = globalThis.File;
}
`
      
      // Use BannerPlugin to inject polyfill - apply to ALL server chunks
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: filePolyfillCode,
          raw: true,
          entryOnly: false,
        })
      )

      // Also use DefinePlugin to replace File references with globalThis.File
      // But this won't work for constructors, so we'll use a custom plugin
      config.plugins.push({
        apply: (compiler) => {
          compiler.hooks.compilation.tap('FilePolyfillPlugin', (compilation) => {
            compilation.hooks.processAssets.tap(
              {
                name: 'FilePolyfillPlugin',
                stage: webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
              },
              (assets) => {
                // Inject polyfill at the start of each server chunk
                Object.keys(assets).forEach((filename) => {
                  if (filename.includes('server') && filename.endsWith('.js')) {
                    const asset = assets[filename]
                    const source = asset.source()
                    // Only inject if File polyfill isn't already present
                    if (!source.includes('globalThis.File')) {
                      assets[filename] = {
                        source: () => filePolyfillCode + '\n' + source,
                        size: () => filePolyfillCode.length + source.length,
                      }
                    }
                  }
                })
              }
            )
          })
        },
      })
    }

    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/node_modules/**', '**/vetted/**'],
    }
    return config
  },
}

module.exports = nextConfig

