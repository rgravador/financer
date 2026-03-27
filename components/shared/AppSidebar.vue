<template>
  <v-navigation-drawer
    app
    permanent
    :width="280"
    class="app-sidebar"
  >
    <!-- Logo Section -->
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="/logo-transparent.png" alt="Ascendent Logo" class="logo-image" />
      </div>
    </div>

    <!-- Navigation Menu -->
    <div class="nav-section">
      <p class="nav-label">Main Menu</p>
      <nav class="nav-menu">
        <NuxtLink
          v-for="item in filteredMenuItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActiveRoute(item.to) }"
        >
          <div class="nav-item-icon">
            <v-icon size="20">{{ item.icon }}</v-icon>
          </div>
          <span class="nav-item-text">{{ item.title }}</span>
          <div v-if="item.badge" class="nav-item-badge">{{ item.badge }}</div>
        </NuxtLink>
      </nav>
    </div>

  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

interface MenuItem {
  title: string
  icon: string
  to: string
  roles: string[]
  badge?: string | number
}

const authStore = useAuthStore()
const route = useRoute()

// Define menu items with role-based access
const menuItems: MenuItem[] = [
  // System Admin menu items
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/system/dashboard', roles: ['system_admin'] },
  { title: 'Tenants', icon: 'mdi-office-building-outline', to: '/system/tenants', roles: ['system_admin'] },
  { title: 'Audit Logs', icon: 'mdi-shield-check-outline', to: '/system/audit-logs', roles: ['system_admin'] },

  // Tenant Admin menu items
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/tenant/dashboard', roles: ['tenant_admin'] },
  { title: 'Users', icon: 'mdi-account-multiple-outline', to: '/tenant/users', roles: ['tenant_admin'] },
  { title: 'Loan Types', icon: 'mdi-file-document-outline', to: '/tenant/loan-types', roles: ['tenant_admin'] },
  { title: 'Settings', icon: 'mdi-cog-outline', to: '/tenant/settings', roles: ['tenant_admin'] },
  { title: 'Audit Logs', icon: 'mdi-shield-check-outline', to: '/tenant/audit-logs', roles: ['tenant_admin'] },
]

// Filter menu items based on user role
const filteredMenuItems = computed(() => {
  const userRole = authStore.userRole
  if (!userRole) return []

  return menuItems.filter(item => item.roles.includes(userRole))
})

// Check if route is active
const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
.app-sidebar {
  background: var(--bg-sidebar-gradient) !important;
  border-right: 1px solid var(--sidebar-border) !important;
  box-shadow: var(--sidebar-shadow);
  transition: all var(--transition-base);
}

/* Header / Logo */
.sidebar-header {
  padding: 20px 24px;
  border-bottom: 1px solid var(--sidebar-border);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  width: 140px;
  height: auto;
  object-fit: contain;
}

/* Navigation Section */
.nav-section {
  padding: 20px 16px;
}

.nav-label {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-muted);
  margin: 0 0 12px 8px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: var(--border-radius);
  text-decoration: none;
  transition: all var(--transition-base);
  position: relative;
}

.nav-item-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--border-radius-sm);
  background: var(--bg-sidebar-hover);
  color: var(--sidebar-text);
  transition: all var(--transition-base);
}

.nav-item-text {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  color: var(--sidebar-text);
  flex: 1;
  transition: color var(--transition-base);
}

.nav-item-badge {
  padding: 2px 8px;
  background: var(--accent-primary);
  color: var(--text-inverse);
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  border-radius: var(--border-radius-sm);
}

/* Hover State */
.nav-item:hover {
  background: var(--bg-sidebar-hover);
}

.nav-item:hover .nav-item-icon {
  background: var(--bg-sidebar-active);
  color: var(--sidebar-text-hover);
}

.nav-item:hover .nav-item-text {
  color: var(--sidebar-text-hover);
}

/* Active State */
.nav-item.active {
  background: var(--bg-sidebar-active);
}

.nav-item.active .nav-item-icon {
  background: var(--accent-primary);
  color: var(--text-inverse);
}

.nav-item.active .nav-item-text {
  color: var(--sidebar-text-active);
  font-weight: 600;
}

.nav-item.active .nav-item-badge {
  background: var(--accent-primary);
}

/* Active indicator */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 24px;
  background: var(--accent-primary);
  border-radius: 0 4px 4px 0;
}
</style>
