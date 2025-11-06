'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getCurrentUser, getUserProfile, type UserProfile } from '@/lib/auth/route-protection'

export function useUserProfile() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        setError(null)

        const user = await getCurrentUser()
        if (!user) {
          setUserProfile(null)
          return
        }

        const profile = await getUserProfile(user.id)
        setUserProfile(profile)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user profile')
        setUserProfile(null)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const profile = await getUserProfile(session.user.id)
        setUserProfile(profile)
      } else {
        setUserProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return { userProfile, loading, error }
}