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

  // Validate income source if provided
  const validIncomeSources = ['salary', 'business', 'freelance', 'remittance', 'pension', 'rental', 'investments', 'other']
  if (body.incomeSource && !validIncomeSources.includes(body.incomeSource)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid income source. Must be one of: ${validIncomeSources.join(', ')}`,
    })
  }

  // Validate government ID type if provided
  const validIdTypes = ['passport', 'drivers_license', 'sss', 'philhealth', 'pagibig', 'tin', 'voters_id', 'postal_id', 'umid', 'national_id', 'other']
  if (body.governmentIdType && !validIdTypes.includes(body.governmentIdType)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid government ID type. Must be one of: ${validIdTypes.join(', ')}`,
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

    // Basic Identity
    firstName: body.firstName.trim(),
    middleName: body.middleName?.trim(),
    lastName: body.lastName.trim(),
    suffix: body.suffix?.trim(),
    email: body.email.toLowerCase().trim(),
    contactNumber: body.contactNumber.trim(),
    dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
    governmentIdType: body.governmentIdType,
    governmentIdNumber: body.governmentIdNumber?.trim(),

    // Stability Indicators
    address: body.address.trim(),
    housingStatus: body.housingStatus,
    previousAddress: body.previousAddress?.trim(),
    yearsAtCurrentAddress: body.yearsAtCurrentAddress,
    employmentType: body.employmentType,
    employer: body.employer?.trim(),
    employmentLength: body.employmentLength,

    // Income & Capacity
    incomeSource: body.incomeSource,
    monthlyIncome: body.monthlyIncome,
    annualIncome: body.annualIncome,
    existingObligations: body.existingObligations,
    dependentsCount: body.dependentsCount,
    monthlyRent: body.monthlyRent,

    // Creditworthiness
    creditScore: body.creditScore,
    creditHistory: body.creditHistory?.trim(),
    pastLoans: body.pastLoans || [],
    hasDefaults: body.hasDefaults,
    hasLatePayments: body.hasLatePayments,

    // Banking
    bankName: body.bankName?.trim(),
    bankAccountNumber: body.bankAccountNumber?.trim(),
    hasBankStatements: body.hasBankStatements,

    // References
    references: body.references || [],

    // Notes
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
