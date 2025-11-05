import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { Earnings, CashoutRequest } from '~/types'

export const useEarningsStore = defineStore('earnings', {
  state: () => ({
    earnings: [] as Earnings[],
    cashouts: [] as CashoutRequest[],
    loading: false,
    totalEarnings: 0,
    availableEarnings: 0
  }),

  getters: {
    earningsStats: state => ({
      total: state.totalEarnings,
      available: state.availableEarnings,
      pending: state.cashouts
        .filter(c => c.status === 'pending')
        .reduce((sum, c) => sum + c.amount, 0),
      cashed_out: state.cashouts
        .filter(c => c.status === 'approved')
        .reduce((sum, c) => sum + c.amount, 0)
    })
  },

  actions: {
    async fetchEarnings () {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return }

      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('earnings')
          .select('*')
          .eq('agent_id', user.id)
          .order('created_at', { ascending: false })

        if (error) { throw error }

        this.earnings = data || []

        // Calculate totals
        this.totalEarnings = this.earnings.reduce((sum, e) => sum + e.total_earnings, 0)
        this.availableEarnings = this.earnings.reduce((sum, e) => sum + e.collectible_earnings, 0)
      } catch (error: any) {
        console.error('Error fetching earnings:', error)
      } finally {
        this.loading = false
      }
    },

    async fetchCashouts () {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return }

      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('cashout_requests')
          .select('*')
          .eq('agent_id', user.id)
          .order('created_at', { ascending: false })

        if (error) { throw error }
        this.cashouts = data || []
      } catch (error: any) {
        console.error('Error fetching cashouts:', error)
      }
    },

    async requestCashout (amount: number) {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return { success: false, error: 'User not authenticated' } }

      if (amount > this.availableEarnings) {
        return { success: false, error: 'Insufficient available earnings' }
      }

      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('cashout_requests')
          .insert({
            agent_id: user.id,
            amount,
            status: 'pending'
          } as any)
          .select()
          .single()

        if (error) { throw error }

        this.cashouts.unshift(data)
        return { success: true, data }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    }
  }
})

export type EarningsStore = ReturnType<typeof useEarningsStore>
