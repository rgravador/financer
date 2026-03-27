<template>
  <div class="audit-logs-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <v-icon size="28">mdi-shield-check</v-icon>
        </div>
        <div class="header-text">
          <h1 class="page-title">Activity Audit Log</h1>
          <p class="page-subtitle">Track and monitor all tenant activity for compliance and security</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn secondary-btn" @click="exportLogs" :disabled="exportLoading">
          <v-icon size="18">mdi-download</v-icon>
          {{ exportLoading ? 'Exporting...' : 'Export CSV' }}
        </button>
        <button class="action-btn primary-btn" @click="fetchLogs">
          <v-icon size="18">mdi-refresh</v-icon>
          Refresh
        </button>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-value">{{ pagination.total }}</span>
        <span class="stat-label">Total Events</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value stat-create">{{ actionCounts.create }}</span>
        <span class="stat-label">Created</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value stat-update">{{ actionCounts.update }}</span>
        <span class="stat-label">Updated</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value stat-delete">{{ actionCounts.delete }}</span>
        <span class="stat-label">Deleted</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value stat-login">{{ actionCounts.login }}</span>
        <span class="stat-label">Logins</span>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <!-- Search -->
      <div class="search-container">
        <v-icon size="20" class="search-icon">mdi-magnify</v-icon>
        <input
          v-model="searchQuery"
          type="text"
          class="search-input"
          placeholder="Search by user or entity..."
          @keyup.enter="applySearch"
        />
        <button v-if="searchQuery" class="clear-search" @click="clearSearch">
          <v-icon size="16">mdi-close</v-icon>
        </button>
      </div>

      <!-- Filter Chips -->
      <div class="filter-chips">
        <button
          v-for="filter in actionFilters"
          :key="filter.value"
          :class="['filter-chip', { active: selectedAction === filter.value }]"
          @click="setActionFilter(filter.value)"
        >
          <v-icon size="16">{{ filter.icon }}</v-icon>
          {{ filter.label }}
        </button>
      </div>

      <!-- Entity Filter -->
      <div class="entity-filter">
        <select v-model="selectedEntity" class="entity-select" @change="applyFilters">
          <option value="">All Entities</option>
          <option v-for="entity in entityOptions" :key="entity" :value="entity">
            {{ formatEntityName(entity) }}
          </option>
        </select>
      </div>

      <!-- User Filter -->
      <div class="user-filter">
        <select v-model="selectedUserId" class="user-select" @change="applyFilters">
          <option value="">All Users</option>
          <option v-for="user in userOptions" :key="user.id" :value="user.id">
            {{ user.name }}
          </option>
        </select>
      </div>

      <!-- Date Range -->
      <div class="date-filter">
        <button
          v-for="range in dateRanges"
          :key="range.value"
          :class="['date-chip', { active: selectedDateRange === range.value }]"
          @click="setDateRange(range.value)"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <!-- Logs Container -->
    <div class="logs-container">
      <div v-if="loading" class="loading-state">
        <v-progress-circular indeterminate color="primary" size="48" />
        <p>Loading audit logs...</p>
      </div>

      <div v-else-if="logs.length === 0" class="empty-state">
        <div class="empty-icon">
          <v-icon size="56">mdi-file-search-outline</v-icon>
        </div>
        <h3 class="empty-title">No audit logs found</h3>
        <p class="empty-text">
          {{ hasActiveFilters
            ? 'Try adjusting your filters or search query'
            : 'Activity logs will appear here once actions are performed'
          }}
        </p>
        <button v-if="hasActiveFilters" class="clear-filters-btn" @click="clearAllFilters">
          Clear All Filters
        </button>
      </div>

      <div v-else class="logs-table">
        <div class="table-header">
          <div class="col-timestamp">Timestamp</div>
          <div class="col-action">Action</div>
          <div class="col-user">User</div>
          <div class="col-entity">Entity</div>
          <div class="col-ip">IP Address</div>
          <div class="col-details">Details</div>
        </div>

        <div class="table-body">
          <div
            v-for="log in logs"
            :key="log.id"
            class="log-row"
            @click="viewLogDetails(log)"
          >
            <div class="col-timestamp">
              <span class="timestamp-date">{{ formatDate(log.createdAt) }}</span>
              <span class="timestamp-time">{{ formatTime(log.createdAt) }}</span>
            </div>
            <div class="col-action">
              <div :class="['action-badge', `action-${getActionType(log.action)}`]">
                <v-icon size="14">{{ getActionIcon(log.action) }}</v-icon>
                {{ formatAction(log.action) }}
              </div>
            </div>
            <div class="col-user">
              <div class="user-info">
                <div class="user-avatar">{{ getInitial(log.userName) }}</div>
                <div class="user-details">
                  <span class="user-name">{{ log.userName }}</span>
                  <span class="user-role">{{ formatRole(log.userRole) }}</span>
                </div>
              </div>
            </div>
            <div class="col-entity">
              <span class="entity-type">{{ formatEntityName(log.entity) }}</span>
              <span class="entity-id">{{ truncateId(log.entityId) }}</span>
            </div>
            <div class="col-ip">
              <span class="ip-address">{{ log.ipAddress || 'N/A' }}</span>
            </div>
            <div class="col-details">
              <button class="details-btn">
                <v-icon size="16">mdi-chevron-right</v-icon>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="logs.length > 0" class="pagination">
        <div class="pagination-info">
          Showing {{ startIndex + 1 }} - {{ endIndex }} of {{ pagination.total }} logs
        </div>
        <div class="pagination-controls">
          <button
            class="page-btn"
            :disabled="pagination.page === 1"
            @click="goToPage(pagination.page - 1)"
          >
            <v-icon size="18">mdi-chevron-left</v-icon>
          </button>
          <span class="page-indicator">Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
          <button
            class="page-btn"
            :disabled="pagination.page === pagination.totalPages"
            @click="goToPage(pagination.page + 1)"
          >
            <v-icon size="18">mdi-chevron-right</v-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Log Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="640">
      <div v-if="selectedLog" class="details-dialog">
        <div class="dialog-header">
          <div class="dialog-icon">
            <v-icon size="24">{{ getActionIcon(selectedLog.action) }}</v-icon>
          </div>
          <div class="dialog-title-content">
            <h3 class="dialog-title">Audit Log Details</h3>
            <p class="dialog-subtitle">{{ formatAction(selectedLog.action) }}</p>
          </div>
          <button class="dialog-close" @click="detailsDialog = false">
            <v-icon size="20">mdi-close</v-icon>
          </button>
        </div>
        <div class="dialog-body">
          <div class="detail-group">
            <label>Timestamp</label>
            <span>{{ formatFullDate(selectedLog.createdAt) }}</span>
          </div>
          <div class="detail-group">
            <label>User</label>
            <span>{{ selectedLog.userName }} ({{ formatRole(selectedLog.userRole) }})</span>
          </div>
          <div class="detail-group">
            <label>Email</label>
            <span>{{ selectedLog.userEmail }}</span>
          </div>
          <div class="detail-group">
            <label>Action</label>
            <span>{{ formatAction(selectedLog.action) }}</span>
          </div>
          <div class="detail-group">
            <label>Entity</label>
            <span>{{ formatEntityName(selectedLog.entity) }}</span>
          </div>
          <div class="detail-group">
            <label>Entity ID</label>
            <span class="mono-text">{{ selectedLog.entityId }}</span>
          </div>
          <div class="detail-group">
            <label>IP Address</label>
            <span class="mono-text">{{ selectedLog.ipAddress || 'N/A' }}</span>
          </div>
          <div v-if="selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0" class="detail-group full-width">
            <label>Changes / Metadata</label>
            <pre class="changes-code">{{ JSON.stringify(selectedLog.metadata, null, 2) }}</pre>
          </div>
        </div>
        <div class="dialog-footer">
          <button class="dialog-btn secondary" @click="detailsDialog = false">Close</button>
        </div>
      </div>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['tenant_admin'],
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
  metadata: Record<string, any>
  ipAddress: string | null
  userAgent: string | null
  createdAt: string
}

interface TenantUser {
  id: string
  firstName: string
  lastName: string
}

// Auth
const auth = useAuthStore()

// State
const loading = ref(false)
const exportLoading = ref(false)
const logs = ref<AuditLogEntry[]>([])
const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
})

// Filters
const searchQuery = ref('')
const selectedAction = ref('')
const selectedEntity = ref('')
const selectedUserId = ref('')
const selectedDateRange = ref('7d')

// User options for filter
const userOptions = ref<{ id: string; name: string }[]>([])

// Dialog
const detailsDialog = ref(false)
const selectedLog = ref<AuditLogEntry | null>(null)

// Filter options
const actionFilters = [
  { value: '', label: 'All', icon: 'mdi-view-list' },
  { value: 'login', label: 'Login', icon: 'mdi-login' },
  { value: 'create', label: 'Create', icon: 'mdi-plus-circle' },
  { value: 'update', label: 'Update', icon: 'mdi-pencil' },
  { value: 'delete', label: 'Delete', icon: 'mdi-delete' },
]

const entityOptions = [
  'user',
  'loan-type',
  'loan-application',
  'borrower',
  'tenant-settings',
  'approval',
]

const dateRanges = [
  { value: '24h', label: 'Last 24h' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: '', label: 'All time' },
]

// Computed
const hasActiveFilters = computed(() => {
  return searchQuery.value || selectedAction.value || selectedEntity.value || selectedUserId.value
})

const startIndex = computed(() => (pagination.value.page - 1) * pagination.value.limit)
const endIndex = computed(() => Math.min(startIndex.value + pagination.value.limit, pagination.value.total))

const actionCounts = computed(() => {
  const counts = {
    create: 0,
    update: 0,
    delete: 0,
    login: 0,
  }
  logs.value.forEach((log) => {
    const type = getActionType(log.action)
    if (type in counts) {
      counts[type as keyof typeof counts]++
    }
  })
  return counts
})

// Methods
const getDateRange = () => {
  if (!selectedDateRange.value) return { dateFrom: undefined, dateTo: undefined }

  const now = new Date()
  let dateFrom: Date

  switch (selectedDateRange.value) {
    case '24h':
      dateFrom = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case '7d':
      dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '30d':
      dateFrom = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case '90d':
      dateFrom = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      break
    default:
      return { dateFrom: undefined, dateTo: undefined }
  }

  return {
    dateFrom: dateFrom.toISOString(),
    dateTo: now.toISOString(),
  }
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const { dateFrom, dateTo } = getDateRange()
    const params = new URLSearchParams()

    params.append('page', pagination.value.page.toString())
    params.append('limit', pagination.value.limit.toString())

    if (selectedAction.value) params.append('action', selectedAction.value)
    if (selectedEntity.value) params.append('entity', selectedEntity.value)
    if (selectedUserId.value) params.append('userId', selectedUserId.value)
    if (dateFrom) params.append('dateFrom', dateFrom)
    if (dateTo) params.append('dateTo', dateTo)

    const response = await auth.authenticatedFetch(`/api/tenant/audit-logs?${params.toString()}`)
    logs.value = response.logs
    pagination.value = {
      ...pagination.value,
      total: response.pagination.total,
      totalPages: response.pagination.totalPages,
    }
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
  } finally {
    loading.value = false
  }
}

const fetchUsers = async () => {
  try {
    const response = await auth.authenticatedFetch('/api/tenant/users')
    userOptions.value = response.users.map((u: TenantUser) => ({
      id: u.id,
      name: `${u.firstName} ${u.lastName}`,
    }))
  } catch (error) {
    console.error('Failed to fetch users:', error)
  }
}

const applySearch = () => {
  pagination.value.page = 1
  fetchLogs()
}

const clearSearch = () => {
  searchQuery.value = ''
  applySearch()
}

const setActionFilter = (value: string) => {
  selectedAction.value = value
  pagination.value.page = 1
  fetchLogs()
}

const setDateRange = (value: string) => {
  selectedDateRange.value = value
  pagination.value.page = 1
  fetchLogs()
}

const applyFilters = () => {
  pagination.value.page = 1
  fetchLogs()
}

const clearAllFilters = () => {
  searchQuery.value = ''
  selectedAction.value = ''
  selectedEntity.value = ''
  selectedUserId.value = ''
  selectedDateRange.value = '7d'
  pagination.value.page = 1
  fetchLogs()
}

const goToPage = (page: number) => {
  pagination.value.page = page
  fetchLogs()
}

const viewLogDetails = (log: AuditLogEntry) => {
  selectedLog.value = log
  detailsDialog.value = true
}

const exportLogs = async () => {
  exportLoading.value = true
  try {
    const { dateFrom, dateTo } = getDateRange()
    const params = new URLSearchParams()

    params.append('limit', '1000') // Export up to 1000 records
    if (selectedAction.value) params.append('action', selectedAction.value)
    if (selectedEntity.value) params.append('entity', selectedEntity.value)
    if (selectedUserId.value) params.append('userId', selectedUserId.value)
    if (dateFrom) params.append('dateFrom', dateFrom)
    if (dateTo) params.append('dateTo', dateTo)

    const response = await auth.authenticatedFetch(`/api/tenant/audit-logs?${params.toString()}`)

    // Convert to CSV
    const headers = ['Timestamp', 'User', 'Email', 'Role', 'Action', 'Entity', 'Entity ID', 'IP Address']
    const rows = response.logs.map((log: AuditLogEntry) => [
      new Date(log.createdAt).toISOString(),
      log.userName,
      log.userEmail,
      log.userRole,
      log.action,
      log.entity,
      log.entityId,
      log.ipAddress || '',
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map((row: string[]) => row.map((cell: string) => `"${cell}"`).join(',')),
    ].join('\n')

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Failed to export logs:', error)
  } finally {
    exportLoading.value = false
  }
}

// Formatting helpers
const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

const formatTime = (date: string) => {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatFullDate = (date: string) => {
  return new Date(date).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const formatAction = (action: string) => {
  return action
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatEntityName = (entity: string) => {
  return entity
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatRole = (role: string) => {
  const roleMap: Record<string, string> = {
    tenant_admin: 'Administrator',
    tenant_officer: 'Officer',
    tenant_approver: 'Approver',
  }
  return roleMap[role] || role
}

const getActionType = (action: string): string => {
  if (action.includes('login') || action.includes('logout')) return 'login'
  if (action.includes('create') || action.includes('add')) return 'create'
  if (action.includes('update') || action.includes('edit') || action.includes('change')) return 'update'
  if (action.includes('delete') || action.includes('remove')) return 'delete'
  return 'other'
}

const getActionIcon = (action: string) => {
  const type = getActionType(action)
  const icons: Record<string, string> = {
    create: 'mdi-plus-circle',
    update: 'mdi-pencil',
    delete: 'mdi-delete',
    login: 'mdi-login',
    other: 'mdi-information',
  }
  return icons[type] || 'mdi-information'
}

const getInitial = (name: string) => {
  if (!name) return '?'
  const parts = name.split(' ')
  return parts.length > 1
    ? `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    : name.charAt(0).toUpperCase()
}

const truncateId = (id: string) => {
  if (!id || id.length <= 8) return id
  return `${id.slice(0, 4)}...${id.slice(-4)}`
}

// Lifecycle
onMounted(() => {
  fetchLogs()
  fetchUsers()
})
</script>

<style scoped>
/* Audit Logs Page - Tenant Admin */
.audit-logs-page {
  min-height: 100%;
  padding: 32px;
  transition: background-color var(--transition-base), color var(--transition-base);
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 28px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 20px;
}

.header-icon {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%);
  border-radius: var(--border-radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgb(245 158 11 / 0.25);
}

.header-text {
  padding-top: 6px;
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
  line-height: 1.5;
  transition: color var(--transition-base);
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-shrink: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
}

.action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.primary-btn {
  background: var(--accent-primary);
  color: var(--text-inverse);
}

.primary-btn:hover:not(:disabled) {
  background: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgb(245 158 11 / 0.3);
}

.secondary-btn {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  transition: all var(--transition-base);
}

.secondary-btn:hover:not(:disabled) {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* Stats Bar */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 40px;
  padding: 24px 32px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: 28px;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  transition: color var(--transition-base);
}

.stat-create { color: var(--color-success); }
.stat-update { color: var(--color-info); }
.stat-delete { color: var(--color-error); }
.stat-login { color: #8b5cf6; }

.stat-label {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color var(--transition-base);
}

.stat-divider {
  width: 1px;
  height: 48px;
  background: var(--border-color);
  transition: background-color var(--transition-base);
}

/* Filters Section */
.filters-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;
}

.search-container {
  position: relative;
  min-width: 320px;
  flex: 1;
  max-width: 400px;
}

.search-icon {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  transition: color var(--transition-base);
}

.search-input {
  width: 100%;
  padding: 14px 44px 14px 48px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
  transition: all var(--transition-base);
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgb(245 158 11 / 0.15);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.clear-search {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 28px;
  height: 28px;
  border: none;
  background: var(--bg-hover);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
}

.clear-search:hover {
  background: var(--border-color);
  color: var(--text-primary);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
}

.filter-chip:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.filter-chip.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: var(--text-inverse);
}

.entity-filter,
.user-filter {
  min-width: 160px;
}

.entity-select,
.user-select {
  width: 100%;
  padding: 12px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-base);
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
}

.entity-select:focus,
.user-select:focus {
  outline: none;
  border-color: var(--accent-primary);
}

.date-filter {
  display: flex;
  gap: 8px;
}

.date-chip {
  padding: 10px 16px;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-sm);
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-base);
}

.date-chip:hover {
  color: var(--accent-primary);
  background: var(--bg-hover);
}

.date-chip.active {
  color: var(--accent-primary);
  background: var(--bg-sidebar-active);
}

/* Logs Container */
.logs-container {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
  text-align: center;
  gap: 16px;
}

.loading-state p {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

.empty-icon {
  width: 100px;
  height: 100px;
  background: var(--bg-hover);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  transition: background-color var(--transition-base), color var(--transition-base);
}

.empty-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  transition: color var(--transition-base);
}

.empty-text {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  max-width: 320px;
  line-height: 1.5;
  transition: color var(--transition-base);
}

.clear-filters-btn {
  padding: 12px 24px;
  background: var(--accent-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--border-radius);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  margin-top: 8px;
}

.clear-filters-btn:hover {
  background: var(--accent-hover);
}

/* Logs Table */
.logs-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 130px 160px 1fr 150px 130px 60px;
  gap: 16px;
  padding: 18px 28px;
  background: var(--bg-hover);
  border-bottom: 1px solid var(--border-color);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.table-body {
  max-height: 600px;
  overflow-y: auto;
}

.log-row {
  display: grid;
  grid-template-columns: 130px 160px 1fr 150px 130px 60px;
  gap: 16px;
  padding: 18px 28px;
  border-bottom: 1px solid var(--border-color);
  align-items: center;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.log-row:hover {
  background: var(--bg-hover);
}

.log-row:last-child {
  border-bottom: none;
}

/* Column Styles */
.col-timestamp {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.timestamp-date {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  transition: color var(--transition-base);
}

.timestamp-time {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
  transition: color var(--transition-base);
}

.action-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  border-radius: var(--border-radius-sm);
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
}

.action-create {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.action-update {
  background: rgba(59, 130, 246, 0.1);
  color: var(--color-info);
}

.action-delete {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.action-login {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.action-other {
  background: var(--bg-hover);
  color: var(--text-muted);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-inverse);
  flex-shrink: 0;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.user-name {
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-base);
}

.user-role {
  font-family: var(--font-sans);
  font-size: 12px;
  color: var(--text-muted);
  transition: color var(--transition-base);
}

.col-entity {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.entity-type {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  transition: color var(--transition-base);
}

.entity-id {
  font-family: monospace;
  font-size: 11px;
  color: var(--text-muted);
  opacity: 0.8;
  transition: color var(--transition-base);
}

.col-ip {
  display: flex;
  align-items: center;
}

.ip-address {
  font-family: monospace;
  font-size: 12px;
  color: var(--text-muted);
  transition: color var(--transition-base);
}

.details-btn {
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.details-btn:hover {
  background: var(--bg-hover);
  color: var(--accent-primary);
}

/* Pagination */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 28px;
  border-top: 1px solid var(--border-color);
  transition: border-color var(--transition-base);
}

.pagination-info {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  transition: color var(--transition-base);
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 14px;
}

.page-btn {
  width: 40px;
  height: 40px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-indicator {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color var(--transition-base);
}

/* Details Dialog */
.details-dialog {
  background: var(--bg-card);
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: background-color var(--transition-base);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 28px;
  border-bottom: 1px solid var(--border-color);
  transition: border-color var(--transition-base);
}

.dialog-icon {
  width: 56px;
  height: 56px;
  background: rgb(245 158 11 / 0.1);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
}

.dialog-title-content {
  flex: 1;
}

.dialog-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  transition: color var(--transition-base);
}

.dialog-subtitle {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  transition: color var(--transition-base);
}

.dialog-close {
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  border-radius: var(--border-radius-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.dialog-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.dialog-body {
  padding: 28px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.detail-group.full-width {
  grid-column: 1 / -1;
}

.detail-group label {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color var(--transition-base);
}

.detail-group span {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-primary);
  transition: color var(--transition-base);
}

.mono-text {
  font-family: monospace;
}

.changes-code {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16px;
  font-family: monospace;
  font-size: 12px;
  color: var(--text-primary);
  overflow-x: auto;
  margin: 0;
  line-height: 1.5;
  transition: background-color var(--transition-base), border-color var(--transition-base), color var(--transition-base);
}

.dialog-footer {
  padding: 20px 28px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  transition: border-color var(--transition-base);
}

.dialog-btn {
  padding: 12px 24px;
  border-radius: var(--border-radius);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
}

.dialog-btn.secondary {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.dialog-btn.secondary:hover {
  background: var(--bg-sidebar-active);
}

/* Responsive */
@media (max-width: 1200px) {
  .table-header,
  .log-row {
    grid-template-columns: 110px 140px 1fr 130px 100px 50px;
    gap: 12px;
    padding: 16px 24px;
  }
}

@media (max-width: 1000px) {
  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: 100%;
  }

  .filter-chips {
    flex-wrap: wrap;
  }

  .date-filter {
    flex-wrap: wrap;
  }

  .entity-filter,
  .user-filter {
    width: 100%;
  }
}

@media (max-width: 900px) {
  .audit-logs-page {
    padding: 24px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .stats-bar {
    flex-wrap: wrap;
    gap: 24px;
    padding: 20px 24px;
  }

  .stat-divider {
    display: none;
  }

  .table-header {
    display: none;
  }

  .log-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    padding: 20px 24px;
  }

  .user-info {
    width: 100%;
  }

  .dialog-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .audit-logs-page {
    padding: 16px;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-icon {
    width: 56px;
    height: 56px;
  }

  .page-title {
    font-size: 26px;
  }

  .filter-chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 8px;
  }

  .date-filter {
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .pagination {
    flex-direction: column;
    gap: 16px;
  }
}
</style>
