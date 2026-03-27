import { defineStore } from 'pinia'

export interface TenantUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  mustChangePassword?: boolean
  lastLogin?: Date | null
  createdAt: Date
  applicationsCount?: number
  tenantId?: string
  updatedAt?: Date
}

interface UsersState {
  users: TenantUser[]
  loading: boolean
  error: string | null
}

export const useUsersStore = defineStore('users', {
  state: (): UsersState => ({
    users: [],
    loading: false,
    error: null,
  }),

  getters: {
    activeUsers: (state) => state.users.filter(u => u.isActive),
    inactiveUsers: (state) => state.users.filter(u => !u.isActive),
    totalUsers: (state) => state.users.length,

    usersByRole: (state) => (role: string) => {
      return state.users.filter(u => u.role === role)
    },
  },

  actions: {
    /**
     * Fetch all users in the tenant
     */
    async fetchUsers() {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const response = await authenticatedFetch<{ users: TenantUser[]; total: number }>(
          '/api/tenant/users'
        )

        this.users = response.users
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to fetch users'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create new user
     */
    async createUser(data: {
      email: string
      firstName: string
      lastName: string
      role: string
      password: string
    }) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const user = await authenticatedFetch<TenantUser>('/api/tenant/users', {
          method: 'POST',
          body: data,
        })

        // Add to list
        this.users.unshift(user)

        return user
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to create user'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update user
     */
    async updateUser(
      userId: string,
      data: {
        firstName?: string
        lastName?: string
        role?: string
        isActive?: boolean
      }
    ) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const user = await authenticatedFetch<TenantUser>(`/api/tenant/users/${userId}`, {
          method: 'PATCH',
          body: data,
        })

        // Update in list
        const index = this.users.findIndex(u => u.id === userId)
        if (index !== -1) {
          this.users[index] = { ...this.users[index], ...user }
        }

        return user
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to update user'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Deactivate user (soft delete)
     */
    async deactivateUser(userId: string) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        await authenticatedFetch(`/api/tenant/users/${userId}`, {
          method: 'DELETE',
        })

        // Update in list
        const index = this.users.findIndex(u => u.id === userId)
        if (index !== -1) {
          this.users[index].isActive = false
        }

        return true
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to deactivate user'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Activate user (set isActive to true)
     */
    async activateUser(userId: string) {
      return await this.updateUser(userId, { isActive: true })
    },

    /**
     * Reset user password
     */
    async resetUserPassword(userId: string) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const response = await authenticatedFetch<{
          success: boolean
          temporaryPassword: string
          revokedSessions: number
          message: string
        }>(`/api/tenant/users/${userId}/reset-password`, {
          method: 'POST',
        })

        // Update mustChangePassword flag in list
        const index = this.users.findIndex(u => u.id === userId)
        if (index !== -1) {
          this.users[index].mustChangePassword = true
        }

        return response
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to reset password'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null
    },
  },
})
