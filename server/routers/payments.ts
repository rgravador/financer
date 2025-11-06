import { z } from 'zod'
import { router, tenantOfficerProcedure, authenticatedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const paymentTypeEnum = z.enum(['regular', 'penalty', 'partial'])
const paymentStatusEnum = z.enum(['received', 'pending', 'cancelled'])

export const paymentsRouter = router({
  // Get payment by ID
  getById: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('payments')
        .select('*, loan:loans(*, account:accounts(*))')
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payment not found'
        })
      }

      // Tenant officers can only see payments for their accounts
      if (ctx.userProfile.role === 'tenant_officer') {
        const loan = data.loan as any
        const account = loan?.account
        if (account?.assigned_agent_id !== ctx.userProfile.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only view payments for accounts assigned to you'
          })
        }
      }

      return data
    }),

  // List payments
  list: authenticatedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      loan_id: z.string().optional(),
      status: paymentStatusEnum.optional(),
      type: paymentTypeEnum.optional(),
      start_date: z.string().optional(),
      end_date: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('payments')
        .select('*, loan:loans(*, account:accounts(*))', { count: 'exact' })
        .range(input.offset, input.offset + input.limit - 1)
        .order('payment_date', { ascending: false })

      if (input.loan_id) {
        query = query.eq('loan_id', input.loan_id)
      }

      if (input.status) {
        query = query.eq('status', input.status)
      }

      if (input.type) {
        query = query.eq('type', input.type)
      }

      if (input.start_date) {
        query = query.gte('payment_date', input.start_date)
      }

      if (input.end_date) {
        query = query.lte('payment_date', input.end_date)
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
        filteredData = filteredData.filter((payment: any) =>
          payment.loan?.account?.assigned_agent_id === ctx.userProfile.id
        )
      }

      return {
        payments: filteredData,
        total: filteredData.length,
      }
    }),

  // Record payment (tenant officers can record for their accounts)
  create: tenantOfficerProcedure
    .input(z.object({
      loan_id: z.string(),
      amount: z.number().min(0),
      payment_date: z.string(),
      type: paymentTypeEnum.default('regular'),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Get loan details with account
      const { data: loan, error: loanError } = await ctx.supabase
        .from('loans')
        .select('*, account:accounts(*), penalties(*)')
        .eq('id', input.loan_id)
        .single()

      if (loanError || !loan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Loan not found'
        })
      }

      // Tenant officers can only record payments for their accounts
      const account = loan.account as any
      if (ctx.userProfile.role === 'tenant_officer' && account.assigned_agent_id !== ctx.userProfile.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only record payments for accounts assigned to you'
        })
      }

      if (loan.status !== 'active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Can only record payments for active loans'
        })
      }

      // Calculate payment distribution
      let remainingAmount = input.amount
      let appliedToPenalty = 0
      let appliedToInterest = 0
      let appliedToPrincipal = 0

      // First apply to unpaid penalties
      const penalties = loan.penalties as any[]
      const unpaidPenalties = penalties?.filter((p: any) => !p.is_paid) || []
      const totalUnpaidPenalties = unpaidPenalties.reduce((sum: number, p: any) => sum + p.amount, 0)

      if (totalUnpaidPenalties > 0 && remainingAmount > 0) {
        appliedToPenalty = Math.min(remainingAmount, totalUnpaidPenalties)
        remainingAmount -= appliedToPenalty

        // Mark penalties as paid
        for (const penalty of unpaidPenalties) {
          if (appliedToPenalty <= 0) break
          await ctx.supabase
            .from('penalties')
            .update({ is_paid: true })
            .eq('id', penalty.id)
          appliedToPenalty -= penalty.amount
        }
        appliedToPenalty = Math.min(input.amount, totalUnpaidPenalties)
      }

      // Calculate interest and principal from current balance
      if (remainingAmount > 0) {
        const interestRate = loan.interest_rate / 100
        const monthlyRate = interestRate / 12
        const interestDue = loan.current_balance * monthlyRate

        appliedToInterest = Math.min(remainingAmount, interestDue)
        remainingAmount -= appliedToInterest

        appliedToPrincipal = remainingAmount
      }

      // Create payment record
      const { data: payment, error: paymentError } = await ctx.supabase
        .from('payments')
        .insert({
          loan_id: input.loan_id,
          amount: input.amount,
          payment_date: input.payment_date,
          type: input.type,
          status: 'received',
          applied_to_principal: appliedToPrincipal,
          applied_to_interest: appliedToInterest,
          applied_to_penalty: appliedToPenalty,
          received_by: ctx.userProfile.id,
          notes: input.notes,
        })
        .select()
        .single()

      if (paymentError) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: paymentError.message
        })
      }

      // Update loan balances
      const newBalance = loan.current_balance - appliedToPrincipal
      const newTotalPaid = (loan.total_paid || 0) + input.amount
      const newStatus = newBalance <= 0 ? 'closed' : 'active'

      await ctx.supabase
        .from('loans')
        .update({
          current_balance: Math.max(0, newBalance),
          total_paid: newTotalPaid,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', input.loan_id)

      // Update agent earnings
      const commissionRate = 0.10 // 10% commission
      const earningsAmount = input.amount * commissionRate

      const { data: existingEarnings } = await ctx.supabase
        .from('earnings')
        .select('*')
        .eq('agent_id', account.assigned_agent_id)
        .single()

      if (existingEarnings) {
        await ctx.supabase
          .from('earnings')
          .update({
            total_earnings: existingEarnings.total_earnings + earningsAmount,
            collectible_earnings: existingEarnings.collectible_earnings + earningsAmount,
            updated_at: new Date().toISOString(),
          })
          .eq('agent_id', account.assigned_agent_id)
      } else {
        await ctx.supabase
          .from('earnings')
          .insert({
            agent_id: account.assigned_agent_id,
            total_earnings: earningsAmount,
            collectible_earnings: earningsAmount,
            cashed_out_amount: 0,
            commission_percentage: commissionRate * 100,
          })
      }

      // Create transaction log
      await ctx.supabase
        .from('transactions')
        .insert({
          type: 'receive_payment',
          user_id: ctx.userProfile.id,
          account_id: loan.account_id,
          loan_id: input.loan_id,
          payment_id: payment.id,
          details: {
            amount: input.amount,
            applied_to_principal: appliedToPrincipal,
            applied_to_interest: appliedToInterest,
            applied_to_penalty: appliedToPenalty,
          },
        })

      // Create notification
      await ctx.supabase
        .from('notifications')
        .insert({
          user_id: account.assigned_agent_id,
          loan_id: input.loan_id,
          account_id: loan.account_id,
          message: `Payment of ${input.amount} received for loan`,
          type: 'payment_received',
          is_read: false,
        })

      return payment
    }),

  // Cancel payment (admin only)
  cancel: tenantOfficerProcedure
    .input(z.object({
      id: z.string(),
      reason: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data: payment, error: paymentError } = await ctx.supabase
        .from('payments')
        .select('*, loan:loans(*, account:accounts(*))')
        .eq('id', input.id)
        .single()

      if (paymentError || !payment) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Payment not found'
        })
      }

      if (payment.status !== 'received') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only received payments can be cancelled'
        })
      }

      const loan = payment.loan as any
      const account = loan?.account

      // Tenant officers can only cancel payments for their accounts
      if (ctx.userProfile.role === 'tenant_officer' && account?.assigned_agent_id !== ctx.userProfile.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only cancel payments for accounts assigned to you'
        })
      }

      // Update payment status
      const { data, error } = await ctx.supabase
        .from('payments')
        .update({
          status: 'cancelled',
          notes: `${payment.notes || ''}\nCancelled: ${input.reason}`,
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

      // Reverse loan balances
      await ctx.supabase
        .from('loans')
        .update({
          current_balance: loan.current_balance + payment.applied_to_principal,
          total_paid: loan.total_paid - payment.amount,
          status: 'active',
          updated_at: new Date().toISOString(),
        })
        .eq('id', payment.loan_id)

      // Reverse earnings
      const commissionRate = 0.10
      const earningsAmount = payment.amount * commissionRate

      const { data: existingEarnings } = await ctx.supabase
        .from('earnings')
        .select('*')
        .eq('agent_id', account.assigned_agent_id)
        .single()

      if (existingEarnings) {
        await ctx.supabase
          .from('earnings')
          .update({
            total_earnings: Math.max(0, existingEarnings.total_earnings - earningsAmount),
            collectible_earnings: Math.max(0, existingEarnings.collectible_earnings - earningsAmount),
            updated_at: new Date().toISOString(),
          })
          .eq('agent_id', account.assigned_agent_id)
      }

      return data
    }),
})
