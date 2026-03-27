/**
 * Global auth middleware
 *
 * Runs on every route change to:
 * 1. Initialize auth state from localStorage
 * 2. Handle authentication redirects
 */
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  // Initialize auth state on first load
  if (process.client && !authStore.accessToken) {
    authStore.initAuth()
  }

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/forgot-password', '/reset-password', '/unauthorized']

  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => to.path.startsWith(route))

  // If user is authenticated and trying to access login page, redirect to home
  if (authStore.isAuthenticated && to.path === '/login') {
    return navigateTo('/')
  }

  // If user is not authenticated and trying to access protected route, redirect to login
  if (!authStore.isAuthenticated && !isPublicRoute) {
    return navigateTo('/login')
  }
})
