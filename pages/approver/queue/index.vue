<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useLoansStore } from '~/stores/loans'
import type { LoanApplication } from '~/types'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const loansStore = useLoansStore()

const selectedTab = ref<'all' | 'submitted' | 'under_review' | 'pending_documents'>('all')

const tabs = [
  { key: 'all', label: 'All', status: undefined },
  { key: 'submitted', label: 'Submitted', status: 'submitted' },
  { key: 'under_review', label: 'Under Review', status: 'under_review' },
  { key: 'pending_documents', label: 'Pending Documents', status: 'pending_documents' },
]

onMounted(async () => {
  await fetchQueue()
})

const fetchQueue = async () => {
  const status = tabs.find((tab) => tab.key === selectedTab.value)?.status
  await loansStore.fetchQueue({ status, page: 1, limit: 50 })
}

const handleTabChange = async (tabKey: string) => {
  selectedTab.value = tabKey as typeof selectedTab.value
  await fetchQueue()
}

const handleRowClick = (application: LoanApplication) => {
  navigateTo(`/approver/queue/${application.id}`)
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted':
      return '#3b82f6'
    case 'under_review':
      return '#f59e0b'
    case 'pending_documents':
      return '#8b5cf6'
    case 'approved':
      return '#10b981'
    case 'rejected':
      return '#ef4444'
    default:
      return '#6b7280'
  }
}

const getStatusLabel = (status: string) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getRateVarianceColor = (variance: number) => {
  if (Math.abs(variance) < 0.5) return '#10b981'
  if (Math.abs(variance) < 1.5) return '#f59e0b'
  return '#ef4444'
}

const filteredApplications = computed(() => {
  return loansStore.applications || []
})
</script>

<template>
  <div class="queue-page">
    <div class="page-header">
      <h1>Approval Queue</h1>
      <p class="subtitle">Review and process loan applications</p>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="tab"
        :class="{ active: selectedTab === tab.key }"
        @click="handleTabChange(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loansStore.loading" class="loading-state">
      <div class="spinner" />
      <p>Loading applications...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredApplications.length === 0" class="empty-state">
      <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3>No applications found</h3>
      <p>There are no applications in this queue at the moment.</p>
    </div>

    <!-- Applications Table -->
    <div v-else class="table-container">
      <table class="applications-table">
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Loan Type</th>
            <th>Amount</th>
            <th>Suggested Rate</th>
            <th>Rate Variance</th>
            <th>Documents</th>
            <th>Submitted</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="app in filteredApplications"
            :key="app.id"
            class="application-row"
            @click="handleRowClick(app)"
          >
            <td class="applicant-cell">
              <div class="applicant-name">{{ app.applicantName || 'N/A' }}</div>
            </td>
            <td>{{ app.loanTypeName || 'N/A' }}</td>
            <td class="amount-cell">{{ formatCurrency(app.loanDetails.requestedAmount) }}</td>
            <td class="rate-cell">{{ app.suggestedRate?.toFixed(2) }}%</td>
            <td class="variance-cell">
              <span
                class="variance-badge"
                :style="{ color: getRateVarianceColor(app.rateVariance || 0) }"
              >
                {{ app.rateVariance > 0 ? '+' : '' }}{{ app.rateVariance?.toFixed(2) }}%
              </span>
            </td>
            <td class="documents-cell">
              <span class="documents-count">{{ app.documentsCount || 0 }}</span>
            </td>
            <td class="date-cell">{{ formatDate(app.submittedAt || app.createdAt) }}</td>
            <td>
              <span
                class="status-badge"
                :style="{ backgroundColor: getStatusColor(app.status) }"
              >
                {{ getStatusLabel(app.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="loansStore.pagination.totalPages > 1" class="pagination">
      <button
        class="pagination-button"
        :disabled="loansStore.pagination.page === 1"
        @click="() => fetchQueue()"
      >
        Previous
      </button>
      <span class="pagination-info">
        Page {{ loansStore.pagination.page }} of {{ loansStore.pagination.totalPages }}
      </span>
      <button
        class="pagination-button"
        :disabled="loansStore.pagination.page === loansStore.pagination.totalPages"
        @click="() => fetchQueue()"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.queue-page {
  padding: 32px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.subtitle {
  margin: 0;
  font-size: 16px;
  color: #6b7280;
}

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 0;
}

.tab {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 3px solid transparent;
  color: #6b7280;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
}

.tab:hover {
  color: #111827;
}

.tab.active {
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.table-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.applications-table {
  width: 100%;
  border-collapse: collapse;
}

.applications-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.applications-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.applications-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.applications-table tbody tr:hover {
  background-color: #f9fafb;
}

.applications-table tbody tr:last-child {
  border-bottom: none;
}

.applications-table td {
  padding: 16px;
  font-size: 14px;
  color: #111827;
}

.applicant-cell {
  font-weight: 600;
}

.applicant-name {
  color: #111827;
}

.amount-cell {
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
}

.rate-cell {
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
}

.variance-cell {
  font-weight: 600;
}

.variance-badge {
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  font-weight: 700;
}

.documents-cell {
  text-align: center;
}

.documents-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  background: #f3f4f6;
  border-radius: 14px;
  font-weight: 600;
  font-size: 13px;
}

.date-cell {
  color: #6b7280;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  text-transform: capitalize;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination-button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}
</style>
