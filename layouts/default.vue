<template>
  <v-layout class="rounded rounded-md border" style="height: 100vh;">
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      :model="sidebarOpen"
      permanent
      fixed
    >
      <v-list>
        <v-list-item>
          <div class="d-flex flex-column justify-center align-center pa-1">
            <img class="rounded-circle mt-4" :style="{height: '100px', width: '100px'}" src="https://uyxjwoujwpvzgrxyqzmc.supabase.co/storage/v1/object/public/avatars/profile.jpeg" alt="">
            <div class="text-uppercase mt-4 font-weight-bold">
              {{ user?.full_name || '-' }}
            </div>
            <div class="d-flex align-center justify-space-evenly mt-4" :style="{height: '30px'}">
              <v-btn variant="plain" class="text-none" append-icon="mdi-arrow-right">
                View profile
              </v-btn>
            </div>
          </div>
        </v-list-item>
      </v-list>

      <v-divider />
      <v-list>
        <v-list-item
          prepend-icon="mdi-view-dashboard"
          title="Dashboard"
          to="/dashboard"
        />
        <v-list-item
          prepend-icon="mdi-account-multiple"
          title="Accounts"
          to="/accounts"
        />
        <v-list-item
          prepend-icon="mdi-file-document"
          title="Loans"
          to="/loans"
        />
        <v-list-item
          prepend-icon="mdi-cash"
          title="Payments"
          to="/payments"
        />

        <template v-if="isAgent">
          <v-list-item
            prepend-icon="mdi-currency-usd"
            title="Earnings"
            to="/earnings"
          />
          <v-list-item
            prepend-icon="mdi-cash-check"
            title="Cashouts"
            to="/cashouts"
          />
        </template>

        <template v-if="isAdmin">
          <v-divider class="my-2" />
          <v-listSubheader>Admin</v-listSubheader>
          <v-list-item
            prepend-icon="mdi-shield-account"
            title="Admin Dashboard"
            to="/admin/dashboard"
          />
          <v-list-item
            prepend-icon="mdi-check-decagram"
            title="Approvals"
            to="/admin/approvals"
          />
          <v-list-item
            prepend-icon="mdi-cash-multiple"
            title="Cashouts"
            to="/admin/cashouts"
          />
          <v-list-item
            prepend-icon="mdi-account-group"
            title="Users"
            to="/admin/users"
          />
        </template>

        <template v-if="isInternalAdmin">
          <v-divider class="my-2" />
          <v-listSubheader>Internal Admin</v-listSubheader>
          <v-list-item
            prepend-icon="mdi-shield-star"
            title="Internal Dashboard"
            to="/internal-admin/dashboard"
          />
          <v-list-item
            prepend-icon="mdi-office-building"
            title="Companies"
            to="/internal-admin/companies"
          />
          <v-list-item
            prepend-icon="mdi-account-supervisor"
            title="Manage Admins"
            to="/internal-admin/users"
          />
        </template>
      </v-list>
    </v-navigation-drawer>

    <!-- App Bar -->
    <v-app-bar color="primary" elevate-on-scroll fixed app>
      <!-- Back button for specific pages (mobile only) -->
      <v-btn
        v-if="showBackButton"
        icon
        variant="text"
        class="mr-2 hide-on-desktop"
        @click="$router.back()"
      >
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>

      <!-- Menu button for mobile (when not showing back button) -->
      <v-app-barNavIcon v-else class="hide-on-desktop" @click="toggleSidebar" />

      <v-app-barTitle>
        <span class="text-h6 pl-4">{{ pageTitle || 'Financer' }}</span>
      </v-app-barTitle>

      <v-spacer />

      <!-- Notifications -->
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-badge
              v-if="unreadCount > 0"
              :content="unreadCount"
              color="error"
            >
              <v-icon>mdi-bell</v-icon>
            </v-badge>
            <v-icon v-else>
              mdi-bell
            </v-icon>
          </v-btn>
        </template>

        <v-card min-width="300" max-width="400">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Notifications</span>
            <v-btn
              v-if="unreadCount > 0"
              size="small"
              variant="text"
              @click="markAllAsRead()"
            >
              Mark all read
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-list v-if="notifications.length > 0" max-height="400">
            <v-list-item
              v-for="notification in recentNotifications"
              :key="notification.id"
              :class="{ 'bg-grey-lighten-4': !notification.is_read }"
              @click="markAsRead(notification.id)"
            >
              <v-list-item-title>{{ notification.message }}</v-list-item-title>
              <v-list-item-subtitle>{{ formatRelativeTime(notification.timestamp) }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>

          <v-card-text v-else class="text-center">
            No notifications
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-btn block variant="text" to="/notifications">
              View All
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-menu>

      <v-btn variant="plain" @click="logout()">
        <v-icon>mdi-logout</v-icon>
        Logout
      </v-btn>
    </v-app-bar>

    <!-- Bottom Navigation (Mobile) -->
    <v-bottom-navigation
      v-model="bottomNav"
      grow
      class="hide-on-desktop"
      fixed
      app
    >
      <v-btn value="dashboard" to="/dashboard">
        <v-icon>mdi-view-dashboard</v-icon>
        <span>Dashboard</span>
      </v-btn>

      <v-btn value="accounts" to="/accounts">
        <v-icon>mdi-account-multiple</v-icon>
        <span>Accounts</span>
      </v-btn>

      <v-btn value="loans" to="/loans">
        <v-icon>mdi-file-document</v-icon>
        <span>Loans</span>
      </v-btn>

      <v-btn v-if="isAgent" value="earnings" to="/earnings">
        <v-icon>mdi-currency-usd</v-icon>
        <span>Earnings</span>
      </v-btn>

      <v-btn v-if="isAdmin" value="admin" to="/admin/dashboard">
        <v-icon>mdi-shield-account</v-icon>
        <span>Admin</span>
      </v-btn>

      <v-btn v-if="isInternalAdmin" value="internal-admin" to="/internal-admin/dashboard">
        <v-icon>mdi-shield-star</v-icon>
        <span>Internal</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- Main Content -->
    <v-main style="overflow-y: auto; height: 100vh;">
      <slot />
    </v-main>

    <!-- Global Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="snackbar.timeout"
      location="top"
    >
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="hideSnackbar()">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useUIStore } from '~/stores/ui'
import { useNotificationsStore } from '~/stores/notifications'
import { useRoute } from 'vue-router'
import { formatRelativeTime } from '~/utils/formatters'

// Initialize stores
const authStore = useAuthStore()
const uiStore = useUIStore()
const notificationsStore = useNotificationsStore()
const route = useRoute()

// Extract reactive state/getters using storeToRefs
const { user, isAdmin, isAgent, isInternalAdmin } = storeToRefs(authStore)
const { sidebarOpen, snackbar } = storeToRefs(uiStore)
const { notifications, recentNotifications, unreadCount } = storeToRefs(notificationsStore)

// Extract actions directly from store
const { logout } = authStore
const { toggleSidebar, hideSnackbar } = uiStore
const { fetchNotifications, subscribeToRealtime, markAsRead, markAllAsRead } = notificationsStore

// Component state
const bottomNav = ref('dashboard')

// Computed properties
const pageTitle = computed(() => {
  // Map specific routes to titles
  const routeTitles: Record<string, string> = {
    'accounts-create': 'Create New Account',
    accounts: 'Accounts',
    loans: 'Loans',
    payments: 'Payments',
    earnings: 'Earnings',
    cashouts: 'Cashouts',
    dashboard: 'Dashboard',
    'admin-dashboard': 'Admin Dashboard',
    'admin-approvals': 'Loan Approvals',
    'admin-cashouts': 'Cashout Management',
    'admin-users': 'User Management',
    'internal-admin-dashboard': 'Internal Admin Dashboard',
    'internal-admin-companies': 'Company Management',
    'internal-admin-users': 'Admin User Management'
  }

  const routeName = route.name as string
  return routeTitles[routeName] || 'Financer'
})

const showBackButton = computed(() => {
  const pagesWithBackButton = ['accounts-create', 'loans-create', 'accounts-edit']
  const routeName = route.name as string
  return pagesWithBackButton.includes(routeName)
})

// Lifecycle
onMounted(async () => {
  await fetchNotifications()
  subscribeToRealtime()
})
</script>

<style scoped>
@media (min-width: 960px) {
  .hide-on-desktop {
    display: none !important;
  }
}
</style>
