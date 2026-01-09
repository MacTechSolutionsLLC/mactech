// Type definitions for File API compatibility in Node.js
// File is a browser API, but Next.js FormData returns File-like objects

declare global {
  // Extend the global scope with File if not available
  interface File {
    readonly name: string
    readonly size: number
    readonly type: string
    arrayBuffer(): Promise<ArrayBuffer>
    text(): Promise<string>
    stream(): ReadableStream<Uint8Array>
    slice(start?: number, end?: number, contentType?: string): Blob
  }
}

export {}

