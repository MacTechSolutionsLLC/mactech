// Type definitions for File API compatibility in Node.js
// File is a browser API, but Next.js FormData returns File-like objects
// This file is only used for type checking, not runtime

// Note: We don't declare File globally here to avoid build-time errors.
// Instead, we use type assertions (as Blob) in client-side code.
// For server-side code, we use FileLike type aliases.

export type FileLike = {
  readonly name: string
  readonly size: number
  readonly type: string
  readonly lastModified: number
  arrayBuffer(): Promise<ArrayBuffer>
  text(): Promise<string>
  stream(): ReadableStream<Uint8Array>
  slice(start?: number, end?: number, contentType?: string): Blob
}

