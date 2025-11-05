export default defineNuxtRouteMiddleware((_to, _from) => {
  const authStore = useAuthStore()
  const { showError } = useUI()

  // Check if user is authenticated first
  if (!authStore.isAuthenticated) {
    return navigateTo('/')
  }

  // Check if user is internal_admin
  if (!authStore.isInternalAdmin) {
    showError('Access denied. Internal admin privileges required.')
    return navigateTo('/dashboard')
  }
})
