import { connectDB } from '~/server/utils/db'
import RefreshToken from '~/server/models/RefreshToken'

/**
 * Logout All Devices (Authenticated)
 *
 * Revokes all refresh tokens for the current user
 * Forces logout on all devices/sessions
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

    // Connect to database
    await connectDB()

    // Revoke all refresh tokens for this user
    const result = await RefreshToken.updateMany(
      {
        userId: contextUser.sub,
        isRevoked: false,
      },
      {
        isRevoked: true,
      }
    )

    // TODO: Log audit action
    console.log(`User ${contextUser.email} logged out from all devices (${result.modifiedCount} sessions revoked)`)

    return {
      message: 'Successfully logged out from all devices',
      sessionsRevoked: result.modifiedCount,
    }
  } catch (error: any) {
    // If it's already an H3Error, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('Logout all error:', error)

    // Return generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred during logout',
    })
  }
})
