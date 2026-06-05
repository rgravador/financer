<template>
  <v-navigation-drawer
    v-model="drawerOpen"
    app
    :permanent="!isMobile"
    :temporary="isMobile"
    :width="280"
    class="app-sidebar"
    :aria-label="'Main navigation'"
  >
    <!-- Sidebar ambient glow -->
    <div class="sidebar-glow" aria-hidden="true">
      <div class="sidebar-orb"></div>
    </div>

    <!-- Logo Section -->
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="/logo-transparent.png" alt="Ascendent Logo" class="logo-image" />
      </div>
    </div>

    <!-- Navigation Menu -->
    <div class="nav-section">
      <p class="nav-label" id="main-menu-label">Main Menu</p>
      <nav class="nav-menu" aria-labelledby="main-menu-label" role="navigation">
        <NuxtLink
          v-for="item in filteredMenuItems"
          :key="item.to"
          :to="item.to"
          class="nav-item"
          :class="{ active: isActiveRoute(item.to) }"
          :aria-current="isActiveRoute(item.to) ? 'page' : undefined"
        >
          <div class="nav-item-icon" aria-hidden="true">
            <v-icon size="20">{{ item.icon }}</v-icon>
          </div>
          <span class="nav-item-text">{{ item.title }}</span>
          <div v-if="item.badge" class="nav-item-badge" :aria-label="`${item.badge} new items`">{{ item.badge }}</div>
        </NuxtLink>
      </nav>
    </div>

  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'
import { useDisplay } from 'vuetify'

interface MenuItem {
  title: string
  icon: string
  to: string
  roles: string[]
  badge?: string | number
}

const props = defineProps<{
  modelValue?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { mobile } = useDisplay()
const isMobile = computed(() => mobile.value)

const drawerOpen = computed({
  get: () => props.modelValue ?? true,
  set: (value: boolean) => emit('update:modelValue', value),
})

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

  // Loan Officer menu items
  { title: 'Applications', icon: 'mdi-file-document-multiple-outline', to: '/officer/applications', roles: ['tenant_officer'] },
  { title: 'Accounts', icon: 'mdi-account-group-outline', to: '/officer/accounts', roles: ['tenant_officer'] },
  { title: 'Leads', icon: 'mdi-account-search-outline', to: '/officer/leads', roles: ['tenant_officer'] },
  { title: 'Repayments', icon: 'mdi-cash-check', to: '/officer/repayments', roles: ['tenant_officer'] },
  { title: 'Reports', icon: 'mdi-chart-bar', to: '/officer/reports', roles: ['tenant_officer'] },

  // Approver menu items
  { title: 'Review Queue', icon: 'mdi-clipboard-check-outline', to: '/approver/queue', roles: ['tenant_approver'] },
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
  box-shadow: none !important;
  transition: all var(--transition-base);
  overflow: hidden;
}

/* Sidebar ambient glow */
.sidebar-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.sidebar-orb {
  position: absolute;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, #3B82F6 0%, #6366F1 50%, transparent 70%);
  filter: blur(60px);
  opacity: 0.06;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  animation: sidebar-pulse 15s ease-in-out infinite;
}

@keyframes sidebar-pulse {
  0%, 100% { opacity: 0.05; transform: translateX(-50%) scale(1); }
  50% { opacity: 0.08; transform: translateX(-50%) scale(1.15); }
}

@media (prefers-reduced-motion: reduce) {
  .sidebar-orb { animation: none; }
}

/* Header / Logo */
.sidebar-header {
  padding: 28px 24px 24px;
  border-bottom: 1px solid var(--sidebar-border);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image {
  width: 130px;
  height: auto;
  object-fit: contain;
  opacity: 0.9;
}

/* Navigation Section */
.nav-section {
  padding: 24px 16px;
}

.nav-label {
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  margin: 0 0 16px 12px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 11px 14px;
  border-radius: 10px;
  text-decoration: none;
  transition: all var(--transition-base);
  position: relative;
}

.nav-item:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
}

.nav-item-icon {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: transparent;
  color: var(--sidebar-text);
  transition: all var(--transition-base);
}

.nav-item-text {
  font-family: var(--font-sans);
  font-size: 13.5px;
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
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
}

/* Hover State */
.nav-item:hover {
  background: var(--bg-sidebar-hover);
}

.nav-item:hover .nav-item-icon {
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

/* Active indicator — thin gold line */
.nav-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--accent-primary);
  border-radius: 0 3px 3px 0;
}
</style>
