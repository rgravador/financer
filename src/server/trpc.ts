import { initTRPC, TRPCError } from '@trpc/server'
import { createClient } from '@/src/lib/supabase/server'
import superjson from 'superjson'
import type { UserProfile, UserRole } from './db/database'

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userProfile: UserProfile | null = null

  // Fetch user profile if authenticated
  if (user) {
    const { data } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', user.id)
      .single()

    userProfile = data
  }

  return {
    supabase,
    user,
    userProfile,
    ...opts,
  }
}

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure

// Protected procedure that requires authentication
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
    },
  })
})

// Role-based protected procedure
const createRoleProcedure = (allowedRoles: UserRole[]) => {
  return protectedProcedure.use(async ({ ctx, next }) => {
    if (!ctx.userProfile) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'User profile not found'
      })
    }

    if (!ctx.userProfile.is_active) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: 'User account is not active'
      })
    }

    if (!allowedRoles.includes(ctx.userProfile.role)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `Access denied. Required roles: ${allowedRoles.join(', ')}`
      })
    }

    return next({
      ctx: {
        ...ctx,
        userProfile: ctx.userProfile,
      },
    })
  })
}

// Admin-only procedure
export const adminProcedure = createRoleProcedure(['admin'])

// Tenant admin procedure
export const tenantAdminProcedure = createRoleProcedure(['admin', 'tenant_admin'])

// Tenant officer procedure (can also be used by admins)
export const tenantOfficerProcedure = createRoleProcedure(['admin', 'tenant_admin', 'tenant_officer'])

// Tenant approver procedure
export const tenantApproverProcedure = createRoleProcedure(['admin', 'tenant_admin', 'tenant_approver'])

// Tenant legal procedure
export const tenantLegalProcedure = createRoleProcedure(['admin', 'tenant_admin', 'tenant_legal'])

// Any authenticated user with active profile
export const authenticatedProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.userProfile) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User profile not found'
    })
  }

  if (!ctx.userProfile.is_active) {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: 'User account is not active'
    })
  }

  return next({
    ctx: {
      ...ctx,
      userProfile: ctx.userProfile,
    },
  })
})
