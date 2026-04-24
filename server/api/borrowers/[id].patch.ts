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

  // Update string fields
  const stringFields = ['firstName', 'middleName', 'lastName', 'suffix', 'contactNumber', 'address', 'previousAddress', 'employer', 'creditHistory', 'bankName', 'bankAccountNumber', 'notes', 'governmentIdNumber'] as const
  for (const field of stringFields) {
    if (body[field] !== undefined) {
      ;(borrower as any)[field] = body[field] ? body[field].trim() : undefined
    }
  }

  // Update email (special handling for lowercase)
  if (body.email !== undefined) borrower.email = body.email.toLowerCase().trim()

  // Update enum fields
  if (body.employmentType !== undefined) borrower.employmentType = body.employmentType
  if (body.incomeSource !== undefined) borrower.incomeSource = body.incomeSource
  if (body.governmentIdType !== undefined) borrower.governmentIdType = body.governmentIdType
  if (body.housingStatus !== undefined) (borrower as any).housingStatus = body.housingStatus

  // Update number fields
  const numberFields = ['monthlyIncome', 'annualIncome', 'existingObligations', 'dependentsCount', 'monthlyRent', 'yearsAtCurrentAddress', 'employmentLength', 'creditScore'] as const
  for (const field of numberFields) {
    if (body[field] !== undefined) {
      ;(borrower as any)[field] = body[field]
    }
  }

  // Update boolean fields
  const booleanFields = ['isActive', 'hasDefaults', 'hasLatePayments', 'hasBankStatements'] as const
  for (const field of booleanFields) {
    if (body[field] !== undefined) {
      ;(borrower as any)[field] = body[field]
    }
  }

  // Update date fields
  if (body.dateOfBirth !== undefined) borrower.dateOfBirth = body.dateOfBirth ? new Date(body.dateOfBirth) : undefined

  // Update array fields
  if (body.pastLoans !== undefined) borrower.pastLoans = body.pastLoans
  if (body.references !== undefined) borrower.references = body.references

  // Save updated borrower
  await borrower.save()

  // Transform to match interface
  return {
    ...borrower.toObject(),
    id: borrower._id.toString(),
    tenantId: borrower.tenantId.toString(),
  }
})
