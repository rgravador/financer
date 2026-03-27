<template>
  <div class="tenant-dashboard">
    <!-- Page Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Monitor your lending operations and track performance metrics.</p>
        </div>
        <div class="header-actions">
          <v-btn
            variant="outlined"
            color="primary"
            prepend-icon="mdi-refresh"
            size="large"
            :loading="loading"
            @click="refreshData"
          >
            Refresh
          </v-btn>
        </div>
      </div>
    </header>

    <!-- Loading State -->
    <div v-if="loading && !stats" class="loading-state">
      <div class="loading-content">
        <v-progress-circular indeterminate color="primary" size="64" width="5" />
        <p class="loading-text">Loading your dashboard...</p>
      </div>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="error"
      type="error"
      variant="tonal"
      class="error-alert"
      closable
      @click:close="clearError"
    >
      <template #title>Unable to load dashboard</template>
      {{ error }}
    </v-alert>

    <!-- Empty State -->
    <div v-else-if="stats && isNewTenant" class="empty-state">
      <div class="empty-content">
        <div class="empty-icon">
          <v-icon size="80" color="primary">mdi-rocket-launch-outline</v-icon>
        </div>
        <h2 class="empty-title">Welcome to your Dashboard!</h2>
        <p class="empty-text">
          You're all set up. Start by adding your team members and configuring loan products.
        </p>
        <div class="empty-actions">
          <v-btn color="primary" size="large" to="/tenant/users" prepend-icon="mdi-account-plus">
            Add Team Members
          </v-btn>
          <v-btn variant="outlined" color="primary" size="large" to="/tenant/loan-types" prepend-icon="mdi-file-document-plus">
            Configure Loan Types
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Dashboard Content -->
    <div v-else-if="stats" class="dashboard-content">
      <!-- KPI Cards -->
      <section class="kpi-section">
        <div class="kpi-grid">
          <!-- Active Loans -->
          <article class="kpi-card kpi-primary">
            <div class="kpi-icon-wrapper">
              <v-icon size="32">mdi-file-document-multiple</v-icon>
            </div>
            <div class="kpi-body">
              <span class="kpi-value">{{ formatNumber(activeLoans) }}</span>
              <span class="kpi-label">Active Loans</span>
            </div>
            <div class="kpi-footer">
              <div class="kpi-trend trend-neutral">
                <v-icon size="16">mdi-minus</v-icon>
                <span>Current</span>
              </div>
            </div>
          </article>

          <!-- Pending Approvals -->
          <article class="kpi-card kpi-warning">
            <div class="kpi-icon-wrapper">
              <v-icon size="32">mdi-clock-alert-outline</v-icon>
            </div>
            <div class="kpi-body">
              <span class="kpi-value">{{ stats.pendingApprovalCount }}</span>
              <span class="kpi-label">Pending Approvals</span>
            </div>
            <div class="kpi-footer">
              <v-btn
                v-if="stats.pendingApprovalCount > 0"
                variant="text"
                size="small"
                color="warning"
                class="kpi-action"
              >
                Review Now
                <v-icon size="16" end>mdi-arrow-right</v-icon>
              </v-btn>
            </div>
          </article>

          <!-- Total Disbursed -->
          <article class="kpi-card kpi-success">
            <div class="kpi-icon-wrapper">
              <v-icon size="32">mdi-cash-multiple</v-icon>
            </div>
            <div class="kpi-body">
              <span class="kpi-value">{{ formatCurrency(stats.totalDisbursedAmount) }}</span>
              <span class="kpi-label">Total Disbursed</span>
            </div>
            <div class="kpi-footer">
              <div class="kpi-trend trend-up">
                <v-icon size="16">mdi-trending-up</v-icon>
                <span>All time</span>
              </div>
            </div>
          </article>

          <!-- Approval Rate -->
          <article class="kpi-card kpi-info">
            <div class="kpi-icon-wrapper">
              <v-icon size="32">mdi-chart-arc</v-icon>
            </div>
            <div class="kpi-body">
              <span class="kpi-value">{{ approvalRate }}%</span>
              <span class="kpi-label">Approval Rate</span>
            </div>
            <div class="kpi-footer">
              <span class="kpi-note">This month</span>
            </div>
          </article>
        </div>
      </section>

      <!-- Main Content Grid -->
      <section class="main-content">
        <div class="content-grid">
          <!-- Recent Applications -->
          <article class="content-card applications-card">
            <header class="card-header">
              <div class="card-title-group">
                <v-icon color="primary" size="28">mdi-file-document-outline</v-icon>
                <h2 class="card-title">Recent Applications</h2>
              </div>
              <v-btn
                variant="text"
                color="primary"
                size="small"
                append-icon="mdi-arrow-right"
              >
                View All
              </v-btn>
            </header>

            <!-- Empty Applications -->
            <div v-if="!stats.recentApplications?.length" class="card-empty">
              <v-icon size="48" color="grey-lighten-1">mdi-file-document-outline</v-icon>
              <p>No loan applications yet</p>
            </div>

            <!-- Applications List -->
            <div v-else class="applications-list">
              <div
                v-for="app in stats.recentApplications"
                :key="app.id"
                class="application-item"
              >
                <div class="app-avatar">
                  {{ getInitials(app.applicantName) }}
                </div>
                <div class="app-details">
                  <div class="app-name">{{ app.applicantName }}</div>
                  <div class="app-meta">
                    <span class="app-type">{{ app.loanType }}</span>
                    <span class="app-divider">•</span>
                    <span class="app-date">{{ formatDate(app.createdAt) }}</span>
                  </div>
                </div>
                <div class="app-amount">{{ formatCurrency(app.requestedAmount) }}</div>
                <div class="app-status">
                  <span class="status-badge" :class="getStatusClass(app.status)">
                    {{ formatStatus(app.status) }}
                  </span>
                </div>
              </div>
            </div>
          </article>

          <!-- Team & Stats Sidebar -->
          <aside class="sidebar-column">
            <!-- Team Overview -->
            <article class="content-card team-card">
              <header class="card-header">
                <div class="card-title-group">
                  <v-icon color="primary" size="28">mdi-account-group</v-icon>
                  <h2 class="card-title">Team Overview</h2>
                </div>
              </header>
              <div class="team-stats">
                <div class="team-stat">
                  <div class="team-stat-icon officer">
                    <v-icon size="20">mdi-account-edit</v-icon>
                  </div>
                  <div class="team-stat-info">
                    <span class="team-stat-value">{{ stats.totalOfficers }}</span>
                    <span class="team-stat-label">Loan Officers</span>
                  </div>
                </div>
                <div class="team-stat">
                  <div class="team-stat-icon approver">
                    <v-icon size="20">mdi-account-check</v-icon>
                  </div>
                  <div class="team-stat-info">
                    <span class="team-stat-value">{{ stats.totalApprovers }}</span>
                    <span class="team-stat-label">Approvers</span>
                  </div>
                </div>
              </div>
              <v-btn
                variant="tonal"
                color="primary"
                block
                class="mt-4"
                to="/tenant/users"
              >
                Manage Team
              </v-btn>
            </article>

            <!-- Monthly Summary -->
            <article class="content-card summary-card">
              <header class="card-header">
                <div class="card-title-group">
                  <v-icon color="success" size="28">mdi-calendar-month</v-icon>
                  <h2 class="card-title">This Month</h2>
                </div>
              </header>
              <div class="summary-stats">
                <div class="summary-row">
                  <span class="summary-label">Approved</span>
                  <span class="summary-value approved">{{ stats.approvedThisMonth }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Rejected</span>
                  <span class="summary-value rejected">{{ stats.rejectedThisMonth }}</span>
                </div>
                <div class="summary-row">
                  <span class="summary-label">Total Applications</span>
                  <span class="summary-value">{{ stats.totalApplications }}</span>
                </div>
              </div>
            </article>
          </aside>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: ['role'],
  allowedRoles: ['tenant_admin'],
})

interface RecentApplication {
  id: string
  applicantName: string
  loanType: string
  requestedAmount: number
  status: string
  createdAt: string
}

interface TenantStats {
  totalApplications: number
  applicationsByStatus: Record<string, number>
  totalOfficers: number
  totalApprovers: number
  pendingApprovalCount: number
  approvedThisMonth: number
  rejectedThisMonth: number
  totalDisbursedAmount: number
  recentApplications: RecentApplication[]
}

const { authenticatedFetch } = useAuth()

const stats = ref<TenantStats | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

// Computed properties
const isNewTenant = computed(() => {
  if (!stats.value) return false
  return (
    stats.value.totalApplications === 0 &&
    stats.value.totalOfficers === 0 &&
    stats.value.totalApprovers === 0
  )
})

const activeLoans = computed(() => {
  if (!stats.value?.applicationsByStatus) return 0
  const activeStatuses = ['approved', 'disbursed', 'active']
  return activeStatuses.reduce((sum, status) => {
    return sum + (stats.value!.applicationsByStatus[status] || 0)
  }, 0)
})

const approvalRate = computed(() => {
  if (!stats.value) return 0
  const approved = stats.value.approvedThisMonth
  const rejected = stats.value.rejectedThisMonth
  const total = approved + rejected
  if (total === 0) return 0
  return Math.round((approved / total) * 100)
})

// Methods
const fetchStats = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await authenticatedFetch<TenantStats>('/api/tenant/stats')
    stats.value = data
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to load dashboard data'
    console.error('Failed to fetch tenant stats:', err)
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  fetchStats()
}

const clearError = () => {
  error.value = null
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
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
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

const formatStatus = (status: string) => {
  return status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

const getInitials = (name: string) => {
  if (name === 'N/A') return '?'
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const getStatusClass = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: 'status-draft',
    submitted: 'status-pending',
    under_review: 'status-pending',
    approved: 'status-approved',
    rejected: 'status-rejected',
    disbursed: 'status-success',
    completed: 'status-success',
    cancelled: 'status-cancelled',
  }
  return statusMap[status] || 'status-default'
}

// Lifecycle
onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.tenant-dashboard {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 8px;
}

/* Page Header */
.dashboard-header {
  margin-bottom: 40px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 32px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  letter-spacing: -0.025em;
  line-height: 1.1;
}

.page-subtitle {
  font-family: var(--font-sans);
  font-size: 16px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

.loading-text {
  font-family: var(--font-sans);
  font-size: 16px;
  color: var(--text-muted);
  margin: 0;
}

/* Error Alert */
.error-alert {
  border-radius: 16px;
  margin-bottom: 32px;
}

/* Empty State */
.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 500px;
}

.empty-content {
  text-align: center;
  max-width: 480px;
  padding: 48px;
}

.empty-icon {
  margin-bottom: 24px;
}

.empty-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.empty-text {
  font-family: var(--font-sans);
  font-size: 16px;
  color: var(--text-muted);
  margin: 0 0 32px 0;
  line-height: 1.6;
}

.empty-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

/* Dashboard Content */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* KPI Section */
.kpi-section {
  margin-bottom: 8px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}

.kpi-card {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  transition: all var(--transition-base);
}

.kpi-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.kpi-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.kpi-primary::before { background: linear-gradient(90deg, #1e3a8a, #3b82f6); }
.kpi-warning::before { background: linear-gradient(90deg, #d97706, #f59e0b); }
.kpi-success::before { background: linear-gradient(90deg, #059669, #10b981); }
.kpi-info::before { background: linear-gradient(90deg, #7c3aed, #a78bfa); }

.kpi-icon-wrapper {
  width: 64px;
  height: 64px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.kpi-primary .kpi-icon-wrapper { background: rgba(30, 58, 138, 0.1); color: #1e3a8a; }
.kpi-warning .kpi-icon-wrapper { background: rgba(245, 158, 11, 0.12); color: #d97706; }
.kpi-success .kpi-icon-wrapper { background: rgba(16, 185, 129, 0.1); color: #059669; }
.kpi-info .kpi-icon-wrapper { background: rgba(124, 58, 237, 0.1); color: #7c3aed; }

.kpi-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.kpi-value {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  letter-spacing: -0.02em;
}

.kpi-label {
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--text-muted);
  font-weight: 500;
}

.kpi-footer {
  margin-top: auto;
  min-height: 32px;
  display: flex;
  align-items: center;
}

.kpi-trend {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: 20px;
}

.trend-up {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.trend-neutral {
  background: rgba(107, 114, 128, 0.1);
  color: #6b7280;
}

.kpi-action {
  margin-left: -8px;
}

.kpi-note {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
}

/* Main Content */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 32px;
}

.content-card {
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 28px;
  border-bottom: 1px solid var(--border-color);
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 14px;
}

.card-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-empty {
  padding: 64px 24px;
  text-align: center;
  color: var(--text-muted);
}

.card-empty p {
  margin: 16px 0 0;
  font-family: var(--font-sans);
  font-size: 15px;
}

/* Applications List */
.applications-list {
  padding: 12px;
}

.application-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  border-radius: 14px;
  transition: background var(--transition-base);
  cursor: pointer;
}

.application-item:hover {
  background: var(--bg-hover);
}

.app-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%);
  color: var(--text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.app-details {
  flex: 1;
  min-width: 0;
}

.app-name {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 6px;
}

.app-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
}

.app-divider {
  opacity: 0.5;
}

.app-amount {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  flex-shrink: 0;
}

.app-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-flex;
  padding: 6px 14px;
  border-radius: 20px;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-draft { background: rgba(107, 114, 128, 0.1); color: #6b7280; }
.status-pending { background: rgba(245, 158, 11, 0.1); color: #d97706; }
.status-approved { background: rgba(16, 185, 129, 0.1); color: #059669; }
.status-rejected { background: rgba(239, 68, 68, 0.1); color: #dc2626; }
.status-success { background: rgba(16, 185, 129, 0.15); color: #047857; }
.status-cancelled { background: rgba(107, 114, 128, 0.1); color: #4b5563; }
.status-default { background: rgba(107, 114, 128, 0.1); color: #6b7280; }

/* Sidebar Column */
.sidebar-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Team Card */
.team-stats {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.team-stat {
  display: flex;
  align-items: center;
  gap: 16px;
}

.team-stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.team-stat-icon.officer {
  background: rgba(30, 58, 138, 0.1);
  color: #1e3a8a;
}

.team-stat-icon.approver {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.team-stat-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.team-stat-value {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
}

.team-stat-label {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
}

.team-card .v-btn {
  margin: 0 20px 20px;
}

/* Summary Card */
.summary-stats {
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.summary-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.summary-label {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
}

.summary-value {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
}

.summary-value.approved {
  color: var(--color-success);
}

.summary-value.rejected {
  color: var(--color-error);
}

/* Responsive */
@media (max-width: 1200px) {
  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .sidebar-column {
    flex-direction: row;
  }

  .sidebar-column > * {
    flex: 1;
  }
}

@media (max-width: 768px) {
  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    align-self: flex-start;
  }

  .page-title {
    font-size: 28px;
  }

  .sidebar-column {
    flex-direction: column;
  }
}
</style>
