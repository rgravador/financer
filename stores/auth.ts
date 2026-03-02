import { defineStore } from 'pinia'
import type { User, LoginRequest, AuthResponse } from '~/types'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  loading: boolean
  error: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    loading: false,
    error: null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.accessToken && !!state.user,
    currentUser: (state) => state.user,
    userRole: (state) => state.user?.role || null,
    isTenantUser: (state) => state.user?.tenantId !== null,
    isSystemAdmin: (state) => state.user?.role === 'system_admin',
    isTenantAdmin: (state) => state.user?.role === 'tenant_admin',
  },

  actions: {
    /**
     * Initialize auth state from localStorage
     */
    initAuth() {
      if (process.client) {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        const userStr = localStorage.getItem('user')

        if (accessToken && refreshToken && userStr) {
          this.accessToken = accessToken
          this.refreshToken = refreshToken
          this.user = JSON.parse(userStr)
        }
      }
    },

    /**
     * Login with email and password
     */
    async login(credentials: LoginRequest) {
      this.loading = true
      this.error = null

      try {
        const response = await $fetch<AuthResponse>('/api/auth/login', {
          method: 'POST',
          body: credentials,
        })

        // Store tokens and user
        this.accessToken = response.accessToken
        this.refreshToken = response.refreshToken
        this.user = response.user

        // Persist to localStorage
        if (process.client) {
          localStorage.setItem('accessToken', response.accessToken)
          localStorage.setItem('refreshToken', response.refreshToken)
          localStorage.setItem('user', JSON.stringify(response.user))
        }

        return response
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Login failed'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Logout and clear auth state
     */
    async logout() {
      const currentRefreshToken = this.refreshToken

      // Clear state first
      this.user = null
      this.accessToken = null
      this.refreshToken = null
      this.error = null

      // Clear localStorage
      if (process.client) {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
      }

      // Call backend logout endpoint to revoke refresh token
      if (currentRefreshToken) {
        try {
          await $fetch('/api/auth/logout', {
            method: 'POST',
            body: {
              refreshToken: currentRefreshToken,
            },
          })
        } catch (error) {
          // Ignore errors, already logged out locally
          console.error('Logout error:', error)
        }
      }

      // Redirect to login
      if (process.client) {
        navigateTo('/login')
      }
    },

    /**
     * Logout from all devices
     * Revokes all refresh tokens for the current user
     */
    async logoutAllDevices() {
      if (!this.accessToken) {
        return
      }

      try {
        const response = await $fetch<{ message: string; sessionsRevoked: number }>('/api/auth/logout-all', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        })

        // Clear local state
        this.user = null
        this.accessToken = null
        this.refreshToken = null
        this.error = null

        // Clear localStorage
        if (process.client) {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          localStorage.removeItem('user')
        }

        // Redirect to login
        if (process.client) {
          navigateTo('/login')
        }

        return response
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Logout failed'
        throw error
      }
    },

    /**
     * Refresh access token using refresh token
     */
    async refreshAccessToken() {
      if (!this.refreshToken) {
        this.logout()
        return
      }

      try {
        const response = await $fetch<{ accessToken: string }>('/api/auth/refresh', {
          method: 'POST',
          body: {
            refreshToken: this.refreshToken,
          },
        })

        // Update access token
        this.accessToken = response.accessToken

        // Persist to localStorage
        if (process.client) {
          localStorage.setItem('accessToken', response.accessToken)
        }

        return response.accessToken
      } catch (error: any) {
        // Refresh token is invalid or expired, logout
        this.logout()
        throw error
      }
    },

    /**
     * Fetch current user data
     */
    async fetchUser() {
      if (!this.accessToken) {
        return
      }

      try {
        const user = await $fetch<User>('/api/auth/me', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        })

        this.user = user

        // Update localStorage
        if (process.client) {
          localStorage.setItem('user', JSON.stringify(user))
        }

        return user
      } catch (error: any) {
        // If 401, try to refresh token
        if (error.statusCode === 401) {
          try {
            await this.refreshAccessToken()
            // Retry fetching user
            return await this.fetchUser()
          } catch (refreshError) {
            // Refresh failed, logout
            this.logout()
          }
        }

        throw error
      }
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null
    },
  },
})
