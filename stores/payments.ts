import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { Payment } from '~/types'

export const usePaymentsStore = defineStore('payments', {
  state: () => ({
    payments: [] as Payment[],
    loading: false
  }),

  actions: {
    async fetchPayments () {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return }

      this.loading = true
      try {
        const supabase = useSupabaseClient()
        let query = supabase.from('payments').select(`
          *,
          loan:loans(*),
          account:loans(account:accounts(*))
        `)

        // If user is agent, only show payments for their assigned accounts
        if (user.role === 'agent') {
          query = query.eq('loans.accounts.assigned_agent_id', user.id)
        }

        const { data, error } = await query.order('payment_date', { ascending: false })

        if (error) { throw error }
        this.payments = data || []
      } catch (error: any) {
        console.error('Error fetching payments:', error)
      } finally {
        this.loading = false
      }
    },

    async createPayment (paymentData: Omit<Payment, 'id' | 'created_at' | 'received_by'>) {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return { success: false, error: 'User not authenticated' } }

      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('payments')
          .insert({
            ...paymentData,
            received_by: user.id
          } as any)
          .select()
          .single()

        if (error) { throw error }

        this.payments.unshift(data)
        return { success: true, data }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },

    async updatePayment (paymentId: string, updates: Partial<Payment>) {
      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('payments')
          .update(updates as any)
          .eq('id', paymentId)
          .select()
          .single()

        if (error) { throw error }

        const index = this.payments.findIndex(p => p.id === paymentId)
        if (index !== -1) {
          this.payments[index] = data
        }

        return { success: true, data }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  }
})

export type PaymentsStore = ReturnType<typeof usePaymentsStore>
