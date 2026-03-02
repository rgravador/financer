import Borrower from '~/server/models/Borrower'
import LoanApplication from '~/server/models/LoanApplication'
import { requireRole } from '~/server/utils/requireRole'

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

  // Fetch borrower
  const borrower = await Borrower.findById(borrowerId).lean()

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

  // Fetch borrower's loan history
  const loanApplications = await LoanApplication.find({
    $or: [
      { borrowerId: borrower._id },
      { coBorrowerId: borrower._id },
    ],
  })
    .populate('loanTypeId', 'name')
    .sort({ createdAt: -1 })
    .limit(10)
    .lean()

  // Transform loan applications
  const transformedLoans = loanApplications.map((loan) => ({
    ...loan,
    id: loan._id.toString(),
    tenantId: loan.tenantId.toString(),
    loanTypeId: loan.loanTypeId.toString(),
    borrowerId: loan.borrowerId.toString(),
    coBorrowerId: loan.coBorrowerId?.toString(),
    assignedOfficerId: loan.assignedOfficerId.toString(),
    assignedApproverId: loan.assignedApproverId?.toString(),
  }))

  // Transform borrower to match interface
  return {
    borrower: {
      ...borrower,
      id: borrower._id.toString(),
      tenantId: borrower.tenantId.toString(),
    },
    loanHistory: transformedLoans,
  }
})
