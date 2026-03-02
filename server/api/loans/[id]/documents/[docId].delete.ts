import LoanApplication from '~/server/models/LoanApplication'
import { requireRole } from '~/server/utils/requireRole'
import { deleteFile } from '~/server/utils/cloudinary'

export default defineEventHandler(async (event) => {
  // Require tenant officer role (only officers delete documents)
  const user = requireRole(event, ['tenant_officer'])

  // Get application ID and document ID from route params
  const applicationId = getRouterParam(event, 'id')
  const docId = getRouterParam(event, 'docId')

  if (!applicationId || !docId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Application ID and Document ID are required',
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

  // Find document
  const documentIndex = application.documents.findIndex(
    (doc) => doc._id?.toString() === docId
  )

  if (documentIndex === -1) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Document not found',
    })
  }

  const document = application.documents[documentIndex]

  // Delete file from Cloudinary
  try {
    await deleteFile(document.filePublicId)
  } catch (error) {
    // Log error but continue with document removal
    console.error('Failed to delete file from Cloudinary:', error)
  }

  // Remove document from array
  application.documents.splice(documentIndex, 1)

  // Save application
  await application.save()

  return {
    success: true,
    message: 'Document deleted successfully',
  }
})
