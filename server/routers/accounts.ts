import { z } from 'zod'
import { router, tenantOfficerProcedure, tenantAdminProcedure, authenticatedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const accountStatusEnum = z.enum(['active', 'inactive', 'suspended'])
const governmentIdTypeEnum = z.enum(['drivers_license', 'passport', 'state_id', 'military_id'])
const secondaryIdTypeEnum = z.enum(['birth_certificate', 'social_security_card', 'utility_bill'])

export const accountsRouter = router({
  // Get account by ID
  getById: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('accounts')
        .select('*, loans(*)')
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Account not found'
        })
      }

      // Ensure tenant isolation
      if (ctx.userProfile.role !== 'admin' && data.tenant_id !== ctx.userProfile.tenant_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view accounts in your tenant'
        })
      }

      // Tenant officers can only see their own accounts
      if (ctx.userProfile.role === 'tenant_officer' && data.assigned_agent_id !== ctx.userProfile.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only view accounts assigned to you'
        })
      }

      return data
    }),

  // List accounts
  list: authenticatedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      status: accountStatusEnum.optional(),
      assigned_agent_id: z.string().optional(),
      search: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('accounts')
        .select('*, loans(*)', { count: 'exact' })
        .range(input.offset, input.offset + input.limit - 1)
        .order('created_at', { ascending: false })

      // Ensure tenant isolation - all non-admin users see only their tenant's accounts
      if (ctx.userProfile.role !== 'admin') {
        query = query.eq('tenant_id', ctx.userProfile.tenant_id)
      }

      // Tenant officers can only see their own accounts
      if (ctx.userProfile.role === 'tenant_officer') {
        query = query.eq('assigned_agent_id', ctx.userProfile.id)
      } else if (input.assigned_agent_id) {
        query = query.eq('assigned_agent_id', input.assigned_agent_id)
      }

      if (input.status) {
        query = query.eq('status', input.status)
      }

      if (input.search) {
        query = query.or(`name.ilike.%${input.search}%,contact_info.ilike.%${input.search}%,phone_number.ilike.%${input.search}%`)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return {
        accounts: data || [],
        total: count || 0,
      }
    }),

  // Create account (tenant officers and admins)
  create: tenantOfficerProcedure
    .input(z.object({
      name: z.string().min(1),
      contact_info: z.string(),
      address: z.string(),
      assigned_agent_id: z.string().optional(),
      phone_number: z.string().optional(),
      email: z.string().email().optional(),
      date_of_birth: z.string().optional(),
      ssn_tax_id: z.string().optional(),
      government_id_type: governmentIdTypeEnum.optional(),
      government_id_number: z.string().optional(),
      secondary_id_type: secondaryIdTypeEnum.optional(),
      current_address: z.string().optional(),
      previous_address: z.string().optional(),
      employer_name: z.string().optional(),
      employer_phone: z.string().optional(),
      job_title: z.string().optional(),
      employment_length_months: z.number().optional(),
      annual_income: z.number().optional(),
      monthly_income: z.number().optional(),
      monthly_expenses: z.number().optional(),
      monthly_debt_obligations: z.number().optional(),
      debt_to_income_ratio: z.number().optional(),
      existing_loans_details: z.string().optional(),
      credit_accounts_details: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Tenant officers can only create accounts assigned to themselves
      const assignedAgentId = ctx.userProfile.role === 'tenant_officer'
        ? ctx.userProfile.id
        : (input.assigned_agent_id || ctx.userProfile.id)

      const { data, error } = await ctx.supabase
        .from('accounts')
        .insert({
          ...input,
          tenant_id: ctx.userProfile.tenant_id,
          assigned_agent_id: assignedAgentId,
          created_by: ctx.userProfile.id,
          status: 'active',
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
          type: 'create_account',
          user_id: ctx.userProfile.id,
          account_id: data.id,
          details: { account_name: data.name },
        })

      return data
    }),

  // Update account
  update: tenantOfficerProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      contact_info: z.string().optional(),
      address: z.string().optional(),
      phone_number: z.string().optional(),
      email: z.string().email().optional(),
      date_of_birth: z.string().optional(),
      ssn_tax_id: z.string().optional(),
      government_id_type: governmentIdTypeEnum.optional(),
      government_id_number: z.string().optional(),
      secondary_id_type: secondaryIdTypeEnum.optional(),
      current_address: z.string().optional(),
      previous_address: z.string().optional(),
      employer_name: z.string().optional(),
      employer_phone: z.string().optional(),
      job_title: z.string().optional(),
      employment_length_months: z.number().optional(),
      annual_income: z.number().optional(),
      monthly_income: z.number().optional(),
      monthly_expenses: z.number().optional(),
      monthly_debt_obligations: z.number().optional(),
      debt_to_income_ratio: z.number().optional(),
      existing_loans_details: z.string().optional(),
      credit_accounts_details: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      // Check if account exists and user has access
      const { data: existingAccount } = await ctx.supabase
        .from('accounts')
        .select('assigned_agent_id, tenant_id')
        .eq('id', id)
        .single()

      if (!existingAccount) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Account not found'
        })
      }

      // Ensure tenant isolation
      if (ctx.userProfile.role !== 'admin' && existingAccount.tenant_id !== ctx.userProfile.tenant_id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update accounts in your tenant'
        })
      }

      // Tenant officers can only update their own accounts
      if (ctx.userProfile.role === 'tenant_officer' && existingAccount.assigned_agent_id !== ctx.userProfile.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update accounts assigned to you'
        })
      }

      const { data, error } = await ctx.supabase
        .from('accounts')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
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
          type: 'update_account',
          user_id: ctx.userProfile.id,
          account_id: data.id,
          details: { updates },
        })

      return data
    }),

  // Update account status (admin only)
  updateStatus: tenantAdminProcedure
    .input(z.object({
      id: z.string(),
      status: accountStatusEnum,
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('accounts')
        .update({
          status: input.status,
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

      return data
    }),

  // Reassign account to another agent (admin only)
  reassignAgent: tenantAdminProcedure
    .input(z.object({
      id: z.string(),
      assigned_agent_id: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('accounts')
        .update({
          assigned_agent_id: input.assigned_agent_id,
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

      return data
    }),
})
