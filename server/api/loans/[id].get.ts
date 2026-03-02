import LoanApplication from '~/server/models/LoanApplication'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require tenant officer, approver, or admin role
  const user = requireRole(event, ['tenant_officer', 'tenant_approver', 'tenant_admin'])

  // Get application ID from route params
  const applicationId = getRouterParam(event, 'id')

  if (!applicationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Application ID is required',
    })
  }

  // Fetch application with populated fields
  const application = await LoanApplication.findById(applicationId)
    .populate('borrowerId', 'firstName lastName email contactNumber address employmentType employer monthlyIncome dateOfBirth')
    .populate('coBorrowerId', 'firstName lastName email contactNumber address employmentType employer monthlyIncome dateOfBirth')
    .populate('loanTypeId', 'name description defaultInterestRate minInterestRate maxInterestRate minLoanAmount maxLoanAmount availableTerms requiredDocuments')
    .populate('assignedOfficerId', 'firstName lastName email')
    .populate('assignedApproverId', 'firstName lastName email')
    .lean()

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

  // Transform to match interface
  return {
    ...application,
    id: application._id.toString(),
    tenantId: application.tenantId.toString(),
    loanTypeId: application.loanTypeId._id ? application.loanTypeId._id.toString() : application.loanTypeId.toString(),
    borrowerId: application.borrowerId._id ? application.borrowerId._id.toString() : application.borrowerId.toString(),
    coBorrowerId: application.coBorrowerId?._id ? application.coBorrowerId._id.toString() : application.coBorrowerId?.toString(),
    assignedOfficerId: application.assignedOfficerId._id ? application.assignedOfficerId._id.toString() : application.assignedOfficerId.toString(),
    assignedApproverId: application.assignedApproverId?._id ? application.assignedApproverId._id.toString() : application.assignedApproverId?.toString(),
    // Transform borrower if populated
    borrower: application.borrowerId._id
      ? {
          ...application.borrowerId,
          id: application.borrowerId._id.toString(),
          tenantId: application.borrowerId.tenantId.toString(),
        }
      : undefined,
    // Transform co-borrower if populated
    coBorrower: application.coBorrowerId?._id
      ? {
          ...application.coBorrowerId,
          id: application.coBorrowerId._id.toString(),
          tenantId: application.coBorrowerId.tenantId.toString(),
        }
      : undefined,
    // Transform loan type if populated
    loanType: application.loanTypeId._id
      ? {
          ...application.loanTypeId,
          id: application.loanTypeId._id.toString(),
          tenantId: application.loanTypeId.tenantId.toString(),
        }
      : undefined,
    // Transform officers if populated
    assignedOfficer: application.assignedOfficerId._id
      ? {
          ...application.assignedOfficerId,
          id: application.assignedOfficerId._id.toString(),
          tenantId: application.assignedOfficerId.tenantId?.toString(),
        }
      : undefined,
    assignedApprover: application.assignedApproverId?._id
      ? {
          ...application.assignedApproverId,
          id: application.assignedApproverId._id.toString(),
          tenantId: application.assignedApproverId.tenantId?.toString(),
        }
      : undefined,
    // Transform status history
    statusHistory: application.statusHistory.map((entry) => ({
      ...entry,
      id: entry._id?.toString(),
      changedBy: entry.changedBy.toString(),
    })),
    // Transform documents
    documents: application.documents.map((doc) => ({
      ...doc,
      id: doc._id?.toString(),
    })),
    // Transform follow-up documents
    followUpDocuments: application.followUpDocuments.map((doc) => ({
      ...doc,
      id: doc._id?.toString(),
    })),
  }
})
