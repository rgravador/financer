import { defineStore } from 'pinia'
import type { TenantUser } from './users'

export interface TenantAddress {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface TenantContact {
  email?: string
  phone?: string
  website?: string
}

export interface Tenant {
  id: string
  name: string
  slug: string
  logo?: string
  address?: TenantAddress
  contact?: TenantContact
  isActive: boolean
  createdAt: Date
  userCount?: number
  activeLoansCount?: number
  users?: TenantUser[]
  updatedAt?: Date
}

export interface TenantAdmin {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  isActive: boolean
  mustChangePassword: boolean
  lastLogin: Date | null
  createdAt: Date
  updatedAt?: Date
}

export interface CreateTenantAdminDto {
  email: string
  firstName: string
  lastName: string
}

export interface UpdateTenantAdminDto {
  firstName?: string
  lastName?: string
  email?: string
  isActive?: boolean
}

export interface SystemStats {
  totalTenants: number
  totalUsers: number
  activeLoans: number
  systemUptime: string
  recentTenants: Array<{
    id: string
    name: string
    userCount: number
    isActive: boolean
    createdAt: string
  }>
  systemHealth: {
    database: 'healthy' | 'degraded' | 'down'
    api: 'healthy' | 'degraded' | 'down'
    storage: 'healthy' | 'degraded' | 'down'
  }
  resourceUsage: {
    cpu: number
    memory: number
    disk: number
  }
}

export interface DefaultPasswordStatus {
  isSet: boolean
  currentPassword: string | null
  updatedAt: string | null
  description: string
}

interface SystemState {
  tenants: Tenant[]
  selectedTenant: Tenant | null
  stats: SystemStats | null
  tenantAdmins: TenantAdmin[]
  selectedTenantForAdmins: { id: string; name: string; slug: string; isActive: boolean } | null
  defaultPasswordStatus: DefaultPasswordStatus | null
  loading: boolean
  error: string | null
}

export const useSystemStore = defineStore('system', {
  state: (): SystemState => ({
    tenants: [],
    selectedTenant: null,
    stats: null,
    tenantAdmins: [],
    selectedTenantForAdmins: null,
    defaultPasswordStatus: null,
    loading: false,
    error: null,
  }),

  getters: {
    activeTenants: (state) => state.tenants.filter(t => t.isActive),
    inactiveTenants: (state) => state.tenants.filter(t => !t.isActive),
    totalTenants: (state) => state.tenants.length,
    totalUsers: (state) => state.tenants.reduce((sum, t) => sum + (t.userCount || 0), 0),
    activeTenantAdmins: (state) => state.tenantAdmins.filter(a => a.isActive),
    inactiveTenantAdmins: (state) => state.tenantAdmins.filter(a => !a.isActive),
    totalTenantAdmins: (state) => state.tenantAdmins.length,
  },

  actions: {
    /**
     * Fetch system statistics
     */
    async fetchStats() {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const stats = await authenticatedFetch<SystemStats>('/api/system/stats')

        this.stats = stats
        return stats
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to fetch system stats'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch all tenants
     */
    async fetchTenants() {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const response = await authenticatedFetch<{ tenants: Tenant[]; total: number }>(
          '/api/system/tenants'
        )

        this.tenants = response.tenants
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to fetch tenants'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch single tenant with details
     */
    async fetchTenant(tenantId: string) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const tenant = await authenticatedFetch<Tenant>(`/api/system/tenants/${tenantId}`)

        this.selectedTenant = tenant

        // Update tenant in list if exists
        const index = this.tenants.findIndex(t => t.id === tenantId)
        if (index !== -1) {
          this.tenants[index] = tenant
        }

        return tenant
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to fetch tenant'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create new tenant
     */
    async createTenant(data: { name: string; slug: string }) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const tenant = await authenticatedFetch<Tenant>('/api/system/tenants', {
          method: 'POST',
          body: data,
        })

        // Add to list
        this.tenants.unshift(tenant)

        return tenant
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to create tenant'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update tenant
     */
    async updateTenant(tenantId: string, data: {
      name?: string
      slug?: string
      logo?: string
      address?: TenantAddress
      contact?: TenantContact
      isActive?: boolean
    }) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const tenant = await authenticatedFetch<Tenant>(`/api/system/tenants/${tenantId}`, {
          method: 'PATCH',
          body: data,
        })

        // Update in list
        const index = this.tenants.findIndex(t => t.id === tenantId)
        if (index !== -1) {
          this.tenants[index] = { ...this.tenants[index], ...tenant }
        }

        // Update selected tenant
        if (this.selectedTenant?.id === tenantId) {
          this.selectedTenant = { ...this.selectedTenant, ...tenant }
        }

        return tenant
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to update tenant'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Toggle tenant active status
     */
    async toggleTenantStatus(tenantId: string) {
      const tenant = this.tenants.find(t => t.id === tenantId)
      if (!tenant) {
        throw new Error('Tenant not found')
      }

      return await this.updateTenant(tenantId, { isActive: !tenant.isActive })
    },

    /**
     * Clear selected tenant
     */
    clearSelectedTenant() {
      this.selectedTenant = null
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null
    },

    // ================== Tenant Admin Management ==================

    /**
     * Fetch tenant admins for a specific tenant
     */
    async fetchTenantAdmins(tenantId: string) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const response = await authenticatedFetch<{
          users: TenantAdmin[]
          total: number
          tenant: { id: string; name: string; slug: string; isActive: boolean }
        }>(`/api/system/tenants/${tenantId}/users`)

        this.tenantAdmins = response.users
        this.selectedTenantForAdmins = response.tenant
        return response
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to fetch tenant admins'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create a new tenant admin
     */
    async createTenantAdmin(tenantId: string, data: CreateTenantAdminDto) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const response = await authenticatedFetch<{
          user: TenantAdmin
          temporaryPassword: string
          message: string
        }>(`/api/system/tenants/${tenantId}/users`, {
          method: 'POST',
          body: data,
        })

        // Add to list
        this.tenantAdmins.unshift(response.user)

        return response
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to create tenant admin'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update a tenant admin
     */
    async updateTenantAdmin(tenantId: string, userId: string, data: UpdateTenantAdminDto) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const updatedAdmin = await authenticatedFetch<TenantAdmin>(
          `/api/system/tenants/${tenantId}/users/${userId}`,
          {
            method: 'PATCH',
            body: data,
          }
        )

        // Update in list
        const index = this.tenantAdmins.findIndex(a => a.id === userId)
        if (index !== -1) {
          this.tenantAdmins[index] = { ...this.tenantAdmins[index], ...updatedAdmin }
        }

        return updatedAdmin
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to update tenant admin'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Delete (soft) a tenant admin
     */
    async deleteTenantAdmin(tenantId: string, userId: string) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        await authenticatedFetch(`/api/system/tenants/${tenantId}/users/${userId}`, {
          method: 'DELETE',
        })

        // Remove from list
        this.tenantAdmins = this.tenantAdmins.filter(a => a.id !== userId)
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to delete tenant admin'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Reset a tenant admin's password
     * @param useDefault - If true, reset to the configured default password
     */
    async resetTenantAdminPassword(tenantId: string, userId: string, useDefault: boolean = false) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const response = await authenticatedFetch<{
          success: boolean
          temporaryPassword: string
          usedDefaultPassword: boolean
          revokedSessions: number
          message: string
        }>(`/api/system/tenants/${tenantId}/users/${userId}/reset-password`, {
          method: 'POST',
          body: { useDefault },
        })

        // Update mustChangePassword flag in list
        const index = this.tenantAdmins.findIndex(a => a.id === userId)
        if (index !== -1) {
          this.tenantAdmins[index].mustChangePassword = true
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
     * Toggle tenant admin active status
     */
    async toggleTenantAdminStatus(tenantId: string, userId: string) {
      const admin = this.tenantAdmins.find(a => a.id === userId)
      if (!admin) {
        throw new Error('Tenant admin not found')
      }

      return await this.updateTenantAdmin(tenantId, userId, { isActive: !admin.isActive })
    },

    /**
     * Clear tenant admins
     */
    clearTenantAdmins() {
      this.tenantAdmins = []
      this.selectedTenantForAdmins = null
    },

    // ================== Default Password Settings ==================

    /**
     * Fetch default password status
     */
    async fetchDefaultPasswordStatus() {
      try {
        const { authenticatedFetch } = useAuth()
        const status = await authenticatedFetch<DefaultPasswordStatus>(
          '/api/system/settings/default-password'
        )

        this.defaultPasswordStatus = status
        return status
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to fetch default password status'
        throw error
      }
    },

    /**
     * Set default password for tenant admins
     */
    async setDefaultPassword(password: string) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const response = await authenticatedFetch<{
          success: boolean
          message: string
          updatedAt: string
        }>('/api/system/settings/default-password', {
          method: 'POST',
          body: { password },
        })

        // Update status with the new password
        this.defaultPasswordStatus = {
          isSet: true,
          currentPassword: password,
          updatedAt: response.updatedAt,
          description: 'When set, this password will be used for all new tenant admin accounts instead of generating random passwords.',
        }

        return response
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to set default password'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Remove default password setting
     */
    async removeDefaultPassword() {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const response = await authenticatedFetch<{
          success: boolean
          message: string
        }>('/api/system/settings/default-password', {
          method: 'DELETE',
        })

        // Update status
        this.defaultPasswordStatus = {
          isSet: false,
          currentPassword: null,
          updatedAt: null,
          description: 'When set, this password will be used for all new tenant admin accounts instead of generating random passwords.',
        }

        return response
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to remove default password'
        throw error
      } finally {
        this.loading = false
      }
    },
  },
})
