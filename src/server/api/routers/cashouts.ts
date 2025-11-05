import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const cashoutsRouter = createTRPCRouter({
  getMy: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('cashout_requests')
      .select('*')
      .eq('agent_id', ctx.userProfile.id)
      .order('request_date', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return data
  }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('cashout_requests')
      .select(`
        *,
        agent:agent_id(id, full_name, email)
      `)
      .order('request_date', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return data
  }),

  create: protectedProcedure
    .input(
      z.object({
        amount: z.number().positive(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('cashout_requests')
        .insert({
          agent_id: ctx.userProfile.id,
          amount: input.amount,
          status: 'pending',
          request_date: new Date().toISOString(),
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
        .from('cashout_requests')
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
        .from('cashout_requests')
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
