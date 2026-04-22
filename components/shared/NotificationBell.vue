<template>
  <v-menu
    v-model="menuOpen"
    :close-on-content-click="false"
    offset-y
    location="bottom end"
    :max-width="dropdownMaxWidth"
    :min-width="dropdownMinWidth"
  >
    <template v-slot:activator="{ props }">
      <button
        v-bind="props"
        class="topbar-btn notification-btn"
        aria-label="Notifications"
        aria-haspopup="true"
        :aria-expanded="menuOpen"
      >
        <v-icon size="20" aria-hidden="true">mdi-bell-outline</v-icon>
        <span
          v-if="notificationsStore.unreadCount > 0"
          class="notification-badge"
          aria-live="polite"
          :aria-label="`${notificationsStore.unreadCount} unread notifications`"
        >
          {{ notificationsStore.unreadCount > 99 ? '99+' : notificationsStore.unreadCount }}
        </span>
      </button>
    </template>

    <div class="notification-dropdown" role="region" aria-label="Notifications panel">
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
      <div class="notification-list" role="list" aria-label="Notification items" v-if="!notificationsStore.loading">
        <template v-if="notificationsStore.notifications.length > 0">
          <button
            v-for="notification in notificationsStore.notifications"
            :key="notification.id"
            class="notification-item"
            :class="{ 'notification-item--unread': !notification.isRead }"
            role="listitem"
            :aria-label="`${notification.isRead ? '' : 'Unread: '}${notification.title}. ${notification.message}`"
            @click="handleNotificationClick(notification)"
          >
            <div class="notification-icon" :class="getIconClass(notification.type)" aria-hidden="true">
              <v-icon size="18">{{ getIcon(notification.type) }}</v-icon>
            </div>
            <div class="notification-content">
              <p class="notification-title">{{ notification.title }}</p>
              <p class="notification-message">{{ notification.message }}</p>
              <span class="notification-time">{{ formatTime(notification.createdAt) }}</span>
            </div>
            <div v-if="!notification.isRead" class="unread-dot" aria-hidden="true"></div>
          </button>
        </template>

        <!-- Empty State -->
        <div v-else class="empty-state" role="status">
          <v-icon size="48" color="grey-lighten-1" aria-hidden="true">mdi-bell-off-outline</v-icon>
          <p>No notifications yet</p>
        </div>
      </div>

      <!-- Loading State -->
      <div v-else class="loading-state" role="status" aria-label="Loading notifications">
        <v-progress-circular indeterminate size="24" color="primary" aria-hidden="true" />
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
let abortController: AbortController | null = null

// Responsive dropdown width
const dropdownMaxWidth = computed(() => {
  if (typeof window !== 'undefined' && window.innerWidth < 420) {
    return `${window.innerWidth - 32}px`
  }
  return '380'
})

const dropdownMinWidth = computed(() => {
  if (typeof window !== 'undefined' && window.innerWidth < 420) {
    return `${window.innerWidth - 32}px`
  }
  return '340'
})

// Fetch notifications and start polling on mount
onMounted(async () => {
  if (authStore.isAuthenticated) {
    try {
      abortController = new AbortController()
      await notificationsStore.fetchNotifications()
      stopPolling = notificationsStore.startPolling(60000)
    } catch {
      // Non-critical: notifications will load on next poll or menu open
    }
  }
})

// Stop polling and abort pending requests on unmount
onUnmounted(() => {
  if (stopPolling) {
    stopPolling()
  }
  if (abortController) {
    abortController.abort()
  }
})

// Refetch when menu opens
watch(menuOpen, async (isOpen) => {
  if (isOpen && authStore.isAuthenticated) {
    try {
      await notificationsStore.fetchNotifications()
    } catch {
      // Non-critical: list shows cached data
    }
  }
})

// Methods
const handleNotificationClick = async (notification: Notification) => {
  try {
    if (!notification.isRead) {
      await notificationsStore.markAsRead(notification.id)
    }

    menuOpen.value = false

    if (notification.data?.applicationId) {
      const userRole = authStore.user?.role
      if (['tenant_approver', 'tenant_admin'].includes(userRole || '')) {
        router.push(`/approver/queue/${notification.data.applicationId}`)
      } else if (userRole === 'tenant_officer') {
        router.push(`/officer/applications/${notification.data.applicationId}`)
      }
    }
  } catch {
    // Non-critical
  }
}

const handleMarkAllRead = async () => {
  try {
    await notificationsStore.markAllRead()
  } catch {
    // Non-critical
  }
}

const handleViewAll = () => {
  menuOpen.value = false
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
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-sm, 8px);
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-base, 200ms);
  position: relative;
}

.topbar-btn:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.topbar-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  background: var(--color-error);
  color: white;
  font-family: var(--font-sans);
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
  background: var(--bg-card);
  border-radius: var(--border-radius, 12px);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.dropdown-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.mark-all-btn {
  background: transparent;
  border: none;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background var(--transition-base, 200ms);
}

.mark-all-btn:hover {
  background: rgba(var(--v-theme-primary), 0.1);
}

.mark-all-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
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
  transition: background var(--transition-base, 200ms);
  position: relative;
}

.notification-item:hover {
  background: var(--bg-hover);
}

.notification-item:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
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
  border-radius: var(--border-radius-sm, 8px);
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
  background: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
}

.icon-error {
  background: rgba(var(--v-theme-error), 0.1);
  color: rgb(var(--v-theme-error));
}

.icon-warning {
  background: rgba(var(--v-theme-warning), 0.1);
  color: rgb(var(--v-theme-warning));
}

.icon-info {
  background: rgba(var(--v-theme-info), 0.1);
  color: rgb(var(--v-theme-info));
}

.icon-default {
  background: var(--bg-hover);
  color: var(--text-muted);
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 2px 0;
  line-height: 1.4;
}

.notification-message {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-secondary);
  margin: 0 0 4px 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-time {
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--text-muted);
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
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 12px 0 0 0;
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px 20px;
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 14px;
}

/* Footer */
.dropdown-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
}

.view-all-btn {
  width: 100%;
  padding: 10px;
  background: rgba(var(--v-theme-primary), 0.08);
  border: none;
  border-radius: var(--border-radius-sm, 8px);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
  transition: background var(--transition-base, 200ms);
}

.view-all-btn:hover {
  background: rgba(var(--v-theme-primary), 0.15);
}

.view-all-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
</style>
