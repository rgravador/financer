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
    <!-- Logo Section -->
    <div class="sidebar-header">
      <div class="logo-container">
        <img src="/logo-transparent.png" alt="Ascendent Logo" class="logo-image" />
      </div>
    </div>

    <!-- Navigation Menu -->
    <div class="nav-section">
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

    <!-- User Section (bottom) -->
    <div class="sidebar-footer">
      <!-- Notification + Theme row -->
      <div class="footer-actions">
        <button class="footer-action-btn" aria-label="Notifications" @click="handleNotifications">
          <v-icon size="20">mdi-bell-outline</v-icon>
        </button>
        <button class="footer-action-btn" :aria-label="`Switch to ${isDarkMode ? 'light' : 'dark'} mode`" @click="toggleTheme">
          <v-icon size="20">{{ isDarkMode ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent' }}</v-icon>
        </button>
      </div>

      <!-- User profile card -->
      <v-menu location="top start" :close-on-content-click="true">
        <template v-slot:activator="{ props: menuProps }">
          <button v-bind="menuProps" class="user-card" aria-label="User menu" aria-haspopup="menu">
            <div class="user-avatar">
              <img :src="avatarImage" :alt="userName" class="avatar-img" loading="lazy" />
            </div>
            <div class="user-info">
              <span class="user-name">{{ userName }}</span>
              <span class="user-role">{{ roleLabel }}</span>
            </div>
            <v-icon size="16" class="user-chevron">mdi-chevron-up</v-icon>
          </button>
        </template>

        <div class="user-dropdown" role="menu" aria-label="User options">
          <button class="dropdown-item" role="menuitem" @click="handleProfile">
            <v-icon size="18">mdi-account-outline</v-icon>
            <span>My Profile</span>
          </button>
          <button class="dropdown-item" role="menuitem" @click="handleSettings">
            <v-icon size="18">mdi-cog-outline</v-icon>
            <span>Settings</span>
          </button>
          <div class="dropdown-divider" role="separator"></div>
          <button class="dropdown-item logout-item" role="menuitem" @click="handleLogout">
            <v-icon size="18">mdi-logout</v-icon>
            <span>Sign Out</span>
          </button>
        </div>
      </v-menu>
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
const router = useRouter()
const colorMode = useColorMode()

const isDarkMode = computed(() => colorMode.value === 'dark')
const toggleTheme = () => {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const avatarImage = computed(() => {
  const gender = authStore.user?.gender || 'male'
  return gender === 'female' ? '/female-icon.jpg' : '/male-icon.jpg'
})

const userName = computed(() => {
  const user = authStore.user
  if (!user) return 'User'
  if (user.fullName) return user.fullName
  if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`
  return user.firstName || user.lastName || user.email || 'User'
})

const roleLabel = computed(() => {
  const roleMap: Record<string, string> = {
    system_admin: 'System Admin',
    tenant_admin: 'Admin',
    tenant_officer: 'Loan Officer',
    tenant_approver: 'Approver',
  }
  return roleMap[authStore.userRole || ''] || 'User'
})

const handleProfile = () => router.push('/profile')
const handleSettings = () => router.push('/settings')
const handleNotifications = () => {}
const handleLogout = async () => {
  try { await authStore.logout(); router.push('/login') }
  catch { router.push('/login') }
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/system/dashboard', roles: ['system_admin'] },
  { title: 'Tenants', icon: 'mdi-office-building-outline', to: '/system/tenants', roles: ['system_admin'] },
  { title: 'Audit Logs', icon: 'mdi-shield-check-outline', to: '/system/audit-logs', roles: ['system_admin'] },

  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/tenant/dashboard', roles: ['tenant_admin'] },
  { title: 'Users', icon: 'mdi-account-multiple-outline', to: '/tenant/users', roles: ['tenant_admin'] },
  { title: 'Loan Types', icon: 'mdi-file-document-outline', to: '/tenant/loan-types', roles: ['tenant_admin'] },
  { title: 'Settings', icon: 'mdi-cog-outline', to: '/tenant/settings', roles: ['tenant_admin'] },
  { title: 'Audit Logs', icon: 'mdi-shield-check-outline', to: '/tenant/audit-logs', roles: ['tenant_admin'] },

  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/officer/dashboard', roles: ['tenant_officer'] },
  { title: 'Applications', icon: 'mdi-file-document-multiple-outline', to: '/officer/applications', roles: ['tenant_officer'] },
  { title: 'Accounts', icon: 'mdi-account-group-outline', to: '/officer/accounts', roles: ['tenant_officer'] },
  { title: 'Leads', icon: 'mdi-account-search-outline', to: '/officer/leads', roles: ['tenant_officer'] },
  { title: 'Repayments', icon: 'mdi-cash-check', to: '/officer/repayments', roles: ['tenant_officer'] },
  { title: 'Reports', icon: 'mdi-chart-bar', to: '/officer/reports', roles: ['tenant_officer'] },

  { title: 'Dashboard', icon: 'mdi-view-dashboard-outline', to: '/approver/dashboard', roles: ['tenant_approver'] },
  { title: 'Review Queue', icon: 'mdi-clipboard-check-outline', to: '/approver/queue', roles: ['tenant_approver'] },
]

const filteredMenuItems = computed(() => {
  const userRole = authStore.userRole
  if (!userRole) return []
  return menuItems.filter(item => item.roles.includes(userRole))
})

const isActiveRoute = (path: string) => {
  return route.path === path || route.path.startsWith(path + '/')
}
</script>

<style scoped>
.app-sidebar {
  background: var(--glass-heavy) !important;
  border: 1px solid var(--glass-border-soft) !important;
  border-radius: 20px !important;
  border: 1px solid var(--glass-border) !important;
  box-shadow: var(--shadow-card), var(--depth-edge), var(--shadow-glass-inset) !important;
  transition: all var(--transition-base);
  margin: 0 !important;
  top: 16px !important;
  left: 16px !important;
  bottom: 16px !important;
  height: calc(100vh - 32px) !important;
  max-height: calc(100vh - 32px) !important;
  overflow: hidden !important;
}

/* Dark mode — glassmorphic sidebar with blur */
:root.dark .app-sidebar {
  backdrop-filter: var(--glass-blur) !important;
  -webkit-backdrop-filter: var(--glass-blur) !important;
  border: none !important;
}

/* Dark mode — nav items become translucent, no solid bg */
:root.dark .nav-item {
  background: rgba(255, 255, 255, 0.04);
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

:root.dark .nav-item:hover {
  background: rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.06);
}

:root.dark .nav-item.active {
  background: rgba(167, 139, 250, 0.12);
  border-color: transparent;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.2), inset 0 0 0 1px rgba(167, 139, 250, 0.08);
}

:root.dark .footer-action-btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

:root.dark .user-card {
  background: rgba(255, 255, 255, 0.05);
  border-color: transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

:root.dark .dropdown-item {
  background: rgba(255, 255, 255, 0.04);
  border-color: transparent;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.04);
}

:root.dark .user-dropdown {
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: none;
}

/* Force Vuetify's internal wrapper to be a flex column */
.app-sidebar :deep(.v-navigation-drawer__content) {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Header / Logo */
.sidebar-header {
  padding: 24px 24px 20px;
  border-bottom: 1px solid var(--glass-border-soft);
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
}

/* Navigation Section — scrollable */
.nav-section {
  padding: 20px 16px 16px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0;
}

.nav-label {
  font-family: var(--font-display);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: var(--text-muted);
  margin: 0 0 12px 12px;
}

.nav-menu {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px;
  border-radius: 12px;
  text-decoration: none;
  transition: all 120ms cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  background: var(--glass-light);
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: var(--depth-edge-xs), 0 2px 4px rgba(0, 0, 0, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.5);
  margin-bottom: 2px;
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
  border-radius: 10px;
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
  background: linear-gradient(135deg, var(--accent-coral), #e879a0);
  color: #fff;
  font-family: var(--font-sans);
  font-size: 10px;
  font-weight: 600;
  border-radius: 6px;
  box-shadow: 0 2px 6px var(--accent-coral-glow);
}

/* Hover — lifts up */
.nav-item:hover {
  background: rgba(255, 255, 255, 0.6);
  transform: translateY(-1px);
  box-shadow: 0 3px 0 #D1D1D5, 0 4px 8px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.6);
}
.nav-item:hover .nav-item-icon { color: var(--sidebar-text-hover); }
.nav-item:hover .nav-item-text { color: var(--sidebar-text-hover); }

/* Active route — pressed in, no depth edge */
.nav-item.active {
  background: rgba(139, 92, 246, 0.10);
  border-color: rgba(139, 92, 246, 0.15);
  transform: translateY(1px);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(139, 92, 246, 0.08);
}
.nav-item.active:hover {
  transform: translateY(1px);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.05), inset 0 0 0 1px rgba(139, 92, 246, 0.08);
}

/* Click — pressed down */
.nav-item:active:not(.active) { transform: translateY(2px); box-shadow: inset 0 2px 4px rgba(0,0,0,0.06); }
.nav-item.active .nav-item-icon {
  background: var(--accent-primary);
  color: #fff;
  box-shadow: var(--depth-edge-xs), 0 2px 6px rgba(139, 92, 246, 0.3);
}
.nav-item.active .nav-item-text { color: var(--accent-primary); font-weight: 600; }
.nav-item.active .nav-item-badge { background: var(--accent-primary); }

.nav-item.active::before {
  content: '';
  position: absolute;
  left: -1px;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--accent-primary);
  border-radius: 0 3px 3px 0;
}

/* Spacer pushes footer to bottom */
.sidebar-spacer { flex: 1; }

/* Footer section */
.sidebar-footer {
  padding: 12px 16px 28px;
  border-top: 1px solid var(--glass-border-soft);
  flex-shrink: 0;
}

.footer-actions {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  padding: 0 4px;
}

.footer-action-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.45);
  color: var(--sidebar-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 120ms cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--depth-edge-xs), 0 2px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6);
}

.footer-action-btn:hover {
  background: var(--bg-sidebar-hover);
  color: var(--sidebar-text-hover);
  transform: translateY(-1px);
  box-shadow: 0 3px 0 #D5D5D9, 0 4px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5);
}

.footer-action-btn:active {
  transform: translateY(2px);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.08);
}

.footer-action-btn:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
}

/* User card */
.user-card {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 120ms cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  box-shadow: var(--depth-edge-sm), 0 3px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.6);
}

.user-card:hover {
  background: var(--bg-sidebar-hover);
  transform: translateY(-1px);
  box-shadow: 0 3px 0 #D5D5D9, 0 4px 10px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.5);
}

.user-card:active {
  transform: translateY(2px);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.08);
}

.user-card:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid var(--glass-border-soft);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 11px;
  color: var(--text-muted);
  display: block;
}

.user-chevron {
  color: var(--text-muted);
  flex-shrink: 0;
}

/* User dropdown menu */
.user-dropdown {
  background: var(--glass-heavy);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border-radius: 14px;
  border: 1px solid var(--glass-border-soft);
  box-shadow: var(--shadow-lg), var(--shadow-glass-inset);
  min-width: 200px;
  padding: 6px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all 120ms cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;
  box-shadow: var(--depth-edge-xs), inset 0 1px 0 rgba(255,255,255,0.4);
  margin-bottom: 4px;
}

.dropdown-item:hover {
  background: rgba(255, 255, 255, 0.5);
  transform: translateY(-1px);
  box-shadow: 0 3px 0 #D5D5D9, 0 2px 6px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5);
}

.dropdown-item:active {
  transform: translateY(2px);
  box-shadow: inset 0 2px 4px rgba(0,0,0,0.06);
}

.dropdown-item:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: -2px;
}

.dropdown-divider {
  height: 1px;
  background: var(--glass-border-soft);
  margin: 4px 0;
}

.dropdown-item.logout-item { color: var(--color-error); }
.dropdown-item.logout-item:hover { background: rgba(239, 68, 68, 0.08); }
</style>
