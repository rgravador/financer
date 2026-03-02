import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import { requireTenantAdmin } from '~/server/utils/requireRole'
import mongoose from 'mongoose'

/**
 * PATCH /api/tenant/users/[id]
 *
 * Update user: firstName, lastName, role, isActive
 * Ensures user belongs to same tenantId as caller
 * Cannot modify system_admin users
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

  // Parse request body
  const body = await readBody<{
    firstName?: string
    lastName?: string
    role?: string
    isActive?: boolean
  }>(event)

  const { firstName, lastName, role, isActive } = body

  // Validate at least one field is provided
  if (firstName === undefined && lastName === undefined && role === undefined && isActive === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one field must be provided: firstName, lastName, role, isActive',
    })
  }

  // Validate role if provided
  if (role !== undefined) {
    const allowedRoles = ['tenant_officer', 'tenant_approver', 'tenant_admin']
    if (!allowedRoles.includes(role)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Role must be one of: ${allowedRoles.join(', ')}`,
      })
    }
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

  // Cannot modify system_admin users
  if (user.role === 'system_admin') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cannot modify system admin users',
    })
  }

  // Ensure user belongs to same tenant
  if (!user.tenantId || user.tenantId.toString() !== currentUser.tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cannot modify users from other tenants',
    })
  }

  // Update fields
  if (firstName !== undefined) {
    user.firstName = firstName
  }
  if (lastName !== undefined) {
    user.lastName = lastName
  }
  if (role !== undefined) {
    user.role = role
  }
  if (isActive !== undefined) {
    user.isActive = isActive
  }

  await user.save()

  console.log(`User updated: ${user.email}`)

  // Return user without password hash
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    tenantId: user.tenantId?.toString(),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
})
