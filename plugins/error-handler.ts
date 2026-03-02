export default defineNuxtPlugin((nuxtApp) => {
  // Global error handler
  nuxtApp.hook('vue:error', (error: any, _instance, info) => {
    console.error('Global error:', error, info)

    const snackbar = useSnackbar()

    // Show user-friendly error message
    snackbar.showError('An unexpected error occurred. Please try again.')
  })

  // API error interceptor
  nuxtApp.hook('app:created', () => {
    const authStore = useAuthStore()
    const router = useRouter()
    const snackbar = useSnackbar()

    // Track if we're currently logging out to prevent infinite loops
    let isLoggingOut = false

    // Intercept fetch errors
    const originalFetch = globalThis.$fetch

    globalThis.$fetch = new Proxy(originalFetch, {
      async apply(target, thisArg, args) {
        try {
          return await Reflect.apply(target, thisArg, args)
        } catch (error: any) {
          const statusCode = error.statusCode || error.response?.status
          const url = args[0] as string

          // Don't handle errors for logout endpoints (they're expected to fail after logout)
          if (url?.includes('/auth/logout')) {
            throw error
          }

          // Handle different error codes
          switch (statusCode) {
            case 401:
              // Only trigger logout if we're not already logging out and user was authenticated
              if (!isLoggingOut && authStore.isAuthenticated) {
                isLoggingOut = true
                try {
                  await authStore.logout()
                  snackbar.showError('Your session has expired. Please log in again.')
                } finally {
                  isLoggingOut = false
                }
              }
              break

            case 403:
              // Forbidden - redirect to unauthorized page
              if (router.currentRoute.value.path !== '/unauthorized') {
                router.push('/unauthorized')
                snackbar.showError('You do not have permission to perform this action.')
              }
              break

            case 404:
              snackbar.showError('The requested resource was not found.')
              break

            case 500:
            case 502:
            case 503:
              snackbar.showError('Something went wrong. Please try again later.')
              break

            default:
              // Show error message from API or generic message
              const message = error.data?.statusMessage || error.message || 'An error occurred'
              snackbar.showError(message)
          }

          throw error
        }
      }
    })
  })
})
