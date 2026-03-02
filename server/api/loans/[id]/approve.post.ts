import LoanApplication from '~/server/models/LoanApplication'
import { LoanType } from '~/server/models/LoanType'
import Notification from '~/server/models/Notification'
import { requireRole } from '~/server/utils/requireRole'

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

  // Validate required fields
  if (body.finalInterestRate == null) {
    throw createError({
      statusCode: 400,
      statusMessage: 'finalInterestRate is required',
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
      statusMessage: 'Can only approve applications that are under review',
    })
  }

  // Fetch loan type to validate interest rate
  const loanType = await LoanType.findById(application.loanTypeId).lean()

  if (!loanType) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Loan type not found',
    })
  }

  // Validate final interest rate is within range
  if (
    body.finalInterestRate < loanType.minInterestRate
    || body.finalInterestRate > loanType.maxInterestRate
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: `Final interest rate must be between ${loanType.minInterestRate}% and ${loanType.maxInterestRate}%`,
    })
  }

  // Update application
  application.status = 'approved'
  application.finalInterestRate = body.finalInterestRate

  // Add status history entry
  application.statusHistory.push({
    status: 'approved',
    changedBy: user.sub,
    timestamp: new Date(),
    notes: body.notes?.trim() || 'Application approved',
  })

  // Save application
  await application.save()

  // Create notifications for officer and tenant admin
  const notificationPromises = [
    // Notify assigned officer
    Notification.create({
      tenantId: application.tenantId,
      userId: application.assignedOfficerId,
      type: 'approved',
      message: `Loan application has been approved with ${body.finalInterestRate}% interest rate`,
      applicationId: application._id,
      isRead: false,
    }),
  ]

  await Promise.all(notificationPromises)

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
