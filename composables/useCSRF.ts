import { ref, onMounted } from 'vue'

/**
 * CSRF Protection Composable
 *
 * Fetches and manages CSRF token for secure state-changing requests
 * Auto-includes X-CSRF-Token header in all authenticated API calls
 */

const csrfToken = ref<string | null>(null)
const isInitialized = ref(false)

export const useCSRF = () => {
  /**
   * Fetch CSRF token from server
   */
  const fetchCSRFToken = async () => {
    try {
      const response = await $fetch<{ csrfToken: string }>('/api/auth/csrf')
      csrfToken.value = response.csrfToken
      isInitialized.value = true
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error)
      isInitialized.value = false
    }
  }

  /**
   * Get CSRF token (fetches if not available)
   */
  const getCSRFToken = async () => {
    if (!csrfToken.value) {
      await fetchCSRFToken()
    }
    return csrfToken.value
  }

  /**
   * Clear CSRF token (e.g., on logout)
   */
  const clearCSRFToken = () => {
    csrfToken.value = null
    isInitialized.value = false
  }

  /**
   * Make authenticated fetch with CSRF token
   */
  const csrfFetch = async <T>(url: string, options: any = {}) => {
    const token = await getCSRFToken()

    if (!token) {
      throw new Error('CSRF token not available')
    }

    const method = options.method?.toUpperCase() || 'GET'
    const needsCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)

    return await $fetch<T>(url, {
      ...options,
      headers: {
        ...options.headers,
        ...(needsCSRF && { 'X-CSRF-Token': token }),
      },
    })
  }

  // Auto-fetch CSRF token on mount (for authenticated users)
  onMounted(async () => {
    const authStore = useAuthStore()
    if (authStore.isAuthenticated && !isInitialized.value) {
      await fetchCSRFToken()
    }
  })

  return {
    csrfToken: readonly(csrfToken),
    isInitialized: readonly(isInitialized),
    fetchCSRFToken,
    getCSRFToken,
    clearCSRFToken,
    csrfFetch,
  }
}
