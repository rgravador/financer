import { generateCSRFToken, storeCSRFToken, getCSRFToken } from '~/server/utils/csrf'

/**
 * Get CSRF Token
 *
 * Returns a CSRF token for the authenticated user's session
 * This token must be included in X-CSRF-Token header for all state-changing requests
 */
export default defineEventHandler(async (event) => {
  try {
    // Get user from context (set by auth middleware)
    const user = event.context.user

    if (!user || !user.sub) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated',
      })
    }

    // Check if user already has a CSRF token
    let token = getCSRFToken(user.sub)

    // Generate new token if none exists
    if (!token) {
      token = generateCSRFToken()
      storeCSRFToken(user.sub, token)
    }

    return { csrfToken: token }
  } catch (error: any) {
    // If it's already an H3Error, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('CSRF token generation error:', error)

    // Return generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while generating CSRF token',
    })
  }
})
