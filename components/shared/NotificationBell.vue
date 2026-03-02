<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useNotificationsStore } from '~/stores/notifications'
import type { Notification } from '~/types'

const notificationsStore = useNotificationsStore()
const showDropdown = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

let cleanupPolling: (() => void) | null = null

// Initialize and start polling
onMounted(async () => {
  await notificationsStore.fetchNotifications()
  cleanupPolling = notificationsStore.startPolling(60000) // Poll every 60 seconds

  // Close dropdown when clicking outside
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  if (cleanupPolling) {
    cleanupPolling()
  }
  document.removeEventListener('click', handleClickOutside)
})

const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    showDropdown.value = false
  }
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const handleNotificationClick = async (notification: Notification) => {
  // Mark as read
  if (!notification.isRead) {
    await notificationsStore.markAsRead(notification.id)
  }

  // Navigate to the application
  navigateTo(`/officer/applications/${notification.applicationId}`)

  // Close dropdown
  showDropdown.value = false
}

const markAllAsRead = async () => {
  await notificationsStore.markAllRead()
}

const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'approved':
      return '✓'
    case 'rejected':
      return '✗'
    case 'pending_documents':
      return '📄'
    default:
      return '•'
  }
}
</script>

<template>
  <div ref="dropdownRef" class="notification-bell">
    <button
      class="bell-button"
      @click.stop="toggleDropdown"
      aria-label="Notifications"
    >
      <!-- Bell Icon -->
      <svg
        class="bell-icon"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>

      <!-- Unread Badge -->
      <span v-if="notificationsStore.unreadCount > 0" class="badge">
        {{ notificationsStore.unreadCount > 99 ? '99+' : notificationsStore.unreadCount }}
      </span>
    </button>

    <!-- Dropdown -->
    <div v-if="showDropdown" class="dropdown">
      <div class="dropdown-header">
        <h3>Notifications</h3>
        <button
          v-if="notificationsStore.hasUnread"
          class="mark-all-read"
          @click="markAllAsRead"
        >
          Mark all read
        </button>
      </div>

      <div class="notifications-list">
        <div
          v-if="notificationsStore.notifications.length === 0"
          class="empty-state"
        >
          No notifications
        </div>

        <div
          v-for="notification in notificationsStore.notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.isRead }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            {{ getNotificationIcon(notification.type) }}
          </div>
          <div class="notification-content">
            <p class="notification-message">{{ notification.message }}</p>
            <span class="notification-time">
              {{ formatTimestamp(notification.createdAt) }}
            </span>
          </div>
          <div v-if="!notification.isRead" class="unread-indicator" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.notification-bell {
  position: relative;
  display: inline-block;
}

.bell-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.bell-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.bell-icon {
  color: #333;
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  background-color: #ef4444;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 9px;
}

.dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 360px;
  max-height: 480px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  overflow: hidden;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
}

.dropdown-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.mark-all-read {
  padding: 4px 12px;
  background: transparent;
  border: none;
  color: #3b82f6;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.mark-all-read:hover {
  background-color: rgba(59, 130, 246, 0.1);
}

.notifications-list {
  max-height: 400px;
  overflow-y: auto;
}

.empty-state {
  padding: 48px 16px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.notification-item {
  display: flex;
  align-items: start;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.notification-item:last-child {
  border-bottom: none;
}

.notification-item:hover {
  background-color: #f9fafb;
}

.notification-item.unread {
  background-color: #eff6ff;
}

.notification-item.unread:hover {
  background-color: #dbeafe;
}

.notification-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: #f3f4f6;
  border-radius: 50%;
  font-size: 16px;
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-message {
  margin: 0 0 4px 0;
  font-size: 14px;
  color: #111827;
  line-height: 1.4;
}

.notification-time {
  font-size: 12px;
  color: #6b7280;
}

.unread-indicator {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  background-color: #3b82f6;
  border-radius: 50%;
  margin-top: 8px;
}
</style>
