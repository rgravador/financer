import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { Loan } from '~/types'

export const useLoansStore = defineStore('loans', {
  state: () => ({
    loans: [] as Loan[],
    loading: false
  }),

  getters: {
    pendingApprovalLoans: state =>
      state.loans.filter(loan => loan.status === 'pending_approval'),

    activeLoans: state =>
      state.loans.filter(loan => loan.status === 'active'),

    overdueLoans: state =>
      state.loans.filter(loan =>
        loan.status === 'active' && new Date(loan.end_date) < new Date()
      ),

    closedLoans: state =>
      state.loans.filter(loan => loan.status === 'closed'),

    rejectedLoans: state =>
      state.loans.filter(loan => loan.status === 'rejected')
  },

  actions: {
    async fetchLoans () {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return }

      this.loading = true
      try {
        const supabase = useSupabaseClient()
        let query = supabase.from('loans').select(`
          *,
          account:accounts(*)
        `)

        // If user is agent, only show loans for their assigned accounts
        if (user.role === 'agent') {
          query = query.eq('accounts.assigned_agent_id', user.id)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) { throw error }
        this.loans = data || []
      } catch (error: any) {
        console.error('Error fetching loans:', error)
      } finally {
        this.loading = false
      }
    },

    async createLoan (loanData: Omit<Loan, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'status' | 'current_balance' | 'total_paid' | 'total_penalties' | 'approval_date' | 'rejection_reason' | 'approved_by' | 'end_date' | 'amortization_schedule'>) {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return { success: false, error: 'User not authenticated' } }

      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('loans')
          .insert({
            ...loanData,
            created_by: user.id,
            status: 'pending_approval',
            current_balance: loanData.principal_amount,
            total_paid: 0,
            total_penalties: 0,
            amortization_schedule: [] // Will be calculated server-side
          } as any)
          .select()
          .single()

        if (error) { throw error }

        this.loans.unshift(data)
        return { success: true, data }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },

    async approveLoan (loanId: string) {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return { success: false, error: 'User not authenticated' } }

      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('loans')
          .update({
            status: 'approved',
            approved_by: user.id,
            approval_date: new Date().toISOString()
          } as any)
          .eq('id', loanId)
          .select()
          .single()

        if (error) { throw error }

        const index = this.loans.findIndex(l => l.id === loanId)
        if (index !== -1) {
          this.loans[index] = data
        }

        return { success: true, data }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },

    async rejectLoan (loanId: string, reason: string) {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return { success: false, error: 'User not authenticated' } }

      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('loans')
          .update({
            status: 'rejected',
            approved_by: user.id,
            rejection_reason: reason
          } as any)
          .eq('id', loanId)
          .select()
          .single()

        if (error) { throw error }

        const index = this.loans.findIndex(l => l.id === loanId)
        if (index !== -1) {
          this.loans[index] = data
        }

        return { success: true, data }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  }
})
