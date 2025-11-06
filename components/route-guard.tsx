'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Spinner } from '@heroui/spinner'
import { 
  getCurrentUser, 
  getUserProfile, 
  isGuestRoute, 
  getRoutePermissions, 
  hasPermission, 
  getRedirectPath,
  type UserProfile 
} from '@/lib/auth/route-protection'

interface RouteGuardProps {
  children: React.ReactNode
}

export default function RouteGuard({ children }: RouteGuardProps) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true)
        
        // Get current user
        const user = await getCurrentUser()
        
        // If this is a guest route
        if (isGuestRoute(pathname)) {
          // If user is logged in and trying to access guest route, redirect to dashboard
          if (user) {
            const profile = await getUserProfile(user.id)
            if (profile) {
              const redirectPath = getRedirectPath(profile.role)
              router.replace(redirectPath)
              return
            }
          }
          // Allow access to guest route
          setAuthorized(true)
          setLoading(false)
          return
        }

        // For protected routes, user must be authenticated
        if (!user) {
          router.replace('/')
          return
        }

        // Get user profile to check role permissions
        const profile = await getUserProfile(user.id)
        if (!profile) {
          console.error('User profile not found')
          router.replace('/')
          return
        }

        setUserProfile(profile)

        // Check route permissions
        const routePermissions = getRoutePermissions(pathname)
        const hasAccess = hasPermission(profile.role, routePermissions)

        if (!hasAccess) {
          // Redirect to appropriate dashboard based on role
          const redirectPath = getRedirectPath(profile.role)
          router.replace(redirectPath)
          return
        }

        setAuthorized(true)
      } catch (error) {
        console.error('Error checking authentication:', error)
        router.replace('/')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [pathname])

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-default-500">Loading...</p>
        </div>
      </div>
    )
  }

  // Show content if authorized
  if (authorized) {
    return <>{children}</>
  }

  // Show nothing while redirecting
  return null
}