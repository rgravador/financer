<template>
  <v-menu
    v-model="menuOpen"
    :close-on-content-click="false"
    offset-y
    location="bottom end"
    max-width="380"
    min-width="340"
  >
    <template v-slot:activator="{ props }">
      <button v-bind="props" class="topbar-btn notification-btn">
        <v-icon size="20">mdi-bell-outline</v-icon>
        <span v-if="notificationsStore.unreadCount > 0" class="notification-badge">
          {{ notificationsStore.unreadCount > 99 ? '99+' : notificationsStore.unreadCount }}
        </span>
      </button>
    </template>

    <div class="notification-dropdown">
      <!-- Header -->
      <div class="dropdown-header">
        <h3 class="dropdown-title">Notifications</h3>
        <button
          v-if="notificationsStore.hasUnread"
          class="mark-all-btn"
          @click="handleMarkAllRead"
        >
          Mark all read
        </button>
      </div>

      <!-- Notifications List -->
      <div class="notification-list" v-if="!notificationsStore.loading">
        <template v-if="notificationsStore.notifications.length > 0">
          <button
            v-for="notification in notificationsStore.notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'notification-item--unread': !notification.isRead }"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon" :class="getIconClass(notification.type)">
              <v-icon size="18">{{ getIcon(notification.type) }}</v-icon>
            </div>
            <div class="notification-content">
              <p class="notification-title">{{ notification.title }}</p>
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            </div>
            <div v-if="!notification.isRead" class="unread-dot"></div>
          </button>
        </template>

        <!-- Empty State -->
        <div v-else class="empty-state">
          <v-icon size="48" color="grey-lighten-1">mdi-bell-off-outline</v-icon>
          <p>No notifications yet</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="loading-state">
        <v-progress-circular indeterminate size="24" color="primary" />
        <span>Loading...</span>
      </div>

      <!-- Footer -->
      <div class="dropdown-footer" v-if="notificationsStore.notifications.length > 0">
        <button class="view-all-btn" @click="handleViewAll">
          View all notifications
        </button>
      </div>
    </div>
  </v-menu>
</template>

<script setup lang="ts">
import { useNotificationsStore } from '~/stores/notifications'
import { useAuthStore } from '~/stores/auth'
import type { Notification } from '~/types'

const notificationsStore = useNotificationsStore()
const authStore = useAuthStore()
const router = useRouter()

const menuOpen = ref(false)
let stopPolling: (() => void) | null = null

// Fetch notifications and start polling on mount
onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      await notificationsStore.fetchNotifications()
      // Start polling every 60 seconds
      stopPolling = notificationsStore.startPolling(60000)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    }
  }
})

// Stop polling on unmount
onUnmounted(() => {
  if (stopPolling) {
    stopPolling()
  }
})

// Refetch when menu opens
watch(menuOpen, async (isOpen) => {
  if (isOpen && authStore.isAuthenticated) {
    try {
      await notificationsStore.fetchNotifications()
    } catch (error) {
      console.error('Failed to refresh notifications:', error)
    }
  }
})

// Methods
const handleNotificationClick = async (notification: Notification) => {
  try {
    // Mark as read if unread
    if (!notification.isRead) {
      await notificationsStore.markAsRead(notification.id)
    }

    // Close menu
    menuOpen.value = false

    // Navigate based on notification type and data
    if (notification.data?.applicationId) {
      const userRole = authStore.user?.role
      if (userRole === 'tenant_approver' || userRole === 'tenant_admin') {
        router.push(`/approver/queue/${notification.data.applicationId}`)
      } else if (userRole === 'tenant_officer') {
        router.push(`/officer/applications/${notification.data.applicationId}`)
      }
    }
  } catch (error) {
    console.error('Failed to handle notification click:', error)
  }
}

const handleMarkAllRead = async () => {
  try {
    await notificationsStore.markAllRead()
  } catch (error) {
    console.error('Failed to mark all as read:', error)
  }
}

const handleViewAll = () => {
  menuOpen.value = false
  // Navigate to notifications page if it exists
  router.push('/notifications')
}

const getIcon = (type: string): string => {
  const icons: Record<string, string> = {
    new_application: 'mdi-file-document-plus-outline',
    status_change: 'mdi-swap-horizontal',
    approval: 'mdi-check-circle-outline',
    rejection: 'mdi-close-circle-outline',
    document_request: 'mdi-file-alert-outline',
    document_uploaded: 'mdi-file-check-outline',
    comment: 'mdi-message-outline',
    reminder: 'mdi-bell-ring-outline',
    system: 'mdi-information-outline',
  }
  return icons[type] || 'mdi-bell-outline'
}

const getIconClass = (type: string): string => {
  const classes: Record<string, string> = {
    new_application: 'icon-primary',
    status_change: 'icon-info',
    approval: 'icon-success',
    rejection: 'icon-error',
    document_request: 'icon-warning',
    document_uploaded: 'icon-success',
    comment: 'icon-info',
    reminder: 'icon-warning',
    system: 'icon-info',
  }
  return classes[type] || 'icon-default'
}

const formatTime = (date: Date | string): string => {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`

  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}
</script>

<style scoped>
.topbar-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.topbar-btn:hover {
  background: rgba(var(--v-theme-on-surface), 0.05);
  color: rgb(var(--v-theme-on-surface));
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  background: rgb(var(--v-theme-error));
  color: white;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 10px;
  font-weight: 600;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 5px;
}

/* Dropdown */
.notification-dropdown {
  background: rgb(var(--v-theme-surface));
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.dropdown-title {
  font-family: 'Sora', sans-serif;
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.mark-all-btn {
  background: transparent;
  border: none;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.mark-all-btn:hover {
  background: rgba(var(--v-theme-primary), 0.1);
}

/* Notification List */
.notification-list {
  max-height: 400px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  background: transparent;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  transition: background 0.2s ease;
  position: relative;
}

.notification-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.04);
}

.notification-item--unread {
  background: rgba(var(--v-theme-primary), 0.04);
}

.notification-item--unread:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}

.notification-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-primary {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.icon-success {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.icon-error {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
}

.icon-warning {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.icon-info {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.icon-default {
  background: rgba(var(--v-theme-on-surface), 0.1);
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 2px 0;
  line-height: 1.4;
}

.notification-message {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0 0 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.unread-dot {
  width: 8px;
  height: 8px;
  background: rgb(var(--v-theme-primary));
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 4px;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.empty-state p {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 12px 0 0 0;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
}

/* Footer */
.dropdown-footer {
  padding: 12px 16px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.view-all-btn {
  width: 100%;
  padding: 10px;
  background: rgba(var(--v-theme-primary), 0.08);
  border: none;
  border-radius: 8px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  transition: background 0.2s ease;
}

.view-all-btn:hover {
  background: rgba(var(--v-theme-primary), 0.15);
}
</style>
