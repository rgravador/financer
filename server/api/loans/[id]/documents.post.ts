import LoanApplication from '~/server/models/LoanApplication'
import { requireRole } from '~/server/utils/requireRole'
import { uploadFile } from '~/server/utils/cloudinary'

export default defineEventHandler(async (event) => {
  // Require tenant officer role (only officers upload documents)
  const user = requireRole(event, ['tenant_officer'])

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
  if (!body.documentName || !body.fileBase64) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: documentName, fileBase64',
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

  // Upload file to Cloudinary
  const folder = `financer/${user.tenantId}/loan-documents`
  let uploadResult

  try {
    uploadResult = await uploadFile(body.fileBase64, folder)
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to upload file to cloud storage',
    })
  }

  // Add document to application
  application.documents.push({
    documentName: body.documentName.trim(),
    fileUrl: uploadResult.url,
    filePublicId: uploadResult.publicId,
    uploadedAt: new Date(),
    status: 'uploaded',
  })

  // Save application
  await application.save()

  // Find the newly added document
  const newDocument = application.documents[application.documents.length - 1]

  // Return the uploaded document
  return {
    ...newDocument.toObject(),
    id: newDocument._id?.toString(),
  }
})
