'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidenav from '@/components/sidenav'
import type { User } from '@supabase/supabase-js'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Guest routes (no authentication required)
  const guestRoutes = ['/', '/login', '/signup', '/forgot-password']
  const isGuestRoute = guestRoutes.includes(pathname)

  // Show loading state
  if (loading) {
    return (
      <div className="relative flex flex-col h-screen">
        <main className="container mx-auto max-w-7xl px-6 flex-grow flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    )
  }

  // Guest Layout (no navbar/footer)
  if (!user && isGuestRoute) {
    return (
      <div className="relative flex flex-col min-h-screen">
        <main className="flex-grow">
          {children}
        </main>
      </div>
    )
  }

  // Authenticated Layout (with sidenav)
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidenav user={user} />
      <main className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto max-w-7xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
