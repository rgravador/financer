import Tenant from '~/server/models/Tenant'
import User from '~/server/models/User'
import LoanApplication from '~/server/models/LoanApplication'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require system admin role
  requireRole(event, ['system_admin'])

  // Get total tenants
  const totalTenants = await Tenant.countDocuments()

  // Get total users
  const totalUsers = await User.countDocuments()

  // Get active loans (approved or in-review)
  const activeLoans = await LoanApplication.countDocuments({
    status: { $in: ['approved', 'in_review'] },
  })

  // Calculate system uptime (mock for now - would use actual system metrics)
  const systemUptime = '98.5%'

  // Get recent tenants (last 4 for table display)
  const recentTenants = await Tenant.find()
    .sort({ createdAt: -1 })
    .limit(4)
    .lean()

  // For each tenant, get their user count
  const tenantsWithCounts = await Promise.all(
    recentTenants.map(async (tenant) => {
      const userCount = await User.countDocuments({
        tenantId: tenant._id,
      })

      return {
        id: tenant._id.toString(),
        name: tenant.name,
        isActive: tenant.isActive,
        userCount,
        createdAt: tenant.createdAt,
      }
    })
  )

  // System health (mock - would connect to actual health checks)
  const systemHealth = {
    database: 'OK' as const,
    api: 'OK' as const,
    storage: 'OK' as const,
  }

  // Resource usage (mock - would connect to actual system metrics)
  const resourceUsage = {
    cpu: 45,
    memory: 62,
    disk: 38,
  }

  return {
    totalTenants,
    totalUsers,
    activeLoans,
    systemUptime,
    recentTenants: tenantsWithCounts,
    systemHealth,
    resourceUsage,
  }
})
