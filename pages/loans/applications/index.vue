<template>
  <v-container fluid class="wf-content-padding">
    <!-- Page Header -->
    <div class="wf-page-header">
      <h1>Loan Applications</h1>
    </div>
    <p class="wf-page-subtitle">View and manage all loan applications</p>

    <!-- Toolbar -->
    <div class="wf-toolbar mb-6">
      <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/loans/applications/new')">
        New Application
      </v-btn>
      <div class="wf-search-box">
        <v-icon class="search-icon">mdi-magnify</v-icon>
        <input
          v-model="search"
          type="text"
          class="search-input"
          placeholder="Search applications..."
        />
      </div>
    </div>

    <!-- Filter Card -->
    <v-card class="wf-section-card mb-6">
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.status"
            label="Status"
            variant="outlined"
            density="compact"
            :items="statusOptions"
            clearable
            @update:model-value="handleFilterChange"
          />
        </v-col>
        <v-col cols="12" sm="6" md="3">
          <v-select
            v-model="filters.loanType"
            label="Loan Type"
            variant="outlined"
            density="compact"
            :items="loanTypeOptions"
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
            <th>ID</th>
            <th>Client</th>
            <th>Loan Type</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="app in filteredApplications"
            :key="app.id"
            @click="$router.push(`/loans/applications/${app.id}`)"
          >
            <td><strong class="wf-app-id">#{{ app.id.slice(0, 6) }}</strong></td>
            <td>
              <div>
                <strong>{{ getBorrowerName(app) }}</strong>
                <div v-if="app.borrower?.email" class="wf-table-subtext">
                  {{ app.borrower.email }}
                </div>
              </div>
            </td>
            <td>{{ getLoanTypeName(app) }}</td>
            <td class="wf-amount">{{ formatCurrency(app.loanDetails?.requestedAmount || 0) }}</td>
            <td>
              <span
                class="wf-status-badge"
                :class="getStatusClass(app.status)"
              >
                <span class="wf-status-dot"></span>
                {{ formatStatus(app.status) }}
              </span>
            </td>
            <td>{{ formatDate(app.createdAt) }}</td>
            <td>
              <a
                class="action-btn"
                @click.stop="$router.push(`/loans/applications/${app.id}`)"
              >
                View
              </a>
            </td>
          </tr>
          <tr v-if="filteredApplications.length === 0">
            <td colspan="7" class="text-center pa-8">
              <div class="wf-empty-state">
                <v-icon class="empty-icon">mdi-file-document-outline</v-icon>
                <div class="empty-title">No applications found</div>
                <div class="empty-message">
                  {{ search || filters.status ? 'Try adjusting your filters' : 'Click "New Application" to get started' }}
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>

      <!-- Pagination -->
      <div class="wf-pagination" v-if="filteredApplications.length > 0">
        <button
          class="wf-pagination-btn"
          :disabled="currentPage === 1"
          @click="currentPage--"
        >
          ← Previous
        </button>
        <span class="wf-pagination-info">
          Page {{ currentPage }} of {{ totalPages }} ({{ filteredApplications.length }} total)
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
import { useLoansStore } from '~/stores/loans'

definePageMeta({
  layout: 'default',
})

const loansStore = useLoansStore()
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

const filters = ref({
  status: '',
  loanType: '',
})

const statusOptions = [
  { title: 'Draft', value: 'draft' },
  { title: 'Submitted', value: 'submitted' },
  { title: 'Under Review', value: 'under_review' },
  { title: 'Pending Documents', value: 'pending_documents' },
  { title: 'Approved', value: 'approved' },
  { title: 'Rejected', value: 'rejected' },
  { title: 'Disbursed', value: 'disbursed' },
]

const loanTypeOptions = ref([
  { title: 'Personal Loan', value: 'personal' },
  { title: 'Business Loan', value: 'business' },
  { title: 'Home Loan', value: 'home' },
])

// Filtered applications
const filteredApplications = computed(() => {
  let apps = loansStore.applications || []

  // Apply status filter
  if (filters.value.status) {
    apps = apps.filter((app: any) => app.status === filters.value.status)
  }

  // Apply loan type filter
  if (filters.value.loanType) {
    apps = apps.filter((app: any) => app.loanType?.slug === filters.value.loanType)
  }

  // Apply search filter
  if (search.value) {
    const searchLower = search.value.toLowerCase()
    apps = apps.filter((app: any) =>
      getBorrowerName(app).toLowerCase().includes(searchLower) ||
      app.id.toLowerCase().includes(searchLower)
    )
  }

  return apps
})

// Total pages for pagination
const totalPages = computed(() => {
  return Math.ceil(filteredApplications.value.length / itemsPerPage.value)
})

const getBorrowerName = (record: any): string => {
  if (record.borrower) {
    return `${record.borrower.firstName} ${record.borrower.lastName}`
  }
  return 'N/A'
}

const getLoanTypeName = (record: any): string => {
  if (record.loanType) {
    return record.loanType.name
  }
  return 'N/A'
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const getStatusClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: 'pending',
    submitted: 'review',
    under_review: 'review',
    pending_documents: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    disbursed: 'approved',
  }
  return statusMap[status] || 'pending'
}

const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const handleFilterChange = () => {
  currentPage.value = 1 // Reset to first page on filter change
}

onMounted(() => {
  loansStore.fetchApplications()
})
</script>

<style scoped>
.wf-table-subtext {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.action-btn {
  color: #1e3a8a;
  text-decoration: none;
  font-weight: 500;
  font-size: 13px;
  padding: 6px 12px;
  border-radius: 6px;
  transition: all 0.2s;
  display: inline-block;
  cursor: pointer;
}

.action-btn:hover {
  background: #f0f4ff;
}
</style>
