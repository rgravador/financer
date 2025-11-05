import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'
import type { Account } from '@/types/database'

export const accountsRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    let query = ctx.supabase.from('accounts').select('*')

    // If user is agent, only show their assigned accounts
    if (ctx.userProfile.role === 'agent') {
      query = query.eq('assigned_agent_id', ctx.userProfile.id)
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message,
      })
    }

    return data as Account[]
  }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('accounts')
        .select(`
          *,
          assigned_agent:assigned_agent_id(id, full_name, email),
          loans(*)
        `)
        .eq('id', input.id)
        .single()

      if (error) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Account not found',
        })
      }

      return data
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        contact_info: z.string().nullable(),
        address: z.string().nullable(),
        id_proof_url: z.string().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('accounts')
        .insert({
          ...input,
          assigned_agent_id: ctx.userProfile.id,
          created_by: ctx.userProfile.id,
          status: 'active',
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  createMultiStep: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        date_of_birth: z.string().nullable().optional(),
        ssn_tax_id: z.string().nullable().optional(),
        government_id_type: z.string().nullable().optional(),
        government_id_number: z.string().nullable().optional(),
        secondary_id_type: z.string().nullable().optional(),
        id_proof_url: z.string().nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('accounts')
        .insert({
          name: input.name,
          date_of_birth: input.date_of_birth || null,
          ssn_tax_id: input.ssn_tax_id || null,
          government_id_type: input.government_id_type || null,
          government_id_number: input.government_id_number || null,
          secondary_id_type: input.secondary_id_type || null,
          id_proof_url: input.id_proof_url || null,
          contact_info: null,
          address: null,
          assigned_agent_id: ctx.userProfile.id,
          created_by: ctx.userProfile.id,
          status: 'active',
        })
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        updates: z.record(z.any()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { data, error } = await ctx.supabase
        .from('accounts')
        .update(input.updates)
        .eq('id', input.id)
        .select()
        .single()

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message,
        })
      }

      return data
    }),

  uploadDocument: protectedProcedure
    .input(
      z.object({
        accountId: z.string().uuid(),
        fileName: z.string(),
        fileType: z.string(),
        documentType: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // This would be handled client-side with Supabase storage
      // Return success to allow client to proceed with upload
      return {
        success: true,
        path: `account-documents/${input.accountId}-${input.documentType}-${Date.now()}.${input.fileType}`,
      }
    }),
})
