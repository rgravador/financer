import Tenant from '~/server/models/Tenant'
import User from '~/server/models/User'
import LoanApplication from '~/server/models/LoanApplication'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require system admin role
  requireRole(event, ['system_admin'])

  // Get total tenants
  const totalTenants = await Tenant.countDocuments()

  // Get active tenants
  const activeTenants = await Tenant.countDocuments({ isActive: true })

  // Get suspended tenants
  const suspendedTenants = await Tenant.countDocuments({ isActive: false })

  // Get total users
  const totalUsers = await User.countDocuments()

  // Get total applications
  const totalApplications = await LoanApplication.countDocuments()

  // Get applications by status (grouped)
  const applicationsByStatus = await LoanApplication.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ])

  // Format applications by status
  const statusCounts = applicationsByStatus.reduce((acc, item) => {
    acc[item._id] = item.count
    return acc
  }, {} as Record<string, number>)

  // Get recent tenants (last 5)
  const recentTenants = await Tenant.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .lean()

  // For each tenant, get their application count
  const tenantsWithCounts = await Promise.all(
    recentTenants.map(async (tenant) => {
      const applicationCount = await LoanApplication.countDocuments({
        tenantId: tenant._id,
      })

      return {
        id: tenant._id.toString(),
        name: tenant.name,
        slug: tenant.slug,
        isActive: tenant.isActive,
        createdAt: tenant.createdAt,
        applicationCount,
      }
    })
  )

  return {
    totalTenants,
    activeTenants,
    suspendedTenants,
    totalUsers,
    totalApplications,
    applicationsByStatus: statusCounts,
    recentTenants: tenantsWithCounts,
  }
})
