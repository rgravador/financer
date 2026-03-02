/**
 * Rate Limiter with Account Lockout
 *
 * Tracks failed login attempts and locks accounts after threshold is reached
 * Uses in-memory storage (can be upgraded to Redis for distributed systems)
 */

interface LoginAttempt {
  count: number
  lockedUntil: Date | null
  lastAttempt: Date
}

// In-memory storage for login attempts
// In production, use Redis for distributed systems
const loginAttempts = new Map<string, LoginAttempt>()

const MAX_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes

/**
 * Check if an account is currently locked
 */
export async function isAccountLocked(email: string): Promise<boolean> {
  const attempt = loginAttempts.get(email.toLowerCase())

  if (!attempt || !attempt.lockedUntil) {
    return false
  }

  // Check if lockout period has expired
  if (new Date() > attempt.lockedUntil) {
    // Reset the lockout
    resetLoginAttempts(email)
    return false
  }

  return true
}

/**
 * Record a failed login attempt
 * Locks account after MAX_ATTEMPTS
 */
export async function recordFailedLogin(email: string): Promise<{
  attemptsRemaining: number
  isLocked: boolean
  lockedUntil: Date | null
}> {
  const emailKey = email.toLowerCase()
  const now = new Date()

  let attempt = loginAttempts.get(emailKey)

  if (!attempt) {
    // First failed attempt
    attempt = {
      count: 1,
      lockedUntil: null,
      lastAttempt: now,
    }
  } else {
    // Increment failed attempts
    attempt.count += 1
    attempt.lastAttempt = now

    // Lock account if threshold reached
    if (attempt.count >= MAX_ATTEMPTS) {
      attempt.lockedUntil = new Date(now.getTime() + LOCKOUT_DURATION_MS)
    }
  }

  loginAttempts.set(emailKey, attempt)

  return {
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - attempt.count),
    isLocked: attempt.count >= MAX_ATTEMPTS,
    lockedUntil: attempt.lockedUntil,
  }
}

/**
 * Reset login attempts on successful login
 */
export function resetLoginAttempts(email: string): void {
  loginAttempts.delete(email.toLowerCase())
}

/**
 * Lock an account manually for a specific duration
 */
export async function lockAccount(email: string, durationMs: number = LOCKOUT_DURATION_MS): Promise<void> {
  const emailKey = email.toLowerCase()
  const now = new Date()

  const attempt: LoginAttempt = {
    count: MAX_ATTEMPTS,
    lockedUntil: new Date(now.getTime() + durationMs),
    lastAttempt: now,
  }

  loginAttempts.set(emailKey, attempt)
}

/**
 * Get remaining lockout time in seconds
 */
export async function getRemainingLockoutTime(email: string): Promise<number> {
  const attempt = loginAttempts.get(email.toLowerCase())

  if (!attempt || !attempt.lockedUntil) {
    return 0
  }

  const now = new Date()
  if (now > attempt.lockedUntil) {
    return 0
  }

  return Math.ceil((attempt.lockedUntil.getTime() - now.getTime()) / 1000)
}

/**
 * Get failed attempts count for an email
 */
export function getFailedAttemptsCount(email: string): number {
  const attempt = loginAttempts.get(email.toLowerCase())
  return attempt ? attempt.count : 0
}

/**
 * Clean up expired lockouts (run periodically)
 */
export function cleanupExpiredLockouts(): void {
  const now = new Date()

  for (const [email, attempt] of loginAttempts.entries()) {
    if (attempt.lockedUntil && now > attempt.lockedUntil) {
      loginAttempts.delete(email)
    }
  }
}

// Run cleanup every 10 minutes
setInterval(cleanupExpiredLockouts, 10 * 60 * 1000)
