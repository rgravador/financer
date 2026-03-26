<template>
  <div class="dashboard-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Welcome back! Here's what's happening with your platform today.</p>
        </div>
        <div class="header-actions">
          <v-btn
            variant="outlined"
            color="primary"
            prepend-icon="mdi-refresh"
            @click="refreshData"
            :loading="systemStore.loading"
          >
            Refresh
          </v-btn>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="systemStore.loading && !systemStore.stats" class="loading-container">
      <div class="loading-content">
        <v-progress-circular indeterminate color="primary" size="56" width="4" />
        <p class="loading-text">Loading your dashboard...</p>
      </div>
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="systemStore.error"
      type="error"
      variant="tonal"
      class="mb-8 error-alert"
      closable
      @click:close="systemStore.clearError()"
    >
      <template #title>Something went wrong</template>
      {{ systemStore.error }}
    </v-alert>

    <!-- Dashboard Content -->
    <div v-else-if="systemStore.stats" class="dashboard-content">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-primary">
          <div class="stat-icon">
            <v-icon size="28">mdi-office-building</v-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ systemStore.stats.totalTenants }}</div>
            <div class="stat-label">Active Tenants</div>
          </div>
          <div class="stat-trend trend-up">
            <v-icon size="16">mdi-trending-up</v-icon>
            <span>+12%</span>
          </div>
        </div>

        <div class="stat-card stat-success">
          <div class="stat-icon">
            <v-icon size="28">mdi-account-group</v-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ formatNumber(systemStore.stats.totalUsers) }}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-trend trend-up">
            <v-icon size="16">mdi-trending-up</v-icon>
            <span>+8%</span>
          </div>
        </div>

        <div class="stat-card stat-warning">
          <div class="stat-icon">
            <v-icon size="28">mdi-file-document-multiple</v-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ systemStore.stats.activeLoans }}</div>
            <div class="stat-label">Active Loans</div>
          </div>
          <div class="stat-trend trend-up">
            <v-icon size="16">mdi-trending-up</v-icon>
            <span>+23%</span>
          </div>
        </div>

        <div class="stat-card stat-info">
          <div class="stat-icon">
            <v-icon size="28">mdi-clock-check</v-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ systemStore.stats.systemUptime }}</div>
            <div class="stat-label">System Uptime</div>
          </div>
          <div class="stat-badge">
            <v-icon size="12">mdi-check-circle</v-icon>
            Healthy
          </div>
        </div>
      </div>

      <!-- Main Content Grid -->
      <div class="content-grid">
        <!-- Recent Tenant Activity -->
        <div class="content-card activity-card">
          <div class="card-header">
            <div class="card-title-group">
              <v-icon color="primary" size="24">mdi-office-building-marker</v-icon>
              <h2 class="card-title">Recent Tenants</h2>
            </div>
            <v-btn
              variant="text"
              color="primary"
              size="small"
              append-icon="mdi-arrow-right"
              @click="router.push('/system/tenants')"
            >
              View All
            </v-btn>
          </div>

          <div class="tenant-list">
            <div
              v-for="tenant in systemStore.stats.recentTenants"
              :key="tenant.id"
              class="tenant-item"
              @click="viewTenant(tenant.id)"
            >
              <div class="tenant-avatar">
                {{ tenant.name.charAt(0).toUpperCase() }}
              </div>
              <div class="tenant-info">
                <div class="tenant-name">{{ tenant.name }}</div>
                <div class="tenant-meta">
                  <span class="tenant-users">
                    <v-icon size="14">mdi-account-multiple</v-icon>
                    {{ tenant.userCount }} users
                  </span>
                  <span class="tenant-date">{{ formatDate(tenant.createdAt) }}</span>
                </div>
              </div>
              <div class="tenant-status">
                <span
                  class="status-badge"
                  :class="tenant.isActive ? 'status-active' : 'status-pending'"
                >
                  {{ tenant.isActive ? 'Active' : 'Pending' }}
                </span>
              </div>
              <v-icon class="tenant-arrow" size="20">mdi-chevron-right</v-icon>
            </div>
          </div>
        </div>

        <!-- System Info Column -->
        <div class="info-column">
          <!-- System Health -->
          <div class="content-card health-card">
            <div class="card-header">
              <div class="card-title-group">
                <v-icon color="success" size="24">mdi-heart-pulse</v-icon>
                <h2 class="card-title">System Health</h2>
              </div>
            </div>

            <div class="health-list">
              <div class="health-item">
                <div class="health-info">
                  <span
                    class="health-dot"
                    :class="getHealthClass(systemStore.stats.systemHealth.database)"
                  ></span>
                  <span class="health-label">Database</span>
                </div>
                <span class="health-status" :class="getHealthClass(systemStore.stats.systemHealth.database)">
                  {{ formatHealthStatus(systemStore.stats.systemHealth.database) }}
                </span>
              </div>

              <div class="health-item">
                <div class="health-info">
                  <span
                    class="health-dot"
                    :class="getHealthClass(systemStore.stats.systemHealth.api)"
                  ></span>
                  <span class="health-label">API Services</span>
                </div>
                <span class="health-status" :class="getHealthClass(systemStore.stats.systemHealth.api)">
                  {{ formatHealthStatus(systemStore.stats.systemHealth.api) }}
                </span>
              </div>

              <div class="health-item">
                <div class="health-info">
                  <span
                    class="health-dot"
                    :class="getHealthClass(systemStore.stats.systemHealth.storage)"
                  ></span>
                  <span class="health-label">Storage</span>
                </div>
                <span class="health-status" :class="getHealthClass(systemStore.stats.systemHealth.storage)">
                  {{ formatHealthStatus(systemStore.stats.systemHealth.storage) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Resource Usage -->
          <div class="content-card resource-card">
            <div class="card-header">
              <div class="card-title-group">
                <v-icon color="warning" size="24">mdi-gauge</v-icon>
                <h2 class="card-title">Resources</h2>
              </div>
            </div>

            <div class="resource-list">
              <div class="resource-item">
                <div class="resource-header">
                  <span class="resource-label">CPU Usage</span>
                  <span class="resource-value">{{ systemStore.stats.resourceUsage.cpu }}%</span>
                </div>
                <div class="resource-bar">
                  <div
                    class="resource-fill"
                    :class="getResourceClass(systemStore.stats.resourceUsage.cpu)"
                    :style="{ width: systemStore.stats.resourceUsage.cpu + '%' }"
                  ></div>
                </div>
              </div>

              <div class="resource-item">
                <div class="resource-header">
                  <span class="resource-label">Memory</span>
                  <span class="resource-value">{{ systemStore.stats.resourceUsage.memory }}%</span>
                </div>
                <div class="resource-bar">
                  <div
                    class="resource-fill"
                    :class="getResourceClass(systemStore.stats.resourceUsage.memory)"
                    :style="{ width: systemStore.stats.resourceUsage.memory + '%' }"
                  ></div>
                </div>
              </div>

              <div class="resource-item">
                <div class="resource-header">
                  <span class="resource-label">Disk Space</span>
                  <span class="resource-value">{{ systemStore.stats.resourceUsage.disk }}%</span>
                </div>
                <div class="resource-bar">
                  <div
                    class="resource-fill"
                    :class="getResourceClass(systemStore.stats.resourceUsage.disk)"
                    :style="{ width: systemStore.stats.resourceUsage.disk + '%' }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSystemStore } from '~/stores/system'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['system_admin'],
})

const systemStore = useSystemStore()
const router = useRouter()

onMounted(async () => {
  try {
    await systemStore.fetchStats()
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
})

const refreshData = async () => {
  try {
    await systemStore.fetchStats()
  } catch (error) {
    console.error('Failed to refresh stats:', error)
  }
}

const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  }).format(date)
}

const formatHealthStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

const getHealthClass = (status: string) => {
  if (status === 'healthy') return 'health-ok'
  if (status === 'degraded') return 'health-warning'
  return 'health-error'
}

const getResourceClass = (value: number) => {
  if (value < 60) return 'resource-ok'
  if (value < 80) return 'resource-warning'
  return 'resource-danger'
}

const viewTenant = (tenantId: string) => {
  router.push(`/system/tenants/${tenantId}`)
}
</script>

<style scoped>
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
  transition: color var(--transition-base);
}

.page-subtitle {
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--text-muted);
  margin: 0;
  transition: color var(--transition-base);
}

/* Loading State */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.loading-text {
  font-family: var(--font-sans);
  font-size: 15px;
  color: var(--text-muted);
  margin: 0;
  transition: color var(--transition-base);
}

/* Error Alert */
.error-alert {
  border-radius: 16px;
}

/* Dashboard Content */
.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--shadow-card);
  transition: transform var(--transition-base), box-shadow var(--transition-base), background-color var(--transition-base);
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.stat-primary::before { background: linear-gradient(90deg, #1e3a8a, #3b82f6); }
.stat-success::before { background: linear-gradient(90deg, #059669, #10b981); }
.stat-warning::before { background: linear-gradient(90deg, #d97706, #f59e0b); }
.stat-info::before { background: linear-gradient(90deg, #7c3aed, #a78bfa); }

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-primary .stat-icon { background: rgba(30, 58, 138, 0.1); color: #1e3a8a; }
.stat-success .stat-icon { background: rgba(16, 185, 129, 0.1); color: #059669; }
.stat-warning .stat-icon { background: rgba(245, 158, 11, 0.1); color: #d97706; }
.stat-info .stat-icon { background: rgba(124, 58, 237, 0.1); color: #7c3aed; }

.stat-info-container {
  flex: 1;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1;
  margin-bottom: 6px;
  transition: color var(--transition-base);
}

.stat-label {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 500;
  transition: color var(--transition-base);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 20px;
  width: fit-content;
}

.trend-up {
  background: rgba(16, 185, 129, 0.1);
  color: #059669;
}

.trend-down {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-success);
  background: rgba(16, 185, 129, 0.1);
  padding: 6px 12px;
  border-radius: 20px;
  width: fit-content;
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

.content-card {
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
  border: 1px solid var(--border-color);
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  transition: border-color var(--transition-base);
}

.card-title-group {
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  transition: color var(--transition-base);
}

/* Tenant List */
.tenant-list {
  padding: 8px;
}

.tenant-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: background var(--transition-base);
}

.tenant-item:hover {
  background: var(--bg-hover);
}

.tenant-avatar {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%);
  color: var(--text-inverse);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  flex-shrink: 0;
}

.tenant-info {
  flex: 1;
  min-width: 0;
}

.tenant-name {
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  transition: color var(--transition-base);
}

.tenant-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  transition: color var(--transition-base);
}

.tenant-users {
  display: flex;
  align-items: center;
  gap: 4px;
}

.tenant-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 20px;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.status-pending {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.tenant-arrow {
  color: var(--text-muted);
  flex-shrink: 0;
  transition: color var(--transition-base);
}

.tenant-item:hover .tenant-arrow {
  color: var(--accent-primary);
}

/* Info Column */
.info-column {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Health Card */
.health-list {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.health-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.health-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.health-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.health-dot.health-ok { background: #10b981; }
.health-dot.health-warning { background: #f59e0b; }
.health-dot.health-error { background: #ef4444; }

.health-label {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-secondary);
  transition: color var(--transition-base);
}

.health-status {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 6px;
}

.health-status.health-ok {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.health-status.health-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.health-status.health-error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

/* Resource Card */
.resource-list {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.resource-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.resource-label {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-secondary);
  transition: color var(--transition-base);
}

.resource-value {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  transition: color var(--transition-base);
}

.resource-bar {
  height: 8px;
  background: var(--bg-hover);
  border-radius: 4px;
  overflow: hidden;
  transition: background-color var(--transition-base);
}

.resource-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.resource-fill.resource-ok { background: linear-gradient(90deg, #10b981, #34d399); }
.resource-fill.resource-warning { background: linear-gradient(90deg, #f59e0b, #fbbf24); }
.resource-fill.resource-danger { background: linear-gradient(90deg, #ef4444, #f87171); }

/* Responsive */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
  }

  .page-title {
    font-size: 26px;
  }
}
</style>
