<template>
  <v-container fluid class="wf-content-padding">
    <!-- Page Header -->
    <div class="wf-page-header">
      <h1>Approver Dashboard</h1>
      <p class="wf-page-subtitle">Review and approve loan applications</p>
    </div>

    <!-- Stat Cards -->
    <v-row class="wf-section-gap">
      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ stats?.pendingApproval || 0 }}</div>
            <div class="wf-stat-label">Pending Approval</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ stats?.approvedToday || 0 }}</div>
            <div class="wf-stat-label">Approved Today</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ stats?.rejectedToday || 0 }}</div>
            <div class="wf-stat-label">Rejected Today</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ stats?.totalReviewed || 0 }}</div>
            <div class="wf-stat-label">Total Reviewed</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Pending Review Queue -->
    <v-card class="wf-section-card wf-section-gap">
      <v-card-title class="wf-section-title">Pending Review Queue</v-card-title>

      <v-table class="wf-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Loan Type</th>
            <th>Amount</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="app in pendingApplications"
            :key="app.id"
            @click="$router.push(`/approver/queue/${app.id}`)"
          >
            <td><strong class="wf-app-id">#{{ app.id.slice(0, 6) }}</strong></td>
            <td>
              <div>
                <strong>{{ app.borrower?.firstName }} {{ app.borrower?.lastName }}</strong>
                <div v-if="app.borrower?.email" class="wf-table-subtext">
                  {{ app.borrower.email }}
                </div>
              </div>
            </td>
            <td>{{ app.loanType?.name || 'N/A' }}</td>
            <td class="wf-amount">{{ formatCurrency(app.loanDetails?.requestedAmount || 0) }}</td>
            <td>{{ formatDate(app.submittedAt || app.createdAt) }}</td>
            <td>
              <a
                class="action-btn"
                @click.stop="$router.push(`/approver/queue/${app.id}`)"
              >
                Review
              </a>
            </td>
          </tr>
          <tr v-if="pendingApplications.length === 0">
            <td colspan="6" class="text-center pa-8">
              <div class="wf-empty-state">
                <v-icon class="empty-icon">mdi-check-circle-outline</v-icon>
                <div class="empty-title">No pending applications</div>
                <div class="empty-message">All applications have been reviewed</div>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-card>

    <!-- Quick Actions -->
    <v-row class="wf-section-gap">
      <v-col cols="12" md="6">
        <v-card class="wf-card quick-action-card" @click="$router.push('/approver/queue')">
          <v-card-text class="d-flex align-center gap-4">
            <v-icon size="48" color="primary">mdi-clipboard-list</v-icon>
            <div>
              <div class="quick-action-title">Review Queue</div>
              <div class="quick-action-subtitle">View all pending applications</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card class="wf-card quick-action-card" @click="$router.push('/admin/audit-logs')">
          <v-card-text class="d-flex align-center gap-4">
            <v-icon size="48" color="primary">mdi-history</v-icon>
            <div>
              <div class="quick-action-title">Approval History</div>
              <div class="quick-action-subtitle">View your approval activity</div>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'default',
  middleware: ['role'],
  allowedRoles: ['tenant_approver', 'tenant_admin'],
})

interface ApproverStats {
  pendingApproval: number
  approvedToday: number
  rejectedToday: number
  totalReviewed: number
}

const { authenticatedFetch } = useAuth()
const stats = ref<ApproverStats | null>(null)
const pendingApplications = ref<any[]>([])

onMounted(async () => {
  await fetchStats()
  await fetchPendingApplications()
})

const fetchStats = async () => {
  try {
    const data = await authenticatedFetch<ApproverStats>('/api/approver/stats', {
      method: 'GET',
    })
    stats.value = data
  } catch (error) {
    console.error('Failed to fetch approver stats:', error)
  }
}

const fetchPendingApplications = async () => {
  try {
    const response = await authenticatedFetch<{ applications: any[] }>('/api/approver/queue', {
      method: 'GET',
      query: { limit: 10 },
    })
    pendingApplications.value = response.applications || []
  } catch (error) {
    console.error('Failed to fetch pending applications:', error)
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string | Date | undefined) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
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

.wf-table-subtext {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
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
