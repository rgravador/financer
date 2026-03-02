<template>
  <v-container fluid class="wf-content-padding">
    <!-- Page Header -->
    <div class="wf-page-header">
      <h1>Officer Dashboard</h1>
      <p class="wf-page-subtitle">Manage your loan applications and pipeline</p>
    </div>

    <!-- Stat Cards -->
    <v-row class="wf-section-gap">
      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ stats?.myApplications || 0 }}</div>
            <div class="wf-stat-label">My Applications</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ stats?.draftCount || 0 }}</div>
            <div class="wf-stat-label">Draft</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ stats?.submittedCount || 0 }}</div>
            <div class="wf-stat-label">Submitted</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ stats?.approvedCount || 0 }}</div>
            <div class="wf-stat-label">Approved</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Recent Applications -->
    <v-card class="wf-section-card wf-section-gap">
      <v-card-title class="wf-section-title">Recent Applications</v-card-title>

      <v-table class="wf-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="app in recentApplications"
            :key="app.id"
            @click="$router.push(`/loans/applications/${app.id}`)"
          >
            <td><strong class="wf-app-id">#{{ app.id.slice(0, 6) }}</strong></td>
            <td>{{ app.borrower?.firstName }} {{ app.borrower?.lastName }}</td>
            <td class="wf-amount">{{ formatCurrency(app.loanDetails?.requestedAmount || 0) }}</td>
            <td>
              <span
                class="wf-status-badge"
                :class="getStatusClass(app.status)"
              >
                <span class="wf-status-dot"></span>
                {{ formatStatus(app.status) }}
              </span>
            </td>
            <td>{{ formatDate(app.createdAt) }}</td>
            <td>
              <a
                class="action-btn"
                @click.stop="$router.push(`/loans/applications/${app.id}`)"
              >
                View
              </a>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Quick Actions -->
    <v-row class="wf-section-gap">
      <v-col cols="12" md="6">
        <v-card class="wf-card quick-action-card" @click="$router.push('/loans/applications/new')">
          <v-card-text class="d-flex align-center gap-4">
            <v-icon size="48" color="primary">mdi-plus-circle</v-icon>
            <div>
              <div class="quick-action-title">New Application</div>
              <div class="quick-action-subtitle">Start a new loan application</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="wf-card quick-action-card" @click="$router.push('/loans/applications')">
          <v-card-text class="d-flex align-center gap-4">
            <v-icon size="48" color="primary">mdi-file-document-multiple</v-icon>
            <div>
              <div class="quick-action-title">View All Applications</div>
              <div class="quick-action-subtitle">Manage your application pipeline</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useLoansStore } from '~/stores/loans'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'default',
  middleware: ['role'],
  allowedRoles: ['tenant_officer', 'tenant_admin'],
})

interface OfficerStats {
  myApplications: number
  draftCount: number
  submittedCount: number
  approvedCount: number
}

const { authenticatedFetch } = useAuth()
const loansStore = useLoansStore()
const stats = ref<OfficerStats | null>(null)
const recentApplications = ref<any[]>([])

onMounted(async () => {
  await fetchStats()
  await fetchRecentApplications()
})

const fetchStats = async () => {
  try {
    const data = await authenticatedFetch<OfficerStats>('/api/officer/stats', {
      method: 'GET',
    })
    stats.value = data
  } catch (error) {
    console.error('Failed to fetch officer stats:', error)
  }
}

const fetchRecentApplications = async () => {
  await loansStore.fetchApplications({ page: 1, limit: 5 })
  recentApplications.value = loansStore.applications.slice(0, 5)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusClass = (status: string): string => {
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

const formatStatus = (status: string) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

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

.quick-action-card {
  cursor: pointer;
  transition: all 0.2s;
}

.quick-action-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.quick-action-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 4px;
}

.quick-action-subtitle {
  font-size: 14px;
  color: #6b7280;
}

.action-btn {
  color: #1e3a8a;
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  display: inline-block;
  cursor: pointer;
}

.action-btn:hover {
  background: #f0f4ff;
}
</style>
