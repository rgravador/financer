import User from '~/server/models/User'
import LoanApplication from '~/server/models/LoanApplication'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require tenant admin role
  const user = requireRole(event, ['tenant_admin'])

  const tenantId = user.tenantId

  // Get total applications
  const totalApplications = await LoanApplication.countDocuments({ tenantId })

  // Get applications by status (grouped)
  const applicationsByStatus = await LoanApplication.aggregate([
    { $match: { tenantId } },
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

  // Get total officers
  const totalOfficers = await User.countDocuments({
    tenantId,
    role: 'tenant_officer',
    isActive: true,
  })

  // Get total approvers
  const totalApprovers = await User.countDocuments({
    tenantId,
    role: 'tenant_approver',
    isActive: true,
  })

  // Get pending approval count
  const pendingApprovalCount = await LoanApplication.countDocuments({
    tenantId,
    status: { $in: ['submitted', 'under_review'] },
  })

  // Get approved this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const approvedThisMonth = await LoanApplication.countDocuments({
    tenantId,
    status: 'approved',
    updatedAt: { $gte: startOfMonth },
  })

  // Get rejected this month
  const rejectedThisMonth = await LoanApplication.countDocuments({
    tenantId,
    status: 'rejected',
    updatedAt: { $gte: startOfMonth },
  })

  // Get total disbursed amount
  const disbursedApplications = await LoanApplication.find({
    tenantId,
    status: 'disbursed',
  }).select('loanDetails.requestedAmount')

  const totalDisbursedAmount = disbursedApplications.reduce(
    (sum, app) => sum + (app.loanDetails?.requestedAmount || 0),
    0
  )

  // Get recent applications (last 5)
  const recentApplications = await LoanApplication.find({ tenantId })
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('borrowerId', 'firstName lastName')
    .populate('loanTypeId', 'name')
    .lean()

  // Transform recent applications
  const transformedApplications = recentApplications.map((app) => ({
    id: app._id.toString(),
    applicantName: app.borrowerId
      ? `${app.borrowerId.firstName} ${app.borrowerId.lastName}`
      : 'N/A',
    loanType: app.loanTypeId?.name || 'N/A',
    requestedAmount: app.loanDetails.requestedAmount,
    status: app.status,
    createdAt: app.createdAt,
  }))

  return {
    totalApplications,
    applicationsByStatus: statusCounts,
    totalOfficers,
    totalApprovers,
    pendingApprovalCount,
    approvedThisMonth,
    rejectedThisMonth,
    totalDisbursedAmount,
    recentApplications: transformedApplications,
  }
})
