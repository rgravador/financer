import { defineStore } from 'pinia'
import type { LoanType } from '~/types'

interface LoanTypesState {
  loanTypes: LoanType[]
  selectedLoanType: LoanType | null
  loading: boolean
  error: string | null
}

export const useLoanTypesStore = defineStore('loanTypes', {
  state: (): LoanTypesState => ({
    loanTypes: [],
    selectedLoanType: null,
    loading: false,
    error: null,
  }),

  getters: {
    activeLoanTypes: (state) => state.loanTypes.filter((lt) => lt.isActive),
    inactiveLoanTypes: (state) => state.loanTypes.filter((lt) => !lt.isActive),
    totalLoanTypes: (state) => state.loanTypes.length,

    getLoanTypeById: (state) => (id: string) => {
      return state.loanTypes.find((lt) => lt.id === id)
    },
  },

  actions: {
    /**
     * Fetch all loan types for the tenant
     */
    async fetchLoanTypes() {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const response = await authenticatedFetch<{ loanTypes: LoanType[]; total: number }>(
          '/api/tenant/loan-types'
        )

        this.loanTypes = response.loanTypes
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to fetch loan types'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Fetch single loan type
     */
    async fetchLoanType(loanTypeId: string) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const loanType = await authenticatedFetch<LoanType>(
          `/api/tenant/loan-types/${loanTypeId}`
        )

        this.selectedLoanType = loanType

        // Update in list if exists
        const index = this.loanTypes.findIndex((lt) => lt.id === loanTypeId)
        if (index !== -1) {
          this.loanTypes[index] = loanType
        }

        return loanType
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to fetch loan type'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Create new loan type
     */
    async createLoanType(data: {
      name: string
      description?: string
      defaultInterestRate: number
      minInterestRate: number
      maxInterestRate: number
      minLoanAmount: number
      maxLoanAmount: number
      availableTerms: number[]
      requiredDocuments?: Array<{
        documentName: string
        description?: string
        isRequired: boolean
      }>
    }) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const loanType = await authenticatedFetch<LoanType>('/api/tenant/loan-types', {
          method: 'POST',
          body: data,
        })

        // Add to list
        this.loanTypes.unshift(loanType)

        return loanType
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to create loan type'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Update loan type
     */
    async updateLoanType(
      loanTypeId: string,
      data: {
        name?: string
        description?: string
        defaultInterestRate?: number
        minInterestRate?: number
        maxInterestRate?: number
        minLoanAmount?: number
        maxLoanAmount?: number
        availableTerms?: number[]
        requiredDocuments?: Array<{
          documentName: string
          description?: string
          isRequired: boolean
        }>
        isActive?: boolean
      }
    ) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        const loanType = await authenticatedFetch<LoanType>(
          `/api/tenant/loan-types/${loanTypeId}`,
          {
            method: 'PATCH',
            body: data,
          }
        )

        // Update in list
        const index = this.loanTypes.findIndex((lt) => lt.id === loanTypeId)
        if (index !== -1) {
          this.loanTypes[index] = { ...this.loanTypes[index], ...loanType }
        }

        // Update selected if it's the current one
        if (this.selectedLoanType?.id === loanTypeId) {
          this.selectedLoanType = loanType
        }

        return loanType
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to update loan type'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Deactivate loan type (soft delete)
     */
    async deactivateLoanType(loanTypeId: string) {
      this.loading = true
      this.error = null

      try {
        const { authenticatedFetch } = useAuth()
        await authenticatedFetch(`/api/tenant/loan-types/${loanTypeId}`, {
          method: 'DELETE',
        })

        // Update in list
        const index = this.loanTypes.findIndex((lt) => lt.id === loanTypeId)
        if (index !== -1) {
          this.loanTypes[index].isActive = false
        }

        return true
      } catch (error: any) {
        this.error = error.data?.statusMessage || 'Failed to deactivate loan type'
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Activate loan type (set isActive to true)
     */
    async activateLoanType(loanTypeId: string) {
      return await this.updateLoanType(loanTypeId, { isActive: true })
    },

    /**
     * Clear error
     */
    clearError() {
      this.error = null
    },
  },
})
