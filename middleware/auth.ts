export default defineNuxtRouteMiddleware(async (_to, _from) => {
  const { isAuthenticated, refreshSession } = useAuth()

  // Try to refresh session if not authenticated
  if (!isAuthenticated.value) {
    await refreshSession()
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated.value) {
    return navigateTo('/auth/login')
  }
})
