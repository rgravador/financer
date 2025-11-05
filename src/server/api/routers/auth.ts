import { z } from 'zod'
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const authRouter = createTRPCRouter({
  login: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase.auth.signInWithPassword({
        email: input.email,
        password: input.password,
      })

      if (error) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: error.message,
        })
      }

      // Fetch user profile
      const { data: profileData, error: profileError } = await ctx.supabase
        .from('users_profile')
        .select('*')
        .eq('id', data.user.id)
        .single()

      if (profileError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch user profile',
        })
      }

      const displayName = data.user.user_metadata?.display_name || null

      return {
        success: true,
        user: {
          ...profileData,
          display_name: displayName,
        },
      }
    }),

  signup: publicProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(6),
        full_name: z.string().min(1),
        display_name: z.string().optional(),
        role: z.enum(['admin', 'agent', 'internal_admin']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Create auth user
      const { data: authData, error: authError } = await ctx.supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            display_name: input.display_name || input.full_name,
            full_name: input.full_name,
          },
        },
      })

      if (authError) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: authError.message,
        })
      }

      if (!authData.user) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        })
      }

      // Create user profile
      const { error: profileError } = await ctx.supabase
        .from('users_profile')
        .insert({
          id: authData.user.id,
          email: input.email,
          full_name: input.full_name,
          role: input.role,
        })

      if (profileError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: profileError.message,
        })
      }

      return { success: true }
    }),

  logout: protectedProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase.auth.signOut()

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return { success: true }
  }),

  getSession: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userProfile) {
      return { user: null }
    }

    return { user: ctx.userProfile }
  }),
})
