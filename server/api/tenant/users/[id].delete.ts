import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import { requireTenantAdmin } from '~/server/utils/requireRole'
import mongoose from 'mongoose'

/**
 * DELETE /api/tenant/users/[id]
 *
 * Soft-delete user (sets isActive: false)
 * Ensures user belongs to same tenantId as caller
 * Cannot delete system_admin users or self
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

  // Cannot delete self
  if (userId === currentUser.sub) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot deactivate your own account',
    })
  }

  await connectDB()

  // Find user
  const user = await User.findById(userId)

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'User not found',
    })
  }

  // Cannot delete system_admin users
  if (user.role === 'system_admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cannot deactivate system admin users',
    })
  }

  // Ensure user belongs to same tenant
  if (!user.tenantId || user.tenantId.toString() !== currentUser.tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cannot modify users from other tenants',
    })
  }

  // Soft delete by setting isActive to false
  user.isActive = false
  await user.save()

  console.log(`User deactivated: ${user.email}`)

  return {
    message: 'User deactivated successfully',
    userId: user._id.toString(),
  }
})
