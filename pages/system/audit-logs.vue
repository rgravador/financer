<template>
  <div class="audit-logs-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <v-icon size="28">mdi-shield-check</v-icon>
        </div>
        <div class="header-text">
          <h1 class="page-title">System Audit Logs</h1>
          <p class="page-subtitle">Monitor and analyze all system-wide activity in real-time</p>
        </div>
      </div>
      <div class="header-actions">
        <button class="action-btn secondary-btn" @click="exportToCsv">
          <v-icon size="18">mdi-download</v-icon>
          Export
        </button>
        <button class="action-btn primary-btn" @click="refreshLogs">
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
        <span class="stat-value stat-success">{{ stats.creates }}</span>
        <span class="stat-label">Creates</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value stat-info">{{ stats.updates }}</span>
        <span class="stat-label">Updates</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value stat-error">{{ stats.deletes }}</span>
        <span class="stat-label">Deletes</span>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <!-- Search and Tenant Filter -->
      <div class="filters-row">
        <div class="search-container">
          <v-icon size="20" class="search-icon">mdi-magnify</v-icon>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search by user, action, or entity..."
            @input="debouncedFetch"
          />
          <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''; fetchLogs()">
            <v-icon size="16">mdi-close</v-icon>
          </button>
        </div>

        <v-select
          v-model="selectedTenant"
          :items="tenantOptions"
          item-title="name"
          item-value="id"
          label="Filter by Tenant"
          variant="outlined"
          density="compact"
          clearable
          hide-details
          class="tenant-select"
          @update:model-value="fetchLogs"
        />
      </div>

      <!-- Filter Chips -->
      <div class="filter-chips">
        <button
          v-for="filter in actionFilters"
          :key="filter.value"
          :class="['filter-chip', { active: selectedAction === filter.value }]"
          @click="selectedAction = filter.value; fetchLogs()"
        >
          <v-icon size="16">{{ filter.icon }}</v-icon>
          {{ filter.label }}
        </button>
      </div>

      <!-- Date Range -->
      <div class="date-filter">
        <button
          v-for="range in dateRanges"
          :key="range.value"
          :class="['date-chip', { active: selectedDateRange === range.value }]"
          @click="selectedDateRange = range.value; fetchLogs()"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <!-- Logs Table -->
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
          {{ searchQuery || selectedAction !== 'all' || selectedTenant
            ? 'Try adjusting your filters or search query'
            : 'System audit logs will appear here once activity is recorded'
          }}
        </p>
        <button v-if="searchQuery || selectedAction !== 'all' || selectedTenant" class="clear-filters-btn" @click="clearFilters">
          Clear Filters
        </button>
      </div>

      <div v-else class="logs-table">
        <div class="table-header">
          <div class="col-timestamp">Timestamp</div>
          <div class="col-action">Action</div>
          <div class="col-user">User</div>
          <div class="col-entity">Entity</div>
          <div class="col-tenant">Tenant</div>
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
                {{ formatActionName(log.action) }}
              </div>
            </div>
            <div class="col-user">
              <div class="user-info">
                <div class="user-avatar">{{ getUserInitials(log.user) }}</div>
                <div class="user-details">
                  <span class="user-name">{{ log.user?.fullName || log.user?.email || 'System' }}</span>
                  <span class="user-role">{{ log.user?.email || '' }}</span>
                </div>
              </div>
            </div>
            <div class="col-entity">
              <span class="entity-type">{{ log.entity }}</span>
              <span class="entity-id">{{ formatEntityId(log.entityId) }}</span>
            </div>
            <div class="col-tenant">
              <span class="tenant-name">{{ log.tenant?.name || 'System' }}</span>
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
            @click="pagination.page--; fetchLogs()"
          >
            <v-icon size="18">mdi-chevron-left</v-icon>
          </button>
          <span class="page-indicator">Page {{ pagination.page }} of {{ pagination.totalPages }}</span>
          <button
            class="page-btn"
            :disabled="pagination.page === pagination.totalPages"
            @click="pagination.page++; fetchLogs()"
          >
            <v-icon size="18">mdi-chevron-right</v-icon>
          </button>
        </div>
      </div>
    </div>

    <!-- Log Details Dialog -->
    <v-dialog v-model="detailsDialog" max-width="600">
      <div v-if="selectedLog" class="details-dialog">
        <div class="dialog-header">
          <div class="dialog-icon">
            <v-icon size="24">{{ getActionIcon(selectedLog.action) }}</v-icon>
          </div>
          <div class="dialog-title-content">
            <h3 class="dialog-title">Audit Log Details</h3>
            <p class="dialog-subtitle">{{ formatActionName(selectedLog.action) }}</p>
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
            <span>{{ selectedLog.user?.fullName || selectedLog.user?.email || 'System' }}</span>
          </div>
          <div class="detail-group">
            <label>Action</label>
            <span>{{ formatActionName(selectedLog.action) }}</span>
          </div>
          <div class="detail-group">
            <label>Entity</label>
            <span>{{ selectedLog.entity }}: {{ selectedLog.entityId }}</span>
          </div>
          <div class="detail-group">
            <label>Tenant</label>
            <span>{{ selectedLog.tenant?.name || 'System-wide' }}</span>
          </div>
          <div class="detail-group">
            <label>IP Address</label>
            <span class="mono-text">{{ selectedLog.ipAddress || 'N/A' }}</span>
          </div>
          <div class="detail-group">
            <label>User Agent</label>
            <span class="mono-text small-text">{{ selectedLog.userAgent || 'N/A' }}</span>
          </div>
          <div v-if="selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0" class="detail-group full-width">
            <label>Metadata</label>
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
import { useSystemStore } from '~/stores/system'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['system_admin'],
})

interface AuditLogUser {
  _id: string
  email: string
  fullName?: string
}

interface AuditLogTenant {
  _id: string
  name: string
  slug: string
}

interface AuditLog {
  id: string
  action: string
  entity: string
  entityId: string
  user: AuditLogUser | null
  tenant: AuditLogTenant | null
  metadata?: Record<string, unknown>
  ipAddress?: string
  userAgent?: string
  createdAt: string
}

interface TenantOption {
  id: string | null
  name: string
}

const auth = useAuthStore()
const systemStore = useSystemStore()

// State
const loading = ref(false)
const logs = ref<AuditLog[]>([])
const searchQuery = ref('')
const selectedAction = ref('all')
const selectedDateRange = ref('7d')
const selectedTenant = ref<string | null>(null)
const detailsDialog = ref(false)
const selectedLog = ref<AuditLog | null>(null)

const pagination = ref({
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
})

const stats = ref({
  creates: 0,
  updates: 0,
  deletes: 0,
})

// Fetch tenants for filter
const tenantOptions = computed<TenantOption[]>(() => {
  const options: TenantOption[] = [{ id: null, name: 'All Tenants' }]
  if (systemStore.tenants) {
    systemStore.tenants.forEach(t => {
      options.push({ id: t._id, name: t.name })
    })
  }
  return options
})

// Action filters
const actionFilters = [
  { value: 'all', label: 'All', icon: 'mdi-view-list' },
  { value: 'login', label: 'Logins', icon: 'mdi-login' },
  { value: 'create', label: 'Creates', icon: 'mdi-plus-circle' },
  { value: 'update', label: 'Updates', icon: 'mdi-pencil' },
  { value: 'delete', label: 'Deletes', icon: 'mdi-delete' },
]

const dateRanges = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
]

// Computed
const startIndex = computed(() => (pagination.value.page - 1) * pagination.value.limit)
const endIndex = computed(() => Math.min(startIndex.value + pagination.value.limit, pagination.value.total))

// Debounce helper
let debounceTimer: NodeJS.Timeout | null = null
const debouncedFetch = () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => {
    pagination.value.page = 1
    fetchLogs()
  }, 300)
}

// Methods
const getDateRange = () => {
  const now = new Date()
  let dateFrom: Date | null = null

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
    default:
      dateFrom = null
  }

  return dateFrom ? dateFrom.toISOString() : null
}

const fetchLogs = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    params.append('page', pagination.value.page.toString())
    params.append('limit', pagination.value.limit.toString())

    if (selectedTenant.value) {
      params.append('tenantId', selectedTenant.value)
    }

    if (selectedAction.value !== 'all') {
      params.append('action', selectedAction.value)
    }

    const dateFrom = getDateRange()
    if (dateFrom) {
      params.append('dateFrom', dateFrom)
    }

    const response = await auth.authenticatedFetch(`/api/system/audit-logs?${params.toString()}`)

    // Transform API response to match UI interface
    logs.value = response.logs.map((log: any) => ({
      id: log._id,
      action: log.action,
      entity: log.entity,
      entityId: log.entityId,
      user: log.userId,
      tenant: log.tenantId,
      metadata: log.metadata,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
    }))

    pagination.value = {
      ...pagination.value,
      total: response.pagination.total,
      totalPages: response.pagination.totalPages,
    }

    // Calculate stats from current page (could be enhanced with separate API)
    stats.value = {
      creates: logs.value.filter(l => l.action.toLowerCase().includes('create')).length,
      updates: logs.value.filter(l => l.action.toLowerCase().includes('update')).length,
      deletes: logs.value.filter(l => l.action.toLowerCase().includes('delete')).length,
    }
  } catch (error) {
    console.error('Failed to fetch audit logs:', error)
  } finally {
    loading.value = false
  }
}

const refreshLogs = () => {
  pagination.value.page = 1
  fetchLogs()
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedAction.value = 'all'
  selectedDateRange.value = '7d'
  selectedTenant.value = null
  pagination.value.page = 1
  fetchLogs()
}

const viewLogDetails = (log: AuditLog) => {
  selectedLog.value = log
  detailsDialog.value = true
}

const exportToCsv = () => {
  if (logs.value.length === 0) return

  const headers = ['Timestamp', 'Action', 'Entity', 'Entity ID', 'User', 'Tenant', 'IP Address']
  const rows = logs.value.map(log => [
    formatFullDate(log.createdAt),
    formatActionName(log.action),
    log.entity,
    log.entityId,
    log.user?.fullName || log.user?.email || 'System',
    log.tenant?.name || 'System',
    log.ipAddress || 'N/A',
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', `system-audit-logs-${new Date().toISOString().split('T')[0]}.csv`)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
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

const formatActionName = (action: string) => {
  return action
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

const getActionType = (action: string): string => {
  const lowerAction = action.toLowerCase()
  if (lowerAction.includes('create')) return 'create'
  if (lowerAction.includes('update')) return 'update'
  if (lowerAction.includes('delete')) return 'delete'
  if (lowerAction.includes('login') || lowerAction.includes('logout')) return 'login'
  return 'system'
}

const getActionIcon = (action: string) => {
  const type = getActionType(action)
  const icons: Record<string, string> = {
    create: 'mdi-plus-circle',
    update: 'mdi-pencil',
    delete: 'mdi-delete',
    login: 'mdi-login',
    system: 'mdi-cog',
  }
  return icons[type] || 'mdi-information'
}

const getUserInitials = (user: AuditLogUser | null): string => {
  if (!user) return 'S'
  if (user.fullName) {
    const parts = user.fullName.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return user.fullName.substring(0, 2).toUpperCase()
  }
  return user.email.substring(0, 2).toUpperCase()
}

const formatEntityId = (id: string): string => {
  if (!id) return 'N/A'
  if (id.length > 12) {
    return `...${id.slice(-8)}`
  }
  return id
}

// Load data on mount
onMounted(async () => {
  await Promise.all([
    fetchLogs(),
    systemStore.fetchTenants(),
  ])
})
</script>

<style scoped>
/* Audit Logs Page - Uses global CSS custom properties for dark mode support */
.audit-logs-page {
  min-height: 100%;
  transition: background-color var(--transition-base), color var(--transition-base);
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.header-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.header-icon {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%);
  border-radius: var(--border-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  flex-shrink: 0;
}

.header-text {
  padding-top: 4px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 6px 0;
  transition: color var(--transition-base);
}

.page-subtitle {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
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
  padding: 12px 20px;
  border-radius: var(--border-radius);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
}

.primary-btn {
  background: var(--accent-primary);
  color: var(--text-inverse);
}

.primary-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

.secondary-btn {
  background: var(--bg-card);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  transition: all var(--transition-base);
}

.secondary-btn:hover {
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

/* Stats Bar */
.stats-bar {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 20px 28px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: 24px;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  transition: color var(--transition-base);
}

.stat-success { color: var(--color-success); }
.stat-info { color: var(--color-info); }
.stat-warning { color: var(--color-warning); }
.stat-error { color: var(--color-error); }

.stat-label {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color var(--transition-base);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-color);
  transition: background-color var(--transition-base);
}

/* Filters Section */
.filters-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.filters-row {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-container {
  position: relative;
  flex: 1;
  max-width: 400px;
}

.tenant-select {
  width: 250px;
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
  width: 24px;
  height: 24px;
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

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
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

.date-filter {
  display: flex;
  gap: 8px;
}

.date-chip {
  padding: 8px 16px;
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
  font-size: 18px;
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
  max-width: 300px;
  transition: color var(--transition-base);
}

.clear-filters-btn {
  padding: 10px 20px;
  background: var(--accent-primary);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--border-radius);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
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
  grid-template-columns: 120px 160px 1fr 140px 120px 60px;
  gap: 16px;
  padding: 16px 24px;
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
  max-height: 500px;
  overflow-y: auto;
}

.log-row {
  display: grid;
  grid-template-columns: 120px 160px 1fr 140px 120px 60px;
  gap: 16px;
  padding: 16px 24px;
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
  gap: 2px;
}

.timestamp-date {
  font-family: var(--font-sans);
  font-size: 13px;
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
  gap: 6px;
  padding: 6px 12px;
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

.action-system {
  background: var(--bg-hover);
  color: var(--text-muted);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.user-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-inverse);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.user-name {
  font-family: var(--font-sans);
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color var(--transition-base);
}

.user-role {
  font-family: var(--font-sans);
  font-size: 11px;
  color: var(--text-muted);
  transition: color var(--transition-base);
}

.col-entity {
  display: flex;
  flex-direction: column;
  gap: 2px;
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
  opacity: 0.7;
  transition: color var(--transition-base);
}

.col-tenant {
  display: flex;
  align-items: center;
}

.tenant-name {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-primary);
  transition: color var(--transition-base);
}

.details-btn {
  width: 32px;
  height: 32px;
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
  padding: 16px 24px;
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
  gap: 12px;
}

.page-btn {
  width: 36px;
  height: 36px;
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
  gap: 16px;
  padding: 24px;
  border-bottom: 1px solid var(--border-color);
  transition: border-color var(--transition-base);
}

.dialog-icon {
  width: 48px;
  height: 48px;
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
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 4px 0;
  transition: color var(--transition-base);
}

.dialog-subtitle {
  font-family: var(--font-sans);
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
  transition: color var(--transition-base);
}

.dialog-close {
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

.dialog-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.dialog-body {
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-group.full-width {
  grid-column: 1 / -1;
}

.detail-group label {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
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

.small-text {
  font-size: 12px;
  word-break: break-all;
}

.changes-code {
  background: var(--bg-hover);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-sm);
  padding: 12px;
  font-family: monospace;
  font-size: 12px;
  color: var(--text-primary);
  overflow-x: auto;
  margin: 0;
  transition: background-color var(--transition-base), border-color var(--transition-base), color var(--transition-base);
}

.dialog-footer {
  padding: 16px 24px;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  transition: border-color var(--transition-base);
}

.dialog-btn {
  padding: 10px 20px;
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
    grid-template-columns: 100px 140px 1fr 120px 100px 50px;
    gap: 12px;
  }
}

@media (max-width: 900px) {
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
  }

  .stat-divider {
    display: none;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container {
    max-width: 100%;
  }

  .tenant-select {
    width: 100%;
  }

  .table-header {
    display: none;
  }

  .log-row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 20px 24px;
  }

  .dialog-body {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .filter-chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 8px;
  }

  .search-container {
    max-width: 100%;
  }

  .date-filter {
    overflow-x: auto;
  }
}
</style>
