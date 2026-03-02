/**
 * Security Headers Middleware
 *
 * Sets security-related HTTP headers to protect against common vulnerabilities:
 * - XSS (Cross-Site Scripting)
 * - Clickjacking
 * - MIME type sniffing
 * - Protocol downgrade attacks
 */
export default defineEventHandler((event) => {
  const headers = event.node.res

  // Content Security Policy
  // Prevents XSS attacks by controlling which resources can be loaded
  headers.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Nuxt/Vite requires unsafe-inline/eval in dev
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')
  )

  // Prevent MIME type sniffing
  // Forces browsers to respect the declared Content-Type
  headers.setHeader('X-Content-Type-Options', 'nosniff')

  // Clickjacking protection
  // Prevents the site from being embedded in iframes
  headers.setHeader('X-Frame-Options', 'DENY')

  // XSS Protection (legacy, but still useful for older browsers)
  headers.setHeader('X-XSS-Protection', '1; mode=block')

  // Strict Transport Security
  // Forces HTTPS connections (comment out in development if needed)
  if (process.env.NODE_ENV === 'production') {
    headers.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains'
    )
  }

  // Referrer Policy
  // Controls how much referrer information is included with requests
  headers.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

  // Permissions Policy (formerly Feature Policy)
  // Restricts which browser features can be used
  headers.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=()'
  )

  // Remove server identification header
  headers.removeHeader('X-Powered-By')
})
