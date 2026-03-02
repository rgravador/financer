import LoanApplication from '~/server/models/LoanApplication'
import { LoanType } from '~/server/models/LoanType'
import Borrower from '~/server/models/Borrower'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require tenant officer role (only officers create applications)
  const user = requireRole(event, ['tenant_officer'])

  // Read request body
  const body = await readBody(event)

  // Validate required fields
  if (
    !body.loanTypeId
    || !body.borrowerId
    || !body.loanDetails
    || body.loanDetails.requestedAmount == null
    || body.loanDetails.requestedTerm == null
    || body.loanDetails.suggestedInterestRate == null
  ) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: loanTypeId, borrowerId, loanDetails (requestedAmount, requestedTerm, suggestedInterestRate)',
    })
  }

  // Verify loan type exists and belongs to tenant
  const loanType = await LoanType.findById(body.loanTypeId).lean()

  if (!loanType) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Loan type not found',
    })
  }

  if (loanType.tenantId.toString() !== user.tenantId.toString()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied to this loan type',
    })
  }

  if (!loanType.isActive) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Loan type is not active',
    })
  }

  // Verify borrower exists and belongs to tenant
  const borrower = await Borrower.findById(body.borrowerId).lean()

  if (!borrower) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Borrower not found',
    })
  }

  if (borrower.tenantId.toString() !== user.tenantId.toString()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied to this borrower',
    })
  }

  if (!borrower.isActive) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Borrower is not active',
    })
  }

  // Verify co-borrower if provided
  if (body.coBorrowerId) {
    const coBorrower = await Borrower.findById(body.coBorrowerId).lean()

    if (!coBorrower) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Co-borrower not found',
      })
    }

    if (coBorrower.tenantId.toString() !== user.tenantId.toString()) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Access denied to this co-borrower',
      })
    }

    if (!coBorrower.isActive) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Co-borrower is not active',
      })
    }

    // Borrower and co-borrower cannot be the same
    if (body.borrowerId === body.coBorrowerId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Borrower and co-borrower cannot be the same person',
      })
    }
  }

  // Validate loan amount
  const requestedAmount = body.loanDetails.requestedAmount
  if (requestedAmount < loanType.minLoanAmount || requestedAmount > loanType.maxLoanAmount) {
    throw createError({
      statusCode: 400,
      statusMessage: `Requested amount must be between ${loanType.minLoanAmount} and ${loanType.maxLoanAmount}`,
    })
  }

  // Validate loan term
  const requestedTerm = body.loanDetails.requestedTerm
  if (!loanType.availableTerms.includes(requestedTerm)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Requested term must be one of: ${loanType.availableTerms.join(', ')} months`,
    })
  }

  // Validate interest rate
  const suggestedInterestRate = body.loanDetails.suggestedInterestRate
  if (suggestedInterestRate < loanType.minInterestRate || suggestedInterestRate > loanType.maxInterestRate) {
    throw createError({
      statusCode: 400,
      statusMessage: `Suggested interest rate must be between ${loanType.minInterestRate}% and ${loanType.maxInterestRate}%`,
    })
  }

  // Create loan application
  const application = await LoanApplication.create({
    tenantId: user.tenantId,
    loanTypeId: body.loanTypeId,
    borrowerId: body.borrowerId,
    coBorrowerId: body.coBorrowerId,
    assignedOfficerId: user.sub,
    assignedApproverId: body.assignedApproverId,
    loanDetails: {
      requestedAmount,
      requestedTerm,
      suggestedInterestRate,
      officerNotes: body.loanDetails.officerNotes?.trim(),
    },
    documents: [],
    followUpDocuments: [],
    status: 'draft',
    statusHistory: [
      {
        status: 'draft',
        changedBy: user.sub,
        timestamp: new Date(),
        notes: 'Application created',
      },
    ],
  })

  // Transform to match interface
  return {
    ...application.toObject(),
    id: application._id.toString(),
    tenantId: application.tenantId.toString(),
    loanTypeId: application.loanTypeId.toString(),
    borrowerId: application.borrowerId.toString(),
    coBorrowerId: application.coBorrowerId?.toString(),
    assignedOfficerId: application.assignedOfficerId.toString(),
    assignedApproverId: application.assignedApproverId?.toString(),
    statusHistory: application.statusHistory.map((entry) => ({
      ...entry.toObject(),
      id: entry._id?.toString(),
      changedBy: entry.changedBy.toString(),
    })),
    documents: [],
    followUpDocuments: [],
  }
})
