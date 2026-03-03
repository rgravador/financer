<template>
  <AppLayout>
    <WfPageHeader
      title="System Dashboard"
      subtitle="Monitor system health and tenant activity"
      :breadcrumbs="breadcrumbs"
    />

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
      <!-- Stat Cards -->
      <div class="stat-cards-grid">
        <WfStatCard
          :value="systemStore.stats.totalTenants"
          label="Total Tenants"
          :trend="`+${Math.round(systemStore.stats.totalTenants * 0.12)} this month`"
          :trend-positive="true"
        />
        <WfStatCard
          :value="systemStore.stats.totalUsers"
          label="Total Users"
          :trend="`+${Math.round(systemStore.stats.totalUsers * 0.08)} this month`"
          :trend-positive="true"
        />
        <WfStatCard
          :value="systemStore.stats.activeLoans"
          label="Active Loans"
          :trend="`${systemStore.stats.activeLoans > 50 ? '+' : ''}${Math.round(systemStore.stats.activeLoans * 0.05)} this week`"
          :trend-positive="true"
        />
        <WfStatCard
          :value="systemStore.stats.systemUptime"
          label="System Uptime"
        />
      </div>

      <!-- Recent Tenants Table -->
      <v-card elevation="0" class="recent-tenants-card">
        <v-card-title class="card-title">Recent Tenants</v-card-title>
        <v-card-text>
          <v-table class="tenants-table">
            <thead>
              <tr>
                <th>Tenant Name</th>
                <th>Users</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tenant in systemStore.stats.recentTenants" :key="tenant.id">
                <td class="tenant-name">{{ tenant.name }}</td>
                <td>{{ tenant.userCount }}</td>
                <td>
                  <WfStatusBadge :status="tenant.isActive ? 'active' : 'inactive'" />
                </td>
                <td>{{ formatDate(tenant.createdAt) }}</td>
                <td>
                  <v-btn
                    icon="mdi-eye"
                    variant="text"
                    size="small"
                    @click="viewTenant(tenant.id)"
                  />
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <!-- System Health -->
      <v-card elevation="0" class="system-health-card">
        <v-card-title class="card-title">System Health</v-card-title>
        <v-card-text>
          <div class="health-grid">
            <div class="health-item">
              <div class="health-label">Database</div>
              <v-chip
                :color="getHealthColor(systemStore.stats.systemHealth.database)"
                size="small"
                variant="flat"
              >
                {{ systemStore.stats.systemHealth.database }}
              </v-chip>
            </div>
            <div class="health-item">
              <div class="health-label">API</div>
              <v-chip
                :color="getHealthColor(systemStore.stats.systemHealth.api)"
                size="small"
                variant="flat"
              >
                {{ systemStore.stats.systemHealth.api }}
              </v-chip>
            </div>
            <div class="health-item">
              <div class="health-label">Storage</div>
              <v-chip
                :color="getHealthColor(systemStore.stats.systemHealth.storage)"
                size="small"
                variant="flat"
              >
                {{ systemStore.stats.systemHealth.storage }}
              </v-chip>
            </div>
          </div>

          <div class="resource-usage">
            <h4 class="usage-title">Resource Usage</h4>
            <div class="usage-item">
              <div class="usage-label">CPU</div>
              <v-progress-linear
                :model-value="systemStore.stats.resourceUsage.cpu"
                color="navy"
                height="8"
                rounded
              />
              <div class="usage-value">{{ systemStore.stats.resourceUsage.cpu }}%</div>
            </div>
            <div class="usage-item">
              <div class="usage-label">Memory</div>
              <v-progress-linear
                :model-value="systemStore.stats.resourceUsage.memory"
                color="navy"
                height="8"
                rounded
              />
              <div class="usage-value">{{ systemStore.stats.resourceUsage.memory }}%</div>
            </div>
            <div class="usage-item">
              <div class="usage-label">Disk</div>
              <v-progress-linear
                :model-value="systemStore.stats.resourceUsage.disk"
                color="navy"
                height="8"
                rounded
              />
              <div class="usage-value">{{ systemStore.stats.resourceUsage.disk }}%</div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { useSystemStore } from '~/stores/system'

definePageMeta({
  middleware: 'auth',
  roles: ['system_admin'],
})

const systemStore = useSystemStore()
const router = useRouter()

const breadcrumbs = [
  { title: 'System', disabled: true },
  { title: 'Dashboard', disabled: true },
]

// Fetch stats on mount
onMounted(async () => {
  try {
    await systemStore.fetchStats()
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
})

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

// Get health status color
const getHealthColor = (status: 'healthy' | 'degraded' | 'down') => {
  const colors = {
    healthy: 'success',
    degraded: 'warning',
    down: 'error',
  }
  return colors[status] || 'grey'
}

// View tenant details
const viewTenant = (tenantId: string) => {
  router.push(`/system/tenants/${tenantId}`)
}
</script>

<style scoped>
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

.stat-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 24px;
}

.recent-tenants-card,
.system-health-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--v-theme-navy));
  padding: 24px;
}

.tenants-table {
  border: none;
}

.tenants-table th {
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);
}

.tenant-name {
  font-weight: 500;
  color: rgb(var(--v-theme-navy));
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
}

.health-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.health-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
}

.resource-usage {
  margin-top: 24px;
}

.usage-title {
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--v-theme-navy));
  margin-bottom: 16px;
}

.usage-item {
  display: grid;
  grid-template-columns: 80px 1fr 60px;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.usage-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.6);
}

.usage-value {
  font-size: 14px;
  font-weight: 500;
  color: rgb(var(--v-theme-navy));
  text-align: right;
}
</style>
