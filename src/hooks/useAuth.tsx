'use client'

import { trpc } from '@/lib/trpc/client'

export function useAuth() {
  const { data: session, isLoading, refetch } = trpc.auth.getSession.useQuery()
  const logoutMutation = trpc.auth.logout.useMutation()

  const logout = async () => {
    await logoutMutation.mutateAsync()
    window.location.href = '/'
  }

  return {
    user: session?.user ?? null,
    isLoading,
    isAuthenticated: !!session?.user,
    isAdmin: session?.user?.role === 'admin',
    isAgent: session?.user?.role === 'agent',
    isInternalAdmin: session?.user?.role === 'internal_admin',
    logout,
    refetch,
  }
}
