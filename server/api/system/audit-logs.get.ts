import AuditLog from '~/server/models/AuditLog'
import User from '~/server/models/User'
import Tenant from '~/server/models/Tenant'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require system admin role
  requireRole(event, ['system_admin'])

  // Get query parameters
  const query = getQuery(event)
  const tenantId = query.tenantId as string | undefined
  const action = query.action as string | undefined
  const entity = query.entity as string | undefined
  const userId = query.userId as string | undefined
  const dateFrom = query.dateFrom as string | undefined
  const dateTo = query.dateTo as string | undefined
  const page = parseInt(query.page as string) || 1
  const limit = parseInt(query.limit as string) || 50

  // Build filter
  const filter: any = {}

  if (tenantId) {
    filter.tenantId = tenantId
  }

  if (action) {
    filter.action = action
  }

  if (entity) {
    filter.entity = entity
  }

  if (userId) {
    filter.userId = userId
  }

  if (dateFrom || dateTo) {
    filter.createdAt = {}
    if (dateFrom) {
      filter.createdAt.$gte = new Date(dateFrom)
    }
    if (dateTo) {
      filter.createdAt.$lte = new Date(dateTo)
    }
  }

  // Get total count
  const total = await AuditLog.countDocuments(filter)

  // Calculate pagination
  const totalPages = Math.ceil(total / limit)
  const skip = (page - 1) * limit

  // Fetch audit logs with populated references
  const logs = await AuditLog.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('userId', 'firstName lastName email role')
    .populate('tenantId', 'name slug')
    .lean()

  // Transform to match interface
  const transformedLogs = logs.map((log) => ({
    id: log._id.toString(),
    tenantId: log.tenantId ? log.tenantId._id?.toString() : null,
    tenantName: log.tenantId?.name || null,
    userId: log.userId._id?.toString(),
    userName: log.userId ? `${log.userId.firstName} ${log.userId.lastName}` : 'Unknown',
    userEmail: log.userId?.email || 'Unknown',
    userRole: log.userId?.role || 'unknown',
    action: log.action,
    entity: log.entity,
    entityId: log.entityId.toString(),
    metadata: log.metadata,
    ipAddress: log.ipAddress,
    userAgent: log.userAgent,
    createdAt: log.createdAt,
  }))

  return {
    logs: transformedLogs,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }
})
