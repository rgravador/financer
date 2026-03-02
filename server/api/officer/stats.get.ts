import LoanApplication from '~/server/models/LoanApplication'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require tenant officer role
  const user = requireRole(event, ['tenant_officer', 'tenant_admin'])

  const tenantId = user.tenantId

  // For officers, show their own applications
  // For tenant admins, show all applications in the tenant
  const filter: any = { tenantId }

  if (user.role === 'tenant_officer') {
    filter.assignedOfficerId = user.sub
  }

  // Get total applications
  const myApplications = await LoanApplication.countDocuments(filter)

  // Get applications by status (grouped)
  const matchStage = user.role === 'tenant_officer'
    ? { tenantId, assignedOfficerId: user.sub }
    : { tenantId }

  const applicationsByStatus = await LoanApplication.aggregate([
    { $match: matchStage },
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

  // Get draft count
  const draftCount = statusCounts.draft || 0

  // Get submitted count
  const submittedCount = statusCounts.submitted || 0

  // Get approved count
  const approvedCount = statusCounts.approved || 0

  return {
    myApplications,
    myApplicationsByStatus: statusCounts,
    draftCount,
    submittedCount,
    approvedCount,
  }
})
