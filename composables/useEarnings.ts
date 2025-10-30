import type { Earnings, CashoutRequest } from '~/types'

export const useEarnings = () => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  
  const earnings = ref<Earnings[]>([])
  const cashouts = ref<CashoutRequest[]>([])
  const loading = ref(false)
  const totalEarnings = ref(0)
  const availableEarnings = ref(0)

  // Actions
  const fetchEarnings = async () => {
    if (!user.value) return
    
    loading.value = true
    try {
      const { data, error } = await supabase
        .from('earnings')
        .select('*')
        .eq('agent_id', user.value.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      earnings.value = data || []
      
      // Calculate totals  
      totalEarnings.value = earnings.value.reduce((sum, e) => sum + e.total_earnings, 0)
      availableEarnings.value = earnings.value.reduce((sum, e) => sum + e.collectible_earnings, 0)
        
    } catch (error: any) {
      console.error('Error fetching earnings:', error)
    } finally {
      loading.value = false
    }
  }

  const fetchCashouts = async () => {
    if (!user.value) return
    
    try {
      const { data, error } = await supabase
        .from('cashout_requests')
        .select('*')
        .eq('agent_id', user.value.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      cashouts.value = data || []
    } catch (error: any) {
      console.error('Error fetching cashouts:', error)
    }
  }

  const requestCashout = async (amount: number) => {
    if (!user.value) return { success: false, error: 'User not authenticated' }
    
    if (amount > availableEarnings.value) {
      return { success: false, error: 'Insufficient available earnings' }
    }
    
    try {
      const { data, error } = await supabase
        .from('cashout_requests')
        .insert({
          agent_id: user.value.id,
          amount,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error
      
      cashouts.value.unshift(data)
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const getEarningsStats = computed(() => ({
    total: totalEarnings.value,
    available: availableEarnings.value,
    pending: cashouts.value
      .filter(c => c.status === 'pending')
      .reduce((sum, c) => sum + c.amount, 0),
    cashed_out: cashouts.value
      .filter(c => c.status === 'approved')
      .reduce((sum, c) => sum + c.amount, 0)
  }))

  return {
    // State
    earnings: readonly(earnings),
    cashouts: readonly(cashouts),
    loading: readonly(loading),
    totalEarnings: readonly(totalEarnings),
    availableEarnings: readonly(availableEarnings),
    // Getters
    earningsStats: getEarningsStats,
    // Actions
    fetchEarnings,
    fetchCashouts,
    requestCashout
  }
}