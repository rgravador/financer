import { z } from 'zod'
import { router, tenantOfficerProcedure, tenantApproverProcedure, authenticatedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const loanStatusEnum = z.enum(['pending_approval', 'approved', 'active', 'closed', 'rejected'])
const paymentFrequencyEnum = z.enum(['bi-monthly', 'monthly', 'weekly'])

// Helper function to generate amortization schedule
function generateAmortizationSchedule(
  principalAmount: number,
  interestRate: number,
  tenureMonths: number,
  paymentFrequency: 'bi-monthly' | 'monthly' | 'weekly',
  startDate: string
) {
  const schedule = []
  const annualRate = interestRate / 100
  let paymentsPerYear: number
  let paymentInterval: number // days

  switch (paymentFrequency) {
    case 'weekly':
      paymentsPerYear = 52
      paymentInterval = 7
      break
    case 'bi-monthly':
      paymentsPerYear = 24
      paymentInterval = 15
      break
    case 'monthly':
    default:
      paymentsPerYear = 12
      paymentInterval = 30
      break
  }

  const periodicRate = annualRate / paymentsPerYear
  const totalPayments = Math.ceil((tenureMonths / 12) * paymentsPerYear)

  // Calculate payment using amortization formula
  const payment = principalAmount * (periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
                  (Math.pow(1 + periodicRate, totalPayments) - 1)

  let remainingBalance = principalAmount
  const start = new Date(startDate)

  for (let i = 1; i <= totalPayments; i++) {
    const interestDue = remainingBalance * periodicRate
    const principalDue = payment - interestDue
    remainingBalance = Math.max(0, remainingBalance - principalDue)

    const dueDate = new Date(start)
    dueDate.setDate(dueDate.getDate() + (i * paymentInterval))

    schedule.push({
      payment_number: i,
      due_date: dueDate.toISOString().split('T')[0],
      principal_due: Math.round(principalDue * 100) / 100,
      interest_due: Math.round(interestDue * 100) / 100,
      total_due: Math.round(payment * 100) / 100,
      remaining_balance: Math.round(remainingBalance * 100) / 100,
    })
  }

  return schedule
}

export const loansRouter = router({
  // Get loan by ID
  getById: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('loans')
        .select('*, account:accounts(*), payments(*), penalties(*)')
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Loan not found'
        })
      }

      // Tenant officers can only see loans for their accounts
      if (ctx.userProfile.role === 'tenant_officer') {
        const account = data.account as any
        if (account.assigned_agent_id !== ctx.userProfile.id) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You can only view loans for accounts assigned to you'
          })
        }
      }

      return data
    }),

  // List loans
  list: authenticatedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      status: loanStatusEnum.optional(),
      account_id: z.string().optional(),
      agent_id: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('loans')
        .select('*, account:accounts(*), payments(*)', { count: 'exact' })
        .range(input.offset, input.offset + input.limit - 1)
        .order('created_at', { ascending: false })

      if (input.status) {
        query = query.eq('status', input.status)
      }

      if (input.account_id) {
        query = query.eq('account_id', input.account_id)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      // Filter by agent if tenant officer or if agent_id specified
      let filteredData = data || []
      if (ctx.userProfile.role === 'tenant_officer') {
        filteredData = filteredData.filter((loan: any) =>
          loan.account?.assigned_agent_id === ctx.userProfile.id
        )
      } else if (input.agent_id) {
        filteredData = filteredData.filter((loan: any) =>
          loan.account?.assigned_agent_id === input.agent_id
        )
      }

      return {
        loans: filteredData,
        total: filteredData.length,
      }
    }),

  // Create loan (tenant officers can create for their accounts)
  create: tenantOfficerProcedure
    .input(z.object({
      account_id: z.string(),
      principal_amount: z.number().min(0),
      interest_rate: z.number().min(0).max(100),
      tenure_months: z.number().min(1),
      payment_frequency: paymentFrequencyEnum,
      start_date: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if account exists and user has access
      const { data: account } = await ctx.supabase
        .from('accounts')
        .select('assigned_agent_id, status')
        .eq('id', input.account_id)
        .single()

      if (!account) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Account not found'
        })
      }

      if (account.status !== 'active') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Account must be active to create a loan'
        })
      }

      // Tenant officers can only create loans for their accounts
      if (ctx.userProfile.role === 'tenant_officer' && account.assigned_agent_id !== ctx.userProfile.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only create loans for accounts assigned to you'
        })
      }

      const startDate = input.start_date || new Date().toISOString().split('T')[0]
      const endDate = new Date(startDate)
      endDate.setMonth(endDate.getMonth() + input.tenure_months)

      // Generate amortization schedule
      const amortizationSchedule = generateAmortizationSchedule(
        input.principal_amount,
        input.interest_rate,
        input.tenure_months,
        input.payment_frequency,
        startDate
      )

      const { data, error } = await ctx.supabase
        .from('loans')
        .insert({
          account_id: input.account_id,
          principal_amount: input.principal_amount,
          interest_rate: input.interest_rate,
          tenure_months: input.tenure_months,
          payment_frequency: input.payment_frequency,
          start_date: startDate,
          end_date: endDate.toISOString().split('T')[0],
          amortization_schedule: amortizationSchedule,
          current_balance: input.principal_amount,
          total_paid: 0,
          total_penalties: 0,
          status: 'pending_approval',
          created_by: ctx.userProfile.id,
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
          type: 'create_loan',
          user_id: ctx.userProfile.id,
          account_id: input.account_id,
          loan_id: data.id,
          details: {
            principal_amount: input.principal_amount,
            interest_rate: input.interest_rate,
          },
        })

      return data
    }),

  // Approve loan (tenant approver role)
  approve: tenantApproverProcedure
    .input(z.object({
      id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data: existingLoan } = await ctx.supabase
        .from('loans')
        .select('status')
        .eq('id', input.id)
        .single()

      if (!existingLoan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Loan not found'
        })
      }

      if (existingLoan.status !== 'pending_approval') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only pending loans can be approved'
        })
      }

      const { data, error } = await ctx.supabase
        .from('loans')
        .update({
          status: 'active',
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

      // Create transaction log
      await ctx.supabase
        .from('transactions')
        .insert({
          type: 'approve_loan',
          user_id: ctx.userProfile.id,
          loan_id: data.id,
          account_id: data.account_id,
          details: { approved_at: data.approval_date },
        })

      // Create notification
      await ctx.supabase
        .from('notifications')
        .insert({
          user_id: data.created_by,
          loan_id: data.id,
          account_id: data.account_id,
          message: `Loan for ${data.principal_amount} has been approved`,
          type: 'loan_approval',
          is_read: false,
        })

      return data
    }),

  // Reject loan (tenant approver role)
  reject: tenantApproverProcedure
    .input(z.object({
      id: z.string(),
      rejection_reason: z.string().min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data: existingLoan } = await ctx.supabase
        .from('loans')
        .select('status, created_by, account_id')
        .eq('id', input.id)
        .single()

      if (!existingLoan) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Loan not found'
        })
      }

      if (existingLoan.status !== 'pending_approval') {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Only pending loans can be rejected'
        })
      }

      const { data, error } = await ctx.supabase
        .from('loans')
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
          type: 'reject_loan',
          user_id: ctx.userProfile.id,
          loan_id: data.id,
          account_id: data.account_id,
          details: { rejection_reason: input.rejection_reason },
        })

      // Create notification
      await ctx.supabase
        .from('notifications')
        .insert({
          user_id: existingLoan.created_by,
          loan_id: data.id,
          account_id: data.account_id,
          message: `Loan has been rejected: ${input.rejection_reason}`,
          type: 'loan_rejection',
          is_read: false,
        })

      return data
    }),
})
