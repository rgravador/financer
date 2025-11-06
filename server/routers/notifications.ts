import { z } from 'zod'
import { router, authenticatedProcedure } from '../trpc'
import { TRPCError } from '@trpc/server'

const notificationTypeEnum = z.enum([
  'past_due',
  'upcoming_due',
  'loan_approval',
  'loan_rejection',
  'cashout_approved',
  'cashout_rejected',
  'payment_received'
])

export const notificationsRouter = router({
  // Get my notifications
  getMy: authenticatedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(50),
      offset: z.number().min(0).default(0),
      is_read: z.boolean().optional(),
      type: notificationTypeEnum.optional(),
    }))
    .query(async ({ ctx, input }) => {
      let query = ctx.supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', ctx.userProfile.id)
        .range(input.offset, input.offset + input.limit - 1)
        .order('timestamp', { ascending: false })

      if (input.is_read !== undefined) {
        query = query.eq('is_read', input.is_read)
      }

      if (input.type) {
        query = query.eq('type', input.type)
      }

      const { data, error, count } = await query

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return {
        notifications: data || [],
        total: count || 0,
      }
    }),

  // Get unread count
  getUnreadCount: authenticatedProcedure.query(async ({ ctx }) => {
    const { count, error } = await ctx.supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', ctx.userProfile.id)
      .eq('is_read', false)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }

    return { count: count || 0 }
  }),

  // Mark notification as read
  markAsRead: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify notification belongs to user
      const { data: notification } = await ctx.supabase
        .from('notifications')
        .select('user_id')
        .eq('id', input.id)
        .single()

      if (!notification || notification.user_id !== ctx.userProfile.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only mark your own notifications as read'
        })
      }

      const { data, error } = await ctx.supabase
        .from('notifications')
        .update({ is_read: true })
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

  // Mark all notifications as read
  markAllAsRead: authenticatedProcedure.mutation(async ({ ctx }) => {
    const { error } = await ctx.supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', ctx.userProfile.id)
      .eq('is_read', false)

    if (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: error.message
      })
    }

    return { success: true }
  }),

  // Delete notification
  delete: authenticatedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify notification belongs to user
      const { data: notification } = await ctx.supabase
        .from('notifications')
        .select('user_id')
        .eq('id', input.id)
        .single()

      if (!notification || notification.user_id !== ctx.userProfile.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own notifications'
        })
      }

      const { error } = await ctx.supabase
        .from('notifications')
        .delete()
        .eq('id', input.id)

      if (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: error.message
        })
      }

      return { success: true }
    }),
})
