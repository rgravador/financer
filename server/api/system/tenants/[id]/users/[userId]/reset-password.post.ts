import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import Tenant from '~/server/models/Tenant'
import SystemSettings, { SETTING_KEYS } from '~/server/models/SystemSettings'
import { requireSystemAdmin } from '~/server/utils/requireRole'
import { hashPassword, generateTemporaryPassword } from '~/server/utils/password'
import { invalidateUserSessions } from '~/server/utils/session'
import { logAction } from '~/server/utils/audit'
import mongoose from 'mongoose'

/**
 * POST /api/system/tenants/[id]/users/[userId]/reset-password
 *
 * Reset a tenant administrator's password
 * Generates a new temporary password and invalidates all active sessions
 * Optionally use the configured default password with useDefault: true
 * Requires role: system_admin
 */
export default defineEventHandler(async (event) => {
  // Require system admin role
  const currentUser = requireSystemAdmin(event)

  // Get tenant ID and user ID from route params
  const tenantId = getRouterParam(event, 'id')
  const userId = getRouterParam(event, 'userId')

  // Parse request body for optional useDefault flag
  const body = await readBody<{ useDefault?: boolean }>(event).catch(() => ({}))
  const useDefault = body?.useDefault || false

  if (!tenantId || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tenant ID and User ID are required',
    })
  }

  // Validate ObjectId formats
  if (!mongoose.Types.ObjectId.isValid(tenantId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid ID format',
    })
  }

  await connectDB()

  // Verify tenant exists
  const tenant = await Tenant.findById(tenantId)
  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found',
    })
  }

  // Find the user
  const user = await User.findOne({
    _id: userId,
    tenantId,
    role: 'tenant_admin',
    deletedAt: null,
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant admin not found',
    })
  }

  // Check for default password if useDefault is requested
  let tempPassword: string
  let usedDefaultPassword = false

  if (useDefault) {
    const defaultPasswordSetting = await SystemSettings.findOne({
      key: SETTING_KEYS.DEFAULT_TENANT_ADMIN_PASSWORD,
    })

    if (!defaultPasswordSetting?.value) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No default password is configured. Please configure a default password first.',
      })
    }

    tempPassword = defaultPasswordSetting.value
    usedDefaultPassword = true
  } else {
    tempPassword = generateTemporaryPassword()
  }

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
    tenantId,
    metadata: {
      email: user.email,
      resetBy: currentUser.sub,
      revokedSessions,
      usedDefaultPassword,
    },
  })

  console.log(`Password reset for tenant admin: ${user.email}, ${revokedSessions} sessions revoked, useDefault: ${usedDefaultPassword}`)

  return {
    success: true,
    temporaryPassword: tempPassword,
    usedDefaultPassword,
    revokedSessions,
    message: usedDefaultPassword
      ? 'Password reset to default successfully.'
      : 'Password reset successfully. Please provide the temporary password to the user securely.',
  }
})
