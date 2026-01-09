// Next.js instrumentation file - runs before routes are analyzed
// This ensures File polyfill is available during build time

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import the File polyfill to ensure it's available during build
    await import('./lib/polyfills/file-polyfill')
  }
}

