<template>
  <v-container fluid class="wf-content-padding">
    <!-- Page Header -->
    <div class="wf-page-header">
      <h1>Approval Queue</h1>
      <p class="wf-page-subtitle">Review and process loan applications</p>
    </div>

    <!-- Tabs -->
    <v-card class="wf-section-card mb-6">
      <v-tabs v-model="selectedTab" @update:model-value="handleTabChange">
        <v-tab v-for="tab in tabs" :key="tab.key" :value="tab.key">
          {{ tab.label }}
        </v-tab>
      </v-tabs>
    </v-card>

    <!-- Loading State -->
    <v-progress-circular
      v-if="loansStore.loading"
      indeterminate
      color="primary"
      class="mx-auto d-block my-16"
    />

    <!-- Applications Table -->
    <v-card v-else-if="filteredApplications.length > 0" class="wf-section-card">
      <v-table class="wf-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Applicant</th>
            <th>Loan Type</th>
            <th>Amount</th>
            <th>Suggested Rate</th>
            <th>Rate Variance</th>
            <th>Documents</th>
            <th>Submitted</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="app in filteredApplications"
            :key="app.id"
            @click="handleRowClick(app)"
          >
            <td><strong class="wf-app-id">#{{ app.id.slice(0, 6) }}</strong></td>
            <td>
              <div>
                <strong>{{ app.applicantName || 'N/A' }}</strong>
              </div>
            </td>
            <td>{{ app.loanTypeName || 'N/A' }}</td>
            <td class="wf-amount">{{ formatCurrency(app.loanDetails.requestedAmount) }}</td>
            <td>
              <span class="rate-value">{{ app.suggestedRate?.toFixed(2) }}%</span>
            </td>
            <td>
              <span class="variance-badge" :class="getVarianceClass(app.rateVariance || 0)">
                {{ app.rateVariance > 0 ? '+' : '' }}{{ app.rateVariance?.toFixed(2) }}%
              </span>
            </td>
            <td class="text-center">
              <v-chip size="small" color="grey-lighten-2">
                {{ app.documentsCount || 0 }}
              </v-chip>
            </td>
            <td>{{ formatDate(app.submittedAt || app.createdAt) }}</td>
            <td>
              <span class="wf-status-badge" :class="getStatusClass(app.status)">
                <span class="wf-status-dot"></span>
                {{ getStatusLabel(app.status) }}
              </span>
            </td>
            <td>
              <a class="action-btn" @click.stop="handleRowClick(app)">
                Review
              </a>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Pagination -->
      <div class="wf-pagination" v-if="loansStore.pagination.totalPages > 1">
        <button
          class="wf-pagination-btn"
          :disabled="loansStore.pagination.page === 1"
          @click="fetchQueue(loansStore.pagination.page - 1)"
        >
          ← Previous
        </button>
        <span class="wf-pagination-info">
          Page {{ loansStore.pagination.page }} of {{ loansStore.pagination.totalPages }}
        </span>
        <button
          class="wf-pagination-btn"
          :disabled="loansStore.pagination.page === loansStore.pagination.totalPages"
          @click="fetchQueue(loansStore.pagination.page + 1)"
        >
          Next →
        </button>
      </div>
    </v-card>

    <!-- Empty State -->
    <v-card v-else class="wf-section-card">
      <div class="wf-empty-state pa-16">
        <v-icon class="empty-icon" size="64">mdi-clipboard-check-outline</v-icon>
        <div class="empty-title">No applications found</div>
        <div class="empty-message">There are no applications in this queue at the moment</div>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useLoansStore } from '~/stores/loans'
import type { LoanApplication } from '~/types'

definePageMeta({
  layout: 'default',
  middleware: ['role'],
  allowedRoles: ['tenant_approver', 'tenant_admin'],
})

const loansStore = useLoansStore()
const selectedTab = ref('all')

const tabs = [
  { key: 'all', label: 'All', status: undefined },
  { key: 'submitted', label: 'Submitted', status: 'submitted' },
  { key: 'under_review', label: 'Under Review', status: 'under_review' },
  { key: 'pending_documents', label: 'Pending Documents', status: 'pending_documents' },
]

onMounted(async () => {
  await fetchQueue()
})

const fetchQueue = async (page = 1) => {
  const status = tabs.find((tab) => tab.key === selectedTab.value)?.status
  await loansStore.fetchQueue({ status, page, limit: 50 })
}

const handleTabChange = async (tabKey: string) => {
  selectedTab.value = tabKey
  await fetchQueue()
}

const handleRowClick = (application: LoanApplication) => {
  navigateTo(`/approver/queue/${application.id}`)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
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

const getStatusLabel = (status: string) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getVarianceClass = (variance: number): string => {
  const absVariance = Math.abs(variance)
  if (absVariance < 0.5) return 'variance-low'
  if (absVariance < 1.5) return 'variance-medium'
  return 'variance-high'
}

const filteredApplications = computed(() => {
  return loansStore.applications || []
})
</script>

<style scoped>
.rate-value {
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  color: #374151;
}

.variance-badge {
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  font-weight: 700;
  font-size: 13px;
  padding: 4px 8px;
  border-radius: 4px;
}

.variance-low {
  background: #d1fae5;
  color: #065f46;
}

.variance-medium {
  background: #fef3c7;
  color: #92400e;
}

.variance-high {
  background: #fee2e2;
  color: #991b1b;
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
