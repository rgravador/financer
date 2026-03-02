import type { H3Event } from 'h3'
import AuditLog from '~/server/models/AuditLog'
import type { Types } from 'mongoose'

interface LogActionParams {
  action: string
  entity: string
  entityId: Types.ObjectId | string
  metadata?: Record<string, any>
  // Optional: for cases like login where user context isn't set yet
  userId?: Types.ObjectId | string
  tenantId?: Types.ObjectId | string | null
}

/**
 * Log an action to the audit trail
 * Fails silently to never break the main flow
 */
export async function logAction(event: H3Event, params: LogActionParams): Promise<void> {
  try {
    // Get user from event context (set by requireRole middleware) or from params
    const user = event.context.user

    // Use userId from params if provided (for login case), otherwise from context
    const userId = params.userId || user?.sub
    const tenantId = params.tenantId !== undefined ? params.tenantId : user?.tenantId

    if (!userId) {
      // No user context, skip logging
      return
    }

    // Get IP address from request headers
    const headers = getHeaders(event)
    const ipAddress =
      headers['x-forwarded-for'] ||
      headers['x-real-ip'] ||
      event.node.req.socket.remoteAddress ||
      'unknown'

    // Get user agent
    const userAgent = headers['user-agent'] || 'unknown'

    // Create audit log entry
    await AuditLog.create({
      tenantId: tenantId || null,
      userId,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId,
      metadata: params.metadata || {},
      ipAddress: typeof ipAddress === 'string' ? ipAddress : (ipAddress as string[])[0],
      userAgent,
      createdAt: new Date(),
    })
  } catch (error) {
    // Fail silently - log to console but don't throw
    console.error('Failed to create audit log:', error)
  }
}
