import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import type { Loan } from '@/types/database'

export const loansRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    let query = ctx.supabase.from('loans').select(`
      *,
      account:accounts(*)
    `)

    // If user is agent, only show loans for their assigned accounts
    if (ctx.userProfile.role === 'agent') {
      query = query.eq('accounts.assigned_agent_id', ctx.userProfile.id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return data as Loan[]
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('loans')
        .select(`
          *,
          account:accounts(*),
          payments(*)
        `)
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Loan not found',
        })
      }

      return data
    }),

  create: protectedProcedure
    .input(
      z.object({
        account_id: z.string().uuid(),
        principal_amount: z.number().positive(),
        interest_rate: z.number().positive(),
        tenure_months: z.number().int().positive(),
        payment_frequency: z.enum(['bi-monthly', 'monthly', 'weekly']),
        start_date: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('loans')
        .insert({
          ...input,
          created_by: ctx.userProfile.id,
          status: 'pending_approval',
          current_balance: input.principal_amount,
          total_paid: 0,
          total_penalties: 0,
          amortization_schedule: [],
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  approve: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('loans')
        .update({
          status: 'approved',
          approved_by: ctx.userProfile.id,
          approval_date: new Date().toISOString(),
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  reject: adminProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('loans')
        .update({
          status: 'rejected',
          approved_by: ctx.userProfile.id,
          rejection_reason: input.reason,
        })
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),
})
