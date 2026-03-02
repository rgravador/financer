import Borrower from '~/server/models/Borrower'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require tenant officer, approver, or admin role
  const user = requireRole(event, ['tenant_officer', 'tenant_approver', 'tenant_admin'])

  // Get query parameters
  const query = getQuery(event)
  const search = query.search as string | undefined
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 20

  // Build filter
  const filter: any = {
    tenantId: user.tenantId,
    isActive: true,
  }

  // Add search filter if provided
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { contactNumber: { $regex: search, $options: 'i' } },
    ]
  }

  // Calculate skip
  const skip = (page - 1) * limit

  // Fetch borrowers with pagination
  const [borrowers, total] = await Promise.all([
    Borrower.find(filter)
      .sort({ lastName: 1, firstName: 1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Borrower.countDocuments(filter),
  ])

  // Transform to match interface
  const transformedBorrowers = borrowers.map((borrower) => ({
    ...borrower,
    id: borrower._id.toString(),
    tenantId: borrower.tenantId.toString(),
  }))

  return {
    borrowers: transformedBorrowers,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
})
