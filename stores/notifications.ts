import { defineStore } from 'pinia'
import type { Notification } from '~/types'
import { useAuthStore } from './auth'

interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
}

export const useNotificationsStore = defineStore('notifications', {
  state: (): NotificationsState => ({
    notifications: [],
    unreadCount: 0,
    loading: false,
  }),

  actions: {
    // Helper to get auth headers
    getAuthHeaders() {
      const authStore = useAuthStore()
      return {
        Authorization: `Bearer ${authStore.accessToken}`,
      }
    },

    async fetchNotifications(unreadOnly: boolean = false) {
      this.loading = true
      try {
        const data = await $fetch('/api/notifications', {
          method: 'GET',
          query: { unreadOnly: unreadOnly.toString(), limit: 20 },
          headers: this.getAuthHeaders(),
        })

        this.notifications = data.notifications
        this.unreadCount = data.unreadCount
      } catch (error) {
        console.error('Failed to fetch notifications:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    async markAsRead(notificationId: string) {
      try {
        await $fetch(`/api/notifications/${notificationId}/read`, {
          method: 'PATCH',
          headers: this.getAuthHeaders(),
        })

        // Update local notification
        const index = this.notifications.findIndex((n) => n.id === notificationId)
        if (index !== -1) {
          this.notifications[index].isRead = true
        }

        // Decrement unread count
        if (this.unreadCount > 0) {
          this.unreadCount--
        }
      } catch (error) {
        console.error('Failed to mark notification as read:', error)
        throw error
      }
    },

    async markAllRead() {
      // Mark all current notifications as read (batch operation)
      const unreadNotifications = this.notifications.filter((n) => !n.isRead)

      try {
        await Promise.all(
          unreadNotifications.map((n) => this.markAsRead(n.id))
        )
      } catch (error) {
        console.error('Failed to mark all as read:', error)
        throw error
      }
    },

    // Poll for new notifications
    startPolling(intervalMs: number = 60000) {
      const pollInterval = setInterval(() => {
        this.fetchNotifications()
      }, intervalMs)

      // Return cleanup function
      return () => clearInterval(pollInterval)
    },
  },

  getters: {
    unreadNotifications: (state) =>
      state.notifications.filter((n) => !n.isRead),

    readNotifications: (state) =>
      state.notifications.filter((n) => n.isRead),

    hasUnread: (state) => state.unreadCount > 0,
  },
})
