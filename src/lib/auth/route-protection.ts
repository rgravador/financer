import { createClient } from '@/src/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

export type UserRole = 'admin' | 'tenant_admin' | 'tenant_officer' | 'tenant_approver' | 'tenant_legal'

export interface UserProfile {
  id: string
  role: UserRole
  tenant_id: string | null
  full_name: string | null
  email: string
}

// Route definitions with required roles
export const ROUTE_PERMISSIONS = {
  // Guest routes (no authentication required)
  '/': 'guest',
  '/login': 'guest',
  '/signup': 'guest', 
  '/forgot-password': 'guest',
  
  // Admin only routes
  '/admin/dashboard': ['admin'],
  '/admin/tenants': ['admin'],
  '/admin/users': ['admin'],
  '/admin/settings': ['admin'],
  '/admin/tenants/new': ['admin'],
  '/admin/tenants/[id]': ['admin'],
  '/admin/tenants/[id]/edit': ['admin'],
  '/admin/tenants/[id]/users/new': ['admin'],
  
  // Tenant routes (accessible by tenant roles and admin)
  '/dashboard': ['admin', 'tenant_admin', 'tenant_officer', 'tenant_approver', 'tenant_legal'],
  '/accounts': ['admin', 'tenant_admin', 'tenant_officer'],
  '/accounts/new': ['admin', 'tenant_admin', 'tenant_officer'],
  '/accounts/[id]': ['admin', 'tenant_admin', 'tenant_officer', 'tenant_approver'],
  '/accounts/[id]/edit': ['admin', 'tenant_admin', 'tenant_officer'],
  '/loans': ['admin', 'tenant_admin', 'tenant_officer', 'tenant_approver'],
  '/loans/new': ['admin', 'tenant_admin', 'tenant_officer'],
  '/loans/[id]': ['admin', 'tenant_admin', 'tenant_officer', 'tenant_approver'],
  '/payments': ['admin', 'tenant_admin', 'tenant_officer'],
  '/earnings': ['admin', 'tenant_admin', 'tenant_officer'],
  '/users': ['admin', 'tenant_admin'],
  '/notifications': ['admin', 'tenant_admin', 'tenant_officer', 'tenant_approver', 'tenant_legal'],
} as const

export type RoutePermission = typeof ROUTE_PERMISSIONS[keyof typeof ROUTE_PERMISSIONS]

export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = createClient()
  const { data: profile, error } = await supabase
    .from('users_profile')
    .select('id, role, tenant_id, full_name, email')
    .eq('id', userId)
    .single()

  if (error || !profile) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return profile as UserProfile
}

export function isGuestRoute(pathname: string): boolean {
  const guestRoutes = ['/', '/login', '/signup', '/forgot-password']
  return guestRoutes.includes(pathname)
}

export function getRoutePermissions(pathname: string): RoutePermission {
  // Check exact matches first
  if (pathname in ROUTE_PERMISSIONS) {
    return ROUTE_PERMISSIONS[pathname as keyof typeof ROUTE_PERMISSIONS]
  }

  // Check dynamic routes
  for (const [route, permissions] of Object.entries(ROUTE_PERMISSIONS)) {
    if (route.includes('[id]')) {
      const routePattern = route.replace(/\[id\]/g, '[^/]+')
      const regex = new RegExp(`^${routePattern}$`)
      if (regex.test(pathname)) {
        return permissions
      }
    }
  }

  // Default: require authentication for unknown routes
  return ['admin', 'tenant_admin', 'tenant_officer', 'tenant_approver', 'tenant_legal']
}

export function hasPermission(userRole: UserRole, routePermissions: RoutePermission): boolean {
  if (routePermissions === 'guest') {
    return true
  }

  if (Array.isArray(routePermissions)) {
    return routePermissions.includes(userRole)
  }

  return false
}

export function getRedirectPath(userRole: UserRole): string {
  if (userRole === 'admin') {
    return '/admin/dashboard'
  }
  return '/dashboard'
}