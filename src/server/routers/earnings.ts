import { z } from 'zod'
import { router, authenticatedProcedure, tenantAdminProcedure, tenantApproverProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const cashoutStatusEnum = z.enum(['pending', 'approved', 'rejected'])

export const earningsRouter = router({
  // Get earnings for current user (tenant officers can see their own)
  getMy: authenticatedProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('earnings')
      .select('*')
      .eq('agent_id', ctx.userProfile.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }

    // Return default earnings if not found
    if (!data) {
      return {
        id: '',
        agent_id: ctx.userProfile.id,
        total_earnings: 0,
        collectible_earnings: 0,
        cashed_out_amount: 0,
        commission_percentage: 10,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    }

    return data
  }),

  // Get earnings by agent ID (admin only)
  getByAgentId: tenantAdminProcedure
    .input(z.object({ agent_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('earnings')
        .select('*')
        .eq('agent_id', input.agent_id)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return data
    }),

  // List all earnings (admin only)
  list: tenantAdminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      const { data, error, count } = await ctx.supabase
        .from('earnings')
        .select('*', { count: 'exact' })
        .range(input.offset, input.offset + input.limit - 1)
        .order('total_earnings', { ascending: false })

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return {
        earnings: data || [],
        total: count || 0,
      }
    }),

  // Update commission percentage (admin only)
  updateCommission: tenantAdminProcedure
    .input(z.object({
      agent_id: z.string(),
      commission_percentage: z.number().min(0).max(100),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('earnings')
        .update({
          commission_percentage: input.commission_percentage,
          updated_at: new Date().toISOString(),
        })
        .eq('agent_id', input.agent_id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      // Create transaction log
      await ctx.supabase
        .from('transactions')
        .insert({
          type: 'commission_update',
          user_id: ctx.userProfile.id,
          details: {
            agent_id: input.agent_id,
            new_commission_percentage: input.commission_percentage,
          },
        })

      return data
    }),
})

export const cashoutRouter = router({
  // Get cashout request by ID
  getById: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('cashout_requests')
        .select('*')
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Cashout request not found'
        })
      }

      // Tenant officers can only see their own cashout requests
      if (ctx.userProfile.role === 'tenant_officer' && data.agent_id !== ctx.userProfile.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view your own cashout requests'
        })
      }

      return data
    }),

  // List cashout requests
  list: authenticatedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      status: cashoutStatusEnum.optional(),
      agent_id: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('cashout_requests')
        .select('*', { count: 'exact' })
        .range(input.offset, input.offset + input.limit - 1)
        .order('request_date', { ascending: false })

      // Tenant officers can only see their own cashout requests
      if (ctx.userProfile.role === 'tenant_officer') {
        query = query.eq('agent_id', ctx.userProfile.id)
      } else if (input.agent_id) {
        query = query.eq('agent_id', input.agent_id)
      }

      if (input.status) {
        query = query.eq('status', input.status)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return {
        cashouts: data || [],
        total: count || 0,
      }
    }),

  // Get my cashout requests
  getMy: authenticatedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      status: cashoutStatusEnum.optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('cashout_requests')
        .select('*', { count: 'exact' })
        .eq('agent_id', ctx.userProfile.id)
        .range(input.offset, input.offset + input.limit - 1)
        .order('request_date', { ascending: false })

      if (input.status) {
        query = query.eq('status', input.status)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return {
        cashouts: data || [],
        total: count || 0,
      }
    }),

  // Create cashout request (tenant officers can request their earnings)
  create: authenticatedProcedure
    .input(z.object({
      amount: z.number().min(0),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check earnings
      const { data: earnings } = await ctx.supabase
        .from('earnings')
        .select('collectible_earnings')
        .eq('agent_id', ctx.userProfile.id)
        .single()

      if (!earnings) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No earnings found'
        })
      }

      if (input.amount > earnings.collectible_earnings) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Insufficient collectible earnings'
        })
      }

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
          message: error.message
        })
      }

      // Create transaction log
      await ctx.supabase
        .from('transactions')
        .insert({
          type: 'cashout_request',
          user_id: ctx.userProfile.id,
          details: { amount: input.amount },
        })

      return data
    }),

  // Approve cashout request (approver role)
  approve: tenantApproverProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data: cashout, error: cashoutError } = await ctx.supabase
        .from('cashout_requests')
        .select('*')
        .eq('id', input.id)
        .single()

      if (cashoutError || !cashout) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Cashout request not found'
        })
      }

      if (cashout.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only pending cashout requests can be approved'
        })
      }

      // Update cashout status
      const { data, error } = await ctx.supabase
        .from('cashout_requests')
        .update({
          status: 'approved',
          approval_date: new Date().toISOString(),
          approved_by: ctx.userProfile.id,
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

      // Update earnings
      const { data: earnings } = await ctx.supabase
        .from('earnings')
        .select('*')
        .eq('agent_id', cashout.agent_id)
        .single()

      if (earnings) {
        await ctx.supabase
          .from('earnings')
          .update({
            collectible_earnings: earnings.collectible_earnings - cashout.amount,
            cashed_out_amount: earnings.cashed_out_amount + cashout.amount,
            updated_at: new Date().toISOString(),
          })
          .eq('agent_id', cashout.agent_id)
      }

      // Create transaction log
      await ctx.supabase
        .from('transactions')
        .insert({
          type: 'cashout_approved',
          user_id: ctx.userProfile.id,
          details: {
            cashout_id: input.id,
            agent_id: cashout.agent_id,
            amount: cashout.amount,
          },
        })

      // Create notification
      await ctx.supabase
        .from('notifications')
        .insert({
          user_id: cashout.agent_id,
          message: `Your cashout request of ${cashout.amount} has been approved`,
          type: 'cashout_approved',
          is_read: false,
        })

      return data
    }),

  // Reject cashout request (approver role)
  reject: tenantApproverProcedure
    .input(z.object({
      id: z.string(),
      rejection_reason: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data: cashout, error: cashoutError } = await ctx.supabase
        .from('cashout_requests')
        .select('*')
        .eq('id', input.id)
        .single()

      if (cashoutError || !cashout) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Cashout request not found'
        })
      }

      if (cashout.status !== 'pending') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only pending cashout requests can be rejected'
        })
      }

      const { data, error } = await ctx.supabase
        .from('cashout_requests')
        .update({
          status: 'rejected',
          rejection_reason: input.rejection_reason,
          approved_by: ctx.userProfile.id,
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

      // Create transaction log
      await ctx.supabase
        .from('transactions')
        .insert({
          type: 'cashout_rejected',
          user_id: ctx.userProfile.id,
          details: {
            cashout_id: input.id,
            agent_id: cashout.agent_id,
            amount: cashout.amount,
            rejection_reason: input.rejection_reason,
          },
        })

      // Create notification
      await ctx.supabase
        .from('notifications')
        .insert({
          user_id: cashout.agent_id,
          message: `Your cashout request has been rejected: ${input.rejection_reason}`,
          type: 'cashout_rejected',
          is_read: false,
        })

      return data
    }),
})
