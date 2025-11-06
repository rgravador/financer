'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Sidenav from '@/components/sidenav'
import RouteGuard from '@/components/route-guard'
import { isGuestRoute } from '@/lib/auth/route-protection'
import type { User } from '@supabase/supabase-js'

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
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
  }, [])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="relative flex flex-col h-screen">
        <main className="container mx-auto max-w-7xl px-6 flex-grow flex items-center justify-center">
          <div className="text-center">Loading...</div>
        </main>
      </div>
    )
  }

  // Guest Layout (no navbar/footer) for guest routes
  if (isGuestRoute(pathname)) {
    return (
      <RouteGuard>
        <div className="relative flex flex-col min-h-screen">
          <main className="flex-grow">
            {children}
          </main>
        </div>
      </RouteGuard>
    )
  }

  // Authenticated Layout (with sidenav) for protected routes
  return (
    <RouteGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidenav user={user} />
        <main className="flex-1 overflow-y-auto bg-background">
          <div className="container mx-auto max-w-7xl px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </RouteGuard>
  )
}
