<template>
  <div class="tenant-detail-page">
    <!-- Back Button -->
    <button class="back-button" @click="router.back()">
      <v-icon size="20">mdi-arrow-left</v-icon>
      <span>Back to Tenants</span>
    </button>

    <!-- Loading State -->
    <div v-if="systemStore.loading" class="loading-container">
      <div class="loading-spinner">
        <v-progress-circular indeterminate color="primary" size="64" width="5" />
      </div>
      <p class="loading-text">Loading tenant details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="systemStore.error" class="error-container">
      <div class="error-icon">
        <v-icon size="48" color="error">mdi-alert-circle</v-icon>
      </div>
      <h3 class="error-title">Something went wrong</h3>
      <p class="error-message">{{ systemStore.error }}</p>
      <button class="retry-button" @click="loadTenant">
        <v-icon size="18">mdi-refresh</v-icon>
        Try Again
      </button>
    </div>

    <!-- Tenant Details -->
    <div v-else-if="tenant" class="tenant-content">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-decoration"></div>
        <div class="hero-content">
          <div class="hero-avatar">
            <span class="avatar-letter">{{ tenant.name.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="hero-info">
            <h1 class="hero-title">{{ tenant.name }}</h1>
            <div class="hero-meta">
              <span class="meta-slug">
                <v-icon size="14">mdi-link-variant</v-icon>
                {{ tenant.slug }}
              </span>
              <span class="meta-divider"></span>
              <span class="meta-date">
                <v-icon size="14">mdi-calendar</v-icon>
                Created {{ formatDateShort(tenant.createdAt) }}
              </span>
            </div>
          </div>
          <div class="hero-status">
            <div :class="['status-badge', tenant.isActive ? 'status-active' : 'status-suspended']">
              <v-icon size="18">{{ tenant.isActive ? 'mdi-check-circle' : 'mdi-pause-circle' }}</v-icon>
              <span>{{ tenant.isActive ? 'Active' : 'Suspended' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card stat-users">
          <div class="stat-top-border"></div>
          <div class="stat-body">
            <div class="stat-icon">
              <v-icon size="28">mdi-account-group</v-icon>
            </div>
            <div class="stat-data">
              <div class="stat-value">{{ tenant.userCount || 0 }}</div>
              <div class="stat-label">Total Users</div>
            </div>
          </div>
        </div>

        <div class="stat-card stat-loans">
          <div class="stat-top-border"></div>
          <div class="stat-body">
            <div class="stat-icon">
              <v-icon size="28">mdi-file-document-multiple</v-icon>
            </div>
            <div class="stat-data">
              <div class="stat-value">{{ tenant.activeLoansCount || 0 }}</div>
              <div class="stat-label">Active Loans</div>
            </div>
          </div>
        </div>

        <div class="stat-card stat-days">
          <div class="stat-top-border"></div>
          <div class="stat-body">
            <div class="stat-icon">
              <v-icon size="28">mdi-calendar-clock</v-icon>
            </div>
            <div class="stat-data">
              <div class="stat-value">{{ getDaysActive(tenant.createdAt) }}</div>
              <div class="stat-label">Days Active</div>
            </div>
          </div>
        </div>

        <div class="stat-card stat-rate">
          <div class="stat-top-border"></div>
          <div class="stat-body">
            <div class="stat-icon">
              <v-icon size="28">mdi-chart-line</v-icon>
            </div>
            <div class="stat-data">
              <div class="stat-value">—</div>
              <div class="stat-label">Conversion Rate</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="content-grid">
        <!-- Left Column: Tenant Details -->
        <div class="info-card">
          <div class="card-header">
            <div class="header-icon">
              <v-icon size="22">mdi-information-outline</v-icon>
            </div>
            <h3 class="card-title">Tenant Details</h3>
          </div>
          <div class="card-body">
            <div class="detail-item">
              <div class="detail-icon">
                <v-icon size="18">mdi-identifier</v-icon>
              </div>
              <div class="detail-content">
                <span class="detail-label">Tenant ID</span>
                <span class="detail-value detail-id">{{ tenant.id }}</span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">
                <v-icon size="18">mdi-link-variant</v-icon>
              </div>
              <div class="detail-content">
                <span class="detail-label">Slug</span>
                <code class="detail-code">{{ tenant.slug }}</code>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">
                <v-icon size="18">mdi-calendar-plus</v-icon>
              </div>
              <div class="detail-content">
                <span class="detail-label">Created Date</span>
                <span class="detail-value">{{ formatDate(tenant.createdAt) }}</span>
              </div>
            </div>
            <div class="detail-item">
              <div class="detail-icon">
                <v-icon size="18">mdi-update</v-icon>
              </div>
              <div class="detail-content">
                <span class="detail-label">Last Updated</span>
                <span class="detail-value">{{ formatDate(tenant.updatedAt || tenant.createdAt) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Quick Actions -->
        <div class="info-card actions-card">
          <div class="card-header">
            <div class="header-icon actions-icon">
              <v-icon size="22">mdi-lightning-bolt</v-icon>
            </div>
            <h3 class="card-title">Quick Actions</h3>
          </div>
          <div class="card-body actions-body">
            <button
              :class="['action-btn', 'action-primary', tenant.isActive ? 'action-danger' : 'action-success']"
              :disabled="toggling"
              @click="toggleStatus"
            >
              <v-icon size="20">{{ tenant.isActive ? 'mdi-pause-circle' : 'mdi-play-circle' }}</v-icon>
              <span>{{ tenant.isActive ? 'Suspend Tenant' : 'Activate Tenant' }}</span>
              <v-progress-circular
                v-if="toggling"
                indeterminate
                size="18"
                width="2"
                class="action-loader"
              />
            </button>

            <button class="action-btn action-secondary">
              <v-icon size="20">mdi-account-multiple</v-icon>
              <span>Manage Users</span>
            </button>

            <button class="action-btn action-secondary">
              <v-icon size="20">mdi-cog</v-icon>
              <span>Configure Settings</span>
            </button>

            <button class="action-btn action-secondary">
              <v-icon size="20">mdi-file-chart</v-icon>
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Activity Timeline Section -->
      <div class="activity-section">
        <div class="section-header">
          <div class="header-icon activity-icon">
            <v-icon size="22">mdi-history</v-icon>
          </div>
          <h3 class="section-title">Recent Activity</h3>
          <div class="section-badge">Coming Soon</div>
        </div>
        <div class="activity-placeholder">
          <div class="placeholder-icon">
            <v-icon size="56">mdi-timeline-clock-outline</v-icon>
          </div>
          <h4 class="placeholder-title">Activity timeline coming soon</h4>
          <p class="placeholder-text">Track tenant events, user actions, and system changes in real-time</p>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="not-found-container">
      <div class="not-found-illustration">
        <div class="illustration-circle">
          <v-icon size="64">mdi-office-building-remove</v-icon>
        </div>
      </div>
      <h2 class="not-found-title">Tenant Not Found</h2>
      <p class="not-found-text">The requested tenant could not be found or may have been deleted.</p>
      <button class="back-home-btn" @click="router.push('/system/tenants')">
        <v-icon size="18">mdi-arrow-left</v-icon>
        Back to Tenants
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSystemStore } from '~/stores/system'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['system_admin'],
})

const route = useRoute()
const router = useRouter()
const systemStore = useSystemStore()

const tenantId = route.params.id as string
const toggling = ref(false)

// Get tenant from store or fetch if not available
const tenant = computed(() => {
  return systemStore.selectedTenant ||
    systemStore.tenants.find(t => t.id === tenantId)
})

// Format date helper (detailed)
const formatDate = (date: Date | string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format date helper (short)
const formatDateShort = (date: Date | string) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Calculate days active
const getDaysActive = (createdAt: Date | string) => {
  if (!createdAt) return 0
  const created = new Date(createdAt)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - created.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Toggle tenant status
const toggleStatus = async () => {
  if (!tenant.value) return

  toggling.value = true
  try {
    await systemStore.toggleTenantStatus(tenantId)
  } catch (error) {
    console.error('Failed to toggle tenant status:', error)
  } finally {
    toggling.value = false
  }
}

// Load tenant details
const loadTenant = async () => {
  try {
    await systemStore.fetchTenant(tenantId)
  } catch (error) {
    console.error('Failed to fetch tenant:', error)
  }
}

// Load tenant details on mount
onMounted(async () => {
  if (!tenant.value) {
    await loadTenant()
  }
})

// Clear selected tenant when leaving
onUnmounted(() => {
  systemStore.clearSelectedTenant()
})
</script>

<style scoped>
/* Tenant Detail Page */
.tenant-detail-page {
  padding: 0;
  min-height: 100%;
}

/* Back Button */
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  color: var(--text-muted);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  margin-bottom: 24px;
}

.back-button:hover {
  color: var(--accent-primary);
  border-color: var(--accent-primary);
  background: var(--bg-hover);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 24px;
}

.loading-spinner {
  animation: pulse 1.5s ease-in-out infinite;
}

.loading-text {
  font-family: var(--font-sans);
  font-size: 16px;
  color: var(--text-muted);
  margin: 0;
  transition: color var(--transition-base);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

/* Error State */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
  text-align: center;
}

.error-icon {
  width: 80px;
  height: 80px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  transition: color var(--transition-base);
}

.error-message {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  max-width: 400px;
  transition: color var(--transition-base);
}

.retry-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--accent-primary);
  border: none;
  border-radius: 12px;
  color: var(--text-inverse);
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-base);
  margin-top: 8px;
}

.retry-button:hover {
  background: var(--accent-hover);
  transform: translateY(-1px);
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #2563eb 100%);
  border-radius: 20px;
  padding: 40px;
  margin-bottom: 32px;
  position: relative;
  overflow: hidden;
}

.hero-decoration {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 200px;
  height: 200px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.hero-decoration::after {
  content: '';
  position: absolute;
  bottom: -100px;
  left: -100px;
  width: 150px;
  height: 150px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
}

.hero-content {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.hero-avatar {
  width: 88px;
  height: 88px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.avatar-letter {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 700;
  color: white;
}

.hero-info {
  flex: 1;
  min-width: 0;
}

.hero-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 700;
  color: white;
  margin: 0 0 12px 0;
  line-height: 1.2;
}

.hero-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-slug,
.meta-date {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-sans);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.meta-slug {
  background: rgba(255, 255, 255, 0.15);
  padding: 6px 14px;
  border-radius: 8px;
}

.meta-divider {
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
}

.hero-status {
  flex-shrink: 0;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
}

.status-active {
  background: var(--color-success);
  color: white;
}

.status-suspended {
  background: var(--color-error);
  color: white;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.stat-card {
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: all var(--transition-base);
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-card-hover);
}

.stat-top-border {
  height: 4px;
}

.stat-users .stat-top-border {
  background: linear-gradient(90deg, var(--accent-primary) 0%, var(--accent-hover) 100%);
}

.stat-loans .stat-top-border {
  background: linear-gradient(90deg, var(--color-success) 0%, #34d399 100%);
}

.stat-days .stat-top-border {
  background: linear-gradient(90deg, #f59e0b 0%, #fbbf24 100%);
}

.stat-rate .stat-top-border {
  background: linear-gradient(90deg, #8b5cf6 0%, #a78bfa 100%);
}

.stat-body {
  padding: 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-users .stat-icon {
  background: rgba(245, 158, 11, 0.1);
  color: var(--accent-primary);
}

.stat-loans .stat-icon {
  background: rgba(16, 185, 129, 0.1);
  color: var(--color-success);
}

.stat-days .stat-icon {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.stat-rate .stat-icon {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.stat-data {
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
  font-size: 13px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: color var(--transition-base);
}

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.info-card {
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  transition: border-color var(--transition-base);
}

.header-icon {
  width: 40px;
  height: 40px;
  background: rgba(245, 158, 11, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
}

.actions-icon {
  background: rgba(245, 158, 11, 0.1);
  color: var(--accent-primary);
}

.card-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  transition: color var(--transition-base);
}

.card-body {
  padding: 24px;
}

/* Detail Items */
.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
  transition: border-color var(--transition-base);
}

.detail-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.detail-item:first-child {
  padding-top: 0;
}

.detail-icon {
  width: 36px;
  height: 36px;
  background: var(--bg-hover);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  flex-shrink: 0;
  transition: background-color var(--transition-base), color var(--transition-base);
}

.detail-content {
  flex: 1;
  min-width: 0;
}

.detail-label {
  display: block;
  font-family: var(--font-sans);
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
  transition: color var(--transition-base);
}

.detail-value {
  display: block;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-all;
  transition: color var(--transition-base);
}

.detail-id {
  font-family: monospace;
  font-size: 12px;
  color: var(--text-muted);
  transition: color var(--transition-base);
}

.detail-code {
  display: inline-block;
  font-family: monospace;
  font-size: 13px;
  background: var(--bg-hover);
  color: var(--accent-primary);
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 500;
  transition: background-color var(--transition-base), color var(--transition-base);
}

/* Actions */
.actions-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  width: 100%;
  padding: 14px 20px;
  border-radius: 12px;
  font-family: var(--font-sans);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
  border: none;
  position: relative;
}

.action-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.action-primary {
  color: white;
}

.action-success {
  background: var(--color-success);
}

.action-success:hover:not(:disabled) {
  background: #059669;
  transform: translateY(-1px);
}

.action-danger {
  background: var(--color-error);
}

.action-danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.action-secondary {
  background: var(--bg-hover);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  transition: all var(--transition-base);
}

.action-secondary:hover {
  background: var(--bg-card);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}

.action-loader {
  position: absolute;
  right: 16px;
}

/* Activity Section */
.activity-section {
  background: var(--bg-card);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  border: 1px solid var(--border-color);
  overflow: hidden;
  transition: background-color var(--transition-base), border-color var(--transition-base);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border-color);
  transition: border-color var(--transition-base);
}

.activity-icon {
  background: rgba(139, 92, 246, 0.1);
  color: #8b5cf6;
}

.section-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  flex: 1;
  transition: color var(--transition-base);
}

.section-badge {
  font-family: var(--font-sans);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #8b5cf6;
  background: rgba(139, 92, 246, 0.1);
  padding: 6px 12px;
  border-radius: 8px;
}

.activity-placeholder {
  padding: 64px 24px;
  text-align: center;
}

.placeholder-icon {
  width: 100px;
  height: 100px;
  background: var(--bg-hover);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  color: var(--text-muted);
  transition: background-color var(--transition-base), color var(--transition-base);
}

.placeholder-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
  transition: color var(--transition-base);
}

.placeholder-text {
  font-family: var(--font-sans);
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
  max-width: 400px;
  margin: 0 auto;
  transition: color var(--transition-base);
}

/* Not Found State */
.not-found-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 500px;
  text-align: center;
  padding: 48px 24px;
}

.not-found-illustration {
  margin-bottom: 32px;
}

.illustration-circle {
  width: 140px;
  height: 140px;
  background: var(--bg-hover);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  animation: float 3s ease-in-out infinite;
  transition: background-color var(--transition-base), color var(--transition-base);
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.not-found-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  transition: color var(--transition-base);
}

.not-found-text {
  font-family: var(--font-sans);
  font-size: 16px;
  color: var(--text-muted);
  margin: 0 0 32px 0;
  max-width: 400px;
  transition: color var(--transition-base);
}

.back-home-btn {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 14px 28px;
  background: var(--accent-primary);
  border: none;
  border-radius: 12px;
  color: var(--text-inverse);
  font-family: var(--font-sans);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition-base);
}

.back-home-btn:hover {
  background: var(--accent-hover);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card-hover);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 900px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .hero-content {
    flex-direction: column;
    text-align: center;
  }

  .hero-avatar {
    width: 72px;
    height: 72px;
  }

  .avatar-letter {
    font-size: 32px;
  }

  .hero-title {
    font-size: 28px;
  }

  .hero-meta {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .hero-section {
    padding: 28px 20px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .stat-body {
    padding: 20px;
  }

  .stat-value {
    font-size: 28px;
  }

  .card-body {
    padding: 20px;
  }
}
</style>
