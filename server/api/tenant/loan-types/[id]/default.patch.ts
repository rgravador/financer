import { requireTenantAdmin } from '~/server/utils/requireRole'
import { connectDB } from '~/server/utils/db'
import { LoanType } from '~/server/models/LoanType'
import { isValidObjectId } from 'mongoose'

/**
 * PATCH /api/tenant/loan-types/[id]/default
 * Sets a loan type as the default for the tenant.
 * Unsets any previously default loan type.
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

  await connectDB()

  const loanType = await LoanType.findById(loanTypeId)

  if (!loanType) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Loan type not found',
    })
  }

  if (loanType.tenantId.toString() !== user.tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cannot modify loan types from other tenants',
    })
  }

  if (!loanType.isActive) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Cannot set an inactive loan type as default',
    })
  }

  // Unset any existing default for this tenant
  await LoanType.updateMany(
    { tenantId: user.tenantId, isDefault: true },
    { $set: { isDefault: false } }
  )

  // Set the selected loan type as default
  loanType.isDefault = true
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
    isDefault: loanType.isDefault,
    isActive: loanType.isActive,
    createdAt: loanType.createdAt,
    updatedAt: loanType.updatedAt,
  }
})
