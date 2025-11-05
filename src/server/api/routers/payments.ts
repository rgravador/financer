import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const paymentsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('payments')
      .select(`
        *,
        loan:loans(
          *,
          account:accounts(*)
        )
      `)
      .order('payment_date', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return data
  }),

  getByLoanId: protectedProcedure
    .input(z.object({ loanId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('payments')
        .select('*')
        .eq('loan_id', input.loanId)
        .order('payment_date', { ascending: false })

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
        loan_id: z.string().uuid(),
        amount: z.number().positive(),
        payment_date: z.string(),
        type: z.enum(['regular', 'penalty', 'partial']),
        applied_to_principal: z.number(),
        applied_to_interest: z.number(),
        applied_to_penalty: z.number(),
        notes: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('payments')
        .insert({
          ...input,
          received_by: ctx.userProfile.id,
          status: 'received',
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
})
