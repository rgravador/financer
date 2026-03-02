import Notification from '~/server/models/Notification'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require authenticated user (any role)
  const user = requireRole(event, ['system_admin', 'tenant_admin', 'tenant_officer', 'tenant_approver'])

  // Get query parameters
  const query = getQuery(event)
  const unreadOnly = query.unreadOnly === 'true'
  const limit = parseInt(query.limit as string) || 20

  // Build filter
  const filter: any = {
    userId: user.sub,
  }

  if (unreadOnly) {
    filter.isRead = false
  }

  // Fetch notifications
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()

  // Count unread notifications
  const unreadCount = await Notification.countDocuments({
    userId: user.sub,
    isRead: false,
  })

  // Transform to match interface
  const transformedNotifications = notifications.map((notification) => ({
    ...notification,
    id: notification._id.toString(),
    tenantId: notification.tenantId.toString(),
    userId: notification.userId.toString(),
    applicationId: notification.applicationId.toString(),
  }))

  return {
    notifications: transformedNotifications,
    unreadCount,
  }
})
