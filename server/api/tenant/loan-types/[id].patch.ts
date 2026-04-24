import { requireTenantAdmin } from '~/server/utils/requireRole'
import { connectDB } from '~/server/utils/db'
import { LoanType } from '~/server/models/LoanType'
import { isValidObjectId } from 'mongoose'

/**
 * PATCH /api/tenant/loan-types/[id]
 * Updates a loan type
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

  const loanTypeId = getRouterParam(event, 'id')

  if (!loanTypeId || !isValidObjectId(loanTypeId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid loan type ID',
    })
  }

  const body = await readBody<{
    name?: string
    description?: string
    defaultInterestRate?: number
    minInterestRate?: number
    maxInterestRate?: number
    minLoanAmount?: number
    maxLoanAmount?: number
    availableTerms?: number[]
    requiredDocuments?: Array<{
      documentName: string
      description?: string
      isRequired: boolean
    }>
    isActive?: boolean
  }>(event)

  await connectDB()

  const loanType = await LoanType.findById(loanTypeId)

  if (!loanType) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Loan type not found',
    })
  }

  // Ensure loan type belongs to user's tenant
  if (loanType.tenantId.toString() !== user.tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cannot modify loan types from other tenants',
    })
  }

  // Update fields if provided
  if (body.name !== undefined) {
    if (!body.name.trim() || body.name.length < 2 || body.name.length > 100) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Loan type name must be between 2 and 100 characters',
      })
    }

    // Check for duplicate name (excluding current loan type)
    const existingLoanType = await LoanType.findOne({
      tenantId: user.tenantId,
      name: body.name.trim(),
      _id: { $ne: loanTypeId },
    })

    if (existingLoanType) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A loan type with this name already exists',
      })
    }

    loanType.name = body.name.trim()
  }

  if (body.description !== undefined) {
    loanType.description = body.description?.trim()
  }

  if (body.defaultInterestRate !== undefined) {
    loanType.defaultInterestRate = body.defaultInterestRate
  }

  if (body.minInterestRate !== undefined) {
    loanType.minInterestRate = body.minInterestRate
  }

  if (body.maxInterestRate !== undefined) {
    loanType.maxInterestRate = body.maxInterestRate
  }

  if (body.minLoanAmount !== undefined) {
    loanType.minLoanAmount = body.minLoanAmount
  }

  if (body.maxLoanAmount !== undefined) {
    loanType.maxLoanAmount = body.maxLoanAmount
  }

  if (body.availableTerms !== undefined) {
    if (body.availableTerms.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'At least one term must be specified',
      })
    }
    loanType.availableTerms = body.availableTerms
  }

  if (body.requiredDocuments !== undefined) {
    loanType.requiredDocuments = body.requiredDocuments
  }

  if (body.isActive !== undefined) {
    loanType.isActive = body.isActive
  }

  // Save (validation happens in pre-save hook)
  await loanType.save()

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
    requiredDocuments: loanType.requiredDocuments.map((doc) => ({
      documentName: doc.documentName,
      description: doc.description,
      isRequired: doc.isRequired,
    })),
    isDefault: loanType.isDefault || false,
    isActive: loanType.isActive,
    createdAt: loanType.createdAt,
    updatedAt: loanType.updatedAt,
  }
})
