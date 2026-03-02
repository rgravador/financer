import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import PasswordResetToken from '~/server/models/PasswordResetToken'
import crypto from 'crypto'

/**
 * Forgot Password
 *
 * Generates a password reset token and sends it via email
 * Always returns success message to prevent email enumeration
 */
export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const body = await readBody<{ email: string }>(event)
    const { email } = body

    // Validate input
    if (!email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email is required',
      })
    }

    // Connect to database
    await connectDB()

    // Find user by email (case-insensitive)
    const user = await User.findOne({ email: email.toLowerCase() }).lean()

    // Generate token even if user doesn't exist (prevent enumeration)
    const token = crypto.randomBytes(32).toString('hex')

    if (user) {
      // Store token in database
      await PasswordResetToken.create({
        userId: user._id,
        token,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        used: false,
      })

      // TODO: Send email with reset link
      // const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`
      // await sendEmail({
      //   to: user.email,
      //   subject: 'Password Reset Request',
      //   html: `Click here to reset your password: ${resetLink}`,
      // })

      console.log(`Password reset token for ${email}:`, token)
      console.log(`Reset link: http://localhost:3000/reset-password?token=${token}`)
    }

    // Always return success message (don't reveal if email exists)
    return {
      message: 'If an account exists with this email, you will receive password reset instructions.',
    }
  } catch (error: any) {
    // If it's already an H3Error, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('Forgot password error:', error)

    // Return generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while processing your request',
    })
  }
})
