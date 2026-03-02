import { connectDB } from '~/server/utils/db'
import RefreshToken from '~/server/models/RefreshToken'
import mongoose from 'mongoose'

/**
 * POST /api/auth/revoke-session
 *
 * Revoke a specific session (refresh token) by tokenId
 * Requires authentication
 */
export default defineEventHandler(async (event) => {
  // Get authenticated user from context
  const contextUser = event.context.user

  if (!contextUser || !contextUser.sub) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  // Parse request body
  const { tokenId } = await readBody<{ tokenId: string }>(event)

  // Validate input
  if (!tokenId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token ID is required',
    })
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(tokenId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid token ID format',
    })
  }

  await connectDB()

  // Find the token and verify it belongs to the current user
  const token = await RefreshToken.findOne({
    _id: tokenId,
    userId: contextUser.sub,
  })

  if (!token) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Session not found or unauthorized',
    })
  }

  if (token.isRevoked) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Session is already revoked',
    })
  }

  // Revoke the token
  token.isRevoked = true
  await token.save()

  console.log(`Session revoked: ${tokenId} for user: ${contextUser.sub}`)

  return {
    message: 'Session revoked successfully',
    tokenId,
  }
})
