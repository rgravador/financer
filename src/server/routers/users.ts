import { z } from 'zod'
import { router, authenticatedProcedure, adminProcedure, tenantAdminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const usersRouter = router({
  // Get current user profile
  getCurrentProfile: authenticatedProcedure.query(async ({ ctx }) => {
    return ctx.userProfile
  }),

  // Get all users (admin only)
  getAll: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('users_profile')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }

    return data || []
  }),

  // Get users for current tenant (tenant_admin and above)
  getTenantUsers: tenantAdminProcedure.query(async ({ ctx }) => {
    // If admin, return all users
    if (ctx.userProfile.role === 'admin') {
      const { data, error } = await ctx.supabase
        .from('users_profile')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return data || []
    }

    // For tenant users, only return users from their tenant
    const { data, error } = await ctx.supabase
      .from('users_profile')
      .select('*')
      .eq('tenant_id', ctx.userProfile.tenant_id)
      .order('created_at', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }

    return data || []
  }),

  // Get user profile by ID (admin/tenant_admin only)
  getById: tenantAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('users_profile')
        .select('*')
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User profile not found'
        })
      }

      return data
    }),

  // List all users (admin/tenant_admin only)
  list: tenantAdminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      role: z.enum(['admin', 'tenant_officer', 'tenant_admin', 'tenant_approver', 'tenant_legal']).optional(),
      is_active: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('users_profile')
        .select('*', { count: 'exact' })
        .range(input.offset, input.offset + input.limit - 1)
        .order('created_at', { ascending: false })

      if (input.role) {
        query = query.eq('role', input.role)
      }

      if (input.is_active !== undefined) {
        query = query.eq('is_active', input.is_active)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return {
        users: data || [],
        total: count || 0,
      }
    }),

  // Update user profile (admin only for other users, users can update their own)
  update: authenticatedProcedure
    .input(z.object({
      id: z.string(),
      full_name: z.string().optional(),
      avatar_url: z.string().nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      // Check if user is updating their own profile or is admin
      if (id !== ctx.userProfile.id && ctx.userProfile.role !== 'admin') {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own profile'
        })
      }

      const { data, error } = await ctx.supabase
        .from('users_profile')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return data
    }),

  // Update user role (admin only)
  updateRole: adminProcedure
    .input(z.object({
      id: z.string(),
      role: z.enum(['admin', 'tenant_officer', 'tenant_admin', 'tenant_approver', 'tenant_legal']),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('users_profile')
        .update({
          role: input.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return data
    }),

  // Activate/deactivate user (admin only)
  updateStatus: adminProcedure
    .input(z.object({
      id: z.string(),
      is_active: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('users_profile')
        .update({
          is_active: input.is_active,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return data
    }),
})
