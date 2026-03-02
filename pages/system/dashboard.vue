<script setup lang="ts">
import { ref, onMounted } from 'vue'
import StatCard from '~/components/shared/StatCard.vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  layout: 'default',
  middleware: ['role'],
  allowedRoles: ['system_admin'],
})

interface SystemStats {
  totalTenants: number
  activeTenants: number
  suspendedTenants: number
  totalUsers: number
  totalApplications: number
  applicationsByStatus: Record<string, number>
  recentTenants: Array<{
    id: string
    name: string
    slug: string
    isActive: boolean
    createdAt: Date
    applicationCount: number
  }>
}

const { authenticatedFetch } = useAuth()
const stats = ref<SystemStats | null>(null)
const loading = ref(false)

onMounted(async () => {
  await fetchStats()
})

const fetchStats = async () => {
  loading.value = true
  try {
    const data = await authenticatedFetch<SystemStats>('/api/system/stats', {
      method: 'GET',
    })

    stats.value = data
  } catch (error) {
    console.error('Failed to fetch system stats:', error)
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: Date) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const getStatusColor = (isActive: boolean) => {
  return isActive ? '#10b981' : '#6b7280'
}
</script>

<template>
  <div class="system-dashboard">
    <div class="page-header">
      <h1>System Dashboard</h1>
      <p class="subtitle">Platform-wide overview and metrics</p>
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
          label="Total Tenants"
          :value="stats.totalTenants"
          :subtext="`${stats.activeTenants} active`"
          color="#3b82f6"
          icon="🏢"
        />

        <StatCard
          label="Active Tenants"
          :value="stats.activeTenants"
          :subtext="`${stats.suspendedTenants} suspended`"
          color="#10b981"
          icon="✓"
        />

        <StatCard
          label="Total Users"
          :value="stats.totalUsers"
          subtext="Across all tenants"
          color="#f59e0b"
          icon="👥"
        />

        <StatCard
          label="Total Applications"
          :value="stats.totalApplications"
          subtext="All time"
          color="#8b5cf6"
          icon="📄"
        />
      </div>

      <!-- Applications by Status -->
      <div class="section-card">
        <h2>Applications by Status</h2>
        <div class="status-grid">
          <div
            v-for="(count, status) in stats.applicationsByStatus"
            :key="status"
            class="status-item"
          >
            <span class="status-label">{{ status }}</span>
            <span class="status-count">{{ count }}</span>
          </div>
        </div>
      </div>

      <!-- Recent Tenants -->
      <div class="section-card">
        <h2>Recent Tenants</h2>
        <div v-if="stats.recentTenants.length > 0" class="table-container">
          <table class="tenants-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Applications</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="tenant in stats.recentTenants" :key="tenant.id">
                <td class="tenant-name">{{ tenant.name }}</td>
                <td class="tenant-slug">{{ tenant.slug }}</td>
                <td>
                  <span
                    class="status-badge"
                    :style="{ backgroundColor: getStatusColor(tenant.isActive) }"
                  >
                    {{ tenant.isActive ? 'Active' : 'Suspended' }}
                  </span>
                </td>
                <td class="application-count">{{ tenant.applicationCount }}</td>
                <td class="date-cell">{{ formatDate(tenant.createdAt) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="empty-state">
          No tenants yet
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.system-dashboard {
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

.section-card h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
}

.status-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
}

.status-label {
  font-size: 13px;
  color: #6b7280;
  text-transform: capitalize;
  font-weight: 500;
}

.status-count {
  font-size: 24px;
  font-weight: 700;
  color: #111827;
}

.table-container {
  overflow-x: auto;
}

.tenants-table {
  width: 100%;
  border-collapse: collapse;
}

.tenants-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.tenants-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tenants-table tbody tr {
  border-bottom: 1px solid #f3f4f6;
}

.tenants-table tbody tr:last-child {
  border-bottom: none;
}

.tenants-table td {
  padding: 16px;
  font-size: 14px;
  color: #111827;
}

.tenant-name {
  font-weight: 600;
}

.tenant-slug {
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  color: #6b7280;
  font-size: 13px;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
}

.application-count {
  font-weight: 600;
  text-align: center;
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
</style>
