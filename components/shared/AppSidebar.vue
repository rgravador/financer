<script setup lang="ts">
import { computed } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRoute } from 'vue-router'

const { user, userRole } = useAuth()
const route = useRoute()

interface NavItem {
  title: string
  icon: string
  to: string
  roles: string[]
}

const navigationItems = computed<NavItem[]>(() => {
  const role = userRole.value

  // System Admin navigation
  if (role === 'system_admin') {
    return [
      { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/system/dashboard', roles: ['system_admin'] },
      { title: 'Tenants', icon: 'mdi-domain', to: '/system/tenants', roles: ['system_admin'] },
      { title: 'Audit Logs', icon: 'mdi-file-document-outline', to: '/system/audit-logs', roles: ['system_admin'] },
      { title: 'Settings', icon: 'mdi-cog', to: '/system/settings', roles: ['system_admin'] },
    ]
  }

  // Tenant Admin navigation
  if (role === 'tenant_admin') {
    return [
      { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/admin/dashboard', roles: ['tenant_admin'] },
      { title: 'Applications', icon: 'mdi-file-document-multiple', to: '/officer/applications', roles: ['tenant_admin'] },
      { title: 'Users', icon: 'mdi-account-multiple', to: '/admin/users', roles: ['tenant_admin'] },
      { title: 'Loan Types', icon: 'mdi-format-list-bulleted-type', to: '/admin/loan-types', roles: ['tenant_admin'] },
      { title: 'Audit Logs', icon: 'mdi-file-document-outline', to: '/admin/audit-logs', roles: ['tenant_admin'] },
      { title: 'Settings', icon: 'mdi-cog', to: '/admin/settings', roles: ['tenant_admin'] },
    ]
  }

  // Approver navigation
  if (role === 'tenant_approver') {
    return [
      { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/approver/dashboard', roles: ['tenant_approver'] },
      { title: 'Review Queue', icon: 'mdi-format-list-checks', to: '/approver/queue', roles: ['tenant_approver'] },
      { title: 'History', icon: 'mdi-history', to: '/approver/history', roles: ['tenant_approver'] },
    ]
  }

  // Loan Officer navigation
  if (role === 'tenant_officer') {
    return [
      { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/officer/dashboard', roles: ['tenant_officer'] },
      { title: 'Applications', icon: 'mdi-file-document-multiple', to: '/officer/applications', roles: ['tenant_officer'] },
      { title: 'New Application', icon: 'mdi-plus-circle', to: '/officer/applications/new', roles: ['tenant_officer'] },
    ]
  }

  return []
})

const isActive = (path: string) => {
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="app-sidebar">
    <!-- Logo -->
    <div class="sidebar-logo">
      <div class="logo-text">
        <span class="logo-icon">A</span>
        <span class="logo-name">ASCENDENT</span>
      </div>
    </div>

    <!-- Navigation List -->
    <v-list density="comfortable" nav>
      <v-list-item
        v-for="item in navigationItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        :active="isActive(item.to)"
        color="primary"
        rounded="lg"
        class="mb-1"
      />
    </v-list>

    <!-- User Info at Bottom -->
    <div class="sidebar-footer">
      <v-divider class="mb-3" />
      <div class="user-info">
        <v-avatar color="primary" size="32">
          <span class="text-subtitle-2">{{ user?.firstName?.[0] }}{{ user?.lastName?.[0] }}</span>
        </v-avatar>
        <div class="user-details">
          <div class="text-body-2 font-weight-medium">
            {{ user?.firstName }} {{ user?.lastName }}
          </div>
          <div class="text-caption text-medium-emphasis">
            {{ user?.email }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: rgb(var(--v-theme-surface));
}

.sidebar-logo {
  padding: 24px 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-text {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
  font-weight: 700;
}

.logo-name {
  font-size: 20px;
  font-weight: 700;
  color: #1e3a8a;
  letter-spacing: -0.5px;
}

.v-list {
  flex: 1;
  padding: 8px 12px;
}

/* Ensure active navigation items have white text */
.v-list-item--active {
  color: rgb(var(--v-theme-on-primary)) !important;
}

.v-list-item--active .v-icon {
  color: rgb(var(--v-theme-on-primary)) !important;
}

/* Hover state for navigation items */
.v-list-item:hover:not(.v-list-item--active) {
  background-color: rgba(var(--v-theme-primary), 0.08) !important;
}

.sidebar-footer {
  padding: 12px;
  margin-top: auto;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  background-color: rgb(var(--v-theme-surface-variant));
}

/* Ensure avatar text is white on navy background */
.user-info .v-avatar {
  color: rgb(var(--v-theme-on-primary)) !important;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-details .text-body-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.user-details .text-caption {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
