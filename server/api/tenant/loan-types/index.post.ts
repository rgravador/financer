import { requireTenantAdmin } from '~/server/utils/requireRole'
import { connectDB } from '~/server/utils/db'
import { LoanType } from '~/server/models/LoanType'

/**
 * POST /api/tenant/loan-types
 * Creates a new loan type
 * Requires: tenant_admin role
 */
export default defineEventHandler(async (event) => {
  const user = requireTenantAdmin(event)

  if (!user.tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User is not associated with a tenant',
    })
  }

  // Read and validate request body
  const body = await readBody<{
    name: string
    description?: string
    defaultInterestRate: number
    minInterestRate: number
    maxInterestRate: number
    minLoanAmount: number
    maxLoanAmount: number
    availableTerms: number[]
    requiredDocuments?: Array<{
      documentName: string
      description?: string
      isRequired: boolean
    }>
  }>(event)

  // Validate required fields
  if (!body.name || !body.name.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Loan type name is required',
    })
  }

  if (body.name.length < 2 || body.name.length > 100) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Loan type name must be between 2 and 100 characters',
    })
  }

  if (body.defaultInterestRate == null || body.minInterestRate == null || body.maxInterestRate == null) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Interest rates (default, min, max) are required',
    })
  }

  if (body.minLoanAmount == null || body.maxLoanAmount == null) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Loan amounts (min, max) are required',
    })
  }

  if (!body.availableTerms || body.availableTerms.length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one term must be specified',
    })
  }

  // Validate interest rate ranges
  if (body.maxInterestRate < body.minInterestRate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Maximum interest rate must be greater than or equal to minimum interest rate',
    })
  }

  if (body.defaultInterestRate < body.minInterestRate || body.defaultInterestRate > body.maxInterestRate) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Default interest rate must be between minimum and maximum interest rates',
    })
  }

  // Validate loan amount ranges
  if (body.maxLoanAmount < body.minLoanAmount) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Maximum loan amount must be greater than or equal to minimum loan amount',
    })
  }

  await connectDB()

  // Check for duplicate loan type name within tenant
  const existingLoanType = await LoanType.findOne({
    tenantId: user.tenantId,
    name: body.name.trim(),
  })

  if (existingLoanType) {
    throw createError({
      statusCode: 409,
      statusMessage: 'A loan type with this name already exists',
    })
  }

  // Create loan type
  const loanType = await LoanType.create({
    tenantId: user.tenantId,
    name: body.name.trim(),
    description: body.description?.trim(),
    defaultInterestRate: body.defaultInterestRate,
    minInterestRate: body.minInterestRate,
    maxInterestRate: body.maxInterestRate,
    minLoanAmount: body.minLoanAmount,
    maxLoanAmount: body.maxLoanAmount,
    availableTerms: body.availableTerms,
    requiredDocuments: body.requiredDocuments || [],
    isActive: true,
  })

  return {
    id: loanType._id.toString(),
    tenantId: loanType.tenantId.toString(),
    name: loanType.name,
    description: loanType.description,
    defaultInterestRate: loanType.defaultInterestRate,
    minInterestRate: loanType.minInterestRate,
    maxInterestRate: loanType.maxInterestRate,
    minLoanAmount: loanType.minLoanAmount,
    maxLoanAmount: loanType.maxLoanAmount,
    availableTerms: loanType.availableTerms,
    requiredDocuments: loanType.requiredDocuments,
    isDefault: loanType.isDefault || false,
    isActive: loanType.isActive,
    createdAt: loanType.createdAt,
    updatedAt: loanType.updatedAt,
  }
})
