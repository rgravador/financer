import { z } from 'zod'
import { router, authenticatedProcedure, tenantAdminProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const paymentFrequencyEnum = z.enum(['bi-monthly', 'monthly', 'weekly'])

export const loanTypesRouter = router({
  // List loan types (all tenant officers can view)
  // Note: These serve as templates/defaults for loan creation, not strict validation rules
  list: authenticatedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      active_only: z.boolean().default(true),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('loan_types')
        .select('*', { count: 'exact' })
        .range(input.offset, input.offset + input.limit - 1)
        .order('created_at', { ascending: false })

      // Filter by tenant
      if (ctx.userProfile.role !== 'admin') {
        query = query.eq('tenant_id', ctx.userProfile.tenant_id)
      }

      if (input.active_only) {
        query = query.eq('is_active', true)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return {
        loanTypes: data || [],
        total: count || 0,
      }
    }),

  // Get loan type by ID
  getById: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('loan_types')
        .select('*')
        .eq('id', input.id)

      // Filter by tenant for non-admin users
      if (ctx.userProfile.role !== 'admin') {
        query = query.eq('tenant_id', ctx.userProfile.tenant_id)
      }

      const { data, error } = await query.single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Loan type not found'
        })
      }

      return data
    }),

  // Create loan type (only tenant admin and system admin)
  create: tenantAdminProcedure
    .input(z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      min_amount: z.number().min(0),
      max_amount: z.number().min(0),
      min_tenure_months: z.number().min(1),
      max_tenure_months: z.number().min(1),
      interest_rate: z.number().min(0).max(100),
      payment_frequencies: z.array(paymentFrequencyEnum).min(1),
    }))
    .mutation(async ({ ctx, input }) => {
      // Validate amounts
      if (input.min_amount >= input.max_amount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Minimum amount must be less than maximum amount'
        })
      }

      // Validate tenure
      if (input.min_tenure_months >= input.max_tenure_months) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Minimum tenure must be less than maximum tenure'
        })
      }

      // Check if name already exists in tenant
      const tenantId = ctx.userProfile.role === 'admin' ? null : ctx.userProfile.tenant_id
      
      if (tenantId) {
        const { data: existing } = await ctx.supabase
          .from('loan_types')
          .select('id')
          .eq('tenant_id', tenantId)
          .eq('name', input.name)
          .single()

        if (existing) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A loan type with this name already exists'
          })
        }
      }

      const { data, error } = await ctx.supabase
        .from('loan_types')
        .insert({
          tenant_id: tenantId,
          name: input.name,
          description: input.description || null,
          min_amount: input.min_amount,
          max_amount: input.max_amount,
          min_tenure_months: input.min_tenure_months,
          max_tenure_months: input.max_tenure_months,
          interest_rate: input.interest_rate,
          payment_frequencies: input.payment_frequencies,
          is_active: true,
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
          type: 'create_loan_type',
          user_id: ctx.userProfile.id,
          details: {
            loan_type_id: data.id,
            name: input.name,
            min_amount: input.min_amount,
            max_amount: input.max_amount,
          },
        })

      return data
    }),

  // Update loan type (only tenant admin and system admin)
  update: tenantAdminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().min(1).max(255).optional(),
      description: z.string().optional(),
      min_amount: z.number().min(0).optional(),
      max_amount: z.number().min(0).optional(),
      min_tenure_months: z.number().min(1).optional(),
      max_tenure_months: z.number().min(1).optional(),
      interest_rate: z.number().min(0).max(100).optional(),
      payment_frequencies: z.array(paymentFrequencyEnum).min(1).optional(),
      is_active: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input

      // Get existing loan type to validate ownership
      let query = ctx.supabase
        .from('loan_types')
        .select('*')
        .eq('id', id)

      // Filter by tenant for non-admin users
      if (ctx.userProfile.role !== 'admin') {
        query = query.eq('tenant_id', ctx.userProfile.tenant_id)
      }

      const { data: existing, error: fetchError } = await query.single()

      if (fetchError || !existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Loan type not found'
        })
      }

      // Validate amounts if both are provided
      const newMinAmount = updateData.min_amount ?? existing.min_amount
      const newMaxAmount = updateData.max_amount ?? existing.max_amount
      
      if (newMinAmount >= newMaxAmount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Minimum amount must be less than maximum amount'
        })
      }

      // Validate tenure if both are provided
      const newMinTenure = updateData.min_tenure_months ?? existing.min_tenure_months
      const newMaxTenure = updateData.max_tenure_months ?? existing.max_tenure_months
      
      if (newMinTenure >= newMaxTenure) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Minimum tenure must be less than maximum tenure'
        })
      }

      // Check if name already exists (if name is being updated)
      if (updateData.name && updateData.name !== existing.name) {
        const { data: nameExists } = await ctx.supabase
          .from('loan_types')
          .select('id')
          .eq('tenant_id', existing.tenant_id)
          .eq('name', updateData.name)
          .neq('id', id)
          .single()

        if (nameExists) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'A loan type with this name already exists'
          })
        }
      }

      const { data, error } = await ctx.supabase
        .from('loan_types')
        .update({
          ...updateData,
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
          type: 'update_loan_type',
          user_id: ctx.userProfile.id,
          details: {
            loan_type_id: data.id,
            changes: updateData,
          },
        })

      return data
    }),

  // Delete/deactivate loan type (only tenant admin and system admin)
  delete: tenantAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Get existing loan type to validate ownership
      let query = ctx.supabase
        .from('loan_types')
        .select('*')
        .eq('id', input.id)

      // Filter by tenant for non-admin users
      if (ctx.userProfile.role !== 'admin') {
        query = query.eq('tenant_id', ctx.userProfile.tenant_id)
      }

      const { data: existing, error: fetchError } = await query.single()

      if (fetchError || !existing) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Loan type not found'
        })
      }

      // Check if loan type is being used by any loans
      const { data: loansUsingType } = await ctx.supabase
        .from('loans')
        .select('id')
        .eq('loan_type_id', input.id)
        .limit(1)

      if (loansUsingType && loansUsingType.length > 0) {
        // If loan type is in use, just deactivate it
        const { data, error } = await ctx.supabase
          .from('loan_types')
          .update({
            is_active: false,
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
            type: 'delete_loan_type',
            user_id: ctx.userProfile.id,
            details: {
              loan_type_id: data.id,
              action: 'deactivated',
              reason: 'loan_type_in_use',
            },
          })

        return { ...data, deleted: false, deactivated: true }
      } else {
        // If no loans are using this type, we can actually delete it
        const { error } = await ctx.supabase
          .from('loan_types')
          .delete()
          .eq('id', input.id)

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
            type: 'delete_loan_type',
            user_id: ctx.userProfile.id,
            details: {
              loan_type_id: input.id,
              action: 'deleted',
              name: existing.name,
            },
          })

        return { ...existing, deleted: true, deactivated: false }
      }
    }),
})