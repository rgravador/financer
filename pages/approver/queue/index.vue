<template>
  <div class="approver-queue-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Approval Queue</h1>
        <p class="page-subtitle">Review and process loan applications</p>
      </div>
    </div>

    <!-- Stats Pills -->
    <div class="stats-section">
      <div
        v-for="stat in statusStats"
        :key="stat.status"
        class="stat-pill"
        :class="{ 'stat-pill--active': activeFilter === stat.status }"
        @click="setFilter(stat.status)"
      >
        <span class="stat-label">{{ stat.label }}</span>
        <span class="stat-count" :style="{ backgroundColor: stat.color }">
          {{ stat.count }}
        </span>
      </div>
    </div>

    <!-- Search and Filters -->
    <v-card class="filters-card">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="searchQuery"
              placeholder="Search by applicant name or application ID..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              hide-details
              clearable
              class="search-field"
            />
          </v-col>
          <v-col cols="12" md="3">
            <v-select
              v-model="sortBy"
              :items="sortOptions"
              label="Sort by"
              variant="outlined"
              density="compact"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="3" class="text-right">
            <v-btn
              color="primary"
              variant="tonal"
              prepend-icon="mdi-refresh"
              @click="refreshQueue"
            >
              Refresh
            </v-btn>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Queue Table -->
    <v-card class="queue-card">
      <v-data-table
        :headers="tableHeaders"
        :items="filteredApplications"
        :loading="loansStore.loading"
        :items-per-page="20"
        class="queue-table"
        hover
      >
        <!-- Application ID -->
        <template #item.id="{ item }">
          <span class="app-id">{{ item.id.slice(-8).toUpperCase() }}</span>
        </template>

        <!-- Applicant -->
        <template #item.applicant="{ item }">
          <div class="applicant-cell">
            <span class="applicant-name">{{ getApplicantName(item) }}</span>
            <span class="applicant-email">{{ getApplicantEmail(item) }}</span>
          </div>
        </template>

        <!-- Loan Type -->
        <template #item.loanType="{ item }">
          <span class="loan-type">{{ getLoanTypeName(item) }}</span>
        </template>

        <!-- Amount -->
        <template #item.amount="{ item }">
          <span class="amount">{{ formatCurrency(item.loanDetails.requestedAmount) }}</span>
        </template>

        <!-- Interest Rates -->
        <template #item.rates="{ item }">
          <div class="rates-cell">
            <div class="rate-row">
              <span class="rate-label">Suggested:</span>
              <span
                class="rate-value"
                :class="getRateClass(item)"
              >
                {{ item.loanDetails.suggestedInterestRate }}%
              </span>
            </div>
            <div class="rate-row">
              <span class="rate-label">Default:</span>
              <span class="rate-value rate-default">{{ getDefaultRate(item) }}%</span>
            </div>
          </div>
        </template>

        <!-- Documents -->
        <template #item.documents="{ item }">
          <v-chip
            size="small"
            :color="getDocsColor(item)"
            variant="tonal"
          >
            <v-icon start size="14">mdi-file-document</v-icon>
            {{ item.documents.length }} docs
          </v-chip>
        </template>

        <!-- Status -->
        <template #item.status="{ item }">
          <v-chip
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
            class="status-chip"
          >
            {{ formatStatus(item.status) }}
          </v-chip>
        </template>

        <!-- Submitted Date -->
        <template #item.submittedAt="{ item }">
          <span class="date-text">{{ formatDate(item.createdAt) }}</span>
        </template>

        <!-- Actions -->
        <template #item.actions="{ item }">
          <v-btn
            color="primary"
            size="small"
            variant="tonal"
            @click="openApplication(item)"
          >
            {{ item.status === 'submitted' ? 'Review' : 'View' }}
          </v-btn>
        </template>

        <!-- Empty State -->
        <template #no-data>
          <div class="empty-state">
            <v-icon size="64" color="grey-lighten-1">mdi-inbox-outline</v-icon>
            <h3>No Applications in Queue</h3>
            <p>There are no applications waiting for review.</p>
          </div>
        </template>

        <!-- Loading State -->
        <template #loading>
          <v-skeleton-loader type="table-row@5" />
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import { useLoansStore } from '~/stores/loans'
import type { LoanApplication } from '~/types'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['tenant_approver', 'tenant_admin'],
})

const router = useRouter()
const loansStore = useLoansStore()

// State
const searchQuery = ref('')
const activeFilter = ref<string | null>(null)
const sortBy = ref('newest')

const sortOptions = [
  { title: 'Newest First', value: 'newest' },
  { title: 'Oldest First', value: 'oldest' },
  { title: 'Amount (High to Low)', value: 'amount_desc' },
  { title: 'Amount (Low to High)', value: 'amount_asc' },
]

const tableHeaders = [
  { title: 'App ID', key: 'id', width: '100px' },
  { title: 'Applicant', key: 'applicant', width: '200px' },
  { title: 'Loan Type', key: 'loanType', width: '150px' },
  { title: 'Amount', key: 'amount', width: '120px' },
  { title: 'Interest Rates', key: 'rates', width: '150px' },
  { title: 'Documents', key: 'documents', width: '100px' },
  { title: 'Status', key: 'status', width: '120px' },
  { title: 'Submitted', key: 'submittedAt', width: '120px' },
  { title: 'Actions', key: 'actions', width: '100px', sortable: false },
]

// Computed
const statusStats = computed(() => {
  const apps = loansStore.applications
  return [
    {
      status: null,
      label: 'All',
      count: apps.length,
      color: '#64748b',
    },
    {
      status: 'submitted',
      label: 'New',
      count: apps.filter(a => a.status === 'submitted').length,
      color: '#3b82f6',
    },
    {
      status: 'under_review',
      label: 'Under Review',
      count: apps.filter(a => a.status === 'under_review').length,
      color: '#8b5cf6',
    },
    {
      status: 'pending_documents',
      label: 'Pending Docs',
      count: apps.filter(a => a.status === 'pending_documents').length,
      color: '#f59e0b',
    },
  ]
})

const filteredApplications = computed(() => {
  let apps = [...loansStore.applications]

  // Filter by status
  if (activeFilter.value) {
    apps = apps.filter(a => a.status === activeFilter.value)
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    apps = apps.filter(a => {
      const name = getApplicantName(a).toLowerCase()
      const id = a.id.toLowerCase()
      return name.includes(query) || id.includes(query)
    })
  }

  // Sort
  switch (sortBy.value) {
    case 'oldest':
      apps.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      break
    case 'amount_desc':
      apps.sort((a, b) => b.loanDetails.requestedAmount - a.loanDetails.requestedAmount)
      break
    case 'amount_asc':
      apps.sort((a, b) => a.loanDetails.requestedAmount - b.loanDetails.requestedAmount)
      break
    default: // newest
      apps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  return apps
})

// Methods
const setFilter = (status: string | null) => {
  activeFilter.value = status
}

const refreshQueue = async () => {
  await loansStore.fetchQueue()
}

const openApplication = (app: LoanApplication) => {
  router.push(`/approver/queue/${app.id}`)
}

const getApplicantName = (app: any): string => {
  if (app.applicantName) return app.applicantName
  if (app.borrower) return `${app.borrower.firstName} ${app.borrower.lastName}`
  return 'N/A'
}

const getApplicantEmail = (app: any): string => {
  if (app.borrower) return app.borrower.email
  return ''
}

const getLoanTypeName = (app: any): string => {
  if (app.loanTypeName) return app.loanTypeName
  if (app.loanType) return app.loanType.name
  return 'N/A'
}

const getDefaultRate = (app: any): number => {
  if (app.defaultRate !== undefined) return app.defaultRate
  if (app.loanType) return app.loanType.defaultInterestRate
  return 0
}

const getRateClass = (app: any): string => {
  const suggested = app.loanDetails.suggestedInterestRate
  const defaultRate = getDefaultRate(app)
  if (suggested < defaultRate) return 'rate-below'
  if (suggested > defaultRate) return 'rate-above'
  return 'rate-match'
}

const getDocsColor = (app: LoanApplication): string => {
  if (app.documents.length === 0) return 'warning'
  return 'success'
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'grey',
    submitted: 'primary',
    under_review: 'info',
    pending_documents: 'warning',
    approved: 'success',
    rejected: 'error',
    disbursed: 'success',
  }
  return colors[status] || 'grey'
}

const formatStatus = (status: string): string => {
  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    under_review: 'Under Review',
    pending_documents: 'Pending Docs',
    approved: 'Approved',
    rejected: 'Rejected',
    disbursed: 'Disbursed',
  }
  return labels[status] || status
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

// Load data on mount
onMounted(async () => {
  await loansStore.fetchQueue()
})
</script>

<style scoped>
.approver-queue-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header */
.page-header {
  margin-bottom: 24px;
}

.page-title {
  font-size: 28px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  font-family: 'Sora', sans-serif;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 4px 0 0 0;
}

/* Stats Section */
.stats-section {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.stat-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid transparent;
}

.stat-pill:hover {
  background: rgba(var(--v-theme-primary), 0.08);
}

.stat-pill--active {
  background: rgba(var(--v-theme-primary), 0.1);
  border-color: rgb(var(--v-theme-primary));
}

.stat-label {
  font-size: 14px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.stat-count {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  min-width: 24px;
  text-align: center;
}

/* Filters Card */
.filters-card {
  margin-bottom: 24px;
}

.search-field {
  max-width: 400px;
}

/* Queue Card */
.queue-card {
  overflow: hidden;
}

.queue-table {
  font-family: 'Plus Jakarta Sans', sans-serif;
}

/* Table Cells */
.app-id {
  font-family: monospace;
  font-size: 12px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  background: rgba(var(--v-theme-on-surface), 0.05);
  padding: 4px 8px;
  border-radius: 4px;
}

.applicant-cell {
  display: flex;
  flex-direction: column;
}

.applicant-name {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.applicant-email {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.loan-type {
  font-weight: 500;
}

.amount {
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

/* Rates Cell */
.rates-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rate-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.rate-label {
  color: rgba(var(--v-theme-on-surface), 0.5);
  font-size: 11px;
}

.rate-value {
  font-weight: 600;
}

.rate-default {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.rate-below {
  color: #10b981;
}

.rate-above {
  color: #f59e0b;
}

.rate-match {
  color: rgb(var(--v-theme-on-surface));
}

.date-text {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.status-chip {
  font-weight: 600;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;
}

.empty-state h3 {
  margin: 16px 0 8px 0;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.empty-state p {
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 0;
}

/* Responsive */
@media (max-width: 960px) {
  .approver-queue-page {
    padding: 16px;
  }

  .stats-section {
    gap: 8px;
  }

  .stat-pill {
    padding: 6px 12px;
  }
}
</style>
