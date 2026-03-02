import { requireRole } from '~/server/utils/requireRole'
import { connectDB } from '~/server/utils/db'
import { LoanType } from '~/server/models/LoanType'

/**
 * GET /api/tenant/loan-types
 * Returns all loan types for the tenant
 * Accessible by all tenant users
 */
export default defineEventHandler(async (event) => {
  // Require authenticated user (any tenant role)
  const user = requireRole(event, ['tenant_admin', 'tenant_officer', 'tenant_approver'])

  if (!user.tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User is not associated with a tenant',
    })
  }

  await connectDB()

  // Fetch all loan types for this tenant
  const loanTypes = await LoanType.find({
    tenantId: user.tenantId,
  })
    .sort({ createdAt: -1 })
    .lean()

  // Format response
  const formattedLoanTypes = loanTypes.map((loanType) => ({
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
  }))

  return {
    loanTypes: formattedLoanTypes,
    total: formattedLoanTypes.length,
  }
})
