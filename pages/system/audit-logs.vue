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
        <button class="action-btn secondary-btn">
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
        <span class="stat-value">{{ totalLogs }}</span>
        <span class="stat-label">Total Events</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value stat-success">{{ successCount }}</span>
        <span class="stat-label">Successful</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value stat-warning">{{ warningCount }}</span>
        <span class="stat-label">Warnings</span>
      </div>
      <div class="stat-divider"></div>
      <div class="stat-item">
        <span class="stat-value stat-error">{{ errorCount }}</span>
        <span class="stat-label">Errors</span>
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
          placeholder="Search by user, action, or description..."
        />
        <button v-if="searchQuery" class="clear-search" @click="searchQuery = ''">
          <v-icon size="16">mdi-close</v-icon>
        </button>
      </div>

      <!-- Filter Chips -->
      <div class="filter-chips">
        <button
          v-for="filter in actionFilters"
          :key="filter.value"
          :class="['filter-chip', { active: selectedAction === filter.value }]"
          @click="selectedAction = filter.value"
        >
          <v-icon size="16">{{ filter.icon }}</v-icon>
          {{ filter.label }}
          <span v-if="filter.count" class="chip-count">{{ filter.count }}</span>
        </button>
      </div>

      <!-- Date Range -->
      <div class="date-filter">
        <button
          v-for="range in dateRanges"
          :key="range.value"
          :class="['date-chip', { active: selectedDateRange === range.value }]"
          @click="selectedDateRange = range.value"
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

      <div v-else-if="filteredLogs.length === 0" class="empty-state">
        <div class="empty-icon">
          <v-icon size="56">mdi-file-search-outline</v-icon>
        </div>
        <h3 class="empty-title">No audit logs found</h3>
        <p class="empty-text">
          {{ searchQuery || selectedAction !== 'all'
            ? 'Try adjusting your filters or search query'
            : 'System audit logs will appear here once activity is recorded'
          }}
        </p>
        <button v-if="searchQuery || selectedAction !== 'all'" class="clear-filters-btn" @click="clearFilters">
          Clear Filters
        </button>
      </div>

      <div v-else class="logs-table">
        <div class="table-header">
          <div class="col-timestamp">Timestamp</div>
          <div class="col-action">Action</div>
          <div class="col-user">User</div>
          <div class="col-target">Target</div>
          <div class="col-status">Status</div>
          <div class="col-details">Details</div>
        </div>

        <div class="table-body">
          <div
            v-for="log in filteredLogs"
            :key="log.id"
            class="log-row"
            @click="viewLogDetails(log)"
          >
            <div class="col-timestamp">
              <span class="timestamp-date">{{ formatDate(log.timestamp) }}</span>
              <span class="timestamp-time">{{ formatTime(log.timestamp) }}</span>
            </div>
            <div class="col-action">
              <div :class="['action-badge', `action-${log.actionType}`]">
                <v-icon size="14">{{ getActionIcon(log.actionType) }}</v-icon>
                {{ log.action }}
              </div>
            </div>
            <div class="col-user">
              <div class="user-info">
                <div class="user-avatar">{{ log.user.charAt(0).toUpperCase() }}</div>
                <div class="user-details">
                  <span class="user-name">{{ log.user }}</span>
                  <span class="user-role">{{ log.userRole }}</span>
                </div>
              </div>
            </div>
            <div class="col-target">
              <span class="target-type">{{ log.targetType }}</span>
              <span class="target-id">{{ log.targetId }}</span>
            </div>
            <div class="col-status">
              <span :class="['status-badge', `status-${log.status}`]">
                <v-icon size="12">{{ getStatusIcon(log.status) }}</v-icon>
                {{ log.status }}
              </span>
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
      <div v-if="filteredLogs.length > 0" class="pagination">
        <div class="pagination-info">
          Showing {{ startIndex + 1 }} - {{ endIndex }} of {{ totalFilteredLogs }} logs
        </div>
        <div class="pagination-controls">
          <button
            class="page-btn"
            :disabled="currentPage === 1"
            @click="currentPage--"
          >
            <v-icon size="18">mdi-chevron-left</v-icon>
          </button>
          <span class="page-indicator">Page {{ currentPage }} of {{ totalPages }}</span>
          <button
            class="page-btn"
            :disabled="currentPage === totalPages"
            @click="currentPage++"
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
            <v-icon size="24">{{ getActionIcon(selectedLog.actionType) }}</v-icon>
          </div>
          <div class="dialog-title-content">
            <h3 class="dialog-title">Audit Log Details</h3>
            <p class="dialog-subtitle">{{ selectedLog.action }}</p>
          </div>
          <button class="dialog-close" @click="detailsDialog = false">
            <v-icon size="20">mdi-close</v-icon>
          </button>
        </div>
        <div class="dialog-body">
          <div class="detail-group">
            <label>Timestamp</label>
            <span>{{ formatFullDate(selectedLog.timestamp) }}</span>
          </div>
          <div class="detail-group">
            <label>User</label>
            <span>{{ selectedLog.user }} ({{ selectedLog.userRole }})</span>
          </div>
          <div class="detail-group">
            <label>Action</label>
            <span>{{ selectedLog.action }}</span>
          </div>
          <div class="detail-group">
            <label>Target</label>
            <span>{{ selectedLog.targetType }}: {{ selectedLog.targetId }}</span>
          </div>
          <div class="detail-group">
            <label>Status</label>
            <span :class="['status-badge', `status-${selectedLog.status}`]">
              {{ selectedLog.status }}
            </span>
          </div>
          <div class="detail-group">
            <label>IP Address</label>
            <span class="mono-text">{{ selectedLog.ipAddress }}</span>
          </div>
          <div v-if="selectedLog.changes" class="detail-group full-width">
            <label>Changes</label>
            <pre class="changes-code">{{ JSON.stringify(selectedLog.changes, null, 2) }}</pre>
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
definePageMeta({
  middleware: ['role'],
  allowedRoles: ['system_admin'],
})

interface AuditLog {
  id: string
  timestamp: string
  action: string
  actionType: 'create' | 'update' | 'delete' | 'login' | 'system'
  user: string
  userRole: string
  targetType: string
  targetId: string
  status: 'success' | 'warning' | 'error'
  ipAddress: string
  changes?: Record<string, unknown>
}

// State
const loading = ref(false)
const searchQuery = ref('')
const selectedAction = ref('all')
const selectedDateRange = ref('7d')
const currentPage = ref(1)
const itemsPerPage = 10
const detailsDialog = ref(false)
const selectedLog = ref<AuditLog | null>(null)

// Mock data for demonstration
const mockLogs = ref<AuditLog[]>([
  {
    id: '1',
    timestamp: new Date().toISOString(),
    action: 'User Login',
    actionType: 'login',
    user: 'admin@ascendent.com',
    userRole: 'System Admin',
    targetType: 'Session',
    targetId: 'sess_abc123',
    status: 'success',
    ipAddress: '192.168.1.100',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    action: 'Tenant Created',
    actionType: 'create',
    user: 'admin@ascendent.com',
    userRole: 'System Admin',
    targetType: 'Tenant',
    targetId: 'ten_xyz789',
    status: 'success',
    ipAddress: '192.168.1.100',
    changes: { name: 'New Company LLC', slug: 'new-company' },
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    action: 'User Status Updated',
    actionType: 'update',
    user: 'admin@ascendent.com',
    userRole: 'System Admin',
    targetType: 'User',
    targetId: 'usr_def456',
    status: 'success',
    ipAddress: '192.168.1.100',
    changes: { isActive: { from: true, to: false } },
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    action: 'Failed Login Attempt',
    actionType: 'login',
    user: 'unknown@test.com',
    userRole: 'Unknown',
    targetType: 'Authentication',
    targetId: 'auth_failed',
    status: 'error',
    ipAddress: '10.0.0.55',
  },
  {
    id: '5',
    timestamp: new Date(Date.now() - 14400000).toISOString(),
    action: 'Tenant Suspended',
    actionType: 'update',
    user: 'admin@ascendent.com',
    userRole: 'System Admin',
    targetType: 'Tenant',
    targetId: 'ten_old123',
    status: 'warning',
    ipAddress: '192.168.1.100',
    changes: { isActive: { from: true, to: false } },
  },
  {
    id: '6',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    action: 'System Backup Completed',
    actionType: 'system',
    user: 'system',
    userRole: 'Automated',
    targetType: 'Database',
    targetId: 'backup_20240315',
    status: 'success',
    ipAddress: 'internal',
  },
])

// Computed
const actionFilters = computed(() => [
  { value: 'all', label: 'All', icon: 'mdi-view-list', count: mockLogs.value.length },
  { value: 'login', label: 'Logins', icon: 'mdi-login', count: mockLogs.value.filter(l => l.actionType === 'login').length },
  { value: 'create', label: 'Creates', icon: 'mdi-plus-circle', count: mockLogs.value.filter(l => l.actionType === 'create').length },
  { value: 'update', label: 'Updates', icon: 'mdi-pencil', count: mockLogs.value.filter(l => l.actionType === 'update').length },
  { value: 'delete', label: 'Deletes', icon: 'mdi-delete', count: mockLogs.value.filter(l => l.actionType === 'delete').length },
  { value: 'system', label: 'System', icon: 'mdi-cog', count: mockLogs.value.filter(l => l.actionType === 'system').length },
])

const dateRanges = [
  { value: '24h', label: 'Last 24 hours' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: 'all', label: 'All time' },
]

const totalLogs = computed(() => mockLogs.value.length)
const successCount = computed(() => mockLogs.value.filter(l => l.status === 'success').length)
const warningCount = computed(() => mockLogs.value.filter(l => l.status === 'warning').length)
const errorCount = computed(() => mockLogs.value.filter(l => l.status === 'error').length)

const filteredLogs = computed(() => {
  let logs = [...mockLogs.value]

  // Filter by action type
  if (selectedAction.value !== 'all') {
    logs = logs.filter(l => l.actionType === selectedAction.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    logs = logs.filter(l =>
      l.user.toLowerCase().includes(query) ||
      l.action.toLowerCase().includes(query) ||
      l.targetType.toLowerCase().includes(query)
    )
  }

  return logs
})

const totalFilteredLogs = computed(() => filteredLogs.value.length)
const totalPages = computed(() => Math.ceil(totalFilteredLogs.value / itemsPerPage))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage)
const endIndex = computed(() => Math.min(startIndex.value + itemsPerPage, totalFilteredLogs.value))

// Methods
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

const getActionIcon = (type: string) => {
  const icons: Record<string, string> = {
    create: 'mdi-plus-circle',
    update: 'mdi-pencil',
    delete: 'mdi-delete',
    login: 'mdi-login',
    system: 'mdi-cog',
  }
  return icons[type] || 'mdi-information'
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, string> = {
    success: 'mdi-check-circle',
    warning: 'mdi-alert',
    error: 'mdi-close-circle',
  }
  return icons[status] || 'mdi-information'
}

const viewLogDetails = (log: AuditLog) => {
  selectedLog.value = log
  detailsDialog.value = true
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedAction.value = 'all'
  selectedDateRange.value = '7d'
  currentPage.value = 1
}

const refreshLogs = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 1000)
}
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

.search-container {
  position: relative;
  max-width: 480px;
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

.chip-count {
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}

.filter-chip.active .chip-count {
  background: rgba(255, 255, 255, 0.2);
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
  grid-template-columns: 120px 160px 1fr 140px 100px 60px;
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
  grid-template-columns: 120px 160px 1fr 140px 100px 60px;
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

.col-target {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.target-type {
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  transition: color var(--transition-base);
}

.target-id {
  font-family: monospace;
  font-size: 11px;
  color: var(--text-muted);
  opacity: 0.7;
  transition: color var(--transition-base);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  text-transform: capitalize;
}

.status-success {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.status-warning {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.status-error {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
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
    grid-template-columns: 100px 140px 1fr 120px 80px 50px;
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
