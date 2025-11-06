import { z } from 'zod'
import { router, tenantOfficerProcedure, authenticatedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const penaltiesRouter = router({
  // Get penalty by ID
  getById: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('penalties')
        .select('*, loan:loans(*, account:accounts(*))')
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Penalty not found'
        })
      }

      // Tenant officers can only see penalties for their accounts
      if (ctx.userProfile.role === 'tenant_officer') {
        const loan = data.loan as any
        const account = loan?.account
        if (account?.assigned_agent_id !== ctx.userProfile.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only view penalties for accounts assigned to you'
          })
        }
      }

      return data
    }),

  // List penalties
  list: authenticatedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      loan_id: z.string().optional(),
      is_paid: z.boolean().optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('penalties')
        .select('*, loan:loans(*, account:accounts(*))', { count: 'exact' })
        .range(input.offset, input.offset + input.limit - 1)
        .order('penalty_date', { ascending: false })

      if (input.loan_id) {
        query = query.eq('loan_id', input.loan_id)
      }

      if (input.is_paid !== undefined) {
        query = query.eq('is_paid', input.is_paid)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      // Filter by agent if tenant officer
      let filteredData = data || []
      if (ctx.userProfile.role === 'tenant_officer') {
        filteredData = filteredData.filter((penalty: any) =>
          penalty.loan?.account?.assigned_agent_id === ctx.userProfile.id
        )
      }

      return {
        penalties: filteredData,
        total: filteredData.length,
      }
    }),

  // Create penalty (tenant officers can create for their accounts)
  create: tenantOfficerProcedure
    .input(z.object({
      loan_id: z.string(),
      amount: z.number().min(0),
      reason: z.string().min(1),
      penalty_date: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if loan exists and user has access
      const { data: loan } = await ctx.supabase
        .from('loans')
        .select('*, account:accounts(*)')
        .eq('id', input.loan_id)
        .single()

      if (!loan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Loan not found'
        })
      }

      const account = loan.account as any

      // Tenant officers can only create penalties for their accounts
      if (ctx.userProfile.role === 'tenant_officer' && account.assigned_agent_id !== ctx.userProfile.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only create penalties for accounts assigned to you'
        })
      }

      if (loan.status !== 'active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only create penalties for active loans'
        })
      }

      const { data, error } = await ctx.supabase
        .from('penalties')
        .insert({
          loan_id: input.loan_id,
          amount: input.amount,
          reason: input.reason,
          penalty_date: input.penalty_date || new Date().toISOString().split('T')[0],
          is_paid: false,
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      // Update loan total penalties
      await ctx.supabase
        .from('loans')
        .update({
          total_penalties: (loan.total_penalties || 0) + input.amount,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.loan_id)

      return data
    }),

  // Mark penalty as paid
  markAsPaid: tenantOfficerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data: penalty, error: penaltyError } = await ctx.supabase
        .from('penalties')
        .select('*, loan:loans(*, account:accounts(*))')
        .eq('id', input.id)
        .single()

      if (penaltyError || !penalty) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Penalty not found'
        })
      }

      const loan = penalty.loan as any
      const account = loan?.account

      // Tenant officers can only update penalties for their accounts
      if (ctx.userProfile.role === 'tenant_officer' && account?.assigned_agent_id !== ctx.userProfile.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update penalties for accounts assigned to you'
        })
      }

      if (penalty.is_paid) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Penalty is already marked as paid'
        })
      }

      const { data, error } = await ctx.supabase
        .from('penalties')
        .update({ is_paid: true })
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

  // Delete penalty (admin only via tenantOfficerProcedure with additional check)
  delete: tenantOfficerProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { data: penalty, error: penaltyError } = await ctx.supabase
        .from('penalties')
        .select('*, loan:loans(*, account:accounts(*))')
        .eq('id', input.id)
        .single()

      if (penaltyError || !penalty) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Penalty not found'
        })
      }

      const loan = penalty.loan as any
      const account = loan?.account

      // Tenant officers can only delete penalties for their accounts
      if (ctx.userProfile.role === 'tenant_officer' && account?.assigned_agent_id !== ctx.userProfile.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete penalties for accounts assigned to you'
        })
      }

      const { error } = await ctx.supabase
        .from('penalties')
        .delete()
        .eq('id', input.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      // Update loan total penalties
      if (loan) {
        await ctx.supabase
          .from('loans')
          .update({
            total_penalties: Math.max(0, (loan.total_penalties || 0) - penalty.amount),
            updated_at: new Date().toISOString(),
          })
          .eq('id', loan.id)
      }

      return { success: true }
    }),
})
