import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import Tenant from '~/server/models/Tenant'
import { requireSystemAdmin } from '~/server/utils/requireRole'
import { invalidateUserSessions } from '~/server/utils/session'
import { logAction } from '~/server/utils/audit'
import mongoose from 'mongoose'

/**
 * DELETE /api/system/tenants/[id]/users/[userId]
 *
 * Soft delete a tenant administrator
 * Sets deletedAt timestamp and invalidates all active sessions
 * Requires role: system_admin
 */
export default defineEventHandler(async (event) => {
  // Require system admin role
  const currentUser = requireSystemAdmin(event)

  // Get tenant ID and user ID from route params
  const tenantId = getRouterParam(event, 'id')
  const userId = getRouterParam(event, 'userId')

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

  // Check if this is the last active tenant admin
  const activeTenantAdmins = await User.countDocuments({
    tenantId,
    role: 'tenant_admin',
    isActive: true,
    deletedAt: null,
    _id: { $ne: userId },
  })

  if (activeTenantAdmins === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot delete the last active tenant administrator. The tenant must have at least one active admin.',
    })
  }

  // Soft delete the user
  user.deletedAt = new Date()
  user.deletedBy = new mongoose.Types.ObjectId(currentUser.sub)
  user.isActive = false
  await user.save()

  // Invalidate all active sessions for this user
  const revokedSessions = await invalidateUserSessions(userId)

  // Log the action
  await logAction(event, {
    action: 'delete',
    entity: 'user',
    entityId: user._id,
    tenantId,
    metadata: {
      email: user.email,
      deletedBy: currentUser.sub,
      revokedSessions,
    },
  })

  console.log(`Tenant admin soft-deleted: ${user.email}, ${revokedSessions} sessions revoked`)

  return {
    success: true,
    message: 'Tenant admin deleted successfully',
    revokedSessions,
  }
})
