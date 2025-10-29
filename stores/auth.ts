import { defineStore } from 'pinia'
import type { UserProfileWithMeta } from '~/types'

interface AuthState {
  user: UserProfileWithMeta | null
  loading: boolean
  session: any | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    loading: false,
    session: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.user?.role === 'admin',
    isAgent: (state) => state.user?.role === 'agent',
    userProfile: (state) => state.user
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      try {
        const supabase = useTypedSupabaseClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) throw error

        this.session = data.session
        await this.fetchUserProfile(data.user.id)

        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async signup(userData: { email: string; password: string; full_name: string; display_name?: string; role: 'admin' | 'agent' }) {
      this.loading = true
      try {
        const supabase = useTypedSupabaseClient()

        // Create auth user with metadata
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password,
          options: {
            data: {
              display_name: userData.display_name || userData.full_name,
              full_name: userData.full_name
            }
          }
        })

        if (authError) throw authError

        // Create user profile (without display_name)
        const { error: profileError } = await (supabase
          .from('users_profile')
          .insert as any)({
            id: authData.user?.id || '',
            email: userData.email,
            full_name: userData.full_name,
            role: userData.role
          })

        if (profileError) throw profileError

        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async logout() {
      const supabase = useTypedSupabaseClient()
      await supabase.auth.signOut()
      this.user = null
      this.session = null
      navigateTo('/auth/login')
    },

    async fetchUserProfile(userId: string) {
      const supabase = useTypedSupabaseClient()
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      // Get display name from auth metadata
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const displayName = authUser?.user_metadata?.display_name || null

      this.user = Object.assign({}, data, {
        display_name: displayName
      }) as UserProfileWithMeta
    },

    async refreshSession() {
      const supabase = useTypedSupabaseClient()
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        this.session = data.session
        await this.fetchUserProfile(data.session.user.id)
      }
    }
  },

  persist: true
})
