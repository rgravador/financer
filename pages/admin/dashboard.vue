<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'default',
  middleware: ['role'],
  allowedRoles: ['tenant_admin'],
})

interface TenantStats {
  totalUsers: number
  activeLoans: number
  disbursedThisMonth: number
  pendingApprovals: number
  recentApplications: Array<{
    id: string
    applicantName: string
    requestedAmount: number
    status: string
    createdAt: Date
  }>
}

const { authenticatedFetch, user } = useAuth()
const router = useRouter()
const stats = ref<TenantStats | null>(null)
const loading = ref(false)

onMounted(async () => {
  await fetchStats()
})

const fetchStats = async () => {
  loading.value = true
  try {
    const data = await authenticatedFetch<TenantStats>('/api/tenant/stats', {
      method: 'GET',
    })
    stats.value = data
  } catch (error) {
    console.error('Failed to fetch tenant stats:', error)
  } finally {
    loading.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: Date) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: 'pending',
    submitted: 'review',
    under_review: 'review',
    pending_documents: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    disbursed: 'approved',
  }
  return statusMap[status] || 'pending'
}

const getStatusLabel = (status: string) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const navigateToApplication = (id: string) => {
  router.push(`/loans/applications/${id}`)
}
</script>

<template>
  <v-container fluid class="wf-content-padding">
    <!-- Page Header -->
    <div class="wf-page-header">
      <h1>Welcome back, {{ user?.firstName || 'Admin' }}</h1>
      <p class="wf-page-subtitle">{{ user?.tenantName || 'Organization' }} Dashboard</p>
    </div>

    <!-- Loading State -->
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      class="mx-auto d-block my-16"
    />

    <!-- Dashboard Content -->
    <template v-else-if="stats">
      <!-- Stat Cards Grid -->
      <v-row class="wf-section-gap">
        <v-col cols="12" sm="6" md="3">
          <v-card class="wf-stat-card">
            <v-card-text>
              <div class="wf-stat-value">{{ stats.totalUsers }}</div>
              <div class="wf-stat-label">Total Users</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="wf-stat-card">
            <v-card-text>
              <div class="wf-stat-value">{{ stats.activeLoans }}</div>
              <div class="wf-stat-label">Active Loans</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="wf-stat-card">
            <v-card-text>
              <div class="wf-stat-value">{{ formatCurrency(stats.disbursedThisMonth) }}</div>
              <div class="wf-stat-label">Disbursed This Month</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="wf-stat-card">
            <v-card-text>
              <div class="wf-stat-value">{{ stats.pendingApprovals }}</div>
              <div class="wf-stat-label">Pending Approvals</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Loan Applications -->
      <v-card class="wf-section-card wf-section-gap">
        <v-card-title class="wf-section-title">
          Recent Loan Applications
        </v-card-title>

        <v-table class="wf-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Client</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="app in stats.recentApplications"
              :key="app.id"
              @click="navigateToApplication(app.id)"
            >
              <td><strong class="wf-app-id">#{{ app.id.slice(0, 6) }}</strong></td>
              <td>{{ app.applicantName }}</td>
              <td class="wf-amount">{{ formatCurrency(app.requestedAmount) }}</td>
              <td>
                <span
                  class="wf-status-badge"
                  :class="getStatusClass(app.status)"
                >
                  <span class="wf-status-dot" />
                  {{ getStatusLabel(app.status) }}
                </span>
              </td>
              <td>{{ formatDate(app.createdAt) }}</td>
            </tr>
          </tbody>
        </v-table>

        <div v-if="stats.recentApplications.length === 0" class="wf-empty-state">
          <div class="empty-icon">
            <v-icon size="48" color="grey-lighten-2">mdi-file-document-outline</v-icon>
          </div>
          <div class="empty-title">No Applications Yet</div>
          <div class="empty-message">Recent applications will appear here once created</div>
        </div>
      </v-card>

      <!-- Bottom Grid -->
      <v-row class="wf-section-gap">
        <!-- Portfolio Performance -->
        <v-col cols="12" md="6">
          <v-card class="wf-card">
            <v-card-title class="wf-section-title">Portfolio Performance</v-card-title>
            <v-card-text>
              <div class="wf-chart-placeholder">
                <v-icon size="48" color="grey-lighten-2">mdi-chart-pie</v-icon>
                <div class="wf-chart-text">[Chart: Loans by Status]</div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Pending Tasks -->
        <v-col cols="12" md="6">
          <v-card class="wf-card">
            <v-card-title class="wf-section-title">Pending Tasks</v-card-title>
            <v-card-text>
              <v-list density="compact" class="wf-task-list">
                <v-list-item
                  v-for="i in 5"
                  :key="i"
                  class="wf-task-item"
                >
                  <template #prepend>
                    <v-checkbox-btn class="wf-task-checkbox" />
                  </template>
                  <v-list-item-title class="wf-task-text">
                    Task item {{ i }}
                  </v-list-item-title>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<style scoped>
.wf-stat-card {
  text-align: center;
  padding: 24px;
}

.wf-stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 8px;
}

.wf-stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.wf-chart-placeholder {
  height: 200px;
  background: linear-gradient(135deg, #f0f4ff 0%, #dbeafe 100%);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.wf-chart-text {
  color: #6b7280;
  font-style: italic;
  font-size: 14px;
}

.wf-task-list {
  background: transparent;
}

.wf-task-item {
  border-bottom: 1px solid #f3f4f6;
}

.wf-task-item:last-child {
  border-bottom: none;
}

.wf-task-checkbox {
  margin-right: 12px;
}

.wf-task-text {
  color: #374151;
  font-size: 14px;
}
</style>
