import type { Payment } from '~/types'

export const usePayments = () => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  
  const payments = ref<Payment[]>([])
  const loading = ref(false)

  // Actions
  const fetchPayments = async () => {
    if (!user.value) return
    
    loading.value = true
    try {
      let query = supabase.from('payments').select(`
        *,
        loan:loans(*),
        account:loans(account:accounts(*))
      `)
      
      // If user is agent, only show payments for their assigned accounts
      if (user.value.role === 'agent') {
        query = query.eq('loans.accounts.assigned_agent_id', user.value.id)
      }
      
      const { data, error } = await query.order('payment_date', { ascending: false })

      if (error) throw error
      payments.value = data || []
    } catch (error: any) {
      console.error('Error fetching payments:', error)
    } finally {
      loading.value = false
    }
  }

  const createPayment = async (paymentData: Omit<Payment, 'id' | 'created_at' | 'received_by'>) => {
    if (!user.value) return { success: false, error: 'User not authenticated' }
    
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          ...paymentData,
          received_by: user.value.id
        })
        .select()
        .single()

      if (error) throw error
      
      payments.value.unshift(data)
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const updatePayment = async (paymentId: string, updates: Partial<Payment>) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single()

      if (error) throw error
      
      const index = payments.value.findIndex(p => p.id === paymentId)
      if (index !== -1) {
        payments.value[index] = data
      }
      
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    // State
    payments,
    loading: readonly(loading),
    // Actions
    fetchPayments,
    createPayment,
    updatePayment
  }
}