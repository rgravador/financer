import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import Tenant from '~/server/models/Tenant'
import { requireSystemAdmin } from '~/server/utils/requireRole'
import mongoose from 'mongoose'

/**
 * GET /api/system/tenants/[id]/users
 *
 * List all tenant administrators for a specific tenant
 * Requires role: system_admin
 */
export default defineEventHandler(async (event) => {
  // Require system admin role
  requireSystemAdmin(event)

  // Get tenant ID from route params
  const tenantId = getRouterParam(event, 'id')

  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tenant ID is required',
    })
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid tenant ID format',
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

  // Find all tenant admins for this tenant (exclude soft-deleted)
  const users = await User.find({
    tenantId,
    role: 'tenant_admin',
    deletedAt: null,
  })
    .select('-passwordHash -__v')
    .sort({ createdAt: -1 })
    .lean()

  // Format users for response
  const formattedUsers = users.map(u => ({
    id: u._id.toString(),
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    isActive: u.isActive,
    mustChangePassword: u.mustChangePassword || false,
    lastLogin: u.lastLogin || null,
    createdAt: u.createdAt,
    updatedAt: u.updatedAt,
  }))

  return {
    users: formattedUsers,
    total: formattedUsers.length,
    tenant: {
      id: tenant._id.toString(),
      name: tenant.name,
      slug: tenant.slug,
      isActive: tenant.isActive,
    },
  }
})
