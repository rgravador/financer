import type { Loan } from '~/types'

export const useLoans = () => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  
  const loans = ref<Loan[]>([])
  const loading = ref(false)

  // Actions
  const fetchLoans = async () => {
    if (!user.value) return
    
    loading.value = true
    try {
      let query = supabase.from('loans').select(`
        *,
        account:accounts(*)
      `)
      
      // If user is agent, only show loans for their assigned accounts
      if (user.value.role === 'agent') {
        query = query.eq('accounts.assigned_agent_id', user.value.id)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      loans.value = data || []
    } catch (error: any) {
      console.error('Error fetching loans:', error)
    } finally {
      loading.value = false
    }
  }

  const createLoan = async (loanData: Omit<Loan, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'status' | 'current_balance' | 'total_paid' | 'total_penalties' | 'approval_date' | 'rejection_reason' | 'approved_by' | 'end_date' | 'amortization_schedule'>) => {
    if (!user.value) return { success: false, error: 'User not authenticated' }
    
    try {
      const { data, error } = await supabase
        .from('loans')
        .insert({
          ...loanData,
          created_by: user.value.id,
          status: 'pending_approval',
          current_balance: loanData.principal_amount,
          total_paid: 0,
          total_penalties: 0,
          amortization_schedule: [] // Will be calculated server-side
        })
        .select()
        .single()

      if (error) throw error
      
      loans.value.unshift(data)
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const approveLoan = async (loanId: string) => {
    if (!user.value) return { success: false, error: 'User not authenticated' }
    
    try {
      const { data, error } = await supabase
        .from('loans')
        .update({
          status: 'approved',
          approved_by: user.value.id,
          approval_date: new Date().toISOString()
        })
        .eq('id', loanId)
        .select()
        .single()

      if (error) throw error
      
      const index = loans.value.findIndex(l => l.id === loanId)
      if (index !== -1) {
        loans.value[index] = data
      }
      
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const rejectLoan = async (loanId: string, reason: string) => {
    if (!user.value) return { success: false, error: 'User not authenticated' }
    
    try {
      const { data, error } = await supabase
        .from('loans')
        .update({
          status: 'rejected',
          approved_by: user.value.id,
          rejection_reason: reason
        })
        .eq('id', loanId)
        .select()
        .single()

      if (error) throw error
      
      const index = loans.value.findIndex(l => l.id === loanId)
      if (index !== -1) {
        loans.value[index] = data
      }
      
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    // State
    loans,
    loading: readonly(loading),
    // Actions
    fetchLoans,
    createLoan,
    approveLoan,
    rejectLoan
  }
}