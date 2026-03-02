import validator from 'validator'

/**
 * Sanitize user input to prevent XSS and SQL injection
 * Removes HTML tags and dangerous SQL patterns
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''

  // Remove HTML tags
  let sanitized = validator.stripLow(input)
  sanitized = validator.escape(sanitized)

  // Remove SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|SCRIPT|JAVASCRIPT|EVAL)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /('|(\\')|(\\"|")|(\\--)|(\\;))/gi,
  ]

  sqlPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '')
  })

  return sanitized.trim()
}

/**
 * Validate email address (RFC 5322 compliant)
 */
export function validateEmail(email: string): boolean {
  if (!email) return false
  return validator.isEmail(email, {
    allow_utf8_local_part: false,
    require_tld: true,
  })
}

/**
 * Validate password strength
 * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!password) {
    return { valid: false, errors: ['Password is required'] }
  }

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Sanitize filename to prevent path traversal attacks
 * Removes special characters and limits length
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return 'unnamed'

  // Remove path traversal patterns
  let sanitized = filename.replace(/\.\./g, '')
  sanitized = sanitized.replace(/[\/\\]/g, '')

  // Remove special characters except alphanumeric, dash, underscore, and dot
  sanitized = sanitized.replace(/[^a-zA-Z0-9._-]/g, '_')

  // Limit length to 255 characters
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'))
    const name = sanitized.substring(0, 255 - ext.length)
    sanitized = name + ext
  }

  return sanitized
}

/**
 * Validate URL format
 */
export function validateURL(url: string): boolean {
  if (!url) return false
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
  })
}

/**
 * Validate phone number (Philippine format)
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone) return false
  // Philippine mobile: 09XX XXX XXXX or +639XX XXX XXXX
  const phonePattern = /^(\+63|0)9\d{9}$/
  return phonePattern.test(phone.replace(/[\s-]/g, ''))
}

/**
 * Sanitize object by sanitizing all string properties
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj }

  Object.keys(sanitized).forEach(key => {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key])
    } else if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
      sanitized[key] = sanitizeObject(sanitized[key])
    }
  })

  return sanitized
}

/**
 * Validate tenant name
 * Requirements: 2-100 characters, no HTML/special chars
 */
export function validateTenantName(name: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!name) {
    return { valid: false, errors: ['Tenant name is required'] }
  }

  if (name.length < 2) {
    errors.push('Tenant name must be at least 2 characters')
  }

  if (name.length > 100) {
    errors.push('Tenant name must not exceed 100 characters')
  }

  // Check for HTML tags
  if (/<[^>]*>/g.test(name)) {
    errors.push('Tenant name cannot contain HTML tags')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate tenant slug
 * Requirements: 2-50 characters, lowercase, alphanumeric and hyphens only, no consecutive hyphens
 */
export function validateTenantSlug(slug: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (!slug) {
    return { valid: false, errors: ['Tenant slug is required'] }
  }

  if (slug.length < 2) {
    errors.push('Tenant slug must be at least 2 characters')
  }

  if (slug.length > 50) {
    errors.push('Tenant slug must not exceed 50 characters')
  }

  // Must be lowercase
  if (slug !== slug.toLowerCase()) {
    errors.push('Tenant slug must be lowercase')
  }

  // Must be alphanumeric and hyphens only
  if (!/^[a-z0-9-]+$/.test(slug)) {
    errors.push('Tenant slug can only contain lowercase letters, numbers, and hyphens')
  }

  // No consecutive hyphens
  if (/--/.test(slug)) {
    errors.push('Tenant slug cannot contain consecutive hyphens')
  }

  // Cannot start or end with hyphen
  if (slug.startsWith('-') || slug.endsWith('-')) {
    errors.push('Tenant slug cannot start or end with a hyphen')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}
