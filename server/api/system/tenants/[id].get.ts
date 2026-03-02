import { connectDB } from '~/server/utils/db'
import Tenant from '~/server/models/Tenant'
import User from '~/server/models/User'
import { requireSystemAdmin } from '~/server/utils/requireRole'
import mongoose from 'mongoose'

/**
 * GET /api/system/tenants/[id]
 *
 * Get single tenant details with user list
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

  // Find tenant
  const tenant = await Tenant.findById(tenantId).lean()

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found',
    })
  }

  // Find all users in this tenant
  const users = await User.find({ tenantId: tenant._id })
    .select('-passwordHash -__v')
    .sort({ createdAt: -1 })
    .lean()

  // Format users
  const formattedUsers = users.map(user => ({
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  }))

  // TODO: Add activeLoansCount when LoanApplication model is created
  const activeLoansCount = 0 // Placeholder

  return {
    id: tenant._id.toString(),
    name: tenant.name,
    slug: tenant.slug,
    isActive: tenant.isActive,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
    userCount: formattedUsers.length,
    activeLoansCount,
    users: formattedUsers,
  }
})
