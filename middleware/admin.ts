export default defineNuxtRouteMiddleware((_to, _from) => {
  const { isAuthenticated, isAdmin, isInternalAdmin } = useAuth()
  const { showError } = useUI()

  // Check if user is authenticated first
  if (!isAuthenticated.value) {
    return navigateTo('/')
  }

  // Check if user is admin or internal_admin
  if (!isAdmin.value && !isInternalAdmin.value) {
    showError('Access denied. Admin privileges required.')
    return navigateTo('/dashboard')
  }
})
