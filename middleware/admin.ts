export default defineNuxtRouteMiddleware((_to, _from) => {
  const { isAuthenticated, isAdmin } = useAuth()
  const { showError } = useUI()

  // Check if user is authenticated first
  if (!isAuthenticated.value) {
    return navigateTo('/auth/login')
  }

  // Check if user is admin
  if (!isAdmin.value) {
    showError('Access denied. Admin privileges required.')
    return navigateTo('/dashboard')
  }
})
