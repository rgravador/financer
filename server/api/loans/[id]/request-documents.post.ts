import LoanApplication from '~/server/models/LoanApplication'
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
  if (!body.requestedDocuments || !Array.isArray(body.requestedDocuments) || body.requestedDocuments.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'requestedDocuments array is required and must not be empty',
    })
  }

  // Validate each requested document
  for (const doc of body.requestedDocuments) {
    if (!doc.documentName || !doc.notes) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Each requested document must have documentName and notes',
      })
    }
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
      statusMessage: 'Can only request documents for applications under review',
    })
  }

  // Update application
  application.status = 'pending_documents'

  // Add requested documents to followUpDocuments array
  for (const doc of body.requestedDocuments) {
    application.followUpDocuments.push({
      documentName: doc.documentName.trim(),
      notes: doc.notes.trim(),
      dueDate: doc.dueDate ? new Date(doc.dueDate) : undefined,
    })
  }

  // Add status history entry
  const documentsList = body.requestedDocuments.map((d: any) => d.documentName).join(', ')
  const historyNotes = body.generalNotes
    ? `${body.generalNotes.trim()} - Requested documents: ${documentsList}`
    : `Requested additional documents: ${documentsList}`

  application.statusHistory.push({
    status: 'pending_documents',
    changedBy: user.sub,
    timestamp: new Date(),
    notes: historyNotes,
  })

  // Save application
  await application.save()

  // Create notification for officer
  await Notification.create({
    tenantId: application.tenantId,
    userId: application.assignedOfficerId,
    type: 'pending_documents',
    message: `Additional documents requested: ${documentsList}`,
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
