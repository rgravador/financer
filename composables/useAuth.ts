import { useAuthStore } from '~/stores/auth'
import type { LoginRequest } from '~/types'

/**
 * Authentication composable
 *
 * Provides convenient helpers for authentication throughout the app
 */
export const useAuth = () => {
  const authStore = useAuthStore()
  const router = useRouter()

  /**
   * Login with credentials
   */
  const login = async (credentials: LoginRequest) => {
    try {
      await authStore.login(credentials)
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.statusMessage || 'Login failed',
      }
    }
  }

  /**
   * Logout
   */
  const logout = async () => {
    await authStore.logout()
  }

  /**
   * Logout from all devices
   */
  const logoutAllDevices = async () => {
    try {
      await authStore.logoutAllDevices()
      return { success: true }
    } catch (error: any) {
      return {
        success: false,
        error: error.data?.statusMessage || 'Logout failed',
      }
    }
  }

  /**
   * Refresh access token
   */
  const refreshToken = async () => {
    try {
      await authStore.refreshAccessToken()
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  }

  /**
   * Fetch current user data
   */
  const fetchUser = async () => {
    try {
      await authStore.fetchUser()
      return { success: true }
    } catch (error) {
      return { success: false }
    }
  }

  /**
   * Check if user has specific role
   */
  const hasRole = (role: string | string[]) => {
    if (!authStore.currentUser) return false

    const roles = Array.isArray(role) ? role : [role]
    return roles.includes(authStore.currentUser.role)
  }

  /**
   * Check if user has any of the specified roles
   */
  const hasAnyRole = (roles: string[]) => {
    if (!authStore.currentUser) return false
    return roles.includes(authStore.currentUser.role)
  }

  /**
   * Require authentication (redirect to login if not authenticated)
   */
  const requireAuth = () => {
    if (!authStore.isAuthenticated) {
      router.push('/login')
      return false
    }
    return true
  }

  /**
   * Require specific role (redirect to unauthorized if not authorized)
   */
  const requireRole = (role: string | string[]) => {
    if (!requireAuth()) return false

    if (!hasRole(role)) {
      router.push('/unauthorized')
      return false
    }
    return true
  }

  /**
   * Get user full name
   */
  const getUserFullName = () => {
    const user = authStore.currentUser
    if (!user) return ''
    return `${user.firstName} ${user.lastName}`
  }

  /**
   * Get user initials
   */
  const getUserInitials = () => {
    const user = authStore.currentUser
    if (!user) return ''
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }

  /**
   * Get role label
   */
  const getRoleLabel = (role?: string) => {
    const targetRole = role || authStore.currentUser?.role
    if (!targetRole) return ''

    const roleLabels: Record<string, string> = {
      system_admin: 'System Administrator',
      tenant_admin: 'Tenant Administrator',
      tenant_officer: 'Loan Officer',
      tenant_approver: 'Approver',
    }
    return roleLabels[targetRole] || targetRole
  }

  /**
   * Make authenticated API request with automatic token refresh
   */
  const authenticatedFetch = async <T>(url: string, options: any = {}) => {
    if (!authStore.accessToken) {
      console.error('❌ authenticatedFetch: No access token available')
      throw new Error('Not authenticated')
    }

    const method = (options.method || 'GET').toUpperCase()
    console.log(`🔐 authenticatedFetch: ${method} ${url}`)

    // Prepare headers
    const headers: Record<string, string> = {
      ...options.headers,
      Authorization: `Bearer ${authStore.accessToken}`,
    }

    // Add CSRF token for state-changing requests
    const stateMethods = ['POST', 'PUT', 'PATCH', 'DELETE']
    if (stateMethods.includes(method)) {
      // Fetch CSRF token if not available
      if (!authStore.csrfToken) {
        console.log('🔐 Fetching CSRF token...')
        await authStore.fetchCSRFToken()
      }

      if (authStore.csrfToken) {
        headers['x-csrf-token'] = authStore.csrfToken
      }
    }

    try {
      return await $fetch<T>(url, {
        ...options,
        headers,
      })
    } catch (error: any) {
      // If 401, try to refresh token and retry
      if (error.statusCode === 401) {
        const refreshResult = await refreshToken()
        if (refreshResult.success) {
          // Retry request with new token (and fetch new CSRF token if needed)
          if (stateMethods.includes(method)) {
            await authStore.fetchCSRFToken()
            if (authStore.csrfToken) {
              headers['x-csrf-token'] = authStore.csrfToken
            }
          }

          return await $fetch<T>(url, {
            ...options,
            headers: {
              ...headers,
              Authorization: `Bearer ${authStore.accessToken}`,
            },
          })
        }
      }
      throw error
    }
  }

  return {
    // State
    user: computed(() => authStore.currentUser),
    isAuthenticated: computed(() => authStore.isAuthenticated),
    isLoading: computed(() => authStore.loading),
    error: computed(() => authStore.error),
    userRole: computed(() => authStore.userRole),
    isSystemAdmin: computed(() => authStore.isSystemAdmin),
    isTenantAdmin: computed(() => authStore.isTenantAdmin),
    isTenantUser: computed(() => authStore.isTenantUser),

    // Actions
    login,
    logout,
    logoutAllDevices,
    refreshToken,
    fetchUser,

    // Helpers
    hasRole,
    hasAnyRole,
    requireAuth,
    requireRole,
    getUserFullName,
    getUserInitials,
    getRoleLabel,
    authenticatedFetch,
  }
}
