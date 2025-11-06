import { z } from 'zod'
import { router, adminProcedure } from '../trpc'
import { createAdminClient } from '@/lib/supabase/admin'
import type { Tenant } from '../db/database'

export const tenantsRouter = router({
  // Get all tenants (admin only)
  getAll: adminProcedure.query(async ({ ctx }) => {
    const { data, error } = await ctx.supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data as Tenant[]
  }),

  // Get single tenant by ID
  getById: adminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('tenants')
        .select('*')
        .eq('id', input.id)
        .single()

      if (error) throw error
      return data as Tenant
    }),

  // Create new tenant
  create: adminProcedure
    .input(
      z.object({
        name: z.string().min(1),
        company_name: z.string().min(1),
        contact_email: z.string().email().optional().nullable(),
        contact_phone: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('tenants')
        .insert({
          ...input,
          created_by: ctx.user.id,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error
      return data as Tenant
    }),

  // Update tenant
  update: adminProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        company_name: z.string().min(1).optional(),
        contact_email: z.string().email().optional().nullable(),
        contact_phone: z.string().optional().nullable(),
        address: z.string().optional().nullable(),
        is_active: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updates } = input

      const { data, error } = await ctx.supabase
        .from('tenants')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Tenant
    }),

  // Delete tenant (soft delete by setting is_active to false)
  delete: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { error } = await ctx.supabase
        .from('tenants')
        .update({ is_active: false })
        .eq('id', input.id)

      if (error) throw error
      return { success: true }
    }),

  // Get users for a specific tenant
  getUsers: adminProcedure
    .input(z.object({ tenantId: z.string() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('users_profile')
        .select('*')
        .eq('tenant_id', input.tenantId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    }),

  // Create tenant user (admin, tenant_admin, tenant_officer, tenant_legal)
  createUser: adminProcedure
    .input(
      z.object({
        email: z.string().email(),
        password: z.string().min(8),
        full_name: z.string().min(1),
        role: z.enum(['tenant_admin', 'tenant_officer', 'tenant_legal', 'tenant_approver']),
        tenant_id: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Use admin client to create user (requires service role key)
      const adminClient = createAdminClient()

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email: input.email,
        password: input.password,
        email_confirm: true,
        user_metadata: {
          full_name: input.full_name,
          role: input.role,
          tenant_id: input.tenant_id,
        },
      })

      if (authError) throw authError

      // Update the user profile with tenant_id (the trigger creates it without tenant_id)
      const { data: profileData, error: profileError } = await adminClient
        .from('users_profile')
        .update({
          tenant_id: input.tenant_id,
          role: input.role,
        })
        .eq('id', authData.user.id)
        .select()
        .single()

      if (profileError) throw profileError

      return profileData
    }),
})
