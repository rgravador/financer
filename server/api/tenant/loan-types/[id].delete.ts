import { requireTenantAdmin } from '~/server/utils/requireRole'
import { connectDB } from '~/server/utils/db'
import { LoanType } from '~/server/models/LoanType'
import { isValidObjectId } from 'mongoose'

/**
 * DELETE /api/tenant/loan-types/[id]
 * Soft-deletes a loan type (sets isActive: false)
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

  // Ensure loan type belongs to user's tenant
  if (loanType.tenantId.toString() !== user.tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Cannot delete loan types from other tenants',
    })
  }

  // Soft delete
  loanType.isActive = false
  await loanType.save()

  return {
    message: 'Loan type deactivated successfully',
    loanTypeId: loanType._id.toString(),
  }
})
