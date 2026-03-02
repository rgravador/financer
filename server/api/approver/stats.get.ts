import LoanApplication from '~/server/models/LoanApplication'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require tenant approver role
  const user = requireRole(event, ['tenant_approver', 'tenant_admin'])

  const tenantId = user.tenantId

  // Get queue count (submitted + under_review + pending_documents)
  const queueCount = await LoanApplication.countDocuments({
    tenantId,
    status: { $in: ['submitted', 'under_review', 'pending_documents'] },
  })

  // Get reviewed today
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)

  const reviewedToday = await LoanApplication.countDocuments({
    tenantId,
    assignedApproverId: user.sub,
    updatedAt: { $gte: startOfDay },
    status: { $in: ['approved', 'rejected'] },
  })

  // Get total approved by this approver
  const approvedTotal = await LoanApplication.countDocuments({
    tenantId,
    assignedApproverId: user.sub,
    status: 'approved',
  })

  // Get total rejected by this approver
  const rejectedTotal = await LoanApplication.countDocuments({
    tenantId,
    assignedApproverId: user.sub,
    status: 'rejected',
  })

  // Get pending documents count
  const pendingDocumentsCount = await LoanApplication.countDocuments({
    tenantId,
    status: 'pending_documents',
  })

  // Calculate average processing time (hours)
  // For applications this approver has approved or rejected
  const completedApplications = await LoanApplication.find({
    tenantId,
    assignedApproverId: user.sub,
    status: { $in: ['approved', 'rejected'] },
  })
    .select('statusHistory')
    .lean()

  let totalProcessingHours = 0
  let processedCount = 0

  completedApplications.forEach((app) => {
    // Find when it was submitted
    const submittedEntry = app.statusHistory.find(
      (entry) => entry.status === 'submitted'
    )
    // Find when it was approved or rejected
    const completedEntry = app.statusHistory.find(
      (entry) => entry.status === 'approved' || entry.status === 'rejected'
    )

    if (submittedEntry && completedEntry) {
      const submittedTime = new Date(submittedEntry.timestamp).getTime()
      const completedTime = new Date(completedEntry.timestamp).getTime()
      const diffHours = (completedTime - submittedTime) / (1000 * 60 * 60)
      totalProcessingHours += diffHours
      processedCount++
    }
  })

  const avgProcessingTime =
    processedCount > 0 ? totalProcessingHours / processedCount : 0

  return {
    queueCount,
    reviewedToday,
    approvedTotal,
    rejectedTotal,
    avgProcessingTime: Math.round(avgProcessingTime * 10) / 10, // Round to 1 decimal
    pendingDocumentsCount,
  }
})
