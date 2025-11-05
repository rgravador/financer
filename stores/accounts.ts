import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import type { Account, AccountWithRelations } from '~/types'

export interface AccountStore {
  accounts: Account[]
  selectedAccount: AccountWithRelations | null
  loading: Boolean
  filters: {
    search: string,
    status: string | null
  }
}

export const useAccountsStore = defineStore('accounts', {
  state: (): AccountStore => ({
    accounts: [] as Account[],
    selectedAccount: null as AccountWithRelations | null,
    loading: false,
    filters: {
      search: '',
      status: 'active' as string | null
    }
  }),

  getters: {
    filteredAccounts: (state) => {
      let filtered = state.accounts

      if (state.filters.search) {
        const search = state.filters.search.toLowerCase()
        filtered = filtered.filter(account =>
          account.name?.toLowerCase().includes(search) ||
          account.contact_info?.toLowerCase().includes(search) ||
          account.address?.toLowerCase().includes(search)
        )
      }

      if (state.filters.status) {
        filtered = filtered.filter(account => account.status === state.filters.status)
      }

      return filtered
    }
  },

  actions: {
    setFilters (newFilters: Partial<{ search: string; status: string | null }>) {
      if (newFilters.search !== undefined) {
        this.filters.search = newFilters.search
      }
      if (newFilters.status !== undefined) {
        this.filters.status = newFilters.status
      }
    },

    clearFilters () {
      this.filters.search = ''
      this.filters.status = null
    },

    async fetchAccounts () {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) {
        this.loading = false
        return
      }

      this.loading = true

      try {
        const supabase = useSupabaseClient()
        let query = supabase.from('accounts').select('*')

        // If user is agent, only show their assigned accounts
        if (user.role === 'agent') {
          query = query.eq('assigned_agent_id', user.id)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) { throw error }
        this.accounts = data || []
      } catch (error: any) {
        console.error('Error fetching accounts:', error)
      } finally {
        this.loading = false
      }
    },

    async createAccount (accountData: { name: string; contact_info: string; address: string; id_proof_file?: File | null }) {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return { success: false, error: 'User not authenticated' } }

      try {
        const supabase = useSupabaseClient()
        let id_proof_url: string | null = null

        // Handle file upload if provided
        if (accountData.id_proof_file) {
          const file = accountData.id_proof_file
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}-${Date.now()}.${fileExt}`
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
            assigned_agent_id: user.id,
            created_by: user.id,
            status: 'active' as const
          })
          .select()
          .single()

        if (error) { throw error }

        this.accounts.unshift(data)
        return { success: true, data }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },

    async createAccountMultiStep (stepData: {
      name: string
      date_of_birth?: string | null
      ssn_tax_id?: string | null
      government_id_type?: string | null
      government_id_number?: string | null
      secondary_id_type?: string | null
      id_proof_file?: File | null
    }) {
      const authStore = useAuthStore()
      const user = authStore.user

      console.log('=� ~ createAccountMultiStep ~ user:', user)
      if (!user) { return { success: false, error: 'User not authenticated' } }

      try {
        const supabase = useSupabaseClient()
        let id_proof_url: string | null = null

        // Handle file upload if provided
        if (stepData.id_proof_file) {
          const file = stepData.id_proof_file
          const fileExt = file.name.split('.').pop()
          const fileName = `${user.id}-${Date.now()}-id.${fileExt}`
          const filePath = `account-documents/${fileName}`

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

        const insertData = {
          name: stepData.name,
          date_of_birth: stepData.date_of_birth,
          ssn_tax_id: stepData.ssn_tax_id,
          government_id_type: stepData.government_id_type,
          government_id_number: stepData.government_id_number,
          secondary_id_type: stepData.secondary_id_type,
          id_proof_url,
          contact_info: null,
          address: null,
          assigned_agent_id: user.id,
          created_by: user.id,
          status: 'active' as const
        }
        console.log('=� ~ createAccountMultiStep ~ insertData:', insertData)
        const { data, error } = await supabase
          .from('accounts')
          .insert(insertData)
          .select()
          .single()

        if (error) { throw error }

        this.accounts.unshift(data)
        return { success: true, data }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },

    async uploadAccountDocument (accountId: string, file: File, documentType: string) {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return { success: false, error: 'User not authenticated' } }

      try {
        const supabase = useSupabaseClient()
        const fileExt = file.name.split('.').pop()
        const fileName = `${accountId}-${documentType}-${Date.now()}.${fileExt}`
        const filePath = `account-documents/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)

        if (uploadError) {
          console.error('File upload error:', uploadError)
          throw new Error(`Failed to upload ${documentType}`)
        }

        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)

        return { success: true, url: urlData.publicUrl }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },

    async updateAccount (accountId: string, updates: Partial<Account>) {
      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('accounts')
          .update(updates)
          .eq('id', accountId)
          .select()
          .single()

        if (error) { throw error }

        const index = this.accounts.findIndex(a => a.id === accountId)
        if (index !== -1) {
          this.accounts[index] = data
        }

        return { success: true, data }
      } catch (error: any) {
        return { success: false, error: error.message }
      }
    },

    async fetchAccountById (accountId: string) {
      this.loading = true

      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('accounts')
          .select(`
            *,
            assigned_agent:assigned_agent_id(id, full_name, email),
            loans(*)
          `)
          .eq('id', accountId)
          .single()

        if (error) { throw error }
        this.selectedAccount = data as AccountWithRelations
      } catch (error: any) {
        console.error('Error fetching account:', error)
        this.selectedAccount = null
      } finally {
        this.loading = false
      }
    }
  }
})

export type AccountsStore = ReturnType<typeof useAccountsStore>
