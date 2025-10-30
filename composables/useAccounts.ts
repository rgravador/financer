import type { Account } from '~/types'

export const useAccounts = () => {
  const supabase = useSupabaseClient()
  const { user } = useAuth()
  
  const accounts = ref<Account[]>([])
  const loading = ref(false)

  // Actions
  const fetchAccounts = async () => {
    if (!user.value) return
    
    loading.value = true
    try {
      let query = supabase.from('accounts').select('*')
      
      // If user is agent, only show their assigned accounts
      if (user.value.role === 'agent') {
        query = query.eq('assigned_agent_id', user.value.id)
      }
      
      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      accounts.value = data || []
    } catch (error: any) {
      console.error('Error fetching accounts:', error)
    } finally {
      loading.value = false
    }
  }

  const createAccount = async (accountData: Omit<Account, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'assigned_agent_id'>) => {
    if (!user.value) return { success: false, error: 'User not authenticated' }
    
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          ...accountData,
          assigned_agent_id: user.value.id,
          created_by: user.value.id,
          status: 'active'
        })
        .select()
        .single()

      if (error) throw error
      
      accounts.value.unshift(data)
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  const updateAccount = async (accountId: string, updates: Partial<Account>) => {
    try {
      const { data, error } = await supabase
        .from('accounts')
        .update(updates)
        .eq('id', accountId)
        .select()
        .single()

      if (error) throw error
      
      const index = accounts.value.findIndex(a => a.id === accountId)
      if (index !== -1) {
        accounts.value[index] = data
      }
      
      return { success: true, data }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  }

  return {
    // State
    accounts,
    loading: readonly(loading),
    // Actions
    fetchAccounts,
    createAccount,
    updateAccount
  }
}