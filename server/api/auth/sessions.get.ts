import { connectDB } from '~/server/utils/db'
import RefreshToken from '~/server/models/RefreshToken'

/**
 * GET /api/auth/sessions
 *
 * Returns all active sessions (refresh tokens) for the current user
 * Requires authentication
 */
export default defineEventHandler(async (event) => {
  // Get authenticated user from context (set by auth middleware)
  const contextUser = event.context.user

  if (!contextUser || !contextUser.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  await connectDB()

  // Get current refresh token from request to identify current session
  const authHeader = getHeader(event, 'authorization')
  let currentTokenHash: string | null = null

  // Note: We can't directly get refresh token from client as it's httpOnly
  // Instead, we'll compare IP and device info to mark current session
  const currentIp = getHeader(event, 'x-forwarded-for') ||
                    getHeader(event, 'x-real-ip') ||
                    event.node.req.socket.remoteAddress ||
                    'Unknown'
  const currentDevice = getHeader(event, 'user-agent') || 'Unknown'

  // Fetch all active refresh tokens for the user
  const tokens = await RefreshToken.find({
    userId: contextUser.sub,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .lean()

  // Format sessions for client
  const sessions = tokens.map((token) => {
    // Mark current session based on IP and device match
    const isCurrent = token.ipAddress === currentIp && token.device === currentDevice

    return {
      tokenId: token._id.toString(),
      device: token.device,
      ipAddress: token.ipAddress,
      lastActive: token.createdAt,
      isCurrent,
    }
  })

  return {
    sessions,
    total: sessions.length,
  }
})
