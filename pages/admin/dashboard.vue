<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatCard from '~/components/shared/StatCard.vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'default',
  middleware: ['role'],
  allowedRoles: ['tenant_admin'],
})

interface TenantStats {
  totalApplications: number
  applicationsByStatus: Record<string, number>
  totalOfficers: number
  totalApprovers: number
  pendingApprovalCount: number
  approvedThisMonth: number
  rejectedThisMonth: number
  totalDisbursedAmount: number
  recentApplications: Array<{
    id: string
    applicantName: string
    loanType: string
    requestedAmount: number
    status: string
    createdAt: Date
  }>
}

const { authenticatedFetch } = useAuth()
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

const totalTeamMembers = computed(() => {
  if (!stats.value) return 0
  return stats.value.totalOfficers + stats.value.totalApprovers
})
</script>

<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <h1>Organization Dashboard</h1>
      <p class="subtitle">Overview and key metrics for your organization</p>
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
          label="Total Applications"
          :value="stats.totalApplications"
          subtext="All time"
          color="#3b82f6"
          icon="📄"
        />

        <StatCard
          label="Pending Approval"
          :value="stats.pendingApprovalCount"
          subtext="Needs review"
          color="#f59e0b"
          icon="⏳"
        />

        <StatCard
          label="Approved This Month"
          :value="stats.approvedThisMonth"
          :subtext="`${stats.rejectedThisMonth} rejected`"
          color="#10b981"
          icon="✓"
        />

        <StatCard
          label="Team Members"
          :value="totalTeamMembers"
          :subtext="`${stats.totalOfficers} officers, ${stats.totalApprovers} approvers`"
          color="#8b5cf6"
          icon="👥"
        />
      </div>

      <!-- Quick Links -->
      <div class="quick-links">
        <NuxtLink to="/admin/users" class="quick-link-card">
          <div class="quick-link-icon">👥</div>
          <div class="quick-link-content">
            <h3>Manage Users</h3>
            <p>Add, edit, or deactivate team members</p>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/loan-types" class="quick-link-card">
          <div class="quick-link-icon">📋</div>
          <div class="quick-link-content">
            <h3>Manage Loan Types</h3>
            <p>Configure available loan products</p>
          </div>
        </NuxtLink>

        <NuxtLink to="/admin/audit-logs" class="quick-link-card">
          <div class="quick-link-icon">📊</div>
          <div class="quick-link-content">
            <h3>Audit Logs</h3>
            <p>View organization activity trail</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Application Status Breakdown -->
      <div class="section-card">
        <h2>Applications by Status</h2>
        <div class="status-breakdown">
          <div
            v-for="(count, status) in stats.applicationsByStatus"
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
                  width: `${(count / stats.totalApplications) * 100}%`,
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
          <NuxtLink to="/officer/applications" class="view-all-link">
            View All →
          </NuxtLink>
        </div>

        <div v-if="stats.recentApplications.length > 0" class="table-container">
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
                v-for="app in stats.recentApplications"
                :key="app.id"
                class="table-row"
                @click="navigateTo(`/officer/applications/${app.id}`)"
              >
                <td class="applicant-name">{{ app.applicantName }}</td>
                <td>{{ app.loanType }}</td>
                <td class="amount-cell">{{ formatCurrency(app.requestedAmount) }}</td>
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
          No applications yet
        </div>
      </div>

      <!-- Disbursed Amount Card -->
      <div class="section-card disbursed-card">
        <h2>Total Disbursed</h2>
        <div class="disbursed-amount">{{ formatCurrency(stats.totalDisbursedAmount) }}</div>
        <p class="disbursed-subtext">Lifetime total across all loans</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.admin-dashboard {
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

.quick-links {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.quick-link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.2s;
}

.quick-link-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: #3b82f6;
}

.quick-link-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.quick-link-content h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
}

.quick-link-content p {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
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

.view-all-link {
  font-size: 14px;
  font-weight: 500;
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: #2563eb;
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
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.disbursed-card {
  text-align: center;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  border: none;
}

.disbursed-card h2 {
  color: white;
  opacity: 0.9;
}

.disbursed-amount {
  font-size: 48px;
  font-weight: 700;
  margin: 16px 0;
}

.disbursed-subtext {
  margin: 0;
  font-size: 14px;
  opacity: 0.9;
}
</style>
