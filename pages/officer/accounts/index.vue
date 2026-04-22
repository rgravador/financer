<template>
  <div class="accounts-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title-group">
          <h1 class="page-title">Accounts</h1>
          <p class="page-subtitle">
            Manage borrower and co-borrower accounts
          </p>
        </div>
        <div class="header-stats">
          <div class="stat-pill">
            <v-icon size="16" color="success">mdi-account-check</v-icon>
            <span class="stat-value">{{ activeCount }}</span>
            <span class="stat-label">Active</span>
          </div>
          <div class="stat-pill">
            <v-icon size="16" color="grey">mdi-account-off</v-icon>
            <span class="stat-value">{{ inactiveCount }}</span>
            <span class="stat-label">Inactive</span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-refresh"
          :loading="borrowersStore.loading"
          @click="loadBorrowers"
        >
          Refresh
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          New Account
        </v-btn>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <v-text-field
        v-model="searchQuery"
        placeholder="Search by name, email, or contact..."
        prepend-inner-icon="mdi-magnify"
        variant="outlined"
        density="compact"
        hide-details
        clearable
        class="search-field"
        @update:model-value="debouncedSearch"
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
      />
    </div>

    <!-- Loading State -->
    <div v-if="borrowersStore.loading && borrowers.length === 0" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="56" width="4" />
      <p class="loading-text">Loading accounts...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredBorrowers.length === 0" class="empty-container">
      <div class="empty-illustration">
        <v-icon size="80" color="primary">mdi-account-group-outline</v-icon>
      </div>
      <h3 class="empty-title">
        {{ hasFilters ? 'No accounts found' : 'No accounts yet' }}
      </h3>
      <p class="empty-message">
        {{ hasFilters
          ? 'Try adjusting your search or filter criteria.'
          : 'Create your first borrower account to get started.'
        }}
      </p>
      <v-btn
        v-if="!hasFilters"
        color="primary"
        size="large"
        @click="openCreateDialog"
      >
        <v-icon start>mdi-plus</v-icon>
        Create Account
      </v-btn>
    </div>

    <!-- Desktop Table View -->
    <div v-else-if="isDesktop" class="accounts-table-wrapper">
      <v-data-table
        :headers="tableHeaders"
        :items="filteredBorrowers"
        :items-per-page="20"
        class="accounts-table"
        item-value="id"
      >
        <!-- Name Column -->
        <template #item.name="{ item }">
          <div class="table-name-cell">
            <v-avatar size="36" color="primary" variant="tonal" class="mr-3">
              <span class="avatar-text-sm">{{ getInitials(item) }}</span>
            </v-avatar>
            <div>
              <div class="table-name">{{ item.firstName }} {{ item.lastName }}</div>
              <div class="table-email">{{ item.email }}</div>
            </div>
          </div>
        </template>

        <!-- Contact Column -->
        <template #item.contactNumber="{ item }">
          <span class="table-contact">{{ item.contactNumber }}</span>
        </template>

        <!-- Employment Column -->
        <template #item.employmentType="{ item }">
          <span class="table-employment">{{ formatEmployment(item.employmentType) }}</span>
        </template>

        <!-- Income Column -->
        <template #item.monthlyIncome="{ item }">
          <span class="table-income">{{ formatCurrency(item.monthlyIncome) }}</span>
        </template>

        <!-- Status Column -->
        <template #item.isActive="{ item }">
          <v-chip
            :color="item.isActive ? 'success' : 'grey'"
            size="small"
            variant="tonal"
          >
            {{ item.isActive ? 'Active' : 'Inactive' }}
          </v-chip>
        </template>

        <!-- Actions Column -->
        <template #item.actions="{ item }">
          <div class="table-actions">
            <v-btn
              variant="text"
              color="primary"
              size="small"
              icon="mdi-pencil-outline"
              @click="openEditDialog(item)"
            />
            <v-btn
              variant="text"
              size="small"
              icon="mdi-eye-outline"
              @click="viewBorrower(item)"
            />
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
                  prepend-icon="mdi-file-document-plus-outline"
                  @click="createLoanForBorrower(item)"
                >
                  <v-list-item-title>Create Loan Application</v-list-item-title>
                </v-list-item>
                <v-divider class="my-1" />
                <v-list-item
                  :prepend-icon="item.isActive ? 'mdi-account-off-outline' : 'mdi-account-check-outline'"
                  @click="toggleStatus(item)"
                >
                  <v-list-item-title>{{ item.isActive ? 'Deactivate' : 'Activate' }}</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Mobile Card View -->
    <div v-else class="accounts-grid">
      <div
        v-for="borrower in filteredBorrowers"
        :key="borrower.id"
        class="account-card"
        :class="{ 'account-card--inactive': !borrower.isActive }"
      >
        <div class="card-header">
          <v-avatar size="56" color="primary" variant="tonal">
            <span class="avatar-text">{{ getInitials(borrower) }}</span>
          </v-avatar>
          <div class="card-status" :class="borrower.isActive ? 'status-active' : 'status-inactive'">
            {{ borrower.isActive ? 'Active' : 'Inactive' }}
          </div>
        </div>

        <div class="card-body">
          <h3 class="account-name">{{ borrower.firstName }} {{ borrower.lastName }}</h3>
          <p class="account-email">{{ borrower.email }}</p>
        </div>

        <div class="card-details">
          <div class="detail-row">
            <v-icon size="16" color="grey">mdi-phone</v-icon>
            <span>{{ borrower.contactNumber }}</span>
          </div>
          <div class="detail-row">
            <v-icon size="16" color="grey">mdi-briefcase-outline</v-icon>
            <span>{{ formatEmployment(borrower.employmentType) }}</span>
          </div>
          <div class="detail-row">
            <v-icon size="16" color="grey">mdi-cash</v-icon>
            <span>{{ formatCurrency(borrower.monthlyIncome) }}/mo</span>
          </div>
        </div>

        <div class="card-actions">
          <v-btn
            variant="text"
            color="primary"
            size="small"
            @click="openEditDialog(borrower)"
          >
            <v-icon start size="16">mdi-pencil-outline</v-icon>
            Edit
          </v-btn>
          <v-btn
            variant="text"
            size="small"
            @click="viewBorrower(borrower)"
          >
            <v-icon start size="16">mdi-eye-outline</v-icon>
            View
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
                prepend-icon="mdi-file-document-plus-outline"
                @click="createLoanForBorrower(borrower)"
              >
                <v-list-item-title>Create Loan Application</v-list-item-title>
              </v-list-item>
              <v-divider class="my-1" />
              <v-list-item
                :prepend-icon="borrower.isActive ? 'mdi-account-off-outline' : 'mdi-account-check-outline'"
                @click="toggleStatus(borrower)"
              >
                <v-list-item-title>{{ borrower.isActive ? 'Deactivate' : 'Activate' }}</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showFormDialog" max-width="650" persistent scrollable>
      <v-card class="form-dialog">
        <v-card-title class="dialog-title">
          <v-icon start :color="editingBorrower ? 'primary' : 'success'">
            {{ editingBorrower ? 'mdi-pencil' : 'mdi-account-plus' }}
          </v-icon>
          {{ editingBorrower ? 'Edit Account' : 'Create Account' }}
        </v-card-title>
        <v-card-text class="dialog-content">
          <v-form ref="formRef">
            <!-- Personal Info -->
            <div class="form-section">
              <h4 class="form-section-title">Personal Information</h4>
              <div class="form-grid">
                <v-text-field
                  v-model="formData.firstName"
                  label="First Name"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model="formData.lastName"
                  label="Last Name"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                />
              </div>
              <v-text-field
                v-model="formData.email"
                label="Email Address"
                type="email"
                :rules="[rules.required, rules.email]"
                variant="outlined"
                density="comfortable"
                class="mt-4"
              />
              <v-text-field
                v-model="formData.contactNumber"
                label="Contact Number"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                class="mt-4"
              />
              <v-text-field
                v-model="formData.address"
                label="Address"
                :rules="[rules.required]"
                variant="outlined"
                density="comfortable"
                class="mt-4"
              />
            </div>

            <!-- Employment Info -->
            <div class="form-section">
              <h4 class="form-section-title">Employment Information</h4>
              <div class="form-grid">
                <v-select
                  v-model="formData.employmentType"
                  :items="employmentTypes"
                  item-title="label"
                  item-value="value"
                  label="Employment Type"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model="formData.employer"
                  label="Employer/Business Name"
                  variant="outlined"
                  density="comfortable"
                />
              </div>
              <v-text-field
                v-model.number="formData.monthlyIncome"
                label="Monthly Income"
                type="number"
                prefix="PHP"
                :rules="[rules.required, rules.positiveNumber]"
                variant="outlined"
                density="comfortable"
                class="mt-4"
              />
            </div>

            <!-- Additional Info -->
            <div class="form-section">
              <h4 class="form-section-title">Additional Information</h4>
              <v-text-field
                v-model="formData.dateOfBirth"
                label="Date of Birth"
                type="date"
                variant="outlined"
                density="comfortable"
              />
              <v-textarea
                v-model="formData.notes"
                label="Notes (optional)"
                variant="outlined"
                density="comfortable"
                rows="2"
                class="mt-4"
              />
            </div>
          </v-form>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="closeFormDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="formLoading"
            @click="submitForm"
          >
            {{ editingBorrower ? 'Save Changes' : 'Create Account' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- View Dialog -->
    <v-dialog v-model="showViewDialog" max-width="600">
      <v-card v-if="viewingBorrower" class="form-dialog">
        <v-card-title class="dialog-title">
          <v-avatar size="40" color="primary" variant="tonal" class="mr-3">
            <span>{{ getInitials(viewingBorrower) }}</span>
          </v-avatar>
          {{ viewingBorrower.firstName }} {{ viewingBorrower.lastName }}
        </v-card-title>
        <v-card-text class="dialog-content">
          <div class="view-grid">
            <div class="view-item">
              <span class="view-label">Email</span>
              <span class="view-value">{{ viewingBorrower.email }}</span>
            </div>
            <div class="view-item">
              <span class="view-label">Contact</span>
              <span class="view-value">{{ viewingBorrower.contactNumber }}</span>
            </div>
            <div class="view-item full-width">
              <span class="view-label">Address</span>
              <span class="view-value">{{ viewingBorrower.address }}</span>
            </div>
            <div class="view-item">
              <span class="view-label">Employment</span>
              <span class="view-value">{{ formatEmployment(viewingBorrower.employmentType) }}</span>
            </div>
            <div class="view-item">
              <span class="view-label">Employer</span>
              <span class="view-value">{{ viewingBorrower.employer || 'N/A' }}</span>
            </div>
            <div class="view-item">
              <span class="view-label">Monthly Income</span>
              <span class="view-value highlight">{{ formatCurrency(viewingBorrower.monthlyIncome) }}</span>
            </div>
            <div class="view-item">
              <span class="view-label">Status</span>
              <v-chip :color="viewingBorrower.isActive ? 'success' : 'grey'" size="small" variant="tonal">
                {{ viewingBorrower.isActive ? 'Active' : 'Inactive' }}
              </v-chip>
            </div>
            <div v-if="viewingBorrower.notes" class="view-item full-width">
              <span class="view-label">Notes</span>
              <span class="view-value">{{ viewingBorrower.notes }}</span>
            </div>
          </div>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-btn variant="text" @click="showViewDialog = false">Close</v-btn>
          <v-spacer />
          <v-btn variant="outlined" @click="openEditFromView">Edit</v-btn>
          <v-btn color="primary" @click="createLoanForBorrower(viewingBorrower)">
            <v-icon start>mdi-plus</v-icon>
            Create Loan
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { useDisplay } from 'vuetify'
import { useBorrowersStore } from '~/stores/borrowers'
import type { Borrower } from '~/types'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['tenant_officer', 'tenant_admin', 'tenant_approver'],
})

const route = useRoute()
const borrowersStore = useBorrowersStore()
const { mdAndUp } = useDisplay()

// Desktop detection
const isDesktop = computed(() => mdAndUp.value)

// Table headers for desktop view
const tableHeaders = [
  { title: 'Name', key: 'name', sortable: true },
  { title: 'Contact', key: 'contactNumber', sortable: false },
  { title: 'Employment', key: 'employmentType', sortable: true },
  { title: 'Monthly Income', key: 'monthlyIncome', sortable: true },
  { title: 'Status', key: 'isActive', sortable: true, align: 'center' as const },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

// State
const searchQuery = ref('')
const statusFilter = ref('all')
const showFormDialog = ref(false)
const showViewDialog = ref(false)
const editingBorrower = ref<Borrower | null>(null)
const viewingBorrower = ref<Borrower | null>(null)
const formLoading = ref(false)
const formRef = ref()

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  contactNumber: '',
  address: '',
  employmentType: 'employed',
  employer: '',
  monthlyIncome: 0,
  dateOfBirth: '',
  notes: '',
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Options
const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

const employmentTypes = [
  { label: 'Employed', value: 'employed' },
  { label: 'Self-Employed', value: 'self_employed' },
  { label: 'Business Owner', value: 'business_owner' },
  { label: 'OFW', value: 'ofw' },
  { label: 'Other', value: 'other' },
]

// Validation rules
const rules = {
  required: (v: any) => !!v || v === 0 || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Invalid email address',
  positiveNumber: (v: number) => v > 0 || 'Must be a positive number',
}

// Computed
const borrowers = computed(() => borrowersStore.borrowers)

const hasFilters = computed(() => searchQuery.value || statusFilter.value !== 'all')

const activeCount = computed(() => borrowers.value.filter(b => b.isActive).length)
const inactiveCount = computed(() => borrowers.value.filter(b => !b.isActive).length)

const filteredBorrowers = computed(() => {
  let result = borrowers.value

  // Filter by status
  if (statusFilter.value === 'active') {
    result = result.filter(b => b.isActive)
  } else if (statusFilter.value === 'inactive') {
    result = result.filter(b => !b.isActive)
  }

  // Filter by search (handled server-side, but also filter locally for instant feedback)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(b =>
      b.firstName.toLowerCase().includes(query) ||
      b.lastName.toLowerCase().includes(query) ||
      b.email.toLowerCase().includes(query) ||
      b.contactNumber.includes(query)
    )
  }

  return result
})

// Methods
const loadBorrowers = async () => {
  try {
    await borrowersStore.fetchBorrowers({
      search: searchQuery.value || undefined,
    })
  } catch (error) {
    showSnackbar('Failed to load accounts', 'error')
  }
}

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(loadBorrowers, 300)
}

const getInitials = (borrower: Borrower) => {
  return `${borrower.firstName?.[0] || ''}${borrower.lastName?.[0] || ''}`
}

const formatEmployment = (type: string) => {
  const map: Record<string, string> = {
    employed: 'Employed',
    self_employed: 'Self-Employed',
    business_owner: 'Business Owner',
    ofw: 'OFW',
    other: 'Other',
  }
  return map[type] || type
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const openCreateDialog = () => {
  editingBorrower.value = null
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    address: '',
    employmentType: 'employed',
    employer: '',
    monthlyIncome: 0,
    dateOfBirth: '',
    notes: '',
  }
  showFormDialog.value = true
}

const openEditDialog = (borrower: Borrower) => {
  editingBorrower.value = borrower
  formData.value = {
    firstName: borrower.firstName,
    lastName: borrower.lastName,
    email: borrower.email,
    contactNumber: borrower.contactNumber,
    address: borrower.address,
    employmentType: borrower.employmentType,
    employer: borrower.employer || '',
    monthlyIncome: borrower.monthlyIncome,
    dateOfBirth: borrower.dateOfBirth ? new Date(borrower.dateOfBirth).toISOString().split('T')[0] : '',
    notes: borrower.notes || '',
  }
  showFormDialog.value = true
}

const closeFormDialog = () => {
  showFormDialog.value = false
  editingBorrower.value = null
}

const submitForm = async () => {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  formLoading.value = true
  try {
    const payload = {
      firstName: formData.value.firstName,
      lastName: formData.value.lastName,
      email: formData.value.email,
      contactNumber: formData.value.contactNumber,
      address: formData.value.address,
      employmentType: formData.value.employmentType,
      employer: formData.value.employer || undefined,
      monthlyIncome: formData.value.monthlyIncome,
      dateOfBirth: formData.value.dateOfBirth || undefined,
      notes: formData.value.notes || undefined,
    }

    if (editingBorrower.value) {
      await borrowersStore.updateBorrower(editingBorrower.value.id, payload)
      showSnackbar('Account updated successfully', 'success')
    } else {
      const created = await borrowersStore.createBorrower(payload)
      showSnackbar('Account created successfully', 'success')

      // Check if we should redirect back to loan application
      const returnTo = route.query.returnTo as string
      if (returnTo) {
        navigateTo(`${returnTo}?borrowerId=${(created as any).id}`)
        return
      }
    }

    closeFormDialog()
    loadBorrowers()
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Operation failed', 'error')
  } finally {
    formLoading.value = false
  }
}

const viewBorrower = (borrower: Borrower) => {
  viewingBorrower.value = borrower
  showViewDialog.value = true
}

const openEditFromView = () => {
  if (viewingBorrower.value) {
    showViewDialog.value = false
    openEditDialog(viewingBorrower.value)
  }
}

const toggleStatus = async (borrower: Borrower) => {
  try {
    await borrowersStore.updateBorrower(borrower.id, {
      isActive: !borrower.isActive,
    })
    showSnackbar(
      borrower.isActive ? 'Account deactivated' : 'Account activated',
      'success'
    )
    loadBorrowers()
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Operation failed', 'error')
  }
}

const createLoanForBorrower = (borrower: Borrower) => {
  navigateTo(`/officer/applications/new?borrowerId=${borrower.id}`)
}

const showSnackbar = (message: string, color: string) => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  loadBorrowers()

  // Check if we should open create dialog (from new loan page redirect)
  if (route.query.create === 'true') {
    openCreateDialog()
  }
})
</script>

<style scoped>
.accounts-page {
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
  min-width: 160px;
}

.search-field :deep(.v-field),
.status-filter :deep(.v-field) {
  border-radius: 12px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.12);
}

/* Loading/Empty States */
.loading-container,
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

.empty-illustration {
  width: 140px;
  height: 140px;
  background: rgba(var(--v-theme-primary), 0.08);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 24px 0 12px;
}

.empty-message {
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 28px;
  max-width: 400px;
  font-size: 15px;
  line-height: 1.6;
}

/* Desktop Table View */
.accounts-table-wrapper {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
}

.accounts-table {
  background: transparent;
}

.accounts-table :deep(.v-data-table__thead) {
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.accounts-table :deep(.v-data-table__thead th) {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.6) !important;
  padding: 16px 20px !important;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08) !important;
}

.accounts-table :deep(.v-data-table__td) {
  padding: 16px 20px !important;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.04) !important;
}

.accounts-table :deep(.v-data-table__tr:hover) {
  background: rgba(var(--v-theme-primary), 0.02) !important;
}

.accounts-table :deep(.v-data-table-footer) {
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  padding: 12px 16px;
}

.table-name-cell {
  display: flex;
  align-items: center;
}

.avatar-text-sm {
  font-size: 13px;
  font-weight: 600;
}

.table-name {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.table-email {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.table-contact {
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
}

.table-employment {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

.table-income {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.table-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
}

/* Mobile Card View */
.accounts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 24px;
}

.account-card {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  padding: 24px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.account-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.account-card--inactive {
  opacity: 0.7;
}

.account-card--inactive:hover {
  opacity: 1;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.avatar-text {
  font-size: 18px;
  font-weight: 600;
}

.card-status {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-active {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.status-inactive {
  background: rgba(239, 68, 68, 0.1);
  color: #dc2626;
}

/* Card Body */
.card-body {
  flex: 1;
}

.account-name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px 0;
}

.account-email {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
}

/* Card Details */
.card-details {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-radius: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.8);
}

/* Card Actions */
.card-actions {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

/* Actions Menu */
.actions-menu {
  min-width: 200px;
  border-radius: 12px;
  padding: 6px;
}

.actions-menu :deep(.v-list-item) {
  border-radius: 8px;
  min-height: 40px;
  padding: 0 12px;
  margin: 2px 0;
}

/* Dialog Styles */
.form-dialog {
  border-radius: 20px;
}

.dialog-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  display: flex;
  align-items: center;
  padding: 24px 28px 20px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.dialog-content {
  padding: 24px 28px !important;
  max-height: 70vh;
}

.dialog-actions {
  padding: 16px 24px 20px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

/* Form Sections */
.form-section {
  margin-bottom: 28px;
}

.form-section-title {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* View Dialog */
.view-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.view-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.view-item.full-width {
  grid-column: 1 / -1;
}

.view-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.view-value {
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
}

.view-value.highlight {
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
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

  .accounts-grid {
    grid-template-columns: 1fr;
  }

  .form-grid,
  .view-grid {
    grid-template-columns: 1fr;
  }
}
</style>
