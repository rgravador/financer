import { defineStore } from 'pinia'

interface SnackbarMessage {
  text: string
  color: 'success' | 'error' | 'warning' | 'info'
  timeout?: number
}

export const useUIStore = defineStore('ui', {
  state: () => ({
    theme: 'light' as 'light' | 'dark',
    sidebarOpen: true,
    loading: {} as Record<string, boolean>,
    snackbar: {
      show: false,
      message: '',
      color: 'info',
      timeout: 3000
    }
  }),

  getters: {
    isDark: state => state.theme === 'dark',
    anyLoading: state => Object.values(state.loading).some(v => v)
  },

  actions: {
    isLoading (key: string) {
      return this.loading[key] || false
    },

    setTheme (newTheme: 'light' | 'dark') {
      this.theme = newTheme
      if (process.client) {
        document.documentElement.classList.toggle('dark', newTheme === 'dark')
        localStorage.setItem('theme', newTheme)
      }
    },

    toggleTheme () {
      this.setTheme(this.theme === 'light' ? 'dark' : 'light')
    },

    toggleSidebar () {
      this.sidebarOpen = !this.sidebarOpen
      if (process.client) {
        localStorage.setItem('sidebarOpen', String(this.sidebarOpen))
      }
    },

    setSidebarOpen (open: boolean) {
      this.sidebarOpen = open
      if (process.client) {
        localStorage.setItem('sidebarOpen', String(open))
      }
    },

    setLoading (key: string, isLoading: boolean) {
      this.loading[key] = isLoading
    },

    showSnackbar (message: string | SnackbarMessage) {
      if (typeof message === 'string') {
        this.snackbar = {
          show: true,
          message,
          color: 'info',
          timeout: 3000
        }
      } else {
        this.snackbar = {
          show: true,
          message: message.text,
          color: message.color,
          timeout: message.timeout || 3000
        }
      }
    },

    hideSnackbar () {
      this.snackbar.show = false
    },

    showSuccess (message: string) {
      this.showSnackbar({ text: message, color: 'success' })
    },

    showError (message: string) {
      this.showSnackbar({ text: message, color: 'error', timeout: 5000 })
    },

    showWarning (message: string) {
      this.showSnackbar({ text: message, color: 'warning' })
    },

    showInfo (message: string) {
      this.showSnackbar({ text: message, color: 'info' })
    },

    initializeFromLocalStorage () {
      if (process.client) {
        const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null
        if (savedTheme) {
          this.setTheme(savedTheme)
        }

        const savedSidebarOpen = localStorage.getItem('sidebarOpen')
        if (savedSidebarOpen !== null) {
          this.sidebarOpen = savedSidebarOpen === 'true'
        }
      }
    }
  }
})
