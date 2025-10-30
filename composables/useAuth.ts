import type { UserProfileWithMeta } from '~/types'

const PROFILE_STORAGE_KEY = 'user_profile'

export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()

  const profile = ref<UserProfileWithMeta | null>(null)
  const loading = ref(false)

  // Load profile from localStorage on initialization
  const loadProfileFromStorage = () => {
    if (process.client) {
      const stored = localStorage.getItem(PROFILE_STORAGE_KEY)
      if (stored) {
        try {
          profile.value = JSON.parse(stored)
        } catch (error) {
          localStorage.removeItem(PROFILE_STORAGE_KEY)
        }
      }
    }
  }

  // Save profile to localStorage
  const saveProfileToStorage = (profileData: UserProfileWithMeta) => {
    if (process.client) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData))
    }
  }

  // Clear profile from localStorage
  const clearProfileFromStorage = () => {
    if (process.client) {
      localStorage.removeItem(PROFILE_STORAGE_KEY)
    }
  }

  // Computed getters
  const isAuthenticated = computed(() => !!user.value && !!profile.value)
  const isAdmin = computed(() => profile.value?.role === 'admin')
  const isAgent = computed(() => profile.value?.role === 'agent')
  const userProfile = computed(() => profile.value)

  // Actions
  const login = async (email: string, password: string) => {
    loading.value = true
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      await fetchUserProfile(data.user.id)

      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  const signup = async (userData: { 
    email: string
    password: string
    full_name: string
    display_name?: string
    role: 'admin' | 'agent' 
  }) => {
    loading.value = true
    try {
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

      // Create user profile
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
      loading.value = false
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    profile.value = null
    clearProfileFromStorage()
    await navigateTo('/auth/login')
  }

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error

    // Get display name from auth metadata
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const displayName = authUser?.user_metadata?.display_name || null

    const userProfile = Object.assign({}, data, {
      display_name: displayName
    }) as UserProfileWithMeta

    profile.value = userProfile
    saveProfileToStorage(userProfile)
  }

  const refreshSession = async () => {
    const { data } = await supabase.auth.getSession()

    if (data.session) {
      await fetchUserProfile(data.session.user.id)
    }
  }

  // Load profile from localStorage on initialization (client-side only)
  if (process.client) {
    loadProfileFromStorage()
  }

  // Listen to auth state changes
  supabase.auth.onAuthStateChange(async (event, session) => {

    if (event === 'SIGNED_IN' && session?.user) {
      // User signed in, fetch and save profile
      await fetchUserProfile(session.user.id)
    } else if (event === 'SIGNED_OUT') {
      // User signed out, clear profile
      profile.value = null
      clearProfileFromStorage()
    } else if (event === 'TOKEN_REFRESHED' && session?.user) {
      // Token refreshed, ensure profile is loaded
      if (!profile.value) {
        await fetchUserProfile(session.user.id)
      }
    } else if (event === 'USER_UPDATED' && session?.user) {
      // User updated, refresh profile
      await fetchUserProfile(session.user.id)
    }
  })

  // Initialize profile when user changes
  watch(user, async (newUser) => {
    if (newUser && !profile.value) {
      await fetchUserProfile(newUser.id)
    } else if (!newUser) {
      profile.value = null
      clearProfileFromStorage()
    }
  }, { immediate: true })

  return {
    // State
    user: computed(() => profile.value),
    loading: readonly(loading),
    // Getters
    isAuthenticated,
    isAdmin,
    isAgent,
    userProfile,
    // Actions
    login,
    signup,
    logout,
    fetchUserProfile,
    refreshSession
  }
}