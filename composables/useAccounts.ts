import type { Account } from '~/types'

export const useAccounts = () => {
  const supabase = useSupabaseClient()
  const {user} = useAuth()

  const accounts = ref<Account[]>([])
  const loading = ref(false)

  // Filters
  const filters = ref({
    search: '',
    status: null as string | null
  })

  // Computed
  const filteredAccounts = computed(() => {
    let filtered = accounts.value

    if (filters.value.search) {
      const search = filters.value.search.toLowerCase()
      filtered = filtered.filter(account =>
        account.name?.toLowerCase().includes(search) ||
        account.contact_info?.toLowerCase().includes(search) ||
        account.address?.toLowerCase().includes(search)
      )
    }

    if (filters.value.status) {
      filtered = filtered.filter(account => account.status === filters.value.status)
    }

    return filtered
  })

  const setFilters = (newFilters: Partial<{ search: string; status: string | null }>) => {
    if (newFilters.search !== undefined) {
      filters.value.search = newFilters.search
    }
    if (newFilters.status !== undefined) {
      filters.value.status = newFilters.status
    }
  }

  const clearFilters = () => {
    filters.value.search = ''
    filters.value.status = null
  }

  // Actions
  const fetchAccounts = async () => {

    if (!user?.value) {
      loading.value = false
      return
    }

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

  const createAccount = async (accountData: { name: string; contact_info: string; address: string; id_proof_file?: File | null }) => {
    if (!user.value) return { success: false, error: 'User not authenticated' }

    try {
      let id_proof_url: string | null = null

      // Handle file upload if provided
      if (accountData.id_proof_file) {
        const file = accountData.id_proof_file
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.value.id}-${Date.now()}.${fileExt}`
        const filePath = `id-proofs/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)

        if (uploadError) {
          console.error('File upload error:', uploadError)
          throw new Error('Failed to upload ID proof')
        }

        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)

        id_proof_url = urlData.publicUrl
      }

      const { data, error } = await supabase
        .from('accounts')
        .insert({
          name: accountData.name,
          contact_info: accountData.contact_info,
          address: accountData.address,
          id_proof_url,
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
        .update(updates as any)
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
    loading,
    filters,
    filteredAccounts,
    // Actions
    fetchAccounts,
    createAccount,
    updateAccount,
    setFilters,
    clearFilters
  }
}