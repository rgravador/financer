<template>
  <AppLayout>
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">System Admin Dashboard</h1>
      <p class="page-subtitle">Complete oversight of all tenants and system activity</p>
    </div>

    <!-- Loading State -->
    <div v-if="systemStore.loading" class="loading-container">
      <v-progress-circular indeterminate color="navy" size="64" />
    </div>

    <!-- Error State -->
    <v-alert
      v-else-if="systemStore.error"
      type="error"
      variant="tonal"
      class="mb-6"
      closable
      @click:close="systemStore.clearError()"
    >
      {{ systemStore.error }}
    </v-alert>

    <!-- Dashboard Content -->
    <div v-else-if="systemStore.stats" class="dashboard-content">
      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">{{ systemStore.stats.totalTenants }}</div>
          <div class="stat-label">Total Tenants</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ formatNumber(systemStore.stats.totalUsers) }}</div>
          <div class="stat-label">Total Users</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ systemStore.stats.activeLoans }}</div>
          <div class="stat-label">Active Loans</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">{{ systemStore.stats.systemUptime }}</div>
          <div class="stat-label">System Uptime</div>
        </div>
      </div>

      <!-- Recent Tenant Activity -->
      <div class="section-card">
        <div class="section-header">
          <div class="section-title">Recent Tenant Activity</div>
        </div>
        <table class="table">
          <thead>
            <tr>
              <th>Tenant</th>
              <th>Status</th>
              <th>Users</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tenant in systemStore.stats.recentTenants" :key="tenant.id">
              <td><strong>{{ tenant.name }}</strong></td>
              <td>
                <span
                  class="status-badge"
                  :class="tenant.isActive ? 'status-active' : 'status-pending'"
                >
                  {{ tenant.isActive ? 'Active' : 'Pending' }}
                </span>
              </td>
              <td>{{ tenant.userCount }}</td>
              <td>{{ formatDate(tenant.createdAt) }}</td>
              <td>
                <a href="#" class="action-btn" @click.prevent="viewTenant(tenant.id)">
                  View →
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- System Info Grid -->
      <div class="info-grid">
        <!-- System Health -->
        <div class="info-card">
          <div class="info-title">System Health</div>
          <div class="info-item">
            <span class="info-label">
              <span
                class="health-indicator"
                :class="getHealthClass(systemStore.stats.systemHealth.database)"
              ></span>
              Database
            </span>
            <span class="info-value">{{ formatHealthStatus(systemStore.stats.systemHealth.database) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">
              <span
                class="health-indicator"
                :class="getHealthClass(systemStore.stats.systemHealth.api)"
              ></span>
              API
            </span>
            <span class="info-value">{{ formatHealthStatus(systemStore.stats.systemHealth.api) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">
              <span
                class="health-indicator"
                :class="getHealthClass(systemStore.stats.systemHealth.storage)"
              ></span>
              Storage
            </span>
            <span class="info-value">{{ formatHealthStatus(systemStore.stats.systemHealth.storage) }}</span>
          </div>
        </div>

        <!-- Resource Usage -->
        <div class="info-card">
          <div class="info-title">Resource Usage</div>
          <div class="info-item">
            <span class="info-label">CPU</span>
            <span class="info-value">{{ systemStore.stats.resourceUsage.cpu }}%</span>
          </div>
          <div class="info-item">
            <span class="info-label">Memory</span>
            <span class="info-value">{{ systemStore.stats.resourceUsage.memory }}%</span>
          </div>
          <div class="info-item">
            <span class="info-label">Disk</span>
            <span class="info-value">{{ systemStore.stats.resourceUsage.disk }}%</span>
          </div>
        </div>
      </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { useSystemStore } from '~/stores/system'
import AppLayout from '~/components/shared/AppLayout.vue'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['system_admin'],
})

const systemStore = useSystemStore()
const router = useRouter()

// Fetch stats on mount
onMounted(async () => {
  try {
    await systemStore.fetchStats()
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
})

// Format large numbers (e.g., 1200000 -> 1.2M)
const formatNumber = (num: number) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M'
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K'
  }
  return num.toString()
}

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

// Format health status
const formatHealthStatus = (status: string) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Get health indicator class
const getHealthClass = (status: string) => {
  if (status === 'healthy') return 'health-ok'
  if (status === 'degraded') return 'health-warning'
  return 'health-error'
}

// View tenant details
const viewTenant = (tenantId: string) => {
  router.push(`/system/tenants/${tenantId}`)
}
</script>

<style scoped>
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1e3a8a;
  margin: 0 0 8px 0;
}

.page-subtitle {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.dashboard-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 8px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.section-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.section-header {
  padding: 20px 24px;
  border-bottom: 1px solid #e5e7eb;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e3a8a;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  background: #f9fafb;
  padding: 12px 24px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.table td {
  padding: 16px 24px;
  border-top: 1px solid #f3f4f6;
  font-size: 14px;
}

.table tr:hover {
  background: rgba(30, 58, 138, 0.04);
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.status-active {
  background: #d1fae5;
  color: #065f46;
}

.status-pending {
  background: #fef3c7;
  color: #92400e;
}

.action-btn {
  color: #1e3a8a;
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
}

.action-btn:hover {
  text-decoration: underline;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.info-title {
  font-size: 16px;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f3f4f6;
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  color: #6b7280;
  font-size: 14px;
  display: flex;
  align-items: center;
}

.info-value {
  color: #1e293b;
  font-weight: 500;
  font-size: 14px;
}

.health-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.health-ok {
  background: #10b981;
}

.health-warning {
  background: #f59e0b;
}

.health-error {
  background: #ef4444;
}
</style>
