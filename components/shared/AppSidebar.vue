<template>
  <v-navigation-drawer
    app
    permanent
    :width="260"
    class="app-sidebar"
  >
    <!-- Logo Section -->
    <div class="sidebar-logo">
      <v-icon size="32" color="gold">mdi-finance</v-icon>
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
          color="gold"
        />
      </template>
    </v-list>

    <v-spacer />

    <!-- User Info & Logout -->
    <template v-slot:append>
      <v-divider class="mb-4" />

      <div class="user-section">
        <div class="user-info">
          <v-icon size="24" color="gold">mdi-account-circle</v-icon>
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
  background-color: rgb(var(--v-theme-navy)) !important;
  color: white;
}

.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: rgb(var(--v-theme-gold));
}

.menu-item {
  margin: 4px 12px;
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
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
  color: white;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.logout-btn {
  color: rgba(255, 255, 255, 0.8);
}

.logout-btn:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
