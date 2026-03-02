import { connectDB } from '~/server/utils/db'
import RefreshToken from '~/server/models/RefreshToken'
import crypto from 'crypto'

/**
 * Logout (Authenticated)
 *
 * Revokes the current refresh token
 * User must provide refresh token in request body
 */
export default defineEventHandler(async (event) => {
  try {
    // Get user from context (set by auth middleware)
    const contextUser = event.context.user

    if (!contextUser) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated',
      })
    }

    // Parse request body
    const body = await readBody<{ refreshToken?: string }>(event)
    const { refreshToken } = body

    if (!refreshToken) {
      // No refresh token provided, just return success
      return {
        message: 'Logged out successfully',
      }
    }

    // Connect to database
    await connectDB()

    // Hash the refresh token to find it in database
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')

    // Find and revoke the refresh token
    const token = await RefreshToken.findOne({
      userId: contextUser.sub,
      tokenHash,
    })

    if (token && !token.isRevoked) {
      token.isRevoked = true
      await token.save()
    }

    // TODO: Log audit action
    console.log(`User ${contextUser.email} logged out`)

    return {
      message: 'Logged out successfully',
    }
  } catch (error: any) {
    // If it's already an H3Error, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('Logout error:', error)

    // Return generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred during logout',
    })
  }
})
