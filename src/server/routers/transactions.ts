import { z } from 'zod'
import { router, authenticatedProcedure, tenantAdminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const transactionTypeEnum = z.enum([
  'create_account',
  'update_account',
  'create_loan',
  'approve_loan',
  'reject_loan',
  'receive_payment',
  'cashout_request',
  'cashout_approved',
  'cashout_rejected',
  'commission_update'
])

export const transactionsRouter = router({
  // Get transaction by ID (admin only)
  getById: tenantAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('transactions')
        .select('*')
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Transaction not found'
        })
      }

      return data
    }),

  // List transactions
  list: tenantAdminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      type: transactionTypeEnum.optional(),
      user_id: z.string().optional(),
      account_id: z.string().optional(),
      loan_id: z.string().optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .range(input.offset, input.offset + input.limit - 1)
        .order('timestamp', { ascending: false })

      if (input.type) {
        query = query.eq('type', input.type)
      }

      if (input.user_id) {
        query = query.eq('user_id', input.user_id)
      }

      if (input.account_id) {
        query = query.eq('account_id', input.account_id)
      }

      if (input.loan_id) {
        query = query.eq('loan_id', input.loan_id)
      }

      if (input.start_date) {
        query = query.gte('timestamp', input.start_date)
      }

      if (input.end_date) {
        query = query.lte('timestamp', input.end_date)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return {
        transactions: data || [],
        total: count || 0,
      }
    }),

  // Get my transactions
  getMy: authenticatedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      type: transactionTypeEnum.optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', ctx.userProfile.id)
        .range(input.offset, input.offset + input.limit - 1)
        .order('timestamp', { ascending: false })

      if (input.type) {
        query = query.eq('type', input.type)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return {
        transactions: data || [],
        total: count || 0,
      }
    }),
})
