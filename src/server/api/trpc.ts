import { initTRPC, TRPCError } from '@trpc/server'
import superjson from 'superjson'
import { ZodError } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { UserProfileWithMeta } from '@/types/database'

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let userProfile: UserProfileWithMeta | null = null

  if (user) {
    const { data } = await supabase
      .from('users_profile')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      const displayName = user.user_metadata?.display_name || null
      userProfile = { ...data, display_name: displayName } as UserProfileWithMeta
    }
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
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    }
  },
})

export const createTRPCRouter = t.router
export const publicProcedure = t.procedure

// Auth middleware
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user || !ctx.userProfile) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }
  return next({
    ctx: {
      user: ctx.user,
      userProfile: ctx.userProfile,
    },
  })
})

// Admin middleware
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.userProfile || ctx.userProfile.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN' })
  }
  return next({
    ctx: {
      user: ctx.user!,
      userProfile: ctx.userProfile,
    },
  })
})

export const protectedProcedure = t.procedure.use(enforceUserIsAuthed)
export const adminProcedure = t.procedure.use(enforceUserIsAdmin)
