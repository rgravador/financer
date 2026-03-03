<template>
  <v-navigation-drawer
    app
    permanent
    :width="260"
    class="app-sidebar"
  >
    <!-- Logo Section -->
    <div class="sidebar-logo">
      <img src="/logo.png" alt="Ascendent Logo" class="logo-image" />
      <span class="logo-text">Ascendent</span>
    </div>

    <v-divider class="my-4" />

    <!-- Navigation Menu -->
    <v-list nav density="compact">
      <template v-for="item in filteredMenuItems" :key="item.to">
        <v-list-item
          :to="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          class="menu-item"
        />
      </template>
    </v-list>

    <v-spacer />

    <!-- User Info & Logout -->
    <template v-slot:append>
      <v-divider class="mb-4" />

      <div class="user-section">
        <div class="user-info">
          <v-icon size="24">mdi-account-circle</v-icon>
          <div class="user-details">
            <div class="user-name">{{ authStore.user?.name || 'User' }}</div>
            <div class="user-role">{{ roleLabel }}</div>
          </div>
        </div>

        <v-btn
          icon="mdi-logout"
          variant="text"
          size="small"
          @click="handleLogout"
          class="logout-btn"
        />
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

interface MenuItem {
  title: string
  icon: string
  to: string
  roles: string[]
}

const authStore = useAuthStore()
const router = useRouter()

// Define menu items with role-based access
const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/system/dashboard', roles: ['system_admin'] },
  { title: 'Tenants', icon: 'mdi-office-building', to: '/system/tenants', roles: ['system_admin'] },
  { title: 'Audit Logs', icon: 'mdi-file-document-outline', to: '/system/audit-logs', roles: ['system_admin'] },
]

// Filter menu items based on user role
const filteredMenuItems = computed(() => {
  const userRole = authStore.userRole
  if (!userRole) return []

  return menuItems.filter(item => item.roles.includes(userRole))
})

// Get readable role label
const roleLabel = computed(() => {
  const role = authStore.userRole
  if (!role) return ''

  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
})

// Handle logout
const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>

<style scoped>
.app-sidebar {
  background-color: white !important;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
}

.logo-image {
  width: 32px;
  height: 32px;
  object-fit: contain;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.menu-item {
  margin: 4px 12px;
  border-radius: 8px;
  background-color: transparent;
  color: rgba(0, 0, 0, 0.6);
}

.menu-item:hover {
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-secondary));
}

/* Active state - when route is active */
.menu-item.v-list-item--active {
  background-color: rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-secondary));
}

.user-section {
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.87);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  color: rgba(0, 0, 0, 0.6);
}

.logout-btn:hover {
  color: rgba(0, 0, 0, 0.87);
  background-color: rgba(0, 0, 0, 0.04);
}
</style>
