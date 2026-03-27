import bcrypt from 'bcrypt'
import zxcvbn from 'zxcvbn'
import crypto from 'crypto'

const SALT_ROUNDS = 12

/**
 * Hash a plain text password
 * @param plainPassword - Plain text password
 * @returns Hashed password
 */
export async function hashPassword(plainPassword: string): Promise<string> {
  return await bcrypt.hash(plainPassword, SALT_ROUNDS)
}

/**
 * Compare a plain text password with a hashed password
 * @param plainPassword - Plain text password
 * @param hashedPassword - Hashed password from database
 * @returns True if passwords match, false otherwise
 */
export async function comparePassword(
  plainPassword: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(plainPassword, hashedPassword)
}

/**
 * Top 100 most common passwords to prevent weak passwords
 */
const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', 'qwerty', 'abc123', 'monkey', '1234567',
  'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
  'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321', 'superman',
  'qazwsx', 'michael', 'football', 'welcome', 'jesus', 'ninja', 'mustang',
  'password1', '123456a', 'admin', 'admin123', 'root', 'toor', 'pass', 'test',
  'guest', 'user', 'demo', '12345678', '1234', '12345', 'password123',
  'qwerty123', 'welcome123', 'admin1234', 'letmein123', 'changeme',
])

/**
 * Validate password strength using zxcvbn
 * Returns score (0-4) and detailed feedback
 *
 * Score meanings:
 * 0 - too weak (unacceptable)
 * 1 - weak (unacceptable)
 * 2 - fair (acceptable for low-security contexts)
 * 3 - strong (acceptable for most contexts)
 * 4 - very strong (recommended)
 */
export function validatePasswordStrength(password: string): {
  score: number
  feedback: string[]
  isCommon: boolean
  isAcceptable: boolean
} {
  if (!password) {
    return {
      score: 0,
      feedback: ['Password is required'],
      isCommon: false,
      isAcceptable: false,
    }
  }

  // Check if password is in common passwords list
  const isCommon = COMMON_PASSWORDS.has(password.toLowerCase())

  if (isCommon) {
    return {
      score: 0,
      feedback: ['This password is too common and easily guessable'],
      isCommon: true,
      isAcceptable: false,
    }
  }

  // Use zxcvbn to estimate password strength
  const result = zxcvbn(password)
  const feedback: string[] = []

  // Add zxcvbn warning if available
  if (result.feedback.warning) {
    feedback.push(result.feedback.warning)
  }

  // Add zxcvbn suggestions
  if (result.feedback.suggestions && result.feedback.suggestions.length > 0) {
    feedback.push(...result.feedback.suggestions)
  }

  // Minimum score of 2 (fair) is acceptable
  const isAcceptable = result.score >= 2

  if (!isAcceptable && feedback.length === 0) {
    feedback.push('Password is too weak. Please use a stronger password.')
  }

  return {
    score: result.score,
    feedback,
    isCommon: false,
    isAcceptable,
  }
}

/**
 * Generate a secure temporary password
 * Format: 3 random words + 2 digits + 1 special char
 * Example: "Maple-River-Stone42!"
 */
export function generateTemporaryPassword(): string {
  const words = [
    'Apple', 'River', 'Stone', 'Cloud', 'Tiger', 'Ocean', 'Eagle', 'Maple',
    'Storm', 'Cedar', 'Flame', 'Pearl', 'Delta', 'Coral', 'Frost', 'Lunar',
    'Solar', 'Terra', 'Viper', 'Amber', 'Blaze', 'Crown', 'Drift', 'Ember',
  ]
  const specials = ['!', '@', '#', '$', '%', '&', '*']

  // Pick 3 random words
  const selectedWords: string[] = []
  for (let i = 0; i < 3; i++) {
    const randomIndex = crypto.randomInt(words.length)
    selectedWords.push(words[randomIndex])
  }

  // Generate 2 random digits
  const digits = crypto.randomInt(10, 99).toString()

  // Pick a random special character
  const special = specials[crypto.randomInt(specials.length)]

  return `${selectedWords.join('-')}${digits}${special}`
}
