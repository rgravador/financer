import type { H3Event } from 'h3'

/**
 * Role Guard Utility
 *
 * Ensures the authenticated user has one of the required roles
 * Throws 403 Forbidden if role check fails
 * Throws 401 Unauthorized if user is not authenticated
 */

/**
 * Require user to have one of the specified roles
 * @param event - H3 event object
 * @param allowedRoles - Array of allowed role strings
 * @throws 401 if not authenticated
 * @throws 403 if user doesn't have required role
 */
export function requireRole(event: H3Event, allowedRoles: string | string[]) {
  // Get user from context (set by auth middleware)
  const user = event.context.user

  // Check if user is authenticated
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized - Authentication required',
    })
  }

  // Normalize to array
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]

  // Check if user has one of the required roles
  if (!user.role || !roles.includes(user.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden - Insufficient permissions',
    })
  }

  // Return user for convenience
  return user
}

/**
 * Require user to be a system admin
 * Convenience wrapper for requireRole
 */
export function requireSystemAdmin(event: H3Event) {
  return requireRole(event, 'system_admin')
}

/**
 * Require user to be a tenant admin
 * Convenience wrapper for requireRole
 */
export function requireTenantAdmin(event: H3Event) {
  return requireRole(event, 'tenant_admin')
}

/**
 * Require user to be tenant admin or system admin
 * Convenience wrapper for requireRole
 */
export function requireAnyAdmin(event: H3Event) {
  return requireRole(event, ['system_admin', 'tenant_admin'])
}

/**
 * Require user to have tenant access (any tenant-scoped role)
 * Excludes system_admin
 */
export function requireTenantAccess(event: H3Event) {
  return requireRole(event, ['tenant_admin', 'tenant_officer', 'tenant_approver'])
}
