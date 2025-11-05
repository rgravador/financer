import { defineStore } from 'pinia'
import type { UserProfileWithMeta } from '~/types'

const PROFILE_STORAGE_KEY = 'user_profile'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    profile: null as UserProfileWithMeta | null,
    loading: false
  }),

  getters: {
    user: state => state.profile,
    isAuthenticated: state => !!state.profile,
    isAdmin: state => state.profile?.role === 'admin',
    isAgent: state => state.profile?.role === 'agent',
    userProfile: state => state.profile
  },

  actions: {
    loadProfileFromStorage () {
      if (process.client) {
        const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
        if (stored) {
          try {
            this.profile = JSON.parse(stored)
          } catch (error) {
            localStorage.removeItem(PROFILE_STORAGE_KEY)
          }
        }
      }
    },

    saveProfileToStorage (profileData: UserProfileWithMeta) {
      if (process.client) {
        localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData))
      }
    },

    clearProfileFromStorage () {
      if (process.client) {
        localStorage.removeItem(PROFILE_STORAGE_KEY)
      }
    },

    async login (email: string, password: string) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) { throw error }

        await this.fetchUserProfile(data.user.id)

        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async signup (userData: {
      email: string
      password: string
      full_name: string
      display_name?: string
      role: 'admin' | 'agent'
    }) {
      this.loading = true
      try {
        const supabase = useSupabaseClient()
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

        if (authError) { throw authError }

        // Create user profile
        const { error: profileError } = await (supabase
          .from('users_profile')
          .insert as any)({
          id: authData.user?.id || '',
          email: userData.email,
          full_name: userData.full_name,
          role: userData.role
        })

        if (profileError) { throw profileError }

        return { success: true }
      } catch (error: any) {
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    async logout () {
      const supabase = useSupabaseClient()
      await supabase.auth.signOut()
      this.profile = null
      this.clearProfileFromStorage()
      await navigateTo('/auth/login')
    },

    async fetchUserProfile (userId: string) {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) { throw error }

      // Get display name from auth metadata
      const { data: { user: authUser } } = await supabase.auth.getUser()
      const displayName = authUser?.user_metadata?.display_name || null

      const userProfile = Object.assign({}, data, {
        display_name: displayName
      }) as UserProfileWithMeta

      this.profile = userProfile
      this.saveProfileToStorage(userProfile)
    },

    async refreshSession () {
      const supabase = useSupabaseClient()
      const { data } = await supabase.auth.getSession()

      if (data.session) {
        await this.fetchUserProfile(data.session.user.id)
      }
    },

    initializeAuthListener () {
      const supabase = useSupabaseClient()
      const user = useSupabaseUser()

      // Load profile from localStorage on initialization (client-side only)
      if (process.client) {
        this.loadProfileFromStorage()
      }

      // Listen to auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          await this.fetchUserProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          this.profile = null
          this.clearProfileFromStorage()
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          if (!this.profile) {
            await this.fetchUserProfile(session.user.id)
          }
        } else if (event === 'USER_UPDATED' && session?.user) {
          await this.fetchUserProfile(session.user.id)
        }
      })

      // Initialize profile when user changes
      watch(user, async (newUser) => {
        if (newUser && !this.profile) {
          await this.fetchUserProfile(newUser.id)
        } else if (!newUser) {
          this.profile = null
          this.clearProfileFromStorage()
        }
      }, { immediate: true })
    }
  }
})
