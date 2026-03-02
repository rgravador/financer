import crypto from 'crypto'

/**
 * CSRF Protection Utilities
 *
 * Generates and validates CSRF tokens to prevent Cross-Site Request Forgery attacks
 */

// In-memory storage for CSRF tokens
// In production, use Redis or session storage
const csrfTokens = new Map<string, { token: string, expiresAt: Date }>()

const TOKEN_EXPIRY_MS = 60 * 60 * 1000 // 1 hour

/**
 * Generate a cryptographically secure CSRF token
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Store CSRF token for a session
 */
export function storeCSRFToken(sessionId: string, token: string): void {
  csrfTokens.set(sessionId, {
    token,
    expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
  })
}

/**
 * Verify CSRF token against session
 */
export function verifyCSRFToken(token: string, sessionId: string): boolean {
  const stored = csrfTokens.get(sessionId)

  if (!stored) {
    return false
  }

  // Check if token expired
  if (new Date() > stored.expiresAt) {
    csrfTokens.delete(sessionId)
    return false
  }

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(stored.token)
  )
}

/**
 * Get CSRF token for a session
 */
export function getCSRFToken(sessionId: string): string | null {
  const stored = csrfTokens.get(sessionId)

  if (!stored) {
    return null
  }

  // Check if token expired
  if (new Date() > stored.expiresAt) {
    csrfTokens.delete(sessionId)
    return null
  }

  return stored.token
}

/**
 * Remove CSRF token for a session
 */
export function removeCSRFToken(sessionId: string): void {
  csrfTokens.delete(sessionId)
}

/**
 * Clean up expired tokens (run periodically)
 */
export function cleanupExpiredTokens(): void {
  const now = new Date()

  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(sessionId)
    }
  }
}

// Run cleanup every 15 minutes
setInterval(cleanupExpiredTokens, 15 * 60 * 1000)
