import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import { requireTenantAdmin } from '~/server/utils/requireRole'

/**
 * GET /api/tenant/users
 *
 * Get all users in the tenant admin's organization
 * Requires role: tenant_admin
 * Never returns system_admin users
 */
export default defineEventHandler(async (event) => {
  // Require tenant admin role
  const user = requireTenantAdmin(event)

  // Ensure user has a tenantId
  if (!user.tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User is not associated with a tenant',
    })
  }

  await connectDB()

  // Find all users in the same tenant (exclude system_admin)
  const users = await User.find({
    tenantId: user.tenantId,
    role: { $ne: 'system_admin' },
  })
    .select('-passwordHash -__v')
    .sort({ createdAt: -1 })
    .lean()

  // TODO: Add applications count when LoanApplication model is created
  // For now, return 0 as placeholder

  // Format users
  const formattedUsers = users.map(u => ({
    id: u._id.toString(),
    email: u.email,
    firstName: u.firstName,
    lastName: u.lastName,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
    applicationsCount: 0, // Placeholder until Step 7
  }))

  return {
    users: formattedUsers,
    total: formattedUsers.length,
  }
})
