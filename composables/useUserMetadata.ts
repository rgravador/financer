// Composable to access user metadata from auth
export const useUserMetadata = () => {
  const supabase = useTypedSupabaseClient()

  /**
   * Get display name from auth metadata for a user
   * @param userId - The user ID to fetch metadata for
   * @returns The display name or null
   */
  const getDisplayName = async (userId: string): Promise<string | null> => {
    try {
      const { data: { user }, error } = await supabase.auth.admin.getUserById(userId)
      if (error || !user) { return null }

      return user.user_metadata?.display_name || null
    } catch {
      return null
    }
  }

  /**
   * Get the current user's display name from session
   * @returns The display name or null
   */
  const getCurrentUserDisplayName = async (): Promise<string | null> => {
    const { data: { user } } = await supabase.auth.getUser()
    return user?.user_metadata?.display_name || null
  }

  /**
   * Update the current user's display name in auth metadata
   * @param displayName - The new display name
   */
  const updateDisplayName = async (displayName: string) => {
    return await supabase.auth.updateUser({
      data: { display_name: displayName }
    })
  }

  return {
    getDisplayName,
    getCurrentUserDisplayName,
    updateDisplayName
  }
}
