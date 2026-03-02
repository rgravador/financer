import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import PasswordResetToken from '~/server/models/PasswordResetToken'
import { hashPassword, validatePasswordStrength } from '~/server/utils/password'
import { validatePassword } from '~/server/utils/validation'

/**
 * Reset Password
 *
 * Validates reset token and updates user password
 */
export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const body = await readBody<{ token: string; newPassword: string }>(event)
    const { token, newPassword } = body

    // Validate input
    if (!token || !newPassword) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Token and new password are required',
      })
    }

    // Validate password format
    const passwordValidation = validatePassword(newPassword)
    if (!passwordValidation.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: passwordValidation.errors.join(', '),
      })
    }

    // Validate password strength
    const strengthValidation = validatePasswordStrength(newPassword)
    if (!strengthValidation.isAcceptable) {
      throw createError({
        statusCode: 400,
        statusMessage: strengthValidation.feedback.join(', '),
      })
    }

    // Connect to database
    await connectDB()

    // Find valid token
    const resetToken = await PasswordResetToken.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    })

    if (!resetToken) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid or expired reset token',
      })
    }

    // Find user
    const user = await User.findById(resetToken.userId)

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found',
      })
    }

    // Hash new password
    const passwordHash = await hashPassword(newPassword)

    // Update user password
    user.passwordHash = passwordHash
    await user.save()

    // Mark token as used
    resetToken.used = true
    await resetToken.save()

    // TODO: Log audit action
    console.log(`Password reset successful for user ${user.email}`)

    return {
      message: 'Password reset successfully. You can now log in with your new password.',
    }
  } catch (error: any) {
    // If it's already an H3Error, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('Reset password error:', error)

    // Return generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while resetting your password',
    })
  }
})
