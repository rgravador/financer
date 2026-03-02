import Borrower from '~/server/models/Borrower'
import { requireRole } from '~/server/utils/requireRole'
import { validateEmail } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  // Require tenant officer, approver, or admin role
  const user = requireRole(event, ['tenant_officer', 'tenant_approver', 'tenant_admin'])

  // Get borrower ID from route params
  const borrowerId = getRouterParam(event, 'id')

  if (!borrowerId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Borrower ID is required',
    })
  }

  // Read request body
  const body = await readBody(event)

  // Fetch borrower
  const borrower = await Borrower.findById(borrowerId)

  if (!borrower) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Borrower not found',
    })
  }

  // Verify borrower belongs to user's tenant
  if (borrower.tenantId.toString() !== user.tenantId.toString()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied',
    })
  }

  // Validate email if provided
  if (body.email !== undefined) {
    if (!validateEmail(body.email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format',
      })
    }

    // Check if email already exists for another borrower in this tenant
    const emailLower = body.email.toLowerCase().trim()
    if (emailLower !== borrower.email.toLowerCase()) {
      const existingBorrower = await Borrower.findOne({
        tenantId: user.tenantId,
        email: emailLower,
        _id: { $ne: borrowerId },
      })

      if (existingBorrower) {
        throw createError({
          statusCode: 409,
          statusMessage: 'A borrower with this email already exists',
        })
      }
    }
  }

  // Validate employment type if provided
  if (body.employmentType !== undefined) {
    const validEmploymentTypes = ['employed', 'self_employed', 'business_owner', 'ofw', 'other']
    if (!validEmploymentTypes.includes(body.employmentType)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid employment type. Must be one of: ${validEmploymentTypes.join(', ')}`,
      })
    }
  }

  // Validate monthly income if provided
  if (body.monthlyIncome !== undefined && body.monthlyIncome < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Monthly income must be a positive number',
    })
  }

  // Update borrower fields
  if (body.firstName !== undefined) borrower.firstName = body.firstName.trim()
  if (body.lastName !== undefined) borrower.lastName = body.lastName.trim()
  if (body.email !== undefined) borrower.email = body.email.toLowerCase().trim()
  if (body.contactNumber !== undefined) borrower.contactNumber = body.contactNumber.trim()
  if (body.address !== undefined) borrower.address = body.address.trim()
  if (body.employmentType !== undefined) borrower.employmentType = body.employmentType
  if (body.employer !== undefined) borrower.employer = body.employer ? body.employer.trim() : undefined
  if (body.monthlyIncome !== undefined) borrower.monthlyIncome = body.monthlyIncome
  if (body.dateOfBirth !== undefined) borrower.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : undefined
  if (body.notes !== undefined) borrower.notes = body.notes ? body.notes.trim() : undefined
  if (body.isActive !== undefined) borrower.isActive = body.isActive

  // Save updated borrower
  await borrower.save()

  // Transform to match interface
  return {
    ...borrower.toObject(),
    id: borrower._id.toString(),
    tenantId: borrower.tenantId.toString(),
  }
})
