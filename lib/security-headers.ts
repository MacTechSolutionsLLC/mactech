/**
 * Security headers for CMMC Level 1 compliance
 * Provides security headers for Next.js application
 */

export interface SecurityHeaders {
  [key: string]: string
}

/** CUI vault origin for CSP connect-src (browser uploads directly to vault) */
function getCuiVaultCspOrigin(): string {
  const url = process.env.CUI_VAULT_URL || "https://vault.mactechsolutionsllc.com"
  try {
    return new URL(url).origin
  } catch {
    return "https://vault.mactechsolutionsllc.com"
  }
}

/**
 * Get security headers for responses
 */
export function getSecurityHeaders(): SecurityHeaders {
  const isProduction = process.env.NODE_ENV === "production"

  return {
    // HSTS: Force HTTPS for 1 year
    "Strict-Transport-Security": isProduction
      ? "max-age=31536000; includeSubDomains"
      : "",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // Referrer policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    // Content Security Policy
    // Note: Next.js requires 'unsafe-inline' and 'unsafe-eval' for scripts
    // connect-src includes CUI vault origin so the browser can POST uploads directly to the vault
    "Content-Security-Policy":
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "font-src 'self' data:; " +
      "connect-src 'self' " + getCuiVaultCspOrigin() + "; " +
      "frame-ancestors 'none';",

    // X-Frame-Options (redundant with CSP frame-ancestors, but included for compatibility)
    "X-Frame-Options": "DENY",

    // Permissions Policy (formerly Feature Policy)
    "Permissions-Policy":
      "geolocation=(), " +
      "microphone=(), " +
      "camera=(), " +
      "payment=(), " +
      "usb=()",
  }
}

/**
 * Apply security headers to Next.js response
 * Usage in middleware or API routes
 */
export function applySecurityHeaders(response: Response): Response {
  const headers = getSecurityHeaders()

  for (const [key, value] of Object.entries(headers)) {
    if (value) {
      response.headers.set(key, value)
    }
  }

  return response
}
