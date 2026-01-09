// File polyfill for Node.js environment
// This prevents "File is not defined" errors during Next.js build
// File is a browser API, but Next.js FormData can return File-like objects

// Ensure Blob exists first (Node.js 18+ has Blob, but we check anyway)
if (typeof globalThis.Blob === 'undefined') {
  try {
    const { Blob: NodeBlob } = require('buffer')
    if (NodeBlob) {
      globalThis.Blob = NodeBlob
    }
  } catch (e) {
    // Blob not available, will use fallback
  }
}

// Create File polyfill if it doesn't exist
if (typeof globalThis.File === 'undefined' && typeof globalThis.Blob !== 'undefined') {
  // Create a minimal File polyfill for Node.js
  globalThis.File = class File extends globalThis.Blob {
    readonly name: string
    readonly lastModified: number

    constructor(
      fileBits: BlobPart[],
      fileName: string,
      options?: FilePropertyBag
    ) {
      super(fileBits, options)
      this.name = fileName
      this.lastModified = options?.lastModified ?? Date.now()
    }
  } as any
} else if (typeof globalThis.File === 'undefined') {
  // Fallback: create a minimal File-like object even without Blob
  globalThis.File = class File {
    readonly name: string
    readonly lastModified: number
    readonly size: number
    readonly type: string

    constructor(
      fileBits: BlobPart[],
      fileName: string,
      options?: FilePropertyBag
    ) {
      this.name = fileName
      this.lastModified = options?.lastModified ?? Date.now()
      this.size = 0
      this.type = options?.type || ''
    }

    arrayBuffer(): Promise<ArrayBuffer> {
      return Promise.resolve(new ArrayBuffer(0))
    }

    text(): Promise<string> {
      return Promise.resolve('')
    }

    stream(): ReadableStream<Uint8Array> {
      return new ReadableStream()
    }
  } as any
}

// Export File for webpack ProvidePlugin
module.exports = globalThis.File
export default globalThis.File
export {}

