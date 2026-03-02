import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import Tenant from '~/server/models/Tenant'
import RefreshToken from '~/server/models/RefreshToken'
import { comparePassword } from '~/server/utils/password'
import { signAccessToken, signRefreshToken } from '~/server/utils/jwt'
import { isAccountLocked, recordFailedLogin, resetLoginAttempts, getRemainingLockoutTime } from '~/server/utils/rateLimiter'
import { logAction } from '~/server/utils/audit'
import type { LoginRequest, AuthResponse, JWTPayload } from '~/types'
import crypto from 'crypto'

export default defineEventHandler(async (event) => {
  try {
    // Parse request body
    const body = await readBody<LoginRequest>(event)
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email and password are required',
      })
    }

    // Check if account is locked
    const locked = await isAccountLocked(email)
    if (locked) {
      const remainingTime = await getRemainingLockoutTime(email)
      const minutes = Math.ceil(remainingTime / 60)
      throw createError({
        statusCode: 429,
        statusMessage: `Account is locked due to too many failed login attempts. Please try again in ${minutes} minute${minutes !== 1 ? 's' : ''}.`,
      })
    }

    // Connect to database
    await connectDB()

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() }).lean()

    if (!user) {
      // Record failed login attempt
      await recordFailedLogin(email)
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100))
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials',
      })
    }

    // Check if user is active
    if (!user.isActive) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Account is inactive',
      })
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash)

    if (!isPasswordValid) {
      // Record failed login attempt
      const result = await recordFailedLogin(email)
      // Add delay to prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 100))

      if (result.isLocked) {
        throw createError({
          statusCode: 429,
          statusMessage: 'Account locked due to too many failed login attempts. Please try again in 30 minutes.',
        })
      }

      throw createError({
        statusCode: 401,
        statusMessage: `Invalid credentials. ${result.attemptsRemaining} attempt${result.attemptsRemaining !== 1 ? 's' : ''} remaining.`,
      })
    }

    // Reset login attempts on successful login
    resetLoginAttempts(email)

    // If user has a tenant, check if tenant is active
    if (user.tenantId) {
      const tenant = await Tenant.findById(user.tenantId).lean()

      if (!tenant || !tenant.isActive) {
        throw createError({
          statusCode: 403,
          statusMessage: 'Organization is inactive',
        })
      }
    }

    // Create JWT payload
    const payload: JWTPayload = {
      sub: user._id.toString(),
      tenantId: user.tenantId ? user.tenantId.toString() : null,
      role: user.role,
      email: user.email,
    }

    // Generate tokens
    const accessToken = signAccessToken(payload)
    const refreshToken = signRefreshToken(payload)

    // Store refresh token in database
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
    const userAgent = getHeader(event, 'user-agent') || 'Unknown'
    const ipAddress = getHeader(event, 'x-forwarded-for') ||
                      getHeader(event, 'x-real-ip') ||
                      event.node.req.socket.remoteAddress ||
                      'Unknown'

    await RefreshToken.create({
      userId: user._id,
      tokenHash,
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      device: userAgent,
      ipAddress,
    })

    // Prepare user response (remove sensitive data)
    const userResponse = {
      _id: user._id.toString(),
      tenantId: user.tenantId ? user.tenantId.toString() : null,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }

    // Log audit action - successful login
    await logAction(event, {
      action: 'auth.login',
      entity: 'User',
      entityId: user._id,
      userId: user._id,
      tenantId: user.tenantId,
      metadata: {
        email: user.email,
        role: user.role,
      },
    })

    // Return auth response
    const response: AuthResponse = {
      accessToken,
      refreshToken,
      user: userResponse,
    }

    return response
  } catch (error: any) {
    // If it's already an H3Error, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('Login error:', error)

    // Return generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred during login',
    })
  }
})
