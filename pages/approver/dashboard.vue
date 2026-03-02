<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatCard from '~/components/shared/StatCard.vue'
import { useLoansStore } from '~/stores/loans'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'default',
  middleware: ['role'],
  allowedRoles: ['tenant_approver', 'tenant_admin'],
})

interface ApproverStats {
  queueCount: number
  reviewedToday: number
  approvedTotal: number
  rejectedTotal: number
  avgProcessingTime: number
  pendingDocumentsCount: number
}

const { authenticatedFetch } = useAuth()
const stats = ref<ApproverStats | null>(null)
const loansStore = useLoansStore()
const loading = ref(false)

onMounted(async () => {
  await fetchStats()
  await fetchQueuePreview()
})

const fetchStats = async () => {
  loading.value = true
  try {
    const data = await authenticatedFetch<ApproverStats>('/api/approver/stats', {
      method: 'GET',
    })

    stats.value = data
  } catch (error) {
    console.error('Failed to fetch approver stats:', error)
  } finally {
    loading.value = false
  }
}

const fetchQueuePreview = async () => {
  await loansStore.fetchQueue({ page: 1, limit: 5 })
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
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

const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted':
      return '#3b82f6'
    case 'under_review':
      return '#f59e0b'
    case 'pending_documents':
      return '#8b5cf6'
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
</script>

<template>
  <div class="approver-dashboard">
    <div class="page-header">
      <h1>Approver Dashboard</h1>
      <p class="subtitle">Your review queue and performance metrics</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
      <p>Loading dashboard...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="stats" class="dashboard-content">
      <!-- Stat Cards -->
      <div class="stats-grid">
        <StatCard
          label="In Queue"
          :value="stats.queueCount"
          subtext="Awaiting review"
          color="#f59e0b"
          icon="⏳"
        />

        <StatCard
          label="Reviewed Today"
          :value="stats.reviewedToday"
          subtext="Decisions made"
          color="#3b82f6"
          icon="✓"
        />

        <StatCard
          label="Total Approved"
          :value="stats.approvedTotal"
          subtext="All time"
          color="#10b981"
          icon="✓"
        />

        <StatCard
          label="Pending Documents"
          :value="stats.pendingDocumentsCount"
          subtext="Awaiting uploads"
          color="#8b5cf6"
          icon="📄"
        />
      </div>

      <!-- Processing Time Card -->
      <div class="section-card processing-card">
        <h2>Average Processing Time</h2>
        <div class="processing-time">
          {{ stats.avgProcessingTime }}
          <span class="time-unit">hours</span>
        </div>
        <p class="processing-subtext">From submission to decision</p>
      </div>

      <!-- Queue Preview -->
      <div class="section-card">
        <div class="section-header">
          <h2>Queue Preview</h2>
          <button class="go-to-queue-button" @click="navigateTo('/approver/queue')">
            Go to Full Queue →
          </button>
        </div>

        <div v-if="loansStore.applications.length > 0" class="table-container">
          <table class="queue-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Loan Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="app in loansStore.applications"
                :key="app.id"
                class="table-row"
                @click="navigateTo(`/approver/queue/${app.id}`)"
              >
                <td class="applicant-name">{{ app.applicantName || 'N/A' }}</td>
                <td>{{ app.loanTypeName || 'N/A' }}</td>
                <td class="amount-cell">{{ formatCurrency(app.loanDetails.requestedAmount) }}</td>
                <td>
                  <span
                    class="status-badge"
                    :style="{ backgroundColor: getStatusColor(app.status) }"
                  >
                    {{ getStatusLabel(app.status) }}
                  </span>
                </td>
                <td class="date-cell">{{ formatDate(app.submittedAt || app.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">
          <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No applications in queue</p>
        </div>
      </div>

      <!-- Performance Summary -->
      <div class="performance-grid">
        <div class="performance-card">
          <h3>Approval Rate</h3>
          <div class="performance-value">
            {{ stats.approvedTotal + stats.rejectedTotal > 0
              ? Math.round((stats.approvedTotal / (stats.approvedTotal + stats.rejectedTotal)) * 100)
              : 0 }}%
          </div>
        </div>

        <div class="performance-card">
          <h3>Total Decisions</h3>
          <div class="performance-value">
            {{ stats.approvedTotal + stats.rejectedTotal }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.approver-dashboard {
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

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
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

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.section-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.section-card h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.go-to-queue-button {
  padding: 10px 20px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.go-to-queue-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.processing-card {
  text-align: center;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
}

.processing-card h2 {
  color: white;
  opacity: 0.9;
}

.processing-time {
  font-size: 56px;
  font-weight: 700;
  margin: 16px 0;
}

.time-unit {
  font-size: 24px;
  font-weight: 400;
  margin-left: 8px;
}

.processing-subtext {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}

.table-container {
  overflow-x: auto;
}

.queue-table {
  width: 100%;
  border-collapse: collapse;
}

.queue-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.queue-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.queue-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.queue-table tbody tr:hover {
  background-color: #f9fafb;
}

.queue-table tbody tr:last-child {
  border-bottom: none;
}

.queue-table td {
  padding: 16px;
  font-size: 14px;
  color: #111827;
}

.applicant-name {
  font-weight: 600;
}

.amount-cell {
  font-weight: 600;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.date-cell {
  color: #6b7280;
  font-size: 13px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 12px;
}

.empty-state p {
  margin: 0;
  font-size: 14px;
  color: #9ca3af;
}

.performance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.performance-card {
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-align: center;
}

.performance-card h3 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.performance-value {
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}
</style>
