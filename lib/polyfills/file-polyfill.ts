// File polyfill for Node.js environment
// This prevents "File is not defined" errors during Next.js build
// File is a browser API, but Next.js FormData can return File-like objects

if (typeof globalThis.File === 'undefined') {
  // Create a minimal File polyfill for Node.js
  globalThis.File = class File extends Blob {
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
}

export {}

