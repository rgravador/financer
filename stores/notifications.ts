import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useUIStore } from './ui'
import type { Notification } from '~/types'

export const useNotificationsStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Notification[],
    unreadCount: 0,
    loading: false
  }),

  getters: {
    unreadNotifications: state => state.notifications.filter(n => !n.is_read),
    recentNotifications: state => state.notifications.slice(0, 5)
  },

  actions: {
    notificationsByType (type: string) {
      return this.notifications.filter(n => n.type === type)
    },

    async fetchNotifications () {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return }

      this.loading = true
      try {
        const supabase = useSupabaseClient()
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('timestamp', { ascending: false })

        if (error) { throw error }

        this.notifications = data || []
        this.unreadCount = this.notifications.filter(n => !n.is_read).length
      } catch (error: any) {
        console.error('Error fetching notifications:', error)
      } finally {
        this.loading = false
      }
    },

    async markAsRead (notificationId: string) {
      try {
        const supabase = useSupabaseClient()
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true } as any)
          .eq('id', notificationId)

        if (error) { throw error }

        // Update local state
        const notification = this.notifications.find(n => n.id === notificationId)
        if (notification && !notification.is_read) {
          notification.is_read = true
          this.unreadCount--
        }
      } catch (error: any) {
        console.error('Error marking notification as read:', error)
      }
    },

    async markAllAsRead () {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return }

      try {
        const supabase = useSupabaseClient()
        const { error } = await supabase
          .from('notifications')
          .update({ is_read: true } as any)
          .eq('user_id', user.id)
          .eq('is_read', false)

        if (error) { throw error }

        // Update local state
        this.notifications.forEach((n) => {
          n.is_read = true
        })
        this.unreadCount = 0
      } catch (error: any) {
        console.error('Error marking all notifications as read:', error)
      }
    },

    subscribeToRealtime () {
      const authStore = useAuthStore()
      const user = authStore.user

      if (!user) { return }

      const uiStore = useUIStore()
      const supabase = useSupabaseClient()

      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          (payload) => {
            this.notifications.unshift(payload.new as Notification)
            this.unreadCount++

            // Show snackbar notification
            uiStore.showInfo(payload.new.message)
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }
})
