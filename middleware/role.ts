/**
 * Role-based middleware
 *
 * Usage in pages:
 * definePageMeta({
 *   middleware: ['role'],
 *   allowedRoles: ['system_admin', 'tenant_admin']
 * })
 */
export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore()

  // Ensure auth state is initialized from localStorage (safety check)
  if (process.client && !authStore.accessToken) {
    authStore.initAuth()
  }

  // Check if route has role restrictions
  const allowedRoles = to.meta.allowedRoles as string[] | undefined

  if (!allowedRoles || allowedRoles.length === 0) {
    // No role restrictions, allow access
    return
  }

  // Check if user is authenticated
  if (!authStore.isAuthenticated || !authStore.currentUser) {
    return navigateTo('/login')
  }

  // Check if user has required role
  const userRole = authStore.currentUser.role

  if (!allowedRoles.includes(userRole)) {
    // User doesn't have required role, redirect to unauthorized page
    return navigateTo('/unauthorized')
  }
})
