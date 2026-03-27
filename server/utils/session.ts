import RefreshToken from '~/server/models/RefreshToken'
import type { Types } from 'mongoose'

/**
 * Invalidate all active sessions for a user by revoking their refresh tokens
 * @param userId - The user ID whose sessions should be invalidated
 * @returns Number of tokens revoked
 */
export async function invalidateUserSessions(userId: Types.ObjectId | string): Promise<number> {
  const result = await RefreshToken.updateMany(
    {
      userId,
      isRevoked: false,
    },
    {
      $set: { isRevoked: true },
    }
  )

  return result.modifiedCount
}

/**
 * Check if a user has any active sessions
 * @param userId - The user ID to check
 * @returns True if user has at least one active (non-revoked, non-expired) session
 */
export async function hasActiveSessions(userId: Types.ObjectId | string): Promise<boolean> {
  const activeToken = await RefreshToken.findOne({
    userId,
    isRevoked: false,
    expiresAt: { $gt: new Date() },
  })

  return !!activeToken
}
