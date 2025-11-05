<template>
  <v-layout class="rounded rounded-md border" style="height: 100vh;">
    <!-- Navigation Drawer -->
    <v-navigation-drawer
      :model="uiStore.sidebarOpen"
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

        <template v-if="authStore.isAgent">
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

        <template v-if="authStore.isAdmin">
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
      <v-app-barNavIcon v-else class="hide-on-desktop" @click="uiStore.toggleSidebar" />

      <v-app-barTitle>
        <span class="text-h6 pl-4">{{ pageTitle || 'Financer' }}</span>
      </v-app-barTitle>

      <v-spacer />

      <!-- Notifications -->
      <v-menu>
        <template #activator="{ props }">
          <v-btn icon v-bind="props">
            <v-badge
              v-if="notificationsStore.unreadCount > 0"
              :content="notificationsStore.unreadCount"
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
              v-if="notificationsStore.unreadCount > 0"
              size="small"
              variant="text"
              @click="notificationsStore.markAllAsRead()"
            >
              Mark all read
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-list v-if="notificationsStore.notifications.length > 0" max-height="400">
            <v-list-item
              v-for="notification in notificationsStore.recentNotifications"
              :key="notification.id"
              :class="{ 'bg-grey-lighten-4': !notification.is_read }"
              @click="notificationsStore.markAsRead(notification.id)"
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

      <v-btn v-if="authStore.isAgent" value="earnings" to="/earnings">
        <v-icon>mdi-currency-usd</v-icon>
        <span>Earnings</span>
      </v-btn>

      <v-btn v-if="authStore.isAdmin" value="admin" to="/admin/dashboard">
        <v-icon>mdi-shield-account</v-icon>
        <span>Admin</span>
      </v-btn>
    </v-bottom-navigation>

    <!-- Main Content -->
    <v-main style="overflow-y: auto; height: 100vh;">
      <slot />
    </v-main>

    <!-- Global Snackbar -->
    <v-snackbar
      v-model="uiStore.snackbar.show"
      :color="uiStore.snackbar.color"
      :timeout="uiStore.snackbar.timeout"
      location="top"
    >
      {{ uiStore.snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="uiStore.hideSnackbar()">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-layout>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { formatRelativeTime } from '~/utils/formatters'

export default defineComponent({
  name: 'DefaultLayout',

  data () {
    return {
      bottomNav: 'dashboard'
    }
  },

  computed: {
    authStore () {
      return useAuthStore()
    },

    uiStore () {
      return useUIStore()
    },

    notificationsStore () {
      return useNotificationsStore()
    },

    user () {
      return this.authStore.user
    },

    pageTitle (): string {
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
        'admin-users': 'User Management'
      }

      const routeName = this.$route.name as string
      return routeTitles[routeName] || 'Financer'
    },

    showBackButton (): boolean {
      const pagesWithBackButton = ['accounts-create', 'loans-create', 'accounts-edit']
      const routeName = this.$route.name as string
      return pagesWithBackButton.includes(routeName)
    }
  },

  async mounted () {
    await this.notificationsStore.fetchNotifications()
    this.notificationsStore.subscribeToRealtime()
  },

  methods: {
    formatRelativeTime,

    logout () {
      this.authStore.logout()
    }
  }
})
</script>

<style scoped>
@media (min-width: 960px) {
  .hide-on-desktop {
    display: none !important;
  }
}
</style>
