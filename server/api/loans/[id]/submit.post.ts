import LoanApplication from '~/server/models/LoanApplication'
import { LoanType } from '~/server/models/LoanType'
import Notification from '~/server/models/Notification'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require tenant officer role (only officers submit)
  const user = requireRole(event, ['tenant_officer'])

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

  // Verify application is in draft status
  if (application.status !== 'draft') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Can only submit applications in draft status',
    })
  }

  // Fetch loan type to check required documents
  const loanType = await LoanType.findById(application.loanTypeId).lean()

  if (!loanType) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Loan type not found',
    })
  }

  // Check if all required documents are uploaded
  const requiredDocs = loanType.requiredDocuments.filter((doc) => doc.isRequired)
  const uploadedDocNames = application.documents.map((doc) => doc.documentName.toLowerCase())

  const missingDocs = requiredDocs.filter(
    (reqDoc) => !uploadedDocNames.includes(reqDoc.documentName.toLowerCase())
  )

  if (missingDocs.length > 0) {
    throw createError({
      statusCode: 400,
      statusMessage: `Missing required documents: ${missingDocs.map((d) => d.documentName).join(', ')}`,
    })
  }

  // Update status to submitted
  application.status = 'submitted'

  // Add status history entry
  application.statusHistory.push({
    status: 'submitted',
    changedBy: user.sub,
    timestamp: new Date(),
    notes: 'Application submitted for review',
  })

  // Save application
  await application.save()

  // Create notification for assigned approver if assigned
  if (application.assignedApproverId) {
    await Notification.create({
      tenantId: application.tenantId,
      userId: application.assignedApproverId,
      type: 'new_application',
      message: `New loan application submitted for your review`,
      applicationId: application._id,
      isRead: false,
    })
  }

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
