<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4">
              Dashboard
            </h1>
            <p class="text-subtitle-1 text-grey">
              Welcome back, {{ user?.full_name }}
            </p>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" to="/accounts/create">
            Add Account
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-grey">
                  Total Accounts
                </p>
                <h2 class="text-h4">
                  {{ accountsCount }}
                </h2>
              </div>
              <v-avatar color="primary" size="48">
                <v-icon size="28">
                  mdi-account-multiple
                </v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-grey">
                  Active Loans
                </p>
                <h2 class="text-h4">
                  {{ activeLoansCount }}
                </h2>
              </div>
              <v-avatar color="success" size="48">
                <v-icon size="28">
                  mdi-file-document
                </v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-grey">
                  Collectible Earnings
                </p>
                <h2 class="text-h5">
                  {{ formatCurrency(availableEarnings) }}
                </h2>
              </div>
              <v-avatar color="warning" size="48">
                <v-icon size="28">
                  mdi-currency-usd
                </v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex justify-space-between align-center">
              <div>
                <p class="text-caption text-grey">
                  Overdue Loans
                </p>
                <h2 class="text-h4">
                  {{ overdueLoansCount }}
                </h2>
              </div>
              <v-avatar color="error" size="48">
                <v-icon size="28">
                  mdi-alert-circle
                </v-icon>
              </v-avatar>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Notifications -->
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Recent Notifications</span>
            <v-btn size="small" variant="text" to="/notifications">
              View All
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-list v-if="notifications.length > 0">
            <v-list-item
              v-for="notification in recentNotifications"
              :key="notification.id"
              :class="{ 'bg-grey-lighten-4': !notification.is_read }"
            >
              <template #prepend>
                <v-icon :color="getNotificationColor(notification.type)">
                  {{ getNotificationIcon(notification.type) }}
                </v-icon>
              </template>

              <v-list-item-title>{{ notification.message }}</v-list-item-title>
              <v-list-item-subtitle>{{ formatRelativeTime(notification.timestamp) }}</v-list-item-subtitle>

              <template #append>
                <v-btn
                  v-if="!notification.is_read"
                  icon
                  size="small"
                  variant="text"
                  @click="markAsRead(notification.id)"
                >
                  <v-icon>mdi-check</v-icon>
                </v-btn>
              </template>
            </v-list-item>
          </v-list>

          <v-card-text v-else class="text-center text-grey">
            No notifications
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Recent Payments -->
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Recent Payments</span>
            <v-btn size="small" variant="text" to="/payments">
              View All
            </v-btn>
          </v-card-title>

          <v-divider />

          <v-list v-if="recentPayments.length > 0">
            <v-list-item
              v-for="payment in recentPayments"
              :key="payment.id"
            >
              <v-list-item-title>{{ formatCurrency(payment.amount) }}</v-list-item-title>
              <v-list-item-subtitle>{{ formatDate(payment.payment_date) }}</v-list-item-subtitle>

              <template #append>
                <v-chip size="small" color="success">
                  {{ payment.status }}
                </v-chip>
              </template>
            </v-list-item>
          </v-list>

          <v-card-text v-else class="text-center text-grey">
            No recent payments
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Quick Actions -->
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-title>Quick Actions</v-card-title>

          <v-card-text>
            <v-row>
              <v-col cols="6" sm="3">
                <v-btn block color="primary" to="/accounts/create" prepend-icon="mdi-account-plus">
                  Add Account
                </v-btn>
              </v-col>
              <v-col cols="6" sm="3">
                <v-btn block color="success" to="/loans/create" prepend-icon="mdi-file-document-plus">
                  Create Loan
                </v-btn>
              </v-col>
              <v-col cols="6" sm="3">
                <v-btn block color="warning" to="/payments/create" prepend-icon="mdi-cash-plus">
                  Record Payment
                </v-btn>
              </v-col>
              <v-col cols="6" sm="3">
                <v-btn block color="info" to="/cashouts" prepend-icon="mdi-cash-check">
                  Request Cashout
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
// import { formatCurrency, formatDate, formatRelativeTime } from '~/utils/formatters'
import { NOTIFICATION_COLORS, NOTIFICATION_ICONS } from '~/utils/constants'

definePageMeta({
  middleware: 'auth'
})

const { user } = useAuth()
const accountsStore = useAccounts()
const { accounts, fetchAccounts: fetchAccountsData } = accountsStore
const loansStore = useLoans()
const { loans, fetchLoans: fetchLoansData } = loansStore
const paymentsStore = usePayments()
const { payments, fetchPayments: fetchPaymentsData } = paymentsStore
const earningsStore = useEarnings()
const { availableEarnings, fetchEarnings: fetchEarningsData } = earningsStore
const notificationsStore = useNotifications()
const { notifications, recentNotifications, fetchNotifications: fetchNotificationsData, markAsRead } = notificationsStore

// Vetur workaround - these are used in template
void user
void accounts
void loans
void payments
void availableEarnings
void notifications
void recentNotifications
void markAsRead

// Computed properties for template
const activeLoansCount = computed(() => loans.value.filter((l: any) => l.status === 'active').length)
const overdueLoansCount = computed(() => loans.value.filter((l: any) => l.status === 'active' && new Date(l.end_date) < new Date()).length)
const accountsCount = computed(() => accounts.value.length)
const recentPayments = computed(() => payments.value.slice(0, 5))

// Fetch data on mount
onMounted(async () => {
  await Promise.all([
    fetchAccountsData(),
    fetchLoansData(),
    fetchPaymentsData(),
    fetchEarningsData(),
    fetchNotificationsData()
  ])
})

const getNotificationColor = (type: string) => {
  return NOTIFICATION_COLORS[type as keyof typeof NOTIFICATION_COLORS] || 'grey'
}

const getNotificationIcon = (type: string) => {
  return NOTIFICATION_ICONS[type as keyof typeof NOTIFICATION_ICONS] || 'mdi-bell'
}
</script>
