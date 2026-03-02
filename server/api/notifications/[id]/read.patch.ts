import Notification from '~/server/models/Notification'
import { requireRole } from '~/server/utils/requireRole'

export default defineEventHandler(async (event) => {
  // Require authenticated user (any role)
  const user = requireRole(event, ['system_admin', 'tenant_admin', 'tenant_officer', 'tenant_approver'])

  // Get notification ID from route params
  const notificationId = getRouterParam(event, 'id')

  if (!notificationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Notification ID is required',
    })
  }

  // Fetch notification
  const notification = await Notification.findById(notificationId)

  if (!notification) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Notification not found',
    })
  }

  // Verify notification belongs to current user
  if (notification.userId.toString() !== user.sub.toString()) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Access denied',
    })
  }

  // Mark as read
  notification.isRead = true
  await notification.save()

  // Transform to match interface
  return {
    ...notification.toObject(),
    id: notification._id.toString(),
    tenantId: notification.tenantId.toString(),
    userId: notification.userId.toString(),
    applicationId: notification.applicationId.toString(),
  }
})
