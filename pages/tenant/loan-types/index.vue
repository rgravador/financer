<template>
  <div class="loan-types-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-title-group">
          <h1 class="page-title">Loan Products</h1>
          <p class="page-subtitle">
            Configure loan types, interest rates, and required documentation
          </p>
        </div>
        <div class="header-stats">
          <div class="stat-pill">
            <v-icon size="16" color="success">mdi-check-circle</v-icon>
            <span class="stat-value">{{ activeLoanTypesCount }}</span>
            <span class="stat-label">Active</span>
          </div>
          <div class="stat-pill">
            <v-icon size="16" color="warning">mdi-pause-circle</v-icon>
            <span class="stat-value">{{ inactiveLoanTypesCount }}</span>
            <span class="stat-label">Inactive</span>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-refresh"
          :loading="loanTypesStore.loading"
          @click="loadLoanTypes"
        >
          Refresh
        </v-btn>
        <v-menu>
          <template #activator="{ props }">
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              v-bind="props"
            >
              Add Loan Type
              <v-icon end size="18">mdi-chevron-down</v-icon>
            </v-btn>
          </template>
          <v-list class="template-menu">
            <v-list-subheader>Create from Template</v-list-subheader>
            <v-list-item
              v-for="template in loanTemplates"
              :key="template.id"
              @click="openCreateFromTemplate(template)"
            >
              <template #prepend>
                <v-avatar :color="template.color" size="36" variant="tonal">
                  <v-icon size="20">{{ template.icon }}</v-icon>
                </v-avatar>
              </template>
              <v-list-item-title>{{ template.name }}</v-list-item-title>
              <v-list-item-subtitle>{{ template.description }}</v-list-item-subtitle>
            </v-list-item>
            <v-divider class="my-2" />
            <v-list-item prepend-icon="mdi-file-outline" @click="openCreateCustom">
              <v-list-item-title>Custom Loan Type</v-list-item-title>
              <v-list-item-subtitle>Create from scratch</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="filters-section">
      <v-text-field
        v-model="searchQuery"
        placeholder="Search loan types..."
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
    <div v-if="loanTypesStore.loading && !loanTypesStore.loanTypes.length" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="56" width="4" />
      <p class="loading-text">Loading loan products...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="loanTypesStore.error" class="error-container">
      <div class="error-icon">
        <v-icon size="48" color="error">mdi-alert-circle-outline</v-icon>
      </div>
      <h3 class="error-title">Unable to load loan products</h3>
      <p class="error-message">{{ loanTypesStore.error }}</p>
      <v-btn color="primary" variant="outlined" @click="loadLoanTypes">
        <v-icon start>mdi-refresh</v-icon>
        Try Again
      </v-btn>
    </div>

    <!-- Empty State -->
    <div v-else-if="filteredLoanTypes.length === 0" class="empty-container">
      <div class="empty-illustration">
        <v-icon size="80" color="primary">mdi-file-document-multiple-outline</v-icon>
      </div>
      <h3 class="empty-title">
        {{ hasFilters ? 'No loan types found' : 'No loan products yet' }}
      </h3>
      <p class="empty-message">
        {{ hasFilters
          ? 'Try adjusting your search or filter criteria.'
          : 'Create your first loan product to start accepting loan applications.'
        }}
      </p>
      <v-btn
        v-if="!hasFilters"
        color="primary"
        size="large"
        @click="openCreateFromTemplate(loanTemplates[0])"
      >
        <v-icon start>mdi-plus</v-icon>
        Create Loan Product
      </v-btn>
    </div>

    <!-- Loan Types Grid -->
    <div v-else class="loan-types-grid">
      <div
        v-for="loanType in filteredLoanTypes"
        :key="loanType.id"
        class="loan-type-card"
        :class="{ 'loan-type-card--inactive': !loanType.isActive }"
      >
        <div class="card-header">
          <div class="card-icon" :style="{ background: getLoanTypeColor(loanType.name) }">
            <v-icon size="24" color="white">{{ getLoanTypeIcon(loanType.name) }}</v-icon>
          </div>
          <div class="card-status" :class="loanType.isActive ? 'status-active' : 'status-inactive'">
            {{ loanType.isActive ? 'Active' : 'Inactive' }}
          </div>
        </div>

        <div class="card-body">
          <h3 class="loan-type-name">{{ loanType.name }}</h3>
          <p class="loan-type-description">{{ loanType.description || 'No description provided' }}</p>
        </div>

        <div class="card-metrics">
          <div class="metric-row">
            <div class="metric">
              <span class="metric-label">Interest Rate</span>
              <span class="metric-value">{{ loanType.defaultInterestRate }}%</span>
              <span class="metric-range">{{ loanType.minInterestRate }}% - {{ loanType.maxInterestRate }}%</span>
            </div>
            <div class="metric">
              <span class="metric-label">Loan Amount</span>
              <span class="metric-value">{{ formatCurrency(loanType.maxLoanAmount) }}</span>
              <span class="metric-range">{{ formatCurrency(loanType.minLoanAmount) }} min</span>
            </div>
          </div>
          <div class="metric-row">
            <div class="metric">
              <span class="metric-label">Terms Available</span>
              <span class="metric-value">{{ loanType.availableTerms.length }}</span>
              <span class="metric-range">{{ formatTerms(loanType.availableTerms) }}</span>
            </div>
            <div class="metric">
              <span class="metric-label">Required Docs</span>
              <span class="metric-value">{{ loanType.requiredDocuments.length }}</span>
              <span class="metric-range">{{ getRequiredCount(loanType) }} mandatory</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <v-btn
            variant="text"
            color="primary"
            size="small"
            @click="openEditDialog(loanType)"
          >
            <v-icon start size="16">mdi-pencil-outline</v-icon>
            Edit
          </v-btn>
          <v-btn
            variant="text"
            size="small"
            @click="openDocumentsDialog(loanType)"
          >
            <v-icon start size="16">mdi-file-document-outline</v-icon>
            Documents
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
              <v-list-item prepend-icon="mdi-content-copy" @click="duplicateLoanType(loanType)">
                <v-list-item-title>Duplicate</v-list-item-title>
              </v-list-item>
              <v-list-item
                :prepend-icon="loanType.isActive ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
                @click="toggleStatus(loanType)"
              >
                <v-list-item-title>{{ loanType.isActive ? 'Deactivate' : 'Activate' }}</v-list-item-title>
              </v-list-item>
              <v-divider class="my-1" />
              <v-list-item
                prepend-icon="mdi-delete-outline"
                class="delete-action"
                @click="openDeleteDialog(loanType)"
              >
                <v-list-item-title>Delete</v-list-item-title>
              </v-list-item>
            </v-list>
          </v-menu>
        </div>
      </div>
    </div>

    <!-- Create/Edit Dialog -->
    <v-dialog v-model="showFormDialog" max-width="700" persistent scrollable>
      <v-card class="form-dialog">
        <v-card-title class="dialog-title">
          <v-icon start :color="editingLoanType ? 'primary' : 'success'">
            {{ editingLoanType ? 'mdi-pencil' : 'mdi-plus-circle' }}
          </v-icon>
          {{ editingLoanType ? 'Edit Loan Product' : 'Create Loan Product' }}
        </v-card-title>
        <v-card-text class="dialog-content">
          <v-form ref="formRef">
            <!-- Basic Info -->
            <div class="form-section">
              <h4 class="form-section-title">Basic Information</h4>
              <v-text-field
                v-model="formData.name"
                label="Loan Type Name"
                :rules="[rules.required, rules.maxLength(100)]"
                variant="outlined"
                density="comfortable"
                class="mb-4"
              />
              <v-textarea
                v-model="formData.description"
                label="Description"
                :rules="[rules.maxLength(500)]"
                variant="outlined"
                density="comfortable"
                rows="2"
                counter="500"
                class="mb-4"
              />
            </div>

            <!-- Interest Rate -->
            <div class="form-section">
              <h4 class="form-section-title">Interest Rate Configuration</h4>
              <div class="form-row three-col">
                <v-text-field
                  v-model.number="formData.minInterestRate"
                  label="Minimum Rate (%)"
                  type="number"
                  :rules="[rules.required, rules.positiveNumber]"
                  variant="outlined"
                  density="comfortable"
                  step="0.1"
                  min="0"
                />
                <v-text-field
                  v-model.number="formData.defaultInterestRate"
                  label="Default Rate (%)"
                  type="number"
                  :rules="[rules.required, rules.positiveNumber]"
                  variant="outlined"
                  density="comfortable"
                  step="0.1"
                  min="0"
                />
                <v-text-field
                  v-model.number="formData.maxInterestRate"
                  label="Maximum Rate (%)"
                  type="number"
                  :rules="[rules.required, rules.positiveNumber]"
                  variant="outlined"
                  density="comfortable"
                  step="0.1"
                  min="0"
                />
              </div>
            </div>

            <!-- Loan Amount -->
            <div class="form-section">
              <h4 class="form-section-title">Loan Amount Range</h4>
              <div class="form-row two-col">
                <v-text-field
                  v-model.number="formData.minLoanAmount"
                  label="Minimum Amount"
                  type="number"
                  :rules="[rules.required, rules.positiveNumber]"
                  variant="outlined"
                  density="comfortable"
                  prefix="₱"
                  min="0"
                />
                <v-text-field
                  v-model.number="formData.maxLoanAmount"
                  label="Maximum Amount"
                  type="number"
                  :rules="[rules.required, rules.positiveNumber]"
                  variant="outlined"
                  density="comfortable"
                  prefix="₱"
                  min="0"
                />
              </div>
            </div>

            <!-- Available Terms -->
            <div class="form-section">
              <h4 class="form-section-title">Available Loan Terms (months)</h4>
              <v-chip-group
                v-model="formData.availableTerms"
                multiple
                selected-class="term-chip-selected"
                class="term-chips"
              >
                <v-chip
                  v-for="term in availableTermOptions"
                  :key="term"
                  :value="term"
                  variant="outlined"
                  filter
                >
                  {{ term }} months
                </v-chip>
              </v-chip-group>
            </div>

            <!-- Active Status -->
            <v-switch
              v-if="editingLoanType"
              v-model="formData.isActive"
              label="Loan Type Active"
              color="success"
              hide-details
              class="mt-4"
            />
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
            {{ editingLoanType ? 'Save Changes' : 'Create Loan Type' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Documents Dialog -->
    <v-dialog v-model="showDocumentsDialog" max-width="650" persistent scrollable>
      <v-card class="form-dialog">
        <v-card-title class="dialog-title">
          <v-icon start color="primary">mdi-file-document-multiple</v-icon>
          Required Documents
          <v-chip size="small" class="ml-3" color="primary" variant="tonal">
            {{ selectedLoanType?.name }}
          </v-chip>
        </v-card-title>
        <v-card-text class="dialog-content">
          <!-- Document List -->
          <div v-if="documentsList.length > 0" class="documents-list">
            <div
              v-for="(doc, index) in documentsList"
              :key="index"
              class="document-item"
            >
              <div class="document-info">
                <v-text-field
                  v-model="doc.documentName"
                  label="Document Name"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="mb-2"
                />
                <v-text-field
                  v-model="doc.description"
                  label="Description (optional)"
                  variant="outlined"
                  density="compact"
                  hide-details
                  class="mb-2"
                />
                <v-checkbox
                  v-model="doc.isRequired"
                  label="Required document"
                  color="primary"
                  hide-details
                  density="compact"
                />
              </div>
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                color="error"
                size="small"
                @click="removeDocument(index)"
              />
            </div>
          </div>
          <div v-else class="no-documents">
            <v-icon size="48" color="grey-lighten-1">mdi-file-document-outline</v-icon>
            <p>No documents configured</p>
          </div>

          <!-- Add Document Button -->
          <v-btn
            variant="tonal"
            color="primary"
            class="mt-4"
            block
            @click="addDocument"
          >
            <v-icon start>mdi-plus</v-icon>
            Add Document
          </v-btn>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="closeDocumentsDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="documentsLoading"
            @click="saveDocuments"
          >
            Save Documents
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Dialog -->
    <v-dialog v-model="showDeleteDialog" max-width="450">
      <v-card class="form-dialog">
        <v-card-title class="dialog-title">
          <v-icon start color="error">mdi-alert</v-icon>
          Delete Loan Type
        </v-card-title>
        <v-card-text>
          <p class="dialog-text">
            Are you sure you want to delete <strong>{{ selectedLoanType?.name }}</strong>?
          </p>
          <v-alert type="warning" variant="tonal" density="compact" class="mt-4">
            This will deactivate the loan type. Existing applications using this loan type will not be affected.
          </v-alert>
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="showDeleteDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            :loading="deleteLoading"
            @click="confirmDelete"
          >
            Delete Loan Type
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
import { useLoanTypesStore } from '~/stores/loanTypes'
import type { LoanType, RequiredDocument } from '~/types'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['tenant_admin'],
})

const loanTypesStore = useLoanTypesStore()

// Loan templates (predefined configurations)
const loanTemplates = [
  {
    id: 'personal',
    name: 'Personal Loan',
    description: 'Flexible loans for personal expenses',
    icon: 'mdi-account-cash',
    color: 'blue',
    defaults: {
      description: 'General purpose personal loan for various financial needs',
      minInterestRate: 12,
      defaultInterestRate: 18,
      maxInterestRate: 24,
      minLoanAmount: 10000,
      maxLoanAmount: 500000,
      availableTerms: [6, 12, 18, 24, 36],
      requiredDocuments: [
        { documentName: 'Valid ID', description: 'Government-issued ID', isRequired: true },
        { documentName: 'Proof of Income', description: 'Payslip or ITR', isRequired: true },
        { documentName: 'Proof of Billing', description: 'Utility bill or bank statement', isRequired: false },
      ],
    },
  },
  {
    id: 'business',
    name: 'Business Loan',
    description: 'Capital financing for businesses',
    icon: 'mdi-briefcase-outline',
    color: 'green',
    defaults: {
      description: 'Business financing for working capital, expansion, or equipment',
      minInterestRate: 10,
      defaultInterestRate: 15,
      maxInterestRate: 20,
      minLoanAmount: 50000,
      maxLoanAmount: 5000000,
      availableTerms: [12, 24, 36, 48, 60],
      requiredDocuments: [
        { documentName: 'Business Registration', description: 'DTI or SEC registration', isRequired: true },
        { documentName: 'Financial Statements', description: 'Last 2 years audited FS', isRequired: true },
        { documentName: 'Bank Statements', description: 'Last 6 months bank statements', isRequired: true },
        { documentName: 'Valid ID of Owner', description: 'Government-issued ID', isRequired: true },
      ],
    },
  },
  {
    id: 'auto',
    name: 'Auto Loan',
    description: 'Vehicle financing',
    icon: 'mdi-car-outline',
    color: 'orange',
    defaults: {
      description: 'Vehicle financing for new or used cars',
      minInterestRate: 8,
      defaultInterestRate: 12,
      maxInterestRate: 18,
      minLoanAmount: 100000,
      maxLoanAmount: 3000000,
      availableTerms: [12, 24, 36, 48, 60, 72],
      requiredDocuments: [
        { documentName: 'Valid ID', description: 'Government-issued ID', isRequired: true },
        { documentName: 'Proof of Income', description: 'Payslip or ITR', isRequired: true },
        { documentName: 'Vehicle Invoice', description: 'Proforma invoice or sales contract', isRequired: true },
        { documentName: 'Insurance Quote', description: 'Comprehensive insurance quote', isRequired: false },
      ],
    },
  },
  {
    id: 'mortgage',
    name: 'Mortgage Loan',
    description: 'Real estate financing',
    icon: 'mdi-home-outline',
    color: 'purple',
    defaults: {
      description: 'Home financing for purchase, construction, or refinancing',
      minInterestRate: 6,
      defaultInterestRate: 8,
      maxInterestRate: 12,
      minLoanAmount: 500000,
      maxLoanAmount: 20000000,
      availableTerms: [60, 120, 180, 240, 300],
      requiredDocuments: [
        { documentName: 'Valid ID', description: 'Government-issued ID', isRequired: true },
        { documentName: 'Proof of Income', description: 'Payslip, ITR, or audited FS', isRequired: true },
        { documentName: 'Property Title', description: 'Transfer Certificate of Title', isRequired: true },
        { documentName: 'Tax Declaration', description: 'Latest tax declaration', isRequired: true },
        { documentName: 'Appraisal Report', description: 'Property appraisal', isRequired: true },
      ],
    },
  },
]

// Available term options for chips
const availableTermOptions = [3, 6, 12, 18, 24, 36, 48, 60, 72, 84, 120, 180, 240, 300]

// Reactive state
const searchQuery = ref('')
const statusFilter = ref('all')
const showFormDialog = ref(false)
const showDocumentsDialog = ref(false)
const showDeleteDialog = ref(false)
const editingLoanType = ref<LoanType | null>(null)
const selectedLoanType = ref<LoanType | null>(null)
const formLoading = ref(false)
const documentsLoading = ref(false)
const deleteLoading = ref(false)
const formRef = ref()

const formData = ref({
  name: '',
  description: '',
  minInterestRate: 10,
  defaultInterestRate: 15,
  maxInterestRate: 20,
  minLoanAmount: 10000,
  maxLoanAmount: 500000,
  availableTerms: [12, 24, 36] as number[],
  isActive: true,
})

const documentsList = ref<RequiredDocument[]>([])

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Filter options
const statusOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
]

// Validation rules
const rules = {
  required: (v: any) => !!v || v === 0 || 'This field is required',
  maxLength: (max: number) => (v: string) => !v || v.length <= max || `Maximum ${max} characters`,
  positiveNumber: (v: number) => v >= 0 || 'Must be a positive number',
}

// Computed
const hasFilters = computed(() => {
  return searchQuery.value || statusFilter.value !== 'all'
})

const activeLoanTypesCount = computed(() => loanTypesStore.loanTypes.filter(lt => lt.isActive).length)
const inactiveLoanTypesCount = computed(() => loanTypesStore.loanTypes.filter(lt => !lt.isActive).length)

const filteredLoanTypes = computed(() => {
  let loanTypes = loanTypesStore.loanTypes

  // Filter by status
  if (statusFilter.value === 'active') {
    loanTypes = loanTypes.filter(lt => lt.isActive)
  } else if (statusFilter.value === 'inactive') {
    loanTypes = loanTypes.filter(lt => !lt.isActive)
  }

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    loanTypes = loanTypes.filter(lt =>
      lt.name.toLowerCase().includes(query) ||
      lt.description?.toLowerCase().includes(query)
    )
  }

  return loanTypes
})

// Methods
const loadLoanTypes = async () => {
  try {
    await loanTypesStore.fetchLoanTypes()
  } catch (error) {
    console.error('Failed to load loan types:', error)
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatTerms = (terms: number[]) => {
  if (terms.length === 0) return 'None'
  if (terms.length <= 3) return terms.map(t => `${t}mo`).join(', ')
  return `${terms[0]}-${terms[terms.length - 1]}mo`
}

const getRequiredCount = (loanType: LoanType) => {
  return loanType.requiredDocuments.filter(d => d.isRequired).length
}

const getLoanTypeIcon = (name: string) => {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('personal')) return 'mdi-account-cash'
  if (nameLower.includes('business')) return 'mdi-briefcase-outline'
  if (['auto', 'car', 'vehicle'].some(k => nameLower.includes(k))) return 'mdi-car-outline'
  if (['mortgage', 'home', 'house'].some(k => nameLower.includes(k))) return 'mdi-home-outline'
  return 'mdi-file-document-outline'
}

const getLoanTypeColor = (name: string) => {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('personal')) return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  if (nameLower.includes('business')) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  if (['auto', 'car', 'vehicle'].some(k => nameLower.includes(k))) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  if (['mortgage', 'home', 'house'].some(k => nameLower.includes(k))) return 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
  return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
}

const openCreateFromTemplate = (template: typeof loanTemplates[0]) => {
  editingLoanType.value = null
  formData.value = {
    name: template.name,
    description: template.defaults.description,
    minInterestRate: template.defaults.minInterestRate,
    defaultInterestRate: template.defaults.defaultInterestRate,
    maxInterestRate: template.defaults.maxInterestRate,
    minLoanAmount: template.defaults.minLoanAmount,
    maxLoanAmount: template.defaults.maxLoanAmount,
    availableTerms: [...template.defaults.availableTerms],
    isActive: true,
  }
  documentsList.value = template.defaults.requiredDocuments.map(d => ({ ...d }))
  showFormDialog.value = true
}

const openCreateCustom = () => {
  editingLoanType.value = null
  formData.value = {
    name: '',
    description: '',
    minInterestRate: 10,
    defaultInterestRate: 15,
    maxInterestRate: 20,
    minLoanAmount: 10000,
    maxLoanAmount: 500000,
    availableTerms: [12, 24, 36],
    isActive: true,
  }
  documentsList.value = []
  showFormDialog.value = true
}

const openEditDialog = (loanType: LoanType) => {
  editingLoanType.value = loanType
  formData.value = {
    name: loanType.name,
    description: loanType.description || '',
    minInterestRate: loanType.minInterestRate,
    defaultInterestRate: loanType.defaultInterestRate,
    maxInterestRate: loanType.maxInterestRate,
    minLoanAmount: loanType.minLoanAmount,
    maxLoanAmount: loanType.maxLoanAmount,
    availableTerms: [...loanType.availableTerms],
    isActive: loanType.isActive,
  }
  documentsList.value = loanType.requiredDocuments.map(d => ({ ...d }))
  showFormDialog.value = true
}

const closeFormDialog = () => {
  showFormDialog.value = false
  editingLoanType.value = null
  documentsList.value = []
}

const submitForm = async () => {
  const { valid } = await formRef.value?.validate()
  if (!valid) return

  if (formData.value.availableTerms.length === 0) {
    showSnackbar('Please select at least one loan term', 'warning')
    return
  }

  formLoading.value = true
  try {
    const payload = {
      name: formData.value.name,
      description: formData.value.description || undefined,
      minInterestRate: formData.value.minInterestRate,
      defaultInterestRate: formData.value.defaultInterestRate,
      maxInterestRate: formData.value.maxInterestRate,
      minLoanAmount: formData.value.minLoanAmount,
      maxLoanAmount: formData.value.maxLoanAmount,
      availableTerms: formData.value.availableTerms,
      requiredDocuments: documentsList.value.filter(d => d.documentName.trim()),
      isActive: formData.value.isActive,
    }

    if (editingLoanType.value) {
      await loanTypesStore.updateLoanType(editingLoanType.value.id, payload)
      showSnackbar('Loan type updated successfully', 'success')
    } else {
      await loanTypesStore.createLoanType(payload)
      showSnackbar('Loan type created successfully', 'success')
    }
    closeFormDialog()
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Operation failed', 'error')
  } finally {
    formLoading.value = false
  }
}

const openDocumentsDialog = (loanType: LoanType) => {
  selectedLoanType.value = loanType
  documentsList.value = loanType.requiredDocuments.map(d => ({ ...d }))
  showDocumentsDialog.value = true
}

const closeDocumentsDialog = () => {
  showDocumentsDialog.value = false
  selectedLoanType.value = null
  documentsList.value = []
}

const addDocument = () => {
  documentsList.value.push({
    documentName: '',
    description: '',
    isRequired: true,
  })
}

const removeDocument = (index: number) => {
  documentsList.value.splice(index, 1)
}

const saveDocuments = async () => {
  if (!selectedLoanType.value) return

  // Validate all documents have names
  const invalidDoc = documentsList.value.find(d => !d.documentName.trim())
  if (invalidDoc) {
    showSnackbar('All documents must have a name', 'warning')
    return
  }

  documentsLoading.value = true
  try {
    await loanTypesStore.updateLoanType(selectedLoanType.value.id, {
      requiredDocuments: documentsList.value,
    })
    showSnackbar('Documents updated successfully', 'success')
    closeDocumentsDialog()
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Failed to update documents', 'error')
  } finally {
    documentsLoading.value = false
  }
}

const duplicateLoanType = (loanType: LoanType) => {
  editingLoanType.value = null
  formData.value = {
    name: `${loanType.name} (Copy)`,
    description: loanType.description || '',
    minInterestRate: loanType.minInterestRate,
    defaultInterestRate: loanType.defaultInterestRate,
    maxInterestRate: loanType.maxInterestRate,
    minLoanAmount: loanType.minLoanAmount,
    maxLoanAmount: loanType.maxLoanAmount,
    availableTerms: [...loanType.availableTerms],
    isActive: true,
  }
  documentsList.value = loanType.requiredDocuments.map(d => ({ ...d }))
  showFormDialog.value = true
}

const toggleStatus = async (loanType: LoanType) => {
  try {
    if (loanType.isActive) {
      await loanTypesStore.deactivateLoanType(loanType.id)
      showSnackbar('Loan type deactivated', 'success')
    } else {
      await loanTypesStore.activateLoanType(loanType.id)
      showSnackbar('Loan type activated', 'success')
    }
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Operation failed', 'error')
  }
}

const openDeleteDialog = (loanType: LoanType) => {
  selectedLoanType.value = loanType
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (!selectedLoanType.value) return

  deleteLoading.value = true
  try {
    await loanTypesStore.deactivateLoanType(selectedLoanType.value.id)
    showSnackbar('Loan type deleted successfully', 'success')
    showDeleteDialog.value = false
    selectedLoanType.value = null
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Failed to delete loan type', 'error')
  } finally {
    deleteLoading.value = false
  }
}

const showSnackbar = (message: string, color: string) => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  loadLoanTypes()
})
</script>

<style scoped>
.loan-types-page {
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

/* Template Menu */
.template-menu {
  min-width: 320px;
  border-radius: 16px;
  padding: 8px;
}

.template-menu :deep(.v-list-item) {
  border-radius: 12px;
  margin: 4px 0;
}

.template-menu :deep(.v-list-subheader) {
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(var(--v-theme-on-surface), 0.5);
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

/* Loan Types Grid */
.loan-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
}

.loan-type-card {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  padding: 24px;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.loan-type-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.loan-type-card--inactive {
  opacity: 0.7;
}

.loan-type-card--inactive:hover {
  opacity: 1;
}

/* Card Header */
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-status {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-active {
  background: rgba(var(--v-theme-success), 0.12);
  color: rgb(var(--v-theme-success));
}

.status-inactive {
  background: rgba(var(--v-theme-error), 0.1);
  color: rgb(var(--v-theme-error));
}

/* Card Body */
.card-body {
  flex: 1;
}

.loan-type-name {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
}

.loan-type-description {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Card Metrics */
.card-metrics {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-radius: 14px;
}

.metric-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.metric-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.metric-range {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
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

.delete-action {
  color: rgb(var(--v-theme-error)) !important;
}

.delete-action :deep(.v-icon) {
  color: rgb(var(--v-theme-error)) !important;
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

.dialog-text {
  font-size: 15px;
  color: rgba(var(--v-theme-on-surface), 0.8);
  line-height: 1.6;
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

.form-row {
  display: grid;
  gap: 16px;
}

.form-row.two-col {
  grid-template-columns: 1fr 1fr;
}

.form-row.three-col {
  grid-template-columns: 1fr 1fr 1fr;
}

/* Term Chips */
.term-chips {
  margin: -4px;
}

.term-chips :deep(.v-chip) {
  margin: 4px;
}

.term-chip-selected {
  background: rgb(var(--v-theme-primary)) !important;
  color: white !important;
}

/* Documents List */
.documents-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.document-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-radius: 12px;
  align-items: flex-start;
}

.document-info {
  flex: 1;
}

.no-documents {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  text-align: center;
}

.no-documents p {
  margin-top: 12px;
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

  .loan-types-grid {
    grid-template-columns: 1fr;
  }

  .form-row.two-col,
  .form-row.three-col {
    grid-template-columns: 1fr;
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
