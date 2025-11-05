export default defineNuxtRouteMiddleware((_to, _from) => {
  const { isAuthenticated, isAdmin, isInternalAdmin } = useAuth()

  // Redirect to dashboard if already authenticated
  if (isAuthenticated.value) {
    if (isAdmin.value || isInternalAdmin.value) {
      return navigateTo('/admin/dashboard')
    } else {
      return navigateTo('/dashboard')
    }
  }
})
