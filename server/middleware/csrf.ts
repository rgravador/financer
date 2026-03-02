import { verifyCSRFToken } from '~/server/utils/csrf'

/**
 * CSRF Protection Middleware
 *
 * Validates CSRF tokens on all state-changing requests (POST, PUT, PATCH, DELETE)
 * Excludes /api/auth/login which uses credentials-based authentication
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)
  const method = event.method

  // Only check state-changing methods
  const stateMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
  if (!stateMethods.includes(method)) {
    return
  }

  // Only run on /api routes
  if (!url.pathname.startsWith('/api/')) {
    return
  }

  // Whitelist: routes that don't require CSRF protection
  const csrfExemptRoutes = [
    '/api/auth/login',
    '/api/auth/refresh',
    '/api/auth/csrf', // Endpoint to get CSRF token
  ]

  if (csrfExemptRoutes.includes(url.pathname)) {
    return
  }

  // Get CSRF token from header
  const csrfToken = getHeader(event, 'x-csrf-token')

  if (!csrfToken) {
    throw createError({
      statusCode: 403,
      statusMessage: 'CSRF token missing',
    })
  }

  // Get user session ID (from JWT payload)
  const user = event.context.user

  if (!user || !user.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    })
  }

  // Verify CSRF token
  const isValid = verifyCSRFToken(csrfToken, user.sub)

  if (!isValid) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Invalid CSRF token',
    })
  }
})
