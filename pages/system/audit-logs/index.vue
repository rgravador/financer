<script setup lang="ts">
import { ref, onMounted } from 'vue'

definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

interface AuditLogEntry {
  id: string
  tenantId: string | null
  tenantName: string | null
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

interface PaginationData {
  page: number
  limit: number
  total: number
  totalPages: number
}

const logs = ref<AuditLogEntry[]>([])
const pagination = ref<PaginationData>({
  page: 1,
  limit: 50,
  total: 0,
  totalPages: 0,
})
const loading = ref(false)
const expandedRow = ref<string | null>(null)

// Filters
const filters = ref({
  tenantId: '',
  action: '',
  entity: '',
  userId: '',
  dateFrom: '',
  dateTo: '',
})

onMounted(() => {
  fetchLogs()
})

const fetchLogs = async () => {
  loading.value = true
  try {
    const queryParams: Record<string, any> = {
      page: pagination.value.page,
      limit: pagination.value.limit,
    }

    if (filters.value.tenantId) queryParams.tenantId = filters.value.tenantId
    if (filters.value.action) queryParams.action = filters.value.action
    if (filters.value.entity) queryParams.entity = filters.value.entity
    if (filters.value.userId) queryParams.userId = filters.value.userId
    if (filters.value.dateFrom) queryParams.dateFrom = filters.value.dateFrom
    if (filters.value.dateTo) queryParams.dateTo = filters.value.dateTo

    const { data } = await useFetch('/api/system/audit-logs', {
      method: 'GET',
      query: queryParams,
    })

    if (data.value) {
      logs.value = data.value.logs
      pagination.value = data.value.pagination
    }
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
  } finally {
    loading.value = false
  }
}

const handleFilterChange = () => {
  pagination.value.page = 1
  fetchLogs()
}

const handlePageChange = (newPage: number) => {
  pagination.value.page = newPage
  fetchLogs()
}

const toggleExpandRow = (logId: string) => {
  expandedRow.value = expandedRow.value === logId ? null : logId
}

const formatDate = (dateString: string | Date) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const getActionColor = (action: string) => {
  if (action.includes('create')) return '#10b981'
  if (action.includes('update')) return '#f59e0b'
  if (action.includes('delete') || action.includes('suspend') || action.includes('reject')) return '#ef4444'
  if (action.includes('approve') || action.includes('login')) return '#3b82f6'
  return '#6b7280'
}

const getRoleBadgeColor = (role: string) => {
  switch (role) {
    case 'system_admin':
      return '#ef4444'
    case 'tenant_admin':
      return '#f59e0b'
    case 'tenant_officer':
      return '#3b82f6'
    case 'tenant_approver':
      return '#8b5cf6'
    default:
      return '#6b7280'
  }
}

const getRoleLabel = (role: string) => {
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<template>
  <div class="audit-logs-page">
    <div class="page-header">
      <h1>System Audit Logs</h1>
      <p class="subtitle">Platform-wide activity trail</p>
    </div>

    <!-- Filters -->
    <div class="filters-section">
      <div class="filters-grid">
        <div class="filter-field">
          <label for="action">Action</label>
          <input
            id="action"
            v-model="filters.action"
            type="text"
            placeholder="e.g., auth.login, loan.approved"
            @change="handleFilterChange"
          />
        </div>

        <div class="filter-field">
          <label for="entity">Entity</label>
          <input
            id="entity"
            v-model="filters.entity"
            type="text"
            placeholder="e.g., User, LoanApplication"
            @change="handleFilterChange"
          />
        </div>

        <div class="filter-field">
          <label for="dateFrom">Date From</label>
          <input
            id="dateFrom"
            v-model="filters.dateFrom"
            type="date"
            @change="handleFilterChange"
          />
        </div>

        <div class="filter-field">
          <label for="dateTo">Date To</label>
          <input
            id="dateTo"
            v-model="filters.dateTo"
            type="date"
            @change="handleFilterChange"
          />
        </div>
      </div>

      <button class="clear-filters-button" @click="filters = { tenantId: '', action: '', entity: '', userId: '', dateFrom: '', dateTo: '' }; handleFilterChange()">
        Clear Filters
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner" />
      <p>Loading audit logs...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="logs.length === 0" class="empty-state">
      <svg class="empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <h3>No audit logs found</h3>
      <p>Try adjusting your filters or check back later.</p>
    </div>

    <!-- Audit Logs Table -->
    <div v-else class="table-container">
      <table class="audit-table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Tenant</th>
            <th>Action</th>
            <th>Entity</th>
            <th>IP Address</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="log in logs" :key="log.id">
            <tr class="log-row" @click="toggleExpandRow(log.id)">
              <td class="timestamp-cell">{{ formatDate(log.createdAt) }}</td>
              <td class="user-cell">
                <div class="user-info">
                  <div class="user-name">{{ log.userName }}</div>
                  <div class="user-email">{{ log.userEmail }}</div>
                  <span
                    class="role-badge"
                    :style="{ backgroundColor: getRoleBadgeColor(log.userRole) }"
                  >
                    {{ getRoleLabel(log.userRole) }}
                  </span>
                </div>
              </td>
              <td class="tenant-cell">{{ log.tenantName || 'System' }}</td>
              <td class="action-cell">
                <span
                  class="action-badge"
                  :style="{ backgroundColor: getActionColor(log.action) }"
                >
                  {{ log.action }}
                </span>
              </td>
              <td class="entity-cell">
                {{ log.entity }}
                <span class="entity-id">{{ log.entityId.slice(0, 8) }}...</span>
              </td>
              <td class="ip-cell">{{ log.ipAddress || 'N/A' }}</td>
              <td class="expand-cell">
                <svg
                  class="expand-icon"
                  :class="{ expanded: expandedRow === log.id }"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </td>
            </tr>

            <!-- Expanded Row Details -->
            <tr v-if="expandedRow === log.id" class="expanded-row">
              <td colspan="7">
                <div class="expanded-content">
                  <div class="detail-grid">
                    <div class="detail-item">
                      <span class="detail-label">User Agent:</span>
                      <span class="detail-value">{{ log.userAgent || 'N/A' }}</span>
                    </div>
                    <div class="detail-item">
                      <span class="detail-label">Entity ID:</span>
                      <span class="detail-value">{{ log.entityId }}</span>
                    </div>
                    <div v-if="log.metadata && Object.keys(log.metadata).length > 0" class="detail-item full-width">
                      <span class="detail-label">Metadata:</span>
                      <pre class="metadata-json">{{ JSON.stringify(log.metadata, null, 2) }}</pre>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div v-if="pagination.totalPages > 1" class="pagination">
      <button
        class="pagination-button"
        :disabled="pagination.page === 1"
        @click="handlePageChange(pagination.page - 1)"
      >
        Previous
      </button>
      <span class="pagination-info">
        Page {{ pagination.page }} of {{ pagination.totalPages }} ({{ pagination.total }} total)
      </span>
      <button
        class="pagination-button"
        :disabled="pagination.page === pagination.totalPages"
        @click="handlePageChange(pagination.page + 1)"
      >
        Next
      </button>
    </div>
  </div>
</template>

<style scoped>
.audit-logs-page {
  padding: 32px;
  max-width: 1600px;
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

.filters-section {
  margin-bottom: 24px;
  padding: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.filter-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-field label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.filter-field input {
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.filter-field input:focus {
  outline: none;
  border-color: #3b82f6;
}

.clear-filters-button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.clear-filters-button:hover {
  background: #f9fafb;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
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

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  text-align: center;
}

.empty-icon {
  color: #d1d5db;
  margin-bottom: 16px;
}

.empty-state h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.empty-state p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}

.table-container {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

.audit-table {
  width: 100%;
  border-collapse: collapse;
}

.audit-table thead {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.audit-table th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.log-row {
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  transition: background-color 0.2s;
}

.log-row:hover {
  background-color: #f9fafb;
}

.audit-table td {
  padding: 16px;
  font-size: 14px;
  color: #111827;
}

.timestamp-cell {
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  font-size: 13px;
  color: #6b7280;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-weight: 600;
  color: #111827;
}

.user-email {
  font-size: 13px;
  color: #6b7280;
}

.role-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  text-transform: capitalize;
  margin-top: 4px;
  width: fit-content;
}

.action-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
}

.entity-id {
  display: block;
  font-size: 12px;
  color: #9ca3af;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  margin-top: 2px;
}

.expand-icon {
  color: #9ca3af;
  transition: transform 0.2s;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.expanded-row {
  background-color: #f9fafb;
}

.expanded-content {
  padding: 16px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 13px;
  font-weight: 600;
  color: #6b7280;
}

.detail-value {
  font-size: 14px;
  color: #111827;
  word-break: break-all;
}

.metadata-json {
  margin: 0;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
  overflow-x: auto;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 24px;
}

.pagination-button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 14px;
  color: #6b7280;
}
</style>
