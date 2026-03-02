<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'
import { useRouter } from 'vue-router'

definePageMeta({
  layout: 'default',
  middleware: ['role'],
  allowedRoles: ['system_admin'],
})

interface SystemStats {
  totalTenants: number
  totalUsers: number
  activeLoans: number
  systemUptime: string
  recentTenants: Array<{
    id: string
    name: string
    isActive: boolean
    userCount: number
    createdAt: Date
  }>
  systemHealth: {
    database: 'OK' | 'ERROR'
    api: 'OK' | 'ERROR'
    storage: 'OK' | 'ERROR'
  }
  resourceUsage: {
    cpu: number
    memory: number
    disk: number
  }
}

const { authenticatedFetch } = useAuth()
const router = useRouter()
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

const navigateToTenant = (tenantId: string) => {
  router.push(`/system/tenants/${tenantId}`)
}
</script>

<template>
  <v-container fluid class="wf-content-padding">
    <!-- Page Header -->
    <div class="wf-page-header">
      <h1>System Admin Dashboard</h1>
      <p class="wf-page-subtitle">Complete oversight of all tenants and system activity</p>
    </div>

    <!-- Loading State -->
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      class="mx-auto d-block my-16"
    />

    <!-- Dashboard Content -->
    <template v-else-if="stats">
      <!-- Stat Cards Grid -->
      <v-row class="wf-section-gap">
        <v-col cols="12" sm="6" md="3">
          <v-card class="wf-stat-card">
            <v-card-text>
              <div class="wf-stat-value">{{ stats.totalTenants }}</div>
              <div class="wf-stat-label">Total Tenants</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="wf-stat-card">
            <v-card-text>
              <div class="wf-stat-value">{{ stats.totalUsers }}</div>
              <div class="wf-stat-label">Total Users</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="wf-stat-card">
            <v-card-text>
              <div class="wf-stat-value">{{ stats.activeLoans }}</div>
              <div class="wf-stat-label">Active Loans</div>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card class="wf-stat-card">
            <v-card-text>
              <div class="wf-stat-value">{{ stats.systemUptime }}</div>
              <div class="wf-stat-label">System Uptime</div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Recent Tenant Activity -->
      <v-card class="wf-section-card wf-section-gap">
        <v-card-title class="wf-section-title">
          Recent Tenant Activity
        </v-card-title>

        <v-table class="wf-table">
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
            <tr
              v-for="tenant in stats.recentTenants"
              :key="tenant.id"
              @click="navigateToTenant(tenant.id)"
            >
              <td><strong>{{ tenant.name }}</strong></td>
              <td>
                <span
                  class="wf-status-badge"
                  :class="tenant.isActive ? 'active' : 'pending'"
                >
                  <span class="wf-status-dot" />
                  {{ tenant.isActive ? 'Active' : 'Pending' }}
                </span>
              </td>
              <td>{{ tenant.userCount }}</td>
              <td>{{ formatDate(tenant.createdAt) }}</td>
              <td>
                <a
                  :href="`/system/tenants/${tenant.id}`"
                  class="wf-action-btn"
                  @click.stop
                >
                  View →
                </a>
              </td>
            </tr>
          </tbody>
        </v-table>

        <div v-if="stats.recentTenants.length === 0" class="wf-empty-state">
          <div class="empty-icon">
            <v-icon size="48" color="grey-lighten-2">mdi-domain</v-icon>
          </div>
          <div class="empty-title">No Tenants Yet</div>
          <div class="empty-message">Tenants will appear here once they're created</div>
        </div>
      </v-card>

      <!-- System Info Grid -->
      <v-row class="wf-section-gap">
        <!-- System Health -->
        <v-col cols="12" md="6">
          <v-card class="wf-card">
            <v-card-title class="wf-info-title">System Health</v-card-title>
            <v-card-text>
              <div class="wf-info-row">
                <span class="wf-info-label">
                  <span
                    class="wf-health-indicator"
                    :class="stats.systemHealth.database === 'OK' ? 'health-ok' : ''"
                  />
                  Database
                </span>
                <span class="wf-info-value">{{ stats.systemHealth.database }}</span>
              </div>
              <div class="wf-info-row">
                <span class="wf-info-label">
                  <span
                    class="wf-health-indicator"
                    :class="stats.systemHealth.api === 'OK' ? 'health-ok' : ''"
                  />
                  API
                </span>
                <span class="wf-info-value">{{ stats.systemHealth.api }}</span>
              </div>
              <div class="wf-info-row">
                <span class="wf-info-label">
                  <span
                    class="wf-health-indicator"
                    :class="stats.systemHealth.storage === 'OK' ? 'health-ok' : ''"
                  />
                  Storage
                </span>
                <span class="wf-info-value">{{ stats.systemHealth.storage }}</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Resource Usage -->
        <v-col cols="12" md="6">
          <v-card class="wf-card">
            <v-card-title class="wf-info-title">Resource Usage</v-card-title>
            <v-card-text>
              <div class="wf-info-row">
                <span class="wf-info-label">CPU</span>
                <span class="wf-info-value">{{ stats.resourceUsage.cpu }}%</span>
              </div>
              <div class="wf-info-row">
                <span class="wf-info-label">Memory</span>
                <span class="wf-info-value">{{ stats.resourceUsage.memory }}%</span>
              </div>
              <div class="wf-info-row">
                <span class="wf-info-label">Disk</span>
                <span class="wf-info-value">{{ stats.resourceUsage.disk }}%</span>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<style scoped>
.wf-stat-card {
  text-align: center;
  padding: 24px;
}

.wf-stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 8px;
}

.wf-stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.wf-health-indicator {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 8px;
}

.wf-health-indicator.health-ok {
  background: #10b981;
}

.wf-action-btn {
  color: #1e3a8a;
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  display: inline-block;
}

.wf-action-btn:hover {
  background: #f0f4ff;
}
</style>
