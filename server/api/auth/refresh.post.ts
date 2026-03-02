import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import RefreshToken from '~/server/models/RefreshToken'
import { verifyRefreshToken, signAccessToken } from '~/server/utils/jwt'
import type { RefreshTokenRequest } from '~/types'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const body = await readBody<RefreshTokenRequest>(event)
    const { refreshToken } = body

    // Validate input
    if (!refreshToken) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Refresh token is required',
      })
    }

    // Verify refresh token JWT
    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch (error: any) {
      throw createError({
        statusCode: 401,
        statusMessage: error.message || 'Invalid refresh token',
      })
    }

    // Connect to database
    await connectDB()

    // Check if refresh token exists in database and is not revoked
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const storedToken = await RefreshToken.findOne({
      userId: payload.sub,
      tokenHash,
    })

    if (!storedToken) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Refresh token not found',
      })
    }

    if (storedToken.isRevoked) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Refresh token has been revoked',
      })
    }

    // Check if token is expired
    if (new Date() > storedToken.expiresAt) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Refresh token has expired',
      })
    }

    // Verify user still exists and is active
    const user = await User.findById(payload.sub).lean()

    if (!user || !user.isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found or inactive',
      })
    }

    // Generate new access token
    const accessToken = signAccessToken({
      sub: user._id.toString(),
      tenantId: user.tenantId ? user.tenantId.toString() : null,
      role: user.role,
      email: user.email,
    })

    return { accessToken }
  } catch (error: any) {
    // If it's already an H3Error, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('Refresh token error:', error)

    // Return generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while refreshing token',
    })
  }
})
