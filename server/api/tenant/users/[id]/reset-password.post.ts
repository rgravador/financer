import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import { requireTenantAdmin } from '~/server/utils/requireRole'
import { hashPassword, generateTemporaryPassword } from '~/server/utils/password'
import { invalidateUserSessions } from '~/server/utils/session'
import { logAction } from '~/server/utils/audit'
import mongoose from 'mongoose'

/**
 * POST /api/tenant/users/[id]/reset-password
 *
 * Reset a tenant user's password
 * Generates a new temporary password and invalidates all active sessions
 * Requires role: tenant_admin
 */
export default defineEventHandler(async (event) => {
  // Require tenant admin role
  const currentUser = requireTenantAdmin(event)

  // Ensure user has a tenantId
  if (!currentUser.tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User is not associated with a tenant',
    })
  }

  // Get user ID from route params
  const userId = getRouterParam(event, 'id')

  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'User ID is required',
    })
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid user ID format',
    })
  }

  await connectDB()

  // Find the user
  const user = await User.findOne({
    _id: userId,
    tenantId: currentUser.tenantId,
    role: { $ne: 'system_admin' },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  // Prevent self-password reset through this endpoint
  if (userId === currentUser.sub) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot reset your own password through this endpoint. Use the change password feature instead.',
    })
  }

  // Generate new temporary password
  const tempPassword = generateTemporaryPassword()
  const passwordHash = await hashPassword(tempPassword)

  // Update user with new password
  user.passwordHash = passwordHash
  user.mustChangePassword = true
  await user.save()

  // Invalidate all active sessions
  const revokedSessions = await invalidateUserSessions(userId)

  // Log the action (DO NOT log the actual password)
  await logAction(event, {
    action: 'reset-password',
    entity: 'user',
    entityId: user._id,
    tenantId: currentUser.tenantId,
    metadata: {
      email: user.email,
      resetBy: currentUser.sub,
      revokedSessions,
    },
  })

  console.log(`Password reset for user: ${user.email}, ${revokedSessions} sessions revoked`)

  return {
    success: true,
    temporaryPassword: tempPassword,
    revokedSessions,
    message: 'Password reset successfully. Please provide the temporary password to the user securely.',
  }
})
