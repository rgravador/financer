import LoanApplication from '~/server/models/LoanApplication'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require tenant approver or admin role
  const user = requireRole(event, ['tenant_approver', 'tenant_admin'])

  // Get query parameters
  const query = getQuery(event)
  const status = query.status as string | undefined
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20

  // Build filter for review queue
  const filter: any = {
    tenantId: user.tenantId,
  }

  // Filter by status - default to applications needing review
  if (status) {
    filter.status = status
  } else {
    // Default: show submitted, under_review, and pending_documents
    filter.status = { $in: ['submitted', 'under_review', 'pending_documents'] }
  }

  // Calculate skip
  const skip = (page - 1) * limit

  // Fetch applications with pagination
  const [applications, total] = await Promise.all([
    LoanApplication.find(filter)
      .populate('borrowerId', 'firstName lastName email contactNumber monthlyIncome')
      .populate('coBorrowerId', 'firstName lastName email contactNumber')
      .populate('loanTypeId', 'name defaultInterestRate minInterestRate maxInterestRate')
      .populate('assignedOfficerId', 'firstName lastName email')
      .populate('assignedApproverId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    LoanApplication.countDocuments(filter),
  ])

  // Transform to match interface
  const transformedApplications = applications.map((app) => ({
    ...app,
    id: app._id.toString(),
    tenantId: app.tenantId.toString(),
    loanTypeId: app.loanTypeId._id ? app.loanTypeId._id.toString() : app.loanTypeId.toString(),
    borrowerId: app.borrowerId._id ? app.borrowerId._id.toString() : app.borrowerId.toString(),
    coBorrowerId: app.coBorrowerId?._id ? app.coBorrowerId._id.toString() : app.coBorrowerId?.toString(),
    assignedOfficerId: app.assignedOfficerId._id ? app.assignedOfficerId._id.toString() : app.assignedOfficerId.toString(),
    assignedApproverId: app.assignedApproverId?._id ? app.assignedApproverId._id.toString() : app.assignedApproverId?.toString(),
    // Add helper fields for approver UI
    applicantName: app.borrowerId._id
      ? `${app.borrowerId.firstName} ${app.borrowerId.lastName}`
      : 'N/A',
    loanTypeName: app.loanTypeId.name || 'N/A',
    documentsCount: app.documents.length,
    suggestedRate: app.loanDetails.suggestedInterestRate,
    defaultRate: app.loanTypeId.defaultInterestRate || 0,
    rateVariance: app.loanDetails.suggestedInterestRate - (app.loanTypeId.defaultInterestRate || 0),
    // Transform nested arrays
    statusHistory: app.statusHistory.map((entry) => ({
      ...entry,
      id: entry._id?.toString(),
      changedBy: entry.changedBy.toString(),
    })),
    documents: app.documents.map((doc) => ({
      ...doc,
      id: doc._id?.toString(),
    })),
    followUpDocuments: app.followUpDocuments.map((doc) => ({
      ...doc,
      id: doc._id?.toString(),
    })),
  }))

  return {
    applications: transformedApplications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
})
