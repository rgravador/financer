import { connectDB } from '~/server/utils/db'
import Tenant from '~/server/models/Tenant'
import User from '~/server/models/User'
import { requireSystemAdmin } from '~/server/utils/requireRole'

/**
 * GET /api/system/tenants
 *
 * Get all tenants with user counts and loan statistics
 * Requires role: system_admin
 */
export default defineEventHandler(async (event) => {
  // Require system admin role
  requireSystemAdmin(event)

  await connectDB()

  // Fetch all tenants
  const tenants = await Tenant.find().sort({ createdAt: -1 }).lean()

  // Get user counts for each tenant
  const tenantIds = tenants.map(t => t._id)
  const userCounts = await User.aggregate([
    { $match: { tenantId: { $in: tenantIds } } },
    { $group: { _id: '$tenantId', count: { $sum: 1 } } },
  ])

  // Create a map for quick lookup
  const userCountMap = new Map(
    userCounts.map(item => [item._id.toString(), item.count])
  )

  // TODO: Add activeLoansCount when LoanApplication model is created
  // For now, we'll return 0 as a placeholder

  // Format response
  const tenantsWithStats = tenants.map(tenant => ({
    id: tenant._id.toString(),
    name: tenant.name,
    slug: tenant.slug,
    isActive: tenant.isActive,
    createdAt: tenant.createdAt,
    userCount: userCountMap.get(tenant._id.toString()) || 0,
    activeLoansCount: 0, // Placeholder until Step 7 (Loan Application Module)
  }))

  return {
    tenants: tenantsWithStats,
    total: tenantsWithStats.length,
  }
})
