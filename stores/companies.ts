import { defineStore } from 'pinia'
import type { CompanyWithRelations, CompanyForm, CompanyStatus } from '~/types'

interface CompanyFilters {
  search: string
  status: CompanyStatus | null
}

export const useCompaniesStore = defineStore('companies', {
  state: () => ({
    companies: [] as CompanyWithRelations[],
    loading: false,
    filters: {
      search: '',
      status: null
    } as CompanyFilters
  }),

  getters: {
    filteredCompanies: (state): CompanyWithRelations[] => {
      let filtered = [...state.companies]

      // Apply search filter
      if (state.filters.search) {
        const searchLower = state.filters.search.toLowerCase()
        filtered = filtered.filter(company =>
          company.name.toLowerCase().includes(searchLower) ||
          company.contact_email?.toLowerCase().includes(searchLower) ||
          company.registration_number?.toLowerCase().includes(searchLower)
        )
      }

      // Apply status filter
      if (state.filters.status) {
        filtered = filtered.filter(company => company.status === state.filters.status)
      }

      return filtered
    },

    activeCompanies: (state): CompanyWithRelations[] => {
      return state.companies.filter(c => c.status === 'active')
    },

    archivedCompanies: (state): CompanyWithRelations[] => {
      return state.companies.filter(c => c.status === 'archived')
    },

    getCompanyById: (state) => {
      return (id: string): CompanyWithRelations | undefined => {
        return state.companies.find(c => c.id === id)
      }
    }
  },

  actions: {
    setFilters (newFilters: Partial<CompanyFilters>) {
      if (newFilters.search !== undefined) {
        this.filters.search = newFilters.search
      }
      if (newFilters.status !== undefined) {
        this.filters.status = newFilters.status
      }
    },

    async fetchCompanies () {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('companies')
          .select(`
            *,
            creator:created_by (
              id,
              email,
              full_name,
              role,
              avatar_url
            )
          `)
          .order('created_at', { ascending: false })

        if (error) { throw error }

        this.companies = (data || []) as CompanyWithRelations[]
      } catch (error: any) {
        const { showError } = useUI()
        showError(`Failed to fetch companies: ${error.message}`)
      } finally {
        this.loading = false
      }
    },

    async createCompany (formData: CompanyForm) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const authStore = useAuthStore()

        let logoUrl = null

        // Upload logo if provided
        if (formData.logo_file) {
          const fileExt = formData.logo_file.name.split('.').pop()
          const fileName = `${Date.now()}.${fileExt}`
          const filePath = `company-logos/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, formData.logo_file)

          if (uploadError) { throw uploadError }

          const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath)

          logoUrl = urlData.publicUrl
        }

        // Create company record
        const { data, error } = await (supabase
          .from('companies')
          .insert as any)({
          name: formData.name,
          description: formData.description || null,
          address: formData.address || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          registration_number: formData.registration_number || null,
          tax_id: formData.tax_id || null,
          logo_url: logoUrl,
          status: 'active',
          created_by: authStore.user?.id
        })
          .select(`
            *,
            creator:created_by (
              id,
              email,
              full_name,
              role,
              avatar_url
            )
          `)
          .single()

        if (error) { throw error }

        this.companies.unshift(data as CompanyWithRelations)

        const { showSuccess } = useUI()
        showSuccess('Company created successfully')

        return { success: true, data }
      } catch (error: any) {
        const { showError } = useUI()
        showError(`Failed to create company: ${error.message}`)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async updateCompany (id: string, formData: CompanyForm) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const company = this.getCompanyById(id)
        let logoUrl = company?.logo_url || null

        // Upload new logo if provided
        if (formData.logo_file) {
          const fileExt = formData.logo_file.name.split('.').pop()
          const fileName = `${Date.now()}.${fileExt}`
          const filePath = `company-logos/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('documents')
            .upload(filePath, formData.logo_file)

          if (uploadError) { throw uploadError }

          const { data: urlData } = supabase.storage
            .from('documents')
            .getPublicUrl(filePath)

          logoUrl = urlData.publicUrl
        }

        // Update company record
        const { data, error } = await (supabase
          .from('companies')
          .update as any)({
          name: formData.name,
          description: formData.description || null,
          address: formData.address || null,
          contact_email: formData.contact_email || null,
          contact_phone: formData.contact_phone || null,
          registration_number: formData.registration_number || null,
          tax_id: formData.tax_id || null,
          logo_url: logoUrl,
          updated_at: new Date().toISOString()
        })
          .eq('id', id)
          .select(`
            *,
            creator:created_by (
              id,
              email,
              full_name,
              role,
              avatar_url
            )
          `)
          .single()

        if (error) { throw error }

        // Update in local state
        const index = this.companies.findIndex(c => c.id === id)
        if (index !== -1) {
          this.companies[index] = data as CompanyWithRelations
        }

        const { showSuccess } = useUI()
        showSuccess('Company updated successfully')

        return { success: true, data }
      } catch (error: any) {
        const { showError } = useUI()
        showError(`Failed to update company: ${error.message}`)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async updateCompanyStatus (id: string, status: CompanyStatus) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()

        const { data, error } = await (supabase
          .from('companies')
          .update as any)({
          status,
          updated_at: new Date().toISOString()
        })
          .eq('id', id)
          .select(`
            *,
            creator:created_by (
              id,
              email,
              full_name,
              role,
              avatar_url
            )
          `)
          .single()

        if (error) { throw error }

        // Update in local state
        const index = this.companies.findIndex(c => c.id === id)
        if (index !== -1) {
          this.companies[index] = data as CompanyWithRelations
        }

        const { showSuccess } = useUI()
        const statusText = status === 'archived' ? 'archived' : status === 'active' ? 'activated' : 'deactivated'
        showSuccess(`Company ${statusText} successfully`)

        return { success: true, data }
      } catch (error: any) {
        const { showError } = useUI()
        showError(`Failed to update company status: ${error.message}`)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async deleteCompany (id: string) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()

        const { error } = await supabase
          .from('companies')
          .delete()
          .eq('id', id)

        if (error) { throw error }

        // Remove from local state
        this.companies = this.companies.filter(c => c.id !== id)

        const { showSuccess } = useUI()
        showSuccess('Company deleted successfully')

        return { success: true }
      } catch (error: any) {
        const { showError } = useUI()
        showError(`Failed to delete company: ${error.message}`)
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    }
  }
})

export type CompaniesStore = ReturnType<typeof useCompaniesStore>
