<template>
  <v-container fluid class="wf-content-padding">
    <!-- Page Header -->
    <div class="wf-page-header">
      <h1>Audit Logs</h1>
    </div>
    <p class="wf-page-subtitle">Track all system activity and changes</p>

    <!-- Filter Card -->
    <v-card class="wf-section-card mb-6">
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.action"
            label="Action"
            variant="outlined"
            density="compact"
            :items="actionOptions"
            clearable
            @update:model-value="handleFilterChange"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.entity"
            label="Entity"
            variant="outlined"
            density="compact"
            :items="entityOptions"
            clearable
            @update:model-value="handleFilterChange"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filters.dateFrom"
            label="From Date"
            type="date"
            variant="outlined"
            density="compact"
            clearable
            @update:model-value="handleFilterChange"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-text-field
            v-model="filters.dateTo"
            label="To Date"
            type="date"
            variant="outlined"
            density="compact"
            clearable
            @update:model-value="handleFilterChange"
          />
        </v-col>
      </v-row>
    </v-card>

    <!-- Table Card -->
    <v-card class="wf-section-card">
      <v-table class="wf-table">
        <thead>
          <tr>
            <th style="width: 50px"></th>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Entity</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="log in filteredLogs" :key="log.id">
            <tr @click="toggleRow(log.id)" class="expandable-row">
              <td>
                <v-icon size="small">
                  {{ expandedRow === log.id ? 'mdi-chevron-down' : 'mdi-chevron-right' }}
                </v-icon>
              </td>
              <td>{{ formatDateTime(log.createdAt) }}</td>
              <td>
                <div>
                  <strong>{{ log.userName }}</strong>
                  <div class="wf-table-subtext">{{ log.userEmail }}</div>
                </div>
              </td>
              <td>
                <span
                  class="wf-action-badge"
                  :class="getActionClass(log.action)"
                >
                  {{ formatAction(log.action) }}
                </span>
              </td>
              <td>
                <span class="entity-type">{{ log.entity }}</span>
                <div class="wf-table-subtext">#{{ log.entityId }}</div>
              </td>
              <td class="details-cell">{{ getLogSummary(log) }}</td>
            </tr>
            <tr v-if="expandedRow === log.id" class="expanded-content">
              <td colspan="6">
                <div class="metadata-panel">
                  <div class="metadata-grid">
                    <div class="metadata-item">
                      <span class="metadata-label">IP Address</span>
                      <span class="metadata-value">{{ log.ipAddress || 'N/A' }}</span>
                    </div>
                    <div class="metadata-item">
                      <span class="metadata-label">User Agent</span>
                      <span class="metadata-value">{{ log.userAgent || 'N/A' }}</span>
                    </div>
                    <div class="metadata-item">
                      <span class="metadata-label">Role</span>
                      <span class="metadata-value">{{ formatRole(log.userRole) }}</span>
                    </div>
                  </div>
                  <div v-if="log.metadata && Object.keys(log.metadata).length > 0" class="metadata-details">
                    <div class="metadata-label mb-2">Additional Details:</div>
                    <pre class="metadata-json">{{ JSON.stringify(log.metadata, null, 2) }}</pre>
                  </div>
                </div>
              </td>
            </tr>
          </template>
          <tr v-if="filteredLogs.length === 0">
            <td colspan="6" class="text-center pa-8">
              <div class="wf-empty-state">
                <v-icon class="empty-icon">mdi-file-document-outline</v-icon>
                <div class="empty-title">No audit logs found</div>
                <div class="empty-message">
                  {{ filters.action || filters.entity ? 'Try adjusting your filters' : 'Logs will appear here as actions occur' }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Pagination -->
      <div class="wf-pagination" v-if="filteredLogs.length > 0">
        <button
          class="wf-pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ← Previous
        </button>
        <span class="wf-pagination-info">
          Page {{ currentPage }} of {{ totalPages }} ({{ filteredLogs.length }} total)
        </span>
        <button
          class="wf-pagination-btn"
          :disabled="currentPage === totalPages"
          @click="currentPage++"
        >
          Next →
        </button>
      </div>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  layout: 'default',
})

interface AuditLogEntry {
  id: string
  tenantId: string | null
  userId: string
  userName: string
  userEmail: string
  userRole: string
  action: string
  entity: string
  entityId: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const logs = ref<AuditLogEntry[]>([])
const expandedRow = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = ref(50)
const loading = ref(false)

const filters = ref({
  action: '',
  entity: '',
  dateFrom: '',
  dateTo: '',
})

const actionOptions = [
  { title: 'Create', value: 'CREATE' },
  { title: 'Update', value: 'UPDATE' },
  { title: 'Delete', value: 'DELETE' },
  { title: 'Login', value: 'LOGIN' },
  { title: 'Logout', value: 'LOGOUT' },
  { title: 'Approve', value: 'APPROVE' },
  { title: 'Reject', value: 'REJECT' },
]

const entityOptions = [
  { title: 'User', value: 'User' },
  { title: 'Loan Application', value: 'LoanApplication' },
  { title: 'Loan Type', value: 'LoanType' },
  { title: 'Borrower', value: 'Borrower' },
  { title: 'Document', value: 'Document' },
]

// Filtered logs
const filteredLogs = computed(() => {
  let filtered = logs.value

  if (filters.value.action) {
    filtered = filtered.filter(log => log.action === filters.value.action)
  }

  if (filters.value.entity) {
    filtered = filtered.filter(log => log.entity === filters.value.entity)
  }

  if (filters.value.dateFrom) {
    const fromDate = new Date(filters.value.dateFrom)
    filtered = filtered.filter(log => new Date(log.createdAt) >= fromDate)
  }

  if (filters.value.dateTo) {
    const toDate = new Date(filters.value.dateTo)
    toDate.setHours(23, 59, 59, 999)
    filtered = filtered.filter(log => new Date(log.createdAt) <= toDate)
  }

  return filtered
})

// Total pages for pagination
const totalPages = computed(() => {
  return Math.ceil(filteredLogs.value.length / itemsPerPage.value)
})

const toggleRow = (id: string) => {
  expandedRow.value = expandedRow.value === id ? null : id
}

const formatDateTime = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatAction = (action: string): string => {
  return action
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getActionClass = (action: string): string => {
  const actionMap: Record<string, string> = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    LOGIN: 'info',
    LOGOUT: 'info',
    APPROVE: 'approve',
    REJECT: 'reject',
  }
  return actionMap[action] || 'info'
}

const formatRole = (role: string): string => {
  const roleLabels: Record<string, string> = {
    system_admin: 'System Admin',
    tenant_admin: 'Tenant Admin',
    tenant_officer: 'Loan Officer',
    tenant_approver: 'Approver',
  }
  return roleLabels[role] || role
}

const getLogSummary = (log: AuditLogEntry): string => {
  const action = formatAction(log.action)
  const entity = log.entity
  return `${action} ${entity}`
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const response = await $fetch<{ logs: AuditLogEntry[] }>('/api/admin/audit-logs', {
      method: 'GET',
    })
    logs.value = response.logs || []
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.wf-table-subtext {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.expandable-row {
  cursor: pointer;
}

.expandable-row:hover {
  background: rgba(30, 58, 138, 0.04);
}

.expanded-content {
  background: #f9fafb;
}

.expanded-content td {
  padding: 0 !important;
}

.metadata-panel {
  padding: 20px 24px;
}

.metadata-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.metadata-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.metadata-value {
  font-size: 14px;
  color: #111827;
}

.metadata-details {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}

.metadata-json {
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  font-size: 12px;
  color: #374151;
  overflow-x: auto;
}

.entity-type {
  font-weight: 500;
  color: #374151;
}

.details-cell {
  color: #6b7280;
  font-size: 13px;
}
</style>
