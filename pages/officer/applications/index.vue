<template>
  <div class="applications-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title-group">
          <h1 class="page-title">Loan Applications</h1>
          <p class="page-subtitle">
            Manage and track your loan applications
          </p>
        </div>
        <div class="header-stats">
          <div class="stat-pill">
            <v-icon size="16" color="grey">mdi-file-document-outline</v-icon>
            <span class="stat-value">{{ draftCount }}</span>
            <span class="stat-label">Drafts</span>
          </div>
          <div class="stat-pill">
            <v-icon size="16" color="primary">mdi-send</v-icon>
            <span class="stat-value">{{ submittedCount }}</span>
            <span class="stat-label">Submitted</span>
          </div>
          <div class="stat-pill">
            <v-icon size="16" color="warning">mdi-clock-outline</v-icon>
            <span class="stat-value">{{ pendingDocumentsCount }}</span>
            <span class="stat-label">Pending Docs</span>
          </div>
          <div class="stat-pill">
            <v-icon size="16" color="success">mdi-check-circle</v-icon>
            <span class="stat-value">{{ approvedCount }}</span>
            <span class="stat-label">Approved</span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-refresh"
          :loading="loansStore.loading"
          @click="loadApplications"
        >
          Refresh
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="navigateTo('/officer/applications/new')"
        >
          New Application
        </v-btn>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <v-text-field
        v-model="searchQuery"
        placeholder="Search by borrower name or application ID..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="search-field"
      />
      <v-select
        v-model="statusFilter"
        :items="statusOptions"
        item-title="label"
        item-value="value"
        variant="outlined"
        density="compact"
        hide-details
        prepend-inner-icon="mdi-filter-variant"
        class="status-filter"
        :menu-props="{ contentClass: 'filter-dropdown-menu' }"
      />
    </div>

    <!-- Loading State -->
    <div v-if="loansStore.loading && applications.length === 0" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="56" width="4" />
      <p class="loading-text">Loading applications...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <v-icon size="48" color="error">mdi-alert-circle-outline</v-icon>
      </div>
      <h3 class="error-title">Unable to load applications</h3>
      <p class="error-message">{{ error }}</p>
      <v-btn color="primary" variant="outlined" @click="loadApplications">
        <v-icon start>mdi-refresh</v-icon>
        Try Again
      </v-btn>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredApplications.length === 0" class="empty-container">
      <div class="empty-illustration">
        <v-icon size="80" color="primary">mdi-file-document-plus-outline</v-icon>
      </div>
      <h3 class="empty-title">
        {{ hasFilters ? 'No applications found' : 'No applications yet' }}
      </h3>
      <p class="empty-message">
        {{ hasFilters
          ? 'Try adjusting your search or filter criteria.'
          : 'Create your first loan application to get started.'
        }}
      </p>
      <v-btn
        v-if="!hasFilters"
        color="primary"
        size="large"
        @click="navigateTo('/officer/applications/new')"
      >
        <v-icon start>mdi-plus</v-icon>
        Create Application
      </v-btn>
    </div>

    <!-- Applications Table -->
    <div v-else class="applications-table-container">
      <v-data-table
        :headers="tableHeaders"
        :items="filteredApplications"
        :loading="loansStore.loading"
        class="applications-table"
        item-key="id"
        hover
      >
        <!-- Application ID -->
        <template #item.id="{ item }">
          <div class="application-id">
            <v-chip size="small" variant="tonal" color="primary">
              {{ formatApplicationId(item.id) }}
            </v-chip>
          </div>
        </template>

        <!-- Borrower -->
        <template #item.borrower="{ item }">
          <div class="borrower-info">
            <v-avatar size="36" color="primary" variant="tonal">
              <span class="avatar-initials">{{ getBorrowerInitials(item) }}</span>
            </v-avatar>
            <div class="borrower-details">
              <span class="borrower-name">{{ getBorrowerName(item) }}</span>
              <span class="borrower-email">{{ getBorrowerEmail(item) }}</span>
            </div>
          </div>
        </template>

        <!-- Loan Type -->
        <template #item.loanType="{ item }">
          <span class="loan-type-name">{{ getLoanTypeName(item) }}</span>
        </template>

        <!-- Amount -->
        <template #item.amount="{ item }">
          <span class="amount-value">{{ formatCurrency(item.loanDetails?.requestedAmount) }}</span>
        </template>

        <!-- Term -->
        <template #item.term="{ item }">
          <span>{{ item.loanDetails?.requestedTerm || 0 }} months</span>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
            class="status-chip"
          >
            <v-icon start size="14">{{ getStatusIcon(item.status) }}</v-icon>
            {{ formatStatus(item.status) }}
          </v-chip>
        </template>

        <!-- Date -->
        <template #item.createdAt="{ item }">
          <span class="date-value">{{ formatDate(item.createdAt) }}</span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <div class="action-buttons">
            <v-btn
              variant="text"
              size="small"
              color="primary"
              @click="viewApplication(item)"
            >
              <v-icon size="18">mdi-eye-outline</v-icon>
            </v-btn>
            <v-btn
              v-if="item.status === 'draft'"
              variant="text"
              size="small"
              color="secondary"
              @click="editApplication(item)"
            >
              <v-icon size="18">mdi-pencil-outline</v-icon>
            </v-btn>
            <v-menu>
              <template #activator="{ props }">
                <v-btn
                  variant="text"
                  size="small"
                  icon="mdi-dots-vertical"
                  v-bind="props"
                />
              </template>
              <v-list class="actions-menu" density="compact">
                <v-list-item
                  v-if="item.status === 'draft'"
                  prepend-icon="mdi-send"
                  @click="submitForReview(item)"
                >
                  <v-list-item-title>Submit for Review</v-list-item-title>
                </v-list-item>
                <v-list-item
                  v-if="['pending_documents'].includes(item.status)"
                  prepend-icon="mdi-upload"
                  @click="uploadDocuments(item)"
                >
                  <v-list-item-title>Upload Documents</v-list-item-title>
                </v-list-item>
                <v-list-item
                  prepend-icon="mdi-content-copy"
                  @click="duplicateApplication(item)"
                >
                  <v-list-item-title>Duplicate</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useLoansStore } from '~/stores/loans'
import type { LoanApplication } from '~/types'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['tenant_officer'],
})

const loansStore = useLoansStore()

// Reactive state
const searchQuery = ref('')
const statusFilter = ref('all')
const error = ref<string | null>(null)

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Table headers
const tableHeaders = [
  { title: 'Application ID', key: 'id', width: '140px' },
  { title: 'Borrower', key: 'borrower', width: '220px' },
  { title: 'Loan Type', key: 'loanType', width: '150px' },
  { title: 'Amount', key: 'amount', width: '130px' },
  { title: 'Term', key: 'term', width: '100px' },
  { title: 'Status', key: 'status', width: '150px' },
  { title: 'Created', key: 'createdAt', width: '120px' },
  { title: 'Actions', key: 'actions', width: '130px', sortable: false },
]

// Filter options
const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Submitted', value: 'submitted' },
  { label: 'Under Review', value: 'under_review' },
  { label: 'Pending Documents', value: 'pending_documents' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
]

// Computed
const applications = computed(() => loansStore.applications || [])

const hasFilters = computed(() => {
  return searchQuery.value || statusFilter.value !== 'all'
})

const filteredApplications = computed(() => {
  let items = applications.value

  // Filter by status
  if (statusFilter.value !== 'all') {
    items = items.filter(app => app.status === statusFilter.value)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(app => {
      const borrowerName = getBorrowerName(app).toLowerCase()
      const appId = app.id.toLowerCase()
      return borrowerName.includes(query) || appId.includes(query)
    })
  }

  return items
})

// Status counts
const draftCount = computed(() => applications.value.filter(a => a.status === 'draft').length)
const submittedCount = computed(() => applications.value.filter(a => a.status === 'submitted').length)
const pendingDocumentsCount = computed(() => applications.value.filter(a => a.status === 'pending_documents').length)
const approvedCount = computed(() => applications.value.filter(a => a.status === 'approved').length)

// Methods
const loadApplications = async () => {
  try {
    error.value = null
    await loansStore.fetchApplications()
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to load applications'
    console.error('Failed to load applications:', err)
  }
}

const formatApplicationId = (id: string) => {
  return `#${id.slice(-8).toUpperCase()}`
}

const getBorrowerInitials = (app: LoanApplication) => {
  if (app.borrower) {
    return `${app.borrower.firstName?.[0] || ''}${app.borrower.lastName?.[0] || ''}`.toUpperCase()
  }
  return '??'
}

const getBorrowerName = (app: LoanApplication) => {
  if (app.borrower) {
    return `${app.borrower.firstName} ${app.borrower.lastName}`
  }
  return 'Unknown Borrower'
}

const getBorrowerEmail = (app: LoanApplication) => {
  return app.borrower?.email || 'No email'
}

const getLoanTypeName = (app: LoanApplication) => {
  return app.loanType?.name || 'Unknown Type'
}

const formatCurrency = (amount: number | undefined) => {
  if (!amount) return '---'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    under_review: 'Under Review',
    pending_documents: 'Pending Docs',
    approved: 'Approved',
    rejected: 'Rejected',
    disbursed: 'Disbursed',
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    draft: 'grey',
    submitted: 'primary',
    under_review: 'info',
    pending_documents: 'warning',
    approved: 'success',
    rejected: 'error',
    disbursed: 'success',
  }
  return colorMap[status] || 'grey'
}

const getStatusIcon = (status: string) => {
  const iconMap: Record<string, string> = {
    draft: 'mdi-file-document-outline',
    submitted: 'mdi-send',
    under_review: 'mdi-eye',
    pending_documents: 'mdi-file-alert-outline',
    approved: 'mdi-check-circle',
    rejected: 'mdi-close-circle',
    disbursed: 'mdi-cash-check',
  }
  return iconMap[status] || 'mdi-help-circle'
}

const viewApplication = (app: LoanApplication) => {
  navigateTo(`/officer/applications/${app.id}`)
}

const editApplication = (app: LoanApplication) => {
  navigateTo(`/officer/applications/${app.id}?edit=true`)
}

const submitForReview = async (app: LoanApplication) => {
  try {
    await loansStore.submitApplication(app.id)
    showSnackbar('Application submitted for review', 'success')
    await loadApplications()
  } catch (err: any) {
    showSnackbar(err.data?.statusMessage || 'Failed to submit application', 'error')
  }
}

const uploadDocuments = (app: LoanApplication) => {
  navigateTo(`/officer/applications/${app.id}?tab=documents`)
}

const duplicateApplication = (app: LoanApplication) => {
  // Navigate to new application with pre-filled data
  navigateTo(`/officer/applications/new?duplicate=${app.id}`)
}

const showSnackbar = (message: string, color: string) => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  loadApplications()
})
</script>

<style scoped>
.applications-page {
  padding: 0;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 36px;
}

.header-content {
  flex: 1;
}

.header-title-group {
  margin-bottom: 16px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 15px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  line-height: 1.5;
}

.header-stats {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 24px;
  font-size: 14px;
}

.stat-value {
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.stat-label {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* Filters Section */
.filters-section {
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
  align-items: center;
  flex-wrap: wrap;
}

.search-field {
  flex: 1;
  min-width: 280px;
  max-width: 400px;
}

.status-filter {
  min-width: 180px;
}

.search-field :deep(.v-field),
.status-filter :deep(.v-field) {
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

/* Loading/Error/Empty States */
.loading-container,
.error-container,
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 24px;
  text-align: center;
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.loading-text {
  margin-top: 24px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 16px;
}

.error-icon {
  width: 88px;
  height: 88px;
  background: rgba(var(--v-theme-error), 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-title,
.empty-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 24px 0 12px;
}

.error-message,
.empty-message {
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 28px;
  max-width: 400px;
  font-size: 15px;
  line-height: 1.6;
}

.empty-illustration {
  width: 140px;
  height: 140px;
  background: rgba(var(--v-theme-primary), 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Table Container */
.applications-table-container {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
}

.applications-table {
  border-radius: 20px;
}

.applications-table :deep(.v-data-table__thead) {
  background: rgba(var(--v-theme-on-surface), 0.03);
}

.applications-table :deep(th) {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08) !important;
}

.applications-table :deep(td) {
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06) !important;
  padding-top: 16px !important;
  padding-bottom: 16px !important;
}

.applications-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.04) !important;
}

/* Application ID */
.application-id {
  font-family: monospace;
  font-size: 13px;
}

/* Borrower Info */
.borrower-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-initials {
  font-size: 12px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.borrower-details {
  display: flex;
  flex-direction: column;
}

.borrower-name {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  font-size: 14px;
}

.borrower-email {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

/* Loan Type */
.loan-type-name {
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
}

/* Amount */
.amount-value {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

/* Status Chip */
.status-chip {
  font-size: 12px;
  font-weight: 600;
  text-transform: capitalize;
}

/* Date */
.date-value {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 4px;
  align-items: center;
}

/* Actions Menu */
.actions-menu {
  min-width: 180px;
  border-radius: 12px;
  padding: 6px;
}

.actions-menu :deep(.v-list-item) {
  border-radius: 8px;
  min-height: 40px;
  padding: 0 12px;
  margin: 2px 0;
}

/* Responsive */
@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .filters-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-field,
  .status-filter {
    max-width: 100%;
  }
}
</style>

<!-- Global styles for filter dropdowns -->
<style>
.filter-dropdown-menu {
  border-radius: 12px !important;
  padding: 6px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
}

.filter-dropdown-menu .v-list {
  background: rgb(var(--v-theme-surface)) !important;
  padding: 0 !important;
}

.filter-dropdown-menu .v-list-item {
  border-radius: 8px !important;
  min-height: 44px !important;
  margin: 2px 0 !important;
}

.filter-dropdown-menu .v-list-item:hover {
  background: rgba(var(--v-theme-primary), 0.08) !important;
}

.filter-dropdown-menu .v-list-item--active {
  background: rgba(var(--v-theme-primary), 0.12) !important;
}

.filter-dropdown-menu .v-list-item--active .v-list-item-title {
  color: rgb(var(--v-theme-primary)) !important;
  font-weight: 600 !important;
}
</style>
