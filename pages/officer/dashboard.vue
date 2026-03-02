<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatCard from '~/components/shared/StatCard.vue'
import { useLoansStore } from '~/stores/loans'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'default',
  middleware: ['role'],
  allowedRoles: ['tenant_officer', 'tenant_admin'],
})

interface OfficerStats {
  myApplications: number
  myApplicationsByStatus: Record<string, number>
  draftCount: number
  submittedCount: number
  approvedCount: number
}

const { authenticatedFetch } = useAuth()
const stats = ref<OfficerStats | null>(null)
const loansStore = useLoansStore()
const loading = ref(false)

onMounted(async () => {
  await fetchStats()
  await fetchRecentApplications()
})

const fetchStats = async () => {
  loading.value = true
  try {
    const data = await authenticatedFetch<OfficerStats>('/api/officer/stats', {
      method: 'GET',
    })

    stats.value = data
  } catch (error) {
    console.error('Failed to fetch officer stats:', error)
  } finally {
    loading.value = false
  }
}

const fetchRecentApplications = async () => {
  await loansStore.fetchApplications({ page: 1, limit: 5 })
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
    case 'draft':
      return '#6b7280'
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
    case 'disbursed':
      return '#059669'
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
  <div class="officer-dashboard">
    <div class="page-header">
      <h1>My Dashboard</h1>
      <p class="subtitle">Your loan applications and performance</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
      <p>Loading dashboard...</p>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="stats" class="dashboard-content">
      <!-- New Application Button -->
      <div class="action-banner">
        <div class="banner-content">
          <h2>Ready to help a customer?</h2>
          <p>Start a new loan application</p>
        </div>
        <button class="new-application-button" @click="navigateTo('/officer/applications/new')">
          + New Application
        </button>
      </div>

      <!-- Stat Cards -->
      <div class="stats-grid">
        <StatCard
          label="My Applications"
          :value="stats.myApplications"
          subtext="Total managed"
          color="#3b82f6"
          icon="📄"
        />

        <StatCard
          label="Drafts"
          :value="stats.draftCount"
          subtext="In progress"
          color="#6b7280"
          icon="✏️"
        />

        <StatCard
          label="Submitted"
          :value="stats.submittedCount"
          subtext="Under review"
          color="#f59e0b"
          icon="⏳"
        />

        <StatCard
          label="Approved"
          :value="stats.approvedCount"
          subtext="Success rate"
          color="#10b981"
          icon="✓"
        />
      </div>

      <!-- Applications by Status -->
      <div class="section-card">
        <h2>Applications by Status</h2>
        <div class="status-breakdown">
          <div
            v-for="(count, status) in stats.myApplicationsByStatus"
            :key="status"
            class="status-bar-item"
          >
            <div class="status-info">
              <span class="status-label">{{ getStatusLabel(status) }}</span>
              <span class="status-count">{{ count }}</span>
            </div>
            <div class="status-bar-track">
              <div
                class="status-bar-fill"
                :style="{
                  width: `${(count / stats.myApplications) * 100}%`,
                  backgroundColor: getStatusColor(status),
                }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Applications -->
      <div class="section-card">
        <div class="section-header">
          <h2>Recent Applications</h2>
          <button class="view-all-button" @click="navigateTo('/officer/applications')">
            View All →
          </button>
        </div>

        <div v-if="loansStore.applications.length > 0" class="table-container">
          <table class="applications-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Loan Type</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="app in loansStore.applications"
                :key="app.id"
                class="table-row"
                @click="navigateTo(`/officer/applications/${app.id}`)"
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
                <td class="date-cell">{{ formatDate(app.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">
          <svg class="empty-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p>No applications yet</p>
          <button class="create-first-button" @click="navigateTo('/officer/applications/new')">
            Create Your First Application
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.officer-dashboard {
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

.action-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 12px;
  color: white;
  gap: 24px;
}

.banner-content h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
}

.banner-content p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.new-application-button {
  padding: 16px 32px;
  background: white;
  color: #3b82f6;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.new-application-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
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
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.view-all-button {
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

.view-all-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}

.status-breakdown {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-bar-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.status-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.status-count {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.status-bar-track {
  height: 8px;
  background: #f3f4f6;
  border-radius: 4px;
  overflow: hidden;
}

.status-bar-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 4px;
}

.table-container {
  overflow-x: auto;
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
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #9ca3af;
}

.create-first-button {
  padding: 12px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.create-first-button:hover {
  background: #2563eb;
  transform: translateY(-1px);
}
</style>
