import { z } from 'zod'
import { router, tenantOfficerProcedure, tenantApproverProcedure, authenticatedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const loanStatusEnum = z.enum(['draft', 'pending_approval', 'approved', 'active', 'closed', 'rejected'])
const paymentFrequencyEnum = z.enum(['bi-monthly', 'monthly', 'weekly'])

// Helper function to determine bi-monthly payment dates based on start date
// MEMORY: Bi-monthly payments should follow common payroll schedules
// Common patterns: 15th & 30th, 10th & 25th, 5th & 20th of each month
function getBiMonthlyPaymentDates(startDate: Date) {
  const startDay = startDate.getDate()
  
  // Determine payment pattern based on start date
  if (startDay <= 7) {
    return [5, 20] // 5th and 20th pattern
  } else if (startDay <= 17) {
    return [15, 30] // 15th and 30th pattern (most common)
  } else {
    return [10, 25] // 10th and 25th pattern
  }
}

// Helper function to get next bi-monthly payment date
function getNextBiMonthlyDate(currentDate: Date, paymentDates: number[], isFirst: boolean = false) {
  const [firstDate, secondDate] = paymentDates
  const currentDay = currentDate.getDate()
  
  let targetDate = new Date(currentDate)
  
  if (isFirst) {
    // For the first payment, find the next payment date
    if (currentDay < firstDate) {
      targetDate.setDate(firstDate)
    } else if (currentDay < secondDate) {
      targetDate.setDate(secondDate)
    } else {
      // Move to next month's first date
      targetDate.setMonth(targetDate.getMonth() + 1)
      targetDate.setDate(firstDate)
    }
  } else {
    // For subsequent payments, alternate between the two dates
    if (currentDay <= firstDate) {
      targetDate.setDate(secondDate)
    } else {
      // Move to next month's first date
      targetDate.setMonth(targetDate.getMonth() + 1)
      targetDate.setDate(firstDate)
    }
  }
  
  // Handle month-end edge cases (e.g., setting 30th in February)
  const lastDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate()
  if (targetDate.getDate() > lastDayOfMonth) {
    targetDate.setDate(lastDayOfMonth)
  }
  
  return targetDate
}

// Helper function to generate amortization schedule
// MEMORY: Monthly payments should always occur on the same day of the month as the first payment date
// MEMORY: Bi-monthly payments should follow common payroll schedules (15th & 30th, 10th & 25th, 5th & 20th)
// MEMORY: First payment date is the actual date of the first payment, all subsequent payments are calculated from this
function generateAmortizationSchedule(
  principalAmount: number,
  interestRate: number,
  tenureMonths: number,
  paymentFrequency: 'bi-monthly' | 'monthly' | 'weekly',
  firstPaymentDate: string
) {
  const schedule = []
  const annualRate = interestRate / 100
  let paymentsPerYear: number

  switch (paymentFrequency) {
    case 'weekly':
      paymentsPerYear = 52
      break
    case 'bi-monthly':
      paymentsPerYear = 24
      break
    case 'monthly':
    default:
      paymentsPerYear = 12
      break
  }

  const periodicRate = annualRate / paymentsPerYear
  const totalPayments = Math.ceil((tenureMonths / 12) * paymentsPerYear)

  // Calculate payment using amortization formula
  const payment = principalAmount * (periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
                  (Math.pow(1 + periodicRate, totalPayments) - 1)

  let remainingBalance = principalAmount
  const firstPayment = new Date(firstPaymentDate)
  
  // For bi-monthly, determine the payment pattern based on first payment date
  const biMonthlyDates = paymentFrequency === 'bi-monthly' ? getBiMonthlyPaymentDates(firstPayment) : null
  let currentDate = new Date(firstPayment)

  for (let i = 1; i <= totalPayments; i++) {
    const interestDue = remainingBalance * periodicRate
    const principalDue = payment - interestDue
    remainingBalance = Math.max(0, remainingBalance - principalDue)

    let dueDate: Date

    if (i === 1) {
      // First payment uses the exact date provided
      dueDate = new Date(firstPayment)
    } else {
      // Calculate subsequent payment dates based on frequency
      if (paymentFrequency === 'monthly') {
        // For monthly payments: Add one month to previous payment, keeping same day
        dueDate = new Date(currentDate)
        dueDate.setMonth(dueDate.getMonth() + 1)
        
        // Handle month-end edge cases (e.g., Jan 31 -> Feb 28/29)
        const originalDay = firstPayment.getDate()
        const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate()
        dueDate.setDate(Math.min(originalDay, lastDayOfMonth))
      } else if (paymentFrequency === 'bi-monthly') {
        // For bi-monthly: Follow payroll schedule patterns, alternating between two dates
        dueDate = getNextBiMonthlyDate(currentDate, biMonthlyDates!, false)
      } else {
        // For weekly: Add 7 days to previous payment
        dueDate = new Date(currentDate)
        dueDate.setDate(dueDate.getDate() + 7)
      }
    }

    // Update current date for next iteration
    currentDate = new Date(dueDate)

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
  // Get loan type defaults (for using as template)
  getLoanTypeDefaults: authenticatedProcedure
    .input(z.object({ loan_type_id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('loan_types')
        .select('*')
        .eq('id', input.loan_type_id)
        .eq('is_active', true)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Loan type not found or inactive'
        })
      }

      // Return default values that can be used as template (not enforced)
      return {
        suggested_min_amount: data.min_amount,
        suggested_max_amount: data.max_amount,
        suggested_min_tenure: data.min_tenure_months,
        suggested_max_tenure: data.max_tenure_months,
        suggested_interest_rate: data.interest_rate,
        available_payment_frequencies: data.payment_frequencies,
        loan_type_name: data.name,
        loan_type_description: data.description,
      }
    }),

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
      loan_type_id: z.string().optional(), // Optional - used as template for defaults
      principal_amount: z.number().min(0),
      interest_rate: z.number().min(0).max(100),
      tenure_months: z.number().min(1),
      payment_frequency: paymentFrequencyEnum,
      first_payment_date: z.string().optional(),
      co_borrower_id: z.string().optional(), // Optional co-borrower
      is_draft: z.boolean().optional(), // Whether to save as draft
    }))
    .mutation(async ({ ctx, input }) => {
      // Check if account exists and user has access
      const { data: account } = await ctx.supabase
        .from('accounts')
        .select('assigned_agent_id, status, tenant_id')
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

      // Default first payment date to 30 days from today if not provided
      const firstPaymentDate = input.first_payment_date || (() => {
        const defaultDate = new Date()
        defaultDate.setDate(defaultDate.getDate() + 30)
        return defaultDate.toISOString().split('T')[0]
      })()
      
      // Calculate loan start date (today) and estimated end date
      const loanStartDate = new Date().toISOString().split('T')[0]
      const estimatedEndDate = new Date(firstPaymentDate)
      estimatedEndDate.setMonth(estimatedEndDate.getMonth() + input.tenure_months - 1) // -1 because first payment is included in tenure

      // Generate amortization schedule based on first payment date
      const amortizationSchedule = generateAmortizationSchedule(
        input.principal_amount,
        input.interest_rate,
        input.tenure_months,
        input.payment_frequency,
        firstPaymentDate
      )

      const { data, error } = await ctx.supabase
        .from('loans')
        .insert({
          tenant_id: account.tenant_id,
          account_id: input.account_id,
          loan_type_id: input.loan_type_id || null, // Optional reference to loan type template
          co_borrower_id: input.co_borrower_id || null, // Optional co-borrower
          principal_amount: input.principal_amount,
          interest_rate: input.interest_rate,
          tenure_months: input.tenure_months,
          payment_frequency: input.payment_frequency,
          start_date: loanStartDate,
          end_date: estimatedEndDate.toISOString().split('T')[0],
          first_payment_date: firstPaymentDate,
          amortization_schedule: amortizationSchedule,
          current_balance: input.principal_amount,
          total_paid: 0,
          total_penalties: 0,
          status: input.is_draft ? 'draft' : 'pending_approval',
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
          type: input.is_draft ? 'save_loan_draft' : 'create_loan',
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
