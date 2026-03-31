import LoanApplication from '~/server/models/LoanApplication'
import { requireRole } from '~/server/utils/requireRole'
import { logAction } from '~/server/utils/audit'

export default defineEventHandler(async (event) => {
  // Require tenant approver role
  const user = requireRole(event, ['tenant_approver'])

  // Get application ID from route params
  const applicationId = getRouterParam(event, 'id')

  if (!applicationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Application ID is required',
    })
  }

  // Fetch application
  const application = await LoanApplication.findById(applicationId)

  if (!application) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Application not found',
    })
  }

  // Verify application belongs to user's tenant
  if (application.tenantId.toString() !== user.tenantId.toString()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied',
    })
  }

  // Verify application is in submitted status
  if (application.status !== 'submitted') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Can only start review on submitted applications',
    })
  }

  // Update status to under_review
  application.status = 'under_review'
  application.assignedApproverId = user.sub

  // Add status history entry
  application.statusHistory.push({
    status: 'under_review',
    changedBy: user.sub,
    timestamp: new Date(),
    notes: 'Application claimed for review',
  })

  // Save application
  await application.save()

  // Log audit action
  await logAction(event, {
    action: 'loan.start_review',
    entity: 'LoanApplication',
    entityId: application._id,
    tenantId: user.tenantId,
    metadata: {
      applicationId: applicationId,
      requestedAmount: application.loanDetails.requestedAmount,
      borrowerId: application.borrowerId.toString(),
    },
  })

  // Transform to match interface
  return {
    ...application.toObject(),
    id: application._id.toString(),
    tenantId: application.tenantId.toString(),
    loanTypeId: application.loanTypeId.toString(),
    borrowerId: application.borrowerId.toString(),
    coBorrowerId: application.coBorrowerId?.toString(),
    assignedOfficerId: application.assignedOfficerId.toString(),
    assignedApproverId: application.assignedApproverId?.toString(),
    statusHistory: application.statusHistory.map((entry) => ({
      ...entry.toObject(),
      id: entry._id?.toString(),
      changedBy: entry.changedBy.toString(),
    })),
    documents: application.documents.map((doc) => ({
      ...doc.toObject(),
      id: doc._id?.toString(),
    })),
    followUpDocuments: application.followUpDocuments.map((doc) => ({
      ...doc.toObject(),
      id: doc._id?.toString(),
    })),
  }
})
