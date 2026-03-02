import { defineStore } from 'pinia'
import type { LoanApplication } from '~/types'
import { useAuthStore } from './auth'

interface LoansState {
  applications: LoanApplication[]
  currentApplication: LoanApplication | null
  loading: boolean
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export const useLoansStore = defineStore('loans', {
  state: (): LoansState => ({
    applications: [],
    currentApplication: null,
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

    async fetchApplications(params?: {
      status?: string
      assignedOfficerId?: string
      assignedApproverId?: string
      borrowerId?: string
      page?: number
      limit?: number
    }) {
      this.loading = true
      try {
        const response = await $fetch('/api/loans', {
          method: 'GET',
          query: params,
          headers: this.getAuthHeaders(),
        })

        this.applications = response.applications
        this.pagination = response.pagination
      } catch (error) {
        console.error('Failed to fetch applications:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchApplicationById(id: string) {
      this.loading = true
      try {
        const data = await $fetch(`/api/loans/${id}`, {
          method: 'GET',
          headers: this.getAuthHeaders(),
        })

        this.currentApplication = data as LoanApplication
      } catch (error) {
        console.error('Failed to fetch application:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async createApplication(payload: {
      loanTypeId: string
      borrowerId: string
      coBorrowerId?: string
      assignedApproverId?: string
      loanDetails: {
        requestedAmount: number
        requestedTerm: number
        suggestedInterestRate: number
        officerNotes?: string
      }
    }) {
      this.loading = true
      try {
        const data = await $fetch('/api/loans', {
          method: 'POST',
          body: payload,
          headers: this.getAuthHeaders(),
        })

        this.currentApplication = data as LoanApplication
        return data
      } catch (error) {
        console.error('Failed to create application:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateApplication(
      id: string,
      payload: {
        loanTypeId?: string
        coBorrowerId?: string
        assignedApproverId?: string
        loanDetails?: {
          requestedAmount?: number
          requestedTerm?: number
          suggestedInterestRate?: number
          officerNotes?: string
        }
      }
    ) {
      this.loading = true
      try {
        const data = await $fetch(`/api/loans/${id}`, {
          method: 'PATCH',
          body: payload,
          headers: this.getAuthHeaders(),
        })

        this.currentApplication = data as LoanApplication
        return data
      } catch (error) {
        console.error('Failed to update application:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async uploadDocument(
      applicationId: string,
      payload: {
        documentName: string
        fileBase64: string
      }
    ) {
      this.loading = true
      try {
        const data = await $fetch(`/api/loans/${applicationId}/documents`, {
          method: 'POST',
          body: payload,
          headers: this.getAuthHeaders(),
        })

        if (data && this.currentApplication) {
          // Add document to current application
          this.currentApplication.documents.push(data)
        }

        return data
      } catch (error) {
        console.error('Failed to upload document:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteDocument(applicationId: string, docId: string) {
      this.loading = true
      try {
        await $fetch(`/api/loans/${applicationId}/documents/${docId}`, {
          method: 'DELETE',
          headers: this.getAuthHeaders(),
        })

        if (this.currentApplication) {
          // Remove document from current application
          this.currentApplication.documents = this.currentApplication.documents.filter(
            (doc) => doc.id !== docId
          )
        }
      } catch (error) {
        console.error('Failed to delete document:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async submitApplication(id: string) {
      this.loading = true
      try {
        const data = await $fetch(`/api/loans/${id}/submit`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
        })

        this.currentApplication = data as LoanApplication
        return data
      } catch (error) {
        console.error('Failed to submit application:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    // Approver actions
    async fetchQueue(params?: {
      status?: string
      page?: number
      limit?: number
    }) {
      this.loading = true
      try {
        const response = await $fetch('/api/approver/queue', {
          method: 'GET',
          query: params,
          headers: this.getAuthHeaders(),
        })

        this.applications = response.applications
        this.pagination = response.pagination
      } catch (error) {
        console.error('Failed to fetch queue:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async startReview(id: string) {
      this.loading = true
      try {
        const data = await $fetch(`/api/loans/${id}/review`, {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
        })

        this.currentApplication = data as LoanApplication
        return data
      } catch (error) {
        console.error('Failed to start review:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async approveApplication(id: string, payload: {
      finalInterestRate: number
      notes?: string
    }) {
      this.loading = true
      try {
        const data = await $fetch(`/api/loans/${id}/approve`, {
          method: 'POST',
          body: payload,
          headers: this.getAuthHeaders(),
        })

        this.currentApplication = data as LoanApplication
        return data
      } catch (error) {
        console.error('Failed to approve application:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async rejectApplication(id: string, payload: {
      notes: string
    }) {
      this.loading = true
      try {
        const data = await $fetch(`/api/loans/${id}/reject`, {
          method: 'POST',
          body: payload,
          headers: this.getAuthHeaders(),
        })

        this.currentApplication = data as LoanApplication
        return data
      } catch (error) {
        console.error('Failed to reject application:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async requestDocuments(id: string, payload: {
      requestedDocuments: Array<{
        documentName: string
        notes: string
        dueDate?: string
      }>
      generalNotes?: string
    }) {
      this.loading = true
      try {
        const data = await $fetch(`/api/loans/${id}/request-documents`, {
          method: 'POST',
          body: payload,
          headers: this.getAuthHeaders(),
        })

        this.currentApplication = data as LoanApplication
        return data
      } catch (error) {
        console.error('Failed to request documents:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    clearCurrentApplication() {
      this.currentApplication = null
    },
  },

  getters: {
    draftApplications: (state) =>
      state.applications.filter((app) => app.status === 'draft'),

    submittedApplications: (state) =>
      state.applications.filter((app) => app.status === 'submitted'),

    underReviewApplications: (state) =>
      state.applications.filter((app) => app.status === 'under_review'),

    approvedApplications: (state) =>
      state.applications.filter((app) => app.status === 'approved'),

    rejectedApplications: (state) =>
      state.applications.filter((app) => app.status === 'rejected'),
  },
})
