import { requireRole } from '~/server/utils/requireRole'
import { connectDB } from '~/server/utils/db'
import { LoanType } from '~/server/models/LoanType'
import { isValidObjectId } from 'mongoose'

/**
 * GET /api/tenant/loan-types/[id]
 * Returns a single loan type
 * Must belong to caller's tenant
 */
export default defineEventHandler(async (event) => {
  const user = requireRole(event, ['tenant_admin', 'tenant_officer', 'tenant_approver'])

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

  await connectDB()

  const loanType = await LoanType.findById(loanTypeId).lean()

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
      statusMessage: 'Cannot access loan types from other tenants',
    })
  }

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
    isActive: loanType.isActive,
    createdAt: loanType.createdAt,
    updatedAt: loanType.updatedAt,
  }
})
