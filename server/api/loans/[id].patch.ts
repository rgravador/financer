import LoanApplication from '~/server/models/LoanApplication'
import { LoanType } from '~/server/models/LoanType'
import Borrower from '~/server/models/Borrower'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require tenant officer role (only officers can update)
  const user = requireRole(event, ['tenant_officer'])

  // Get application ID from route params
  const applicationId = getRouterParam(event, 'id')

  if (!applicationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Application ID is required',
    })
  }

  // Read request body
  const body = await readBody(event)

  // Fetch application
  const application = await LoanApplication.findById(applicationId)

  if (!application) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Application not found',
    })
  }

  // Verify application belongs to user's tenant
  if (application.tenantId.toString() !== user.tenantId.toString()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied',
    })
  }

  // Only allow updates if status is 'draft'
  if (application.status !== 'draft') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Can only update applications in draft status',
    })
  }

  // Verify loan type if changing
  let loanType
  if (body.loanTypeId !== undefined) {
    loanType = await LoanType.findById(body.loanTypeId).lean()

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
  } else {
    // Fetch current loan type for validation
    loanType = await LoanType.findById(application.loanTypeId).lean()
  }

  // Verify co-borrower if changing
  if (body.coBorrowerId !== undefined) {
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
      if (application.borrowerId.toString() === body.coBorrowerId) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Borrower and co-borrower cannot be the same person',
        })
      }
    }
  }

  // Update loan details if provided
  if (body.loanDetails) {
    const requestedAmount = body.loanDetails.requestedAmount ?? application.loanDetails.requestedAmount
    const requestedTerm = body.loanDetails.requestedTerm ?? application.loanDetails.requestedTerm
    const suggestedInterestRate = body.loanDetails.suggestedInterestRate ?? application.loanDetails.suggestedInterestRate

    // Validate loan amount
    if (requestedAmount < loanType.minLoanAmount || requestedAmount > loanType.maxLoanAmount) {
      throw createError({
        statusCode: 400,
        statusMessage: `Requested amount must be between ${loanType.minLoanAmount} and ${loanType.maxLoanAmount}`,
      })
    }

    // Validate loan term
    if (!loanType.availableTerms.includes(requestedTerm)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Requested term must be one of: ${loanType.availableTerms.join(', ')} months`,
      })
    }

    // Validate interest rate
    if (suggestedInterestRate < loanType.minInterestRate || suggestedInterestRate > loanType.maxInterestRate) {
      throw createError({
        statusCode: 400,
        statusMessage: `Suggested interest rate must be between ${loanType.minInterestRate}% and ${loanType.maxInterestRate}%`,
      })
    }

    application.loanDetails.requestedAmount = requestedAmount
    application.loanDetails.requestedTerm = requestedTerm
    application.loanDetails.suggestedInterestRate = suggestedInterestRate

    if (body.loanDetails.officerNotes !== undefined) {
      application.loanDetails.officerNotes = body.loanDetails.officerNotes?.trim()
    }
  }

  // Update other fields
  if (body.loanTypeId !== undefined) application.loanTypeId = body.loanTypeId
  if (body.coBorrowerId !== undefined) application.coBorrowerId = body.coBorrowerId || undefined
  if (body.assignedApproverId !== undefined) application.assignedApproverId = body.assignedApproverId || undefined

  // Save updated application
  await application.save()

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
    documents: application.documents.map((doc) => ({
      ...doc.toObject(),
      id: doc._id?.toString(),
    })),
    followUpDocuments: application.followUpDocuments.map((doc) => ({
      ...doc.toObject(),
      id: doc._id?.toString(),
    })),
  }
})
