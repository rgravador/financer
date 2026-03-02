import { defineStore } from 'pinia'
import type { TenantUser } from './users'

export interface Tenant {
  id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: Date
  userCount?: number
  activeLoansCount?: number
  users?: TenantUser[]
  updatedAt?: Date
}

interface SystemState {
  tenants: Tenant[]
  selectedTenant: Tenant | null
  loading: boolean
  error: string | null
}

export const useSystemStore = defineStore('system', {
  state: (): SystemState => ({
    tenants: [],
    selectedTenant: null,
    loading: false,
    error: null,
  }),

  getters: {
    activeTenants: (state) => state.tenants.filter(t => t.isActive),
    inactiveTenants: (state) => state.tenants.filter(t => !t.isActive),
    totalTenants: (state) => state.tenants.length,
    totalUsers: (state) => state.tenants.reduce((sum, t) => sum + (t.userCount || 0), 0),
  },

  actions: {
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
    async updateTenant(tenantId: string, data: { name?: string; isActive?: boolean }) {
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
  },
})
