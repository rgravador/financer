import Borrower from '~/server/models/Borrower'
import { requireRole } from '~/server/utils/requireRole'
import { validateEmail } from '~/server/utils/validation'

export default defineEventHandler(async (event) => {
  // Require tenant officer, approver, or admin role
  const user = requireRole(event, ['tenant_officer', 'tenant_approver', 'tenant_admin'])

  // Read request body
  const body = await readBody(event)

  // Validate required fields
  if (!body.firstName || !body.lastName || !body.email || !body.contactNumber || !body.address || !body.employmentType || body.monthlyIncome == null) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: firstName, lastName, email, contactNumber, address, employmentType, monthlyIncome',
    })
  }

  // Validate email
  if (!validateEmail(body.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email format',
    })
  }

  // Validate employment type
  const validEmploymentTypes = ['employed', 'self_employed', 'business_owner', 'ofw', 'other']
  if (!validEmploymentTypes.includes(body.employmentType)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid employment type. Must be one of: ${validEmploymentTypes.join(', ')}`,
    })
  }

  // Validate monthly income
  if (body.monthlyIncome < 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Monthly income must be a positive number',
    })
  }

  // Check if borrower with same email already exists in this tenant
  const existingBorrower = await Borrower.findOne({
    tenantId: user.tenantId,
    email: body.email.toLowerCase().trim(),
  })

  if (existingBorrower) {
    throw createError({
      statusCode: 409,
      statusMessage: 'A borrower with this email already exists',
    })
  }

  // Create borrower
  const borrower = await Borrower.create({
    tenantId: user.tenantId,
    firstName: body.firstName.trim(),
    lastName: body.lastName.trim(),
    email: body.email.toLowerCase().trim(),
    contactNumber: body.contactNumber.trim(),
    address: body.address.trim(),
    employmentType: body.employmentType,
    employer: body.employer?.trim(),
    monthlyIncome: body.monthlyIncome,
    dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
    notes: body.notes?.trim(),
    isActive: true,
  })

  // Transform to match interface
  return {
    ...borrower.toObject(),
    id: borrower._id.toString(),
    tenantId: borrower.tenantId.toString(),
  }
})
