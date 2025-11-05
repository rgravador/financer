export default defineNuxtPlugin(() => {
  const authStore = useAuthStore()
  const uiStore = useUIStore()

  // Initialize auth listener
  authStore.initializeAuthListener()

  // Initialize UI from localStorage
  uiStore.initializeFromLocalStorage()
})
