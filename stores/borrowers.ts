import { defineStore } from 'pinia'
import type { Borrower, LoanApplication } from '~/types'
import { useAuthStore } from './auth'

interface BorrowersState {
  borrowers: Borrower[]
  currentBorrower: Borrower | null
  loanHistory: LoanApplication[]
  loading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const useBorrowersStore = defineStore('borrowers', {
  state: (): BorrowersState => ({
    borrowers: [],
    currentBorrower: null,
    loanHistory: [],
    loading: false,
    pagination: {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
    },
  }),

  actions: {
    // Helper to get auth headers
    getAuthHeaders() {
      const authStore = useAuthStore()
      return {
        Authorization: `Bearer ${authStore.accessToken}`,
      }
    },

    async fetchBorrowers(params?: {
      search?: string
      page?: number
      limit?: number
    }) {
      this.loading = true
      try {
        const response = await $fetch('/api/borrowers', {
          method: 'GET',
          query: params,
          headers: this.getAuthHeaders(),
        })

        this.borrowers = response.borrowers
        this.pagination = response.pagination
      } catch (error) {
        console.error('Failed to fetch borrowers:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchBorrowerById(id: string) {
      this.loading = true
      try {
        const data = await $fetch(`/api/borrowers/${id}`, {
          method: 'GET',
          headers: this.getAuthHeaders(),
        })

        this.currentBorrower = data.borrower
        this.loanHistory = data.loanHistory
      } catch (error) {
        console.error('Failed to fetch borrower:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createBorrower(payload: {
      firstName: string
      lastName: string
      email: string
      contactNumber: string
      address: string
      employmentType: string
      employer?: string
      monthlyIncome: number
      dateOfBirth?: string
      notes?: string
    }) {
      this.loading = true
      try {
        const data = await $fetch('/api/borrowers', {
          method: 'POST',
          body: payload,
          headers: this.getAuthHeaders(),
        })

        this.currentBorrower = data as Borrower
        return data
      } catch (error) {
        console.error('Failed to create borrower:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateBorrower(
      id: string,
      payload: {
        firstName?: string
        lastName?: string
        email?: string
        contactNumber?: string
        address?: string
        employmentType?: string
        employer?: string
        monthlyIncome?: number
        dateOfBirth?: string
        notes?: string
        isActive?: boolean
      }
    ) {
      this.loading = true
      try {
        const data = await $fetch(`/api/borrowers/${id}`, {
          method: 'PATCH',
          body: payload,
          headers: this.getAuthHeaders(),
        })

        this.currentBorrower = data as Borrower
        return data
      } catch (error) {
        console.error('Failed to update borrower:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    clearCurrentBorrower() {
      this.currentBorrower = null
      this.loanHistory = []
    },
  },

  getters: {
    activeBorrowers: (state) =>
      state.borrowers.filter((borrower) => borrower.isActive),

    inactiveBorrowers: (state) =>
      state.borrowers.filter((borrower) => !borrower.isActive),
  },
})
