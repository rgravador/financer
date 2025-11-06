import { z } from 'zod'
import { router, authenticatedProcedure, tenantAdminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

export const dashboardRouter = router({
  // Get general dashboard stats (alias for getAdminStats)
  getStats: tenantAdminProcedure.query(async ({ ctx }) => {
    // Same logic as getAdminStats
    const { count: totalUsers } = await ctx.supabase
      .from('users_profile')
      .select('*', { count: 'exact', head: true })

    const { count: activeAgents } = await ctx.supabase
      .from('users_profile')
      .select('*', { count: 'exact', head: true })
      .in('role', ['tenant_officer'])
      .eq('is_active', true)

    const { count: totalAccounts } = await ctx.supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })

    const { count: totalLoans } = await ctx.supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })

    const { count: activeLoans } = await ctx.supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: pendingLoans } = await ctx.supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval')

    return {
      total_loans: totalLoans || 0,
      total_outstanding: 0,
      total_agents: activeAgents || 0,
      pending_approvals: pendingLoans || 0,
      pending_cashouts: 0,
      totalUsers: totalUsers || 0,
      activeAgents: activeAgents || 0,
      totalAccounts: totalAccounts || 0,
      totalLoans: totalLoans || 0,
      activeLoans: activeLoans || 0,
    }
  }),

  // Get agent/tenant officer dashboard stats
  getAgentStats: authenticatedProcedure.query(async ({ ctx }) => {
    const agentId = ctx.userProfile.id

    // Get total accounts
    const { count: totalAccounts } = await ctx.supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })
      .eq('assigned_agent_id', agentId)
      .eq('status', 'active')

    // Get active loans
    const { data: loans } = await ctx.supabase
      .from('loans')
      .select('*, account:accounts!inner(*)')
      .eq('account.assigned_agent_id', agentId)
      .eq('status', 'active')

    const activeLoans = loans?.length || 0

    // Get earnings
    const { data: earnings } = await ctx.supabase
      .from('earnings')
      .select('collectible_earnings')
      .eq('agent_id', agentId)
      .single()

    const collectibleEarnings = earnings?.collectible_earnings || 0

    // Get upcoming payments (next 7 days)
    const today = new Date()
    const nextWeek = new Date(today)
    nextWeek.setDate(today.getDate() + 7)

    let upcomingPayments = 0
    if (loans) {
      for (const loan of loans) {
        const schedule = loan.amortization_schedule as any[]
        if (schedule) {
          const upcoming = schedule.filter((item: any) => {
            const dueDate = new Date(item.due_date)
            return dueDate >= today && dueDate <= nextWeek
          })
          upcomingPayments += upcoming.length
        }
      }
    }

    return {
      total_accounts: totalAccounts || 0,
      active_loans: activeLoans,
      collectible_earnings: collectibleEarnings,
      upcoming_payments: upcomingPayments,
    }
  }),

  // Get admin dashboard stats
  getAdminStats: tenantAdminProcedure.query(async ({ ctx }) => {
    // Total users
    const { count: totalUsers } = await ctx.supabase
      .from('users_profile')
      .select('*', { count: 'exact', head: true })

    // Active agents (tenant officers)
    const { count: activeAgents } = await ctx.supabase
      .from('users_profile')
      .select('*', { count: 'exact', head: true })
      .in('role', ['tenant_officer'])
      .eq('is_active', true)

    // Total accounts
    const { count: totalAccounts } = await ctx.supabase
      .from('accounts')
      .select('*', { count: 'exact', head: true })

    // Total and active loans
    const { count: totalLoans } = await ctx.supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })

    const { count: activeLoans } = await ctx.supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')

    const { count: pendingLoans } = await ctx.supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval')

    const { count: overdueLoans } = await ctx.supabase
      .from('loans')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .lt('end_date', new Date().toISOString().split('T')[0])

    // Financial stats
    const { data: allLoans } = await ctx.supabase
      .from('loans')
      .select('principal_amount, current_balance, total_paid, total_penalties, status')

    let totalDisbursed = 0
    let totalCollected = 0
    let outstandingBalance = 0
    let totalPenalties = 0

    if (allLoans) {
      for (const loan of allLoans) {
        if (loan.status !== 'rejected') {
          totalDisbursed += loan.principal_amount || 0
          totalCollected += loan.total_paid || 0
          if (loan.status === 'active') {
            outstandingBalance += loan.current_balance || 0
          }
          totalPenalties += loan.total_penalties || 0
        }
      }
    }

    // Total commissions
    const { data: allEarnings } = await ctx.supabase
      .from('earnings')
      .select('total_earnings')

    let totalCommissions = 0
    if (allEarnings) {
      totalCommissions = allEarnings.reduce((sum, e) => sum + (e.total_earnings || 0), 0)
    }

    // Pending cashouts
    const { count: pendingCashouts } = await ctx.supabase
      .from('cashout_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending')

    return {
      total_loans: totalLoans || 0,
      total_outstanding: outstandingBalance,
      total_agents: activeAgents || 0,
      pending_approvals: pendingLoans || 0,
      pending_cashouts: pendingCashouts || 0,
      // Additional properties
      totalUsers: totalUsers || 0,
      activeAgents: activeAgents || 0,
      totalAccounts: totalAccounts || 0,
      totalLoans: totalLoans || 0,
      activeLoans: activeLoans || 0,
      totalDisbursed: totalDisbursed,
      totalCollected: totalCollected,
      outstandingBalance: outstandingBalance,
      totalPenalties: totalPenalties,
      totalCommissions: totalCommissions,
      pendingLoans: pendingLoans || 0,
      overdueLoans: overdueLoans || 0,
    }
  }),

  // Get agent performance list (admin only)
  getAgentPerformance: tenantAdminProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ ctx, input }) => {
      // Get all agents
      const { data: agents } = await ctx.supabase
        .from('users_profile')
        .select('id, full_name, email')
        .in('role', ['tenant_officer'])
        .eq('is_active', true)
        .range(input.offset, input.offset + input.limit - 1)

      if (!agents) {
        return {
          agents: [],
          total: 0,
        }
      }

      const agentPerformance = []

      for (const agent of agents) {
        // Get accounts
        const { count: totalAccounts } = await ctx.supabase
          .from('accounts')
          .select('*', { count: 'exact', head: true })
          .eq('assigned_agent_id', agent.id)

        // Get loans
        const { data: loans } = await ctx.supabase
          .from('loans')
          .select('*, account:accounts!inner(*)')
          .eq('account.assigned_agent_id', agent.id)

        const totalLoans = loans?.length || 0
        const activeLoans = loans?.filter(l => l.status === 'active').length || 0

        // Get collections
        const totalCollected = loans?.reduce((sum, l) => sum + (l.total_paid || 0), 0) || 0

        // Get earnings
        const { data: earnings } = await ctx.supabase
          .from('earnings')
          .select('total_earnings')
          .eq('agent_id', agent.id)
          .single()

        const totalCommissions = earnings?.total_earnings || 0

        // Calculate performance (collection rate)
        const totalDisbursed = loans?.reduce((sum, l) => sum + (l.principal_amount || 0), 0) || 0
        const performance = totalDisbursed > 0 ? (totalCollected / totalDisbursed) * 100 : 0

        agentPerformance.push({
          agent_id: agent.id,
          agent_name: agent.full_name,
          total_accounts: totalAccounts || 0,
          total_loans: totalLoans,
          total_collections: totalCollected,
          total_earnings: totalCommissions,
          // Additional properties
          id: agent.id,
          full_name: agent.full_name,
          email: agent.email,
          activeLoans: activeLoans,
          totalCollected: totalCollected,
          totalCommissions: totalCommissions,
          performance: Math.round(performance * 100) / 100,
        })
      }

      return {
        agents: agentPerformance,
        total: agentPerformance.length,
      }
    }),

  // Get recent activities (for activity feed)
  getRecentActivities: authenticatedProcedure
    .input(z.object({
      limit: z.number().min(1).max(50).default(20),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('transactions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(input.limit)

      // Tenant officers only see their own activities
      if (ctx.userProfile.role === 'tenant_officer') {
        query = query.eq('user_id', ctx.userProfile.id)
      }

      const { data, error } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return data || []
    }),
})
