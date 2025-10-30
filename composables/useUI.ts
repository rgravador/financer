interface SnackbarMessage {
  text: string
  color: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

export const useUI = () => {
  // Reactive state
  const theme = ref<'light' | 'dark'>('light')
  const sidebarOpen = ref(true)
  const loading = ref<Record<string, boolean>>({})
  const snackbar = ref({
    show: false,
    message: '',
    color: 'info',
    timeout: 3000
  })

  // Getters
  const isDark = computed(() => theme.value === 'dark')
  const isLoading = (key: string) => loading.value[key] || false
  const anyLoading = computed(() => Object.values(loading.value).some(v => v))

  // Actions
  const setTheme = (newTheme: 'light' | 'dark') => {
    theme.value = newTheme
    if (process.client) {
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
      localStorage.setItem('theme', newTheme)
    }
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  const toggleSidebar = () => {
    sidebarOpen.value = !sidebarOpen.value
    if (process.client) {
      localStorage.setItem('sidebarOpen', String(sidebarOpen.value))
    }
  }

  const setSidebarOpen = (open: boolean) => {
    sidebarOpen.value = open
    if (process.client) {
      localStorage.setItem('sidebarOpen', String(open))
    }
  }

  const setLoading = (key: string, isLoading: boolean) => {
    loading.value[key] = isLoading
  }

  const showSnackbar = (message: string | SnackbarMessage) => {
    if (typeof message === 'string') {
      snackbar.value = {
        show: true,
        message,
        color: 'info',
        timeout: 3000
      }
    } else {
      snackbar.value = {
        show: true,
        message: message.text,
        color: message.color,
        timeout: message.timeout || 3000
      }
    }
  }

  const hideSnackbar = () => {
    snackbar.value.show = false
  }

  const showSuccess = (message: string) => {
    showSnackbar({ text: message, color: 'success' })
  }

  const showError = (message: string) => {
    showSnackbar({ text: message, color: 'error', timeout: 5000 })
  }

  const showWarning = (message: string) => {
    showSnackbar({ text: message, color: 'warning' })
  }

  const showInfo = (message: string) => {
    showSnackbar({ text: message, color: 'info' })
  }

  // Initialize from localStorage on client
  onMounted(() => {
    if (process.client) {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
      if (savedTheme) {
        setTheme(savedTheme)
      }

      const savedSidebarOpen = localStorage.getItem('sidebarOpen')
      if (savedSidebarOpen !== null) {
        sidebarOpen.value = savedSidebarOpen === 'true'
      }
    }
  })

  return {
    // State
    theme,
    sidebarOpen,
    loading: readonly(loading),
    snackbar,
    // Getters
    isDark,
    isLoading,
    anyLoading,
    // Actions
    setTheme,
    toggleTheme,
    toggleSidebar,
    setSidebarOpen,
    setLoading,
    showSnackbar,
    hideSnackbar,
    showSuccess,
    showError,
    showWarning,
    showInfo
  }
}
