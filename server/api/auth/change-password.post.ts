import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import RefreshToken from '~/server/models/RefreshToken'
import { comparePassword, hashPassword, validatePasswordStrength } from '~/server/utils/password'
import { validatePassword } from '~/server/utils/validation'

/**
 * Change Password (Authenticated)
 *
 * Allows authenticated users to change their password
 * Invalidates all refresh tokens after password change
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
    const body = await readBody<{ currentPassword: string; newPassword: string }>(event)
    const { currentPassword, newPassword } = body

    // Validate input
    if (!currentPassword || !newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Current password and new password are required',
      })
    }

    // Validate new password format
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: passwordValidation.errors.join(', '),
      })
    }

    // Validate new password strength
    const strengthValidation = validatePasswordStrength(newPassword)
    if (!strengthValidation.isAcceptable) {
      throw createError({
        statusCode: 400,
        statusMessage: strengthValidation.feedback.join(', '),
      })
    }

    // Connect to database
    await connectDB()

    // Find user
    const user = await User.findById(contextUser.sub)

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash)

    if (!isPasswordValid) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Current password is incorrect',
      })
    }

    // Check if new password is same as current
    const isSamePassword = await comparePassword(newPassword, user.passwordHash)
    if (isSamePassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'New password must be different from current password',
      })
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    // Update user password
    user.passwordHash = passwordHash
    await user.save()

    // Revoke all refresh tokens for security
    await RefreshToken.updateMany(
      { userId: user._id, isRevoked: false },
      { isRevoked: true }
    )

    // TODO: Log audit action
    console.log(`Password changed successfully for user ${user.email}`)

    return {
      message: 'Password changed successfully. Please log in again on all devices.',
    }
  } catch (error: any) {
    // If it's already an H3Error, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('Change password error:', error)

    // Return generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while changing your password',
    })
  }
})
