import LoanApplication from '~/server/models/LoanApplication'
import Notification from '~/server/models/Notification'
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

  // Read request body
  const body = await readBody(event)

  // Validate required fields - rejection reason is mandatory
  if (!body.notes || !body.notes.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Rejection reason (notes) is required',
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

  // Verify application is in under_review status
  if (application.status !== 'under_review') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Can only reject applications that are under review',
    })
  }

  // Update application
  application.status = 'rejected'

  // Add status history entry with rejection reason
  application.statusHistory.push({
    status: 'rejected',
    changedBy: user.sub,
    timestamp: new Date(),
    notes: body.notes.trim(),
  })

  // Save application
  await application.save()

  // Log audit action
  await logAction(event, {
    action: 'loan.reject',
    entity: 'LoanApplication',
    entityId: application._id,
    tenantId: user.tenantId,
    metadata: {
      applicationId: applicationId,
      requestedAmount: application.loanDetails.requestedAmount,
      borrowerId: application.borrowerId.toString(),
      rejectionReason: body.notes.trim(),
    },
  })

  // Create notification for officer
  await Notification.create({
    tenantId: application.tenantId,
    userId: application.assignedOfficerId,
    type: 'rejected',
    message: 'Loan application has been rejected',
    applicationId: application._id,
    isRead: false,
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
