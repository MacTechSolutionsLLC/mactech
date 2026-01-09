// Type definitions for File API compatibility in Node.js
// File is a browser API, but Next.js FormData returns File-like objects
// This file is only used for type checking, not runtime

// Only declare File if it doesn't already exist (browser environment)
declare global {
  // Extend the global scope with File if not available
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface File extends Blob {
    readonly name: string
    readonly size: number
    readonly type: string
    readonly lastModified: number
    arrayBuffer(): Promise<ArrayBuffer>
    text(): Promise<string>
    stream(): ReadableStream<Uint8Array>
    slice(start?: number, end?: number, contentType?: string): Blob
  }
  
  // Ensure Blob exists
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Blob {
    readonly size: number
    readonly type: string
    arrayBuffer(): Promise<ArrayBuffer>
    text(): Promise<string>
    stream(): ReadableStream<Uint8Array>
    slice(start?: number, end?: number, contentType?: string): Blob
  }
}

export {}

