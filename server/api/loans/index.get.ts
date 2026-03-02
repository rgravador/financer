import LoanApplication from '~/server/models/LoanApplication'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require tenant officer, approver, or admin role
  const user = requireRole(event, ['tenant_officer', 'tenant_approver', 'tenant_admin'])

  // Get query parameters
  const query = getQuery(event)
  const status = query.status as string | undefined
  const assignedOfficerId = query.assignedOfficerId as string | undefined
  const assignedApproverId = query.assignedApproverId as string | undefined
  const borrowerId = query.borrowerId as string | undefined
  const search = query.search as string | undefined
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20

  // Build filter
  const filter: any = {
    tenantId: user.tenantId,
  }

  // Add status filter
  if (status) {
    filter.status = status
  }

  // Add officer/approver filters
  if (assignedOfficerId) {
    filter.assignedOfficerId = assignedOfficerId
  }

  if (assignedApproverId) {
    filter.assignedApproverId = assignedApproverId
  }

  // Add borrower filter
  if (borrowerId) {
    filter.$or = [
      { borrowerId },
      { coBorrowerId: borrowerId },
    ]
  }

  // Calculate skip
  const skip = (page - 1) * limit

  // Fetch applications with pagination
  const [applications, total] = await Promise.all([
    LoanApplication.find(filter)
      .populate('borrowerId', 'firstName lastName email contactNumber')
      .populate('coBorrowerId', 'firstName lastName email contactNumber')
      .populate('loanTypeId', 'name defaultInterestRate')
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
    // Transform status history
    statusHistory: app.statusHistory.map((entry) => ({
      ...entry,
      id: entry._id?.toString(),
      changedBy: entry.changedBy.toString(),
    })),
    // Transform documents
    documents: app.documents.map((doc) => ({
      ...doc,
      id: doc._id?.toString(),
    })),
    // Transform follow-up documents
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
