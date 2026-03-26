import { verifyAccessToken } from '~/server/utils/jwt'

/**
 * Auth middleware - Protects all /api/** routes except whitelisted auth endpoints
 * Runs on every API request to verify JWT token
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  // Only run on /api routes
  if (!url.pathname.startsWith('/api/')) {
    return
  }

  // Whitelist: routes that don't require authentication
  const publicRoutes = [
    '/api/auth/login',
    '/api/auth/refresh',
  ]

  if (publicRoutes.includes(url.pathname)) {
    return
  }

  // Get Authorization header
  const authHeader = getHeader(event, 'authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.error(`❌ Auth middleware: Missing auth header for ${url.pathname}`)
    throw createError({
      statusCode: 401,
      statusMessage: 'Missing or invalid authorization header',
    })
  }

  // Extract token
  const token = authHeader.substring(7) // Remove 'Bearer ' prefix

  // Verify token
  try {
    const decoded = verifyAccessToken(token)

    // Attach user to event context for use in route handlers
    event.context.user = decoded

    console.log(`✅ Auth middleware: User ${decoded.email} (${decoded.role}) authenticated for ${url.pathname}`)
  } catch (error: any) {
    console.error(`❌ Auth middleware: Token verification failed for ${url.pathname}:`, error.message)
    throw createError({
      statusCode: 401,
      statusMessage: error.message || 'Invalid or expired token',
    })
  }
})
