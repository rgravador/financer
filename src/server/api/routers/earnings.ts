import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const earningsRouter = createTRPCRouter({
  getMy: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('earnings')
      .select('*')
      .eq('agent_id', ctx.userProfile.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return data || {
      total_earnings: 0,
      collectible_earnings: 0,
      cashed_out_amount: 0,
      commission_percentage: 0,
    }
  }),

  getAll: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('earnings')
      .select(`
        *,
        agent:agent_id(id, full_name, email)
      `)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return data
  }),
})
