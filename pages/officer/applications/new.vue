<template>
  <div class="new-application-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-back">
        <v-btn
          variant="text"
          icon="mdi-arrow-left"
          @click="navigateTo('/officer/applications')"
        />
      </div>
      <div class="header-content">
        <h1 class="page-title">New Loan Application</h1>
        <p class="page-subtitle">Complete the form to create a new loan application</p>
      </div>
    </div>

    <!-- Stepper -->
    <v-stepper
      v-model="currentStep"
      class="application-stepper"
      :items="stepItems"
      flat
      hide-actions
    >
      <!-- Step 1: Loan Type -->
      <template #item.1>
        <div class="step-content">
          <h2 class="step-title">Select Loan Type</h2>
          <p class="step-description">Choose the type of loan for this application</p>

          <div v-if="loanTypesLoading" class="loading-section">
            <v-progress-circular indeterminate color="primary" />
            <span>Loading loan types...</span>
          </div>

          <div v-else class="loan-types-grid">
            <div
              v-for="loanType in activeLoanTypes"
              :key="loanType.id"
              class="loan-type-option"
              :class="{ 'loan-type-option--selected': formData.loanTypeId === loanType.id }"
              @click="selectLoanType(loanType)"
            >
              <div class="loan-type-icon" :style="{ background: getLoanTypeColor(loanType.name) }">
                <v-icon size="28" color="white">{{ getLoanTypeIcon(loanType.name) }}</v-icon>
              </div>
              <div class="loan-type-info">
                <h3>{{ loanType.name }}</h3>
                <p>{{ loanType.description || 'No description' }}</p>
              </div>
              <div class="loan-type-meta">
                <span class="meta-item">
                  <v-icon size="14">mdi-percent</v-icon>
                  {{ loanType.minInterestRate }}% - {{ loanType.maxInterestRate }}%
                </span>
                <span class="meta-item">
                  <v-icon size="14">mdi-cash</v-icon>
                  Up to {{ formatCurrency(loanType.maxLoanAmount) }}
                </span>
              </div>
              <div v-if="formData.loanTypeId === loanType.id" class="selected-indicator">
                <v-icon color="success">mdi-check-circle</v-icon>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Step 2: Borrower Information -->
      <template #item.2>
        <div class="step-content">
          <h2 class="step-title">Borrower Information</h2>
          <p class="step-description">Select an existing borrower or create a new one</p>

          <!-- Borrower Selection Mode -->
          <div class="borrower-mode-toggle">
            <v-btn-toggle v-model="borrowerMode" mandatory color="primary" density="compact">
              <v-btn value="existing">
                <v-icon start>mdi-account-search</v-icon>
                Existing Borrower
              </v-btn>
              <v-btn value="new">
                <v-icon start>mdi-account-plus</v-icon>
                New Borrower
              </v-btn>
            </v-btn-toggle>
          </div>

          <!-- Existing Borrower Search -->
          <div v-if="borrowerMode === 'existing'" class="existing-borrower-section">
            <v-text-field
              v-model="borrowerSearch"
              placeholder="Search borrowers by name or email..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              class="borrower-search"
              @update:model-value="debouncedSearchBorrowers"
            />

            <div v-if="borrowersLoading" class="loading-section">
              <v-progress-circular indeterminate color="primary" size="32" />
              <span>Searching...</span>
            </div>

            <div v-else-if="borrowerResults.length > 0" class="borrower-results">
              <div
                v-for="borrower in borrowerResults"
                :key="borrower.id"
                class="borrower-option"
                :class="{ 'borrower-option--selected': formData.borrowerId === borrower.id }"
                @click="selectBorrower(borrower)"
              >
                <v-avatar size="48" color="primary" variant="tonal">
                  <span>{{ borrower.firstName?.[0] }}{{ borrower.lastName?.[0] }}</span>
                </v-avatar>
                <div class="borrower-details">
                  <span class="borrower-name">{{ borrower.firstName }} {{ borrower.lastName }}</span>
                  <span class="borrower-email">{{ borrower.email }}</span>
                  <span class="borrower-meta">{{ borrower.contactNumber }} | {{ formatEmployment(borrower.employmentType) }}</span>
                </div>
                <div v-if="formData.borrowerId === borrower.id" class="selected-indicator">
                  <v-icon color="success">mdi-check-circle</v-icon>
                </div>
              </div>
            </div>

            <div v-else-if="borrowerSearch && !borrowersLoading" class="no-results">
              <v-icon size="48" color="grey-lighten-1">mdi-account-search-outline</v-icon>
              <p>No borrowers found matching "{{ borrowerSearch }}"</p>
              <v-btn variant="text" color="primary" @click="borrowerMode = 'new'">
                Create New Borrower
              </v-btn>
            </div>
          </div>

          <!-- New Borrower Form -->
          <div v-else class="new-borrower-section">
            <v-form ref="borrowerFormRef">
              <div class="form-grid">
                <v-text-field
                  v-model="newBorrower.firstName"
                  label="First Name"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model="newBorrower.lastName"
                  label="Last Name"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model="newBorrower.email"
                  label="Email"
                  type="email"
                  :rules="[rules.required, rules.email]"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model="newBorrower.contactNumber"
                  label="Contact Number"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model="newBorrower.address"
                  label="Address"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                  class="full-width"
                />
                <v-select
                  v-model="newBorrower.employmentType"
                  :items="employmentTypes"
                  item-title="label"
                  item-value="value"
                  label="Employment Type"
                  :rules="[rules.required]"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model="newBorrower.employer"
                  label="Employer/Business Name"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model.number="newBorrower.monthlyIncome"
                  label="Monthly Income"
                  type="number"
                  prefix="PHP"
                  :rules="[rules.required, rules.positiveNumber]"
                  variant="outlined"
                  density="comfortable"
                />
              </div>
            </v-form>
          </div>

          <!-- Co-Borrower Toggle -->
          <div class="co-borrower-section">
            <v-switch
              v-model="hasCoBorrower"
              label="Add a co-borrower"
              color="primary"
              hide-details
            />

            <div v-if="hasCoBorrower" class="co-borrower-search">
              <v-text-field
                v-model="coBorrowerSearch"
                placeholder="Search for co-borrower..."
                prepend-inner-icon="mdi-magnify"
                variant="outlined"
                density="comfortable"
                hide-details
                clearable
                @update:model-value="debouncedSearchCoBorrowers"
              />

              <div v-if="coBorrowerResults.length > 0" class="borrower-results compact">
                <div
                  v-for="borrower in coBorrowerResults"
                  :key="borrower.id"
                  class="borrower-option compact"
                  :class="{ 'borrower-option--selected': formData.coBorrowerId === borrower.id }"
                  @click="selectCoBorrower(borrower)"
                >
                  <v-avatar size="36" color="secondary" variant="tonal">
                    <span class="avatar-text-small">{{ borrower.firstName?.[0] }}{{ borrower.lastName?.[0] }}</span>
                  </v-avatar>
                  <div class="borrower-details">
                    <span class="borrower-name">{{ borrower.firstName }} {{ borrower.lastName }}</span>
                    <span class="borrower-email">{{ borrower.email }}</span>
                  </div>
                  <div v-if="formData.coBorrowerId === borrower.id" class="selected-indicator">
                    <v-icon color="success" size="20">mdi-check-circle</v-icon>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Step 3: Loan Details -->
      <template #item.3>
        <div class="step-content">
          <h2 class="step-title">Loan Details</h2>
          <p class="step-description">Specify the loan amount, term, and interest rate</p>

          <div v-if="selectedLoanType" class="loan-type-summary">
            <v-icon start color="primary">mdi-information-outline</v-icon>
            <span>
              {{ selectedLoanType.name }}:
              {{ formatCurrency(selectedLoanType.minLoanAmount) }} - {{ formatCurrency(selectedLoanType.maxLoanAmount) }},
              {{ selectedLoanType.minInterestRate }}% - {{ selectedLoanType.maxInterestRate }}% interest
            </span>
          </div>

          <v-form ref="loanDetailsFormRef" class="loan-details-form">
            <div class="form-section">
              <h3 class="form-section-title">Loan Amount</h3>
              <v-text-field
                v-model.number="formData.loanDetails.requestedAmount"
                label="Requested Amount"
                type="number"
                prefix="PHP"
                :rules="[rules.required, rules.positiveNumber, validateAmount]"
                variant="outlined"
                density="comfortable"
                hint="Enter the amount requested by the borrower"
                persistent-hint
              />
            </div>

            <div class="form-section">
              <h3 class="form-section-title">Loan Term</h3>
              <v-chip-group
                v-model="formData.loanDetails.requestedTerm"
                mandatory
                selected-class="term-chip-selected"
                class="term-chips"
              >
                <v-chip
                  v-for="term in availableTerms"
                  :key="term"
                  :value="term"
                  variant="outlined"
                  filter
                >
                  {{ term }} months
                </v-chip>
              </v-chip-group>
            </div>

            <div class="form-section">
              <h3 class="form-section-title">Suggested Interest Rate</h3>
              <div class="interest-rate-input">
                <v-slider
                  v-model="formData.loanDetails.suggestedInterestRate"
                  :min="selectedLoanType?.minInterestRate || 0"
                  :max="selectedLoanType?.maxInterestRate || 30"
                  :step="0.5"
                  thumb-label="always"
                  color="primary"
                  class="rate-slider"
                >
                  <template #thumb-label="{ modelValue }">
                    {{ modelValue }}%
                  </template>
                </v-slider>
                <v-text-field
                  v-model.number="formData.loanDetails.suggestedInterestRate"
                  type="number"
                  suffix="%"
                  :rules="[rules.required, validateInterestRate]"
                  variant="outlined"
                  density="compact"
                  class="rate-input"
                  step="0.5"
                />
              </div>
              <p class="rate-note">
                Default rate: {{ selectedLoanType?.defaultInterestRate || 0 }}% |
                Range: {{ selectedLoanType?.minInterestRate || 0 }}% - {{ selectedLoanType?.maxInterestRate || 0 }}%
              </p>
            </div>

            <div class="form-section">
              <h3 class="form-section-title">Officer Notes</h3>
              <v-textarea
                v-model="formData.loanDetails.officerNotes"
                label="Notes (optional)"
                variant="outlined"
                density="comfortable"
                rows="3"
                counter="500"
                hint="Add any relevant notes about this application"
                persistent-hint
              />
            </div>
          </v-form>
        </div>
      </template>

      <!-- Step 4: Documents -->
      <template #item.4>
        <div class="step-content">
          <h2 class="step-title">Required Documents</h2>
          <p class="step-description">Upload the required documents for this application</p>

          <div v-if="requiredDocuments.length > 0" class="documents-checklist">
            <div
              v-for="(doc, index) in requiredDocuments"
              :key="index"
              class="document-item"
              :class="{ 'document-item--uploaded': isDocumentUploaded(doc.documentName) }"
            >
              <div class="document-info">
                <div class="document-icon">
                  <v-icon v-if="isDocumentUploaded(doc.documentName)" color="success">mdi-check-circle</v-icon>
                  <v-icon v-else-if="doc.isRequired" color="warning">mdi-alert-circle</v-icon>
                  <v-icon v-else color="grey">mdi-file-document-outline</v-icon>
                </div>
                <div class="document-text">
                  <span class="document-name">
                    {{ doc.documentName }}
                    <v-chip v-if="doc.isRequired" size="x-small" color="error" variant="tonal">Required</v-chip>
                  </span>
                  <span v-if="doc.description" class="document-description">{{ doc.description }}</span>
                </div>
              </div>
              <div class="document-actions">
                <template v-if="isDocumentUploaded(doc.documentName)">
                  <v-btn
                    variant="text"
                    size="small"
                    color="primary"
                    @click="viewDocument(doc.documentName)"
                  >
                    View
                  </v-btn>
                  <v-btn
                    variant="text"
                    size="small"
                    color="error"
                    @click="removeUploadedDocument(doc.documentName)"
                  >
                    Remove
                  </v-btn>
                </template>
                <v-btn
                  v-else
                  variant="tonal"
                  size="small"
                  color="primary"
                  @click="openUploadDialog(doc.documentName)"
                >
                  <v-icon start size="16">mdi-upload</v-icon>
                  Upload
                </v-btn>
              </div>
            </div>
          </div>

          <div v-else class="no-documents-required">
            <v-icon size="48" color="success">mdi-check-all</v-icon>
            <p>No documents required for this loan type</p>
          </div>

          <!-- Upload progress -->
          <div v-if="uploadProgress > 0 && uploadProgress < 100" class="upload-progress">
            <v-progress-linear :model-value="uploadProgress" color="primary" height="8" rounded />
            <span>Uploading... {{ uploadProgress }}%</span>
          </div>
        </div>
      </template>

      <!-- Step 5: Review -->
      <template #item.5>
        <div class="step-content">
          <h2 class="step-title">Review Application</h2>
          <p class="step-description">Review all details before submitting</p>

          <div class="review-sections">
            <!-- Loan Type -->
            <div class="review-section">
              <div class="review-header">
                <h3>Loan Type</h3>
                <v-btn variant="text" size="small" @click="currentStep = 1">Edit</v-btn>
              </div>
              <div class="review-content">
                <div class="review-item">
                  <span class="label">Type:</span>
                  <span class="value">{{ selectedLoanType?.name || 'Not selected' }}</span>
                </div>
              </div>
            </div>

            <!-- Borrower -->
            <div class="review-section">
              <div class="review-header">
                <h3>Borrower Information</h3>
                <v-btn variant="text" size="small" @click="currentStep = 2">Edit</v-btn>
              </div>
              <div class="review-content">
                <div class="review-item">
                  <span class="label">Name:</span>
                  <span class="value">{{ selectedBorrowerName }}</span>
                </div>
                <div class="review-item">
                  <span class="label">Email:</span>
                  <span class="value">{{ selectedBorrowerEmail }}</span>
                </div>
                <div v-if="formData.coBorrowerId" class="review-item">
                  <span class="label">Co-Borrower:</span>
                  <span class="value">{{ selectedCoBorrowerName }}</span>
                </div>
              </div>
            </div>

            <!-- Loan Details -->
            <div class="review-section">
              <div class="review-header">
                <h3>Loan Details</h3>
                <v-btn variant="text" size="small" @click="currentStep = 3">Edit</v-btn>
              </div>
              <div class="review-content">
                <div class="review-item">
                  <span class="label">Amount:</span>
                  <span class="value highlight">{{ formatCurrency(formData.loanDetails.requestedAmount) }}</span>
                </div>
                <div class="review-item">
                  <span class="label">Term:</span>
                  <span class="value">{{ formData.loanDetails.requestedTerm }} months</span>
                </div>
                <div class="review-item">
                  <span class="label">Suggested Rate:</span>
                  <span class="value">{{ formData.loanDetails.suggestedInterestRate }}%</span>
                </div>
                <div v-if="formData.loanDetails.officerNotes" class="review-item">
                  <span class="label">Notes:</span>
                  <span class="value">{{ formData.loanDetails.officerNotes }}</span>
                </div>
              </div>
            </div>

            <!-- Documents -->
            <div class="review-section">
              <div class="review-header">
                <h3>Documents</h3>
                <v-btn variant="text" size="small" @click="currentStep = 4">Edit</v-btn>
              </div>
              <div class="review-content">
                <div class="review-item">
                  <span class="label">Uploaded:</span>
                  <span class="value">{{ uploadedDocuments.length }} / {{ requiredDocuments.length }} documents</span>
                </div>
                <div v-if="missingRequiredDocuments.length > 0" class="missing-docs-warning">
                  <v-icon color="warning" size="18">mdi-alert</v-icon>
                  <span>Missing required: {{ missingRequiredDocuments.join(', ') }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </v-stepper>

    <!-- Navigation Footer -->
    <div class="navigation-footer">
      <v-btn
        v-if="currentStep > 1"
        variant="text"
        @click="previousStep"
      >
        <v-icon start>mdi-arrow-left</v-icon>
        Previous
      </v-btn>
      <v-spacer />
      <v-btn
        v-if="currentStep < 5"
        color="primary"
        :disabled="!canProceed"
        @click="nextStep"
      >
        Next
        <v-icon end>mdi-arrow-right</v-icon>
      </v-btn>
      <div v-else class="submit-actions">
        <v-btn
          variant="outlined"
          :loading="saving"
          @click="saveAsDraft"
        >
          <v-icon start>mdi-content-save</v-icon>
          Save as Draft
        </v-btn>
        <v-btn
          color="primary"
          :loading="submitting"
          :disabled="missingRequiredDocuments.length > 0"
          @click="submitApplication"
        >
          <v-icon start>mdi-send</v-icon>
          Submit Application
        </v-btn>
      </div>
    </div>

    <!-- Upload Dialog -->
    <v-dialog v-model="showUploadDialog" max-width="500" persistent>
      <v-card class="upload-dialog">
        <v-card-title class="dialog-title">
          <v-icon start color="primary">mdi-upload</v-icon>
          Upload Document
        </v-card-title>
        <v-card-text>
          <p class="upload-label">{{ uploadingDocumentName }}</p>
          <v-file-input
            v-model="selectedFile"
            label="Select file"
            prepend-icon="mdi-paperclip"
            variant="outlined"
            density="comfortable"
            accept="image/*,.pdf,.doc,.docx"
            :rules="[rules.required]"
            show-size
          />
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="closeUploadDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="uploading"
            :disabled="!selectedFile"
            @click="uploadDocument"
          >
            Upload
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
import { useLoansStore } from '~/stores/loans'
import { useBorrowersStore } from '~/stores/borrowers'
import type { LoanType, Borrower, UploadedDocument } from '~/types'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['tenant_officer'],
})

const route = useRoute()
const loanTypesStore = useLoanTypesStore()
const loansStore = useLoansStore()
const borrowersStore = useBorrowersStore()

// Stepper state
const currentStep = ref(1)
const stepItems = [
  { title: 'Loan Type', value: 1 },
  { title: 'Borrower', value: 2 },
  { title: 'Loan Details', value: 3 },
  { title: 'Documents', value: 4 },
  { title: 'Review', value: 5 },
]

// Form refs
const borrowerFormRef = ref()
const loanDetailsFormRef = ref()

// Form data
const formData = ref({
  loanTypeId: '',
  borrowerId: '',
  coBorrowerId: '',
  loanDetails: {
    requestedAmount: 0,
    requestedTerm: 12,
    suggestedInterestRate: 15,
    officerNotes: '',
  },
})

// Borrower state
const borrowerMode = ref<'existing' | 'new'>('existing')
const borrowerSearch = ref('')
const borrowerResults = ref<Borrower[]>([])
const borrowersLoading = ref(false)
const hasCoBorrower = ref(false)
const coBorrowerSearch = ref('')
const coBorrowerResults = ref<Borrower[]>([])

const newBorrower = ref({
  firstName: '',
  lastName: '',
  email: '',
  contactNumber: '',
  address: '',
  employmentType: 'employed',
  employer: '',
  monthlyIncome: 0,
})

// Document state
const uploadedDocuments = ref<UploadedDocument[]>([])
const showUploadDialog = ref(false)
const uploadingDocumentName = ref('')
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)

// Loading state
const loanTypesLoading = ref(false)
const saving = ref(false)
const submitting = ref(false)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Employment types
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
const activeLoanTypes = computed(() =>
  loanTypesStore.loanTypes.filter(lt => lt.isActive)
)

const selectedLoanType = computed(() =>
  loanTypesStore.loanTypes.find(lt => lt.id === formData.value.loanTypeId)
)

const availableTerms = computed(() =>
  selectedLoanType.value?.availableTerms || [6, 12, 24, 36]
)

const requiredDocuments = computed(() =>
  selectedLoanType.value?.requiredDocuments || []
)

const missingRequiredDocuments = computed(() => {
  return requiredDocuments.value
    .filter(doc => doc.isRequired && !isDocumentUploaded(doc.documentName))
    .map(doc => doc.documentName)
})

const selectedBorrower = computed(() => {
  if (borrowerMode.value === 'new') {
    return {
      firstName: newBorrower.value.firstName,
      lastName: newBorrower.value.lastName,
      email: newBorrower.value.email,
    }
  }
  return borrowerResults.value.find(b => b.id === formData.value.borrowerId)
})

const selectedBorrowerName = computed(() => {
  const b = selectedBorrower.value
  return b ? `${b.firstName} ${b.lastName}` : 'Not selected'
})

const selectedBorrowerEmail = computed(() => {
  return selectedBorrower.value?.email || 'N/A'
})

const selectedCoBorrower = computed(() =>
  coBorrowerResults.value.find(b => b.id === formData.value.coBorrowerId)
)

const selectedCoBorrowerName = computed(() => {
  const b = selectedCoBorrower.value
  return b ? `${b.firstName} ${b.lastName}` : 'None'
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return !!formData.value.loanTypeId
    case 2:
      if (borrowerMode.value === 'existing') {
        return !!formData.value.borrowerId
      }
      return !!(newBorrower.value.firstName && newBorrower.value.lastName &&
               newBorrower.value.email && newBorrower.value.contactNumber &&
               newBorrower.value.address && newBorrower.value.monthlyIncome > 0)
    case 3:
      return formData.value.loanDetails.requestedAmount > 0 &&
             formData.value.loanDetails.requestedTerm > 0 &&
             formData.value.loanDetails.suggestedInterestRate > 0
    case 4:
      return true // Documents are optional for proceeding
    default:
      return true
  }
})

// Methods
const loadLoanTypes = async () => {
  loanTypesLoading.value = true
  try {
    await loanTypesStore.fetchLoanTypes()
  } finally {
    loanTypesLoading.value = false
  }
}

const selectLoanType = (loanType: LoanType) => {
  formData.value.loanTypeId = loanType.id
  // Set default interest rate
  formData.value.loanDetails.suggestedInterestRate = loanType.defaultInterestRate
  // Set first available term as default
  if (loanType.availableTerms.length > 0) {
    formData.value.loanDetails.requestedTerm = loanType.availableTerms[0]
  }
}

const getLoanTypeIcon = (name: string) => {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('personal')) return 'mdi-account-cash'
  if (nameLower.includes('business')) return 'mdi-briefcase-outline'
  if (nameLower.includes('auto') || nameLower.includes('car')) return 'mdi-car-outline'
  if (nameLower.includes('mortgage') || nameLower.includes('home')) return 'mdi-home-outline'
  return 'mdi-file-document-outline'
}

const getLoanTypeColor = (name: string) => {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('personal')) return 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
  if (nameLower.includes('business')) return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
  if (nameLower.includes('auto') || nameLower.includes('car')) return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
  if (nameLower.includes('mortgage') || nameLower.includes('home')) return 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)'
  return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
}

const formatCurrency = (amount: number | undefined) => {
  if (!amount) return 'PHP 0'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
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

// Borrower search with debounce
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearchBorrowers = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchBorrowers, 300)
}

const searchBorrowers = async () => {
  if (!borrowerSearch.value || borrowerSearch.value.length < 2) {
    borrowerResults.value = []
    return
  }
  borrowersLoading.value = true
  try {
    await borrowersStore.fetchBorrowers({ search: borrowerSearch.value })
    borrowerResults.value = borrowersStore.borrowers
  } catch (err) {
    console.error('Failed to search borrowers:', err)
  } finally {
    borrowersLoading.value = false
  }
}

const debouncedSearchCoBorrowers = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchCoBorrowers, 300)
}

const searchCoBorrowers = async () => {
  if (!coBorrowerSearch.value || coBorrowerSearch.value.length < 2) {
    coBorrowerResults.value = []
    return
  }
  try {
    await borrowersStore.fetchBorrowers({ search: coBorrowerSearch.value })
    coBorrowerResults.value = borrowersStore.borrowers.filter(b => b.id !== formData.value.borrowerId)
  } catch (err) {
    console.error('Failed to search co-borrowers:', err)
  }
}

const selectBorrower = (borrower: Borrower) => {
  formData.value.borrowerId = borrower.id
}

const selectCoBorrower = (borrower: Borrower) => {
  formData.value.coBorrowerId = borrower.id
}

// Validation helpers
const validateAmount = (v: number) => {
  if (!selectedLoanType.value) return true
  if (v < selectedLoanType.value.minLoanAmount) {
    return `Minimum amount is ${formatCurrency(selectedLoanType.value.minLoanAmount)}`
  }
  if (v > selectedLoanType.value.maxLoanAmount) {
    return `Maximum amount is ${formatCurrency(selectedLoanType.value.maxLoanAmount)}`
  }
  return true
}

const validateInterestRate = (v: number) => {
  if (!selectedLoanType.value) return true
  if (v < selectedLoanType.value.minInterestRate) {
    return `Minimum rate is ${selectedLoanType.value.minInterestRate}%`
  }
  if (v > selectedLoanType.value.maxInterestRate) {
    return `Maximum rate is ${selectedLoanType.value.maxInterestRate}%`
  }
  return true
}

// Document methods
const isDocumentUploaded = (docName: string) => {
  return uploadedDocuments.value.some(d => d.documentName === docName)
}

const openUploadDialog = (docName: string) => {
  uploadingDocumentName.value = docName
  selectedFile.value = null
  showUploadDialog.value = true
}

const closeUploadDialog = () => {
  showUploadDialog.value = false
  uploadingDocumentName.value = ''
  selectedFile.value = null
}

const uploadDocument = async () => {
  if (!selectedFile.value) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    // Convert file to base64
    const reader = new FileReader()
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(selectedFile.value!)
    })

    const base64 = await base64Promise
    uploadProgress.value = 50

    // Simulate upload progress (actual upload happens when application is saved)
    uploadProgress.value = 100

    // Add to local uploaded documents
    uploadedDocuments.value.push({
      documentName: uploadingDocumentName.value,
      fileUrl: base64, // Store base64 temporarily
      filePublicId: '', // Will be set after actual upload
      uploadedAt: new Date(),
      status: 'uploaded',
    })

    showSnackbar('Document added successfully', 'success')
    closeUploadDialog()
  } catch (err) {
    showSnackbar('Failed to process document', 'error')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const viewDocument = (docName: string) => {
  const doc = uploadedDocuments.value.find(d => d.documentName === docName)
  if (doc?.fileUrl) {
    window.open(doc.fileUrl, '_blank')
  }
}

const removeUploadedDocument = (docName: string) => {
  uploadedDocuments.value = uploadedDocuments.value.filter(d => d.documentName !== docName)
  showSnackbar('Document removed', 'info')
}

// Navigation
const nextStep = async () => {
  // Validate current step
  if (currentStep.value === 2 && borrowerMode.value === 'new') {
    const { valid } = await borrowerFormRef.value?.validate()
    if (!valid) return
  }

  if (currentStep.value === 3) {
    const { valid } = await loanDetailsFormRef.value?.validate()
    if (!valid) return
  }

  if (currentStep.value < 5) {
    currentStep.value++
  }
}

const previousStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Submit methods
const createBorrowerIfNeeded = async (): Promise<string> => {
  if (borrowerMode.value === 'existing') {
    return formData.value.borrowerId
  }

  // Create new borrower
  const result = await borrowersStore.createBorrower(newBorrower.value)
  return (result as any).id
}

const saveAsDraft = async () => {
  saving.value = true
  try {
    const borrowerId = await createBorrowerIfNeeded()

    await loansStore.createApplication({
      loanTypeId: formData.value.loanTypeId,
      borrowerId,
      coBorrowerId: formData.value.coBorrowerId || undefined,
      loanDetails: formData.value.loanDetails,
    })

    showSnackbar('Application saved as draft', 'success')
    await new Promise(resolve => setTimeout(resolve, 1000))
    navigateTo('/officer/applications')
  } catch (err: any) {
    showSnackbar(err.data?.statusMessage || 'Failed to save application', 'error')
  } finally {
    saving.value = false
  }
}

const submitApplication = async () => {
  if (missingRequiredDocuments.value.length > 0) {
    showSnackbar('Please upload all required documents', 'warning')
    return
  }

  submitting.value = true
  try {
    const borrowerId = await createBorrowerIfNeeded()

    // Create application
    const result = await loansStore.createApplication({
      loanTypeId: formData.value.loanTypeId,
      borrowerId,
      coBorrowerId: formData.value.coBorrowerId || undefined,
      loanDetails: formData.value.loanDetails,
    })

    // Upload documents
    const applicationId = (result as any).id
    for (const doc of uploadedDocuments.value) {
      await loansStore.uploadDocument(applicationId, {
        documentName: doc.documentName,
        fileBase64: doc.fileUrl,
      })
    }

    // Submit for review
    await loansStore.submitApplication(applicationId)

    showSnackbar('Application submitted successfully', 'success')
    await new Promise(resolve => setTimeout(resolve, 1000))
    navigateTo('/officer/applications')
  } catch (err: any) {
    showSnackbar(err.data?.statusMessage || 'Failed to submit application', 'error')
  } finally {
    submitting.value = false
  }
}

const showSnackbar = (message: string, color: string) => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  loadLoanTypes()

  // Check for duplicate parameter
  const duplicateId = route.query.duplicate as string
  if (duplicateId) {
    // Load the application to duplicate
    loansStore.fetchApplicationById(duplicateId).then(() => {
      const app = loansStore.currentApplication
      if (app) {
        formData.value.loanTypeId = app.loanTypeId
        formData.value.loanDetails = { ...app.loanDetails }
      }
    })
  }
})
</script>

<style scoped>
.new-application-page {
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 100px;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
}

.header-back {
  margin-top: 4px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 15px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
}

/* Stepper */
.application-stepper {
  background: transparent;
}

.application-stepper :deep(.v-stepper-header) {
  background: rgb(var(--v-theme-surface));
  border-radius: 16px;
  padding: 8px;
  margin-bottom: 32px;
  box-shadow: none;
}

/* Step Content */
.step-content {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  padding: 32px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.step-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
}

.step-description {
  font-size: 15px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0 0 28px 0;
}

/* Loading Section */
.loading-section {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 40px;
  justify-content: center;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* Loan Types Grid */
.loan-types-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.loan-type-option {
  position: relative;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.loan-type-option:hover {
  background: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.loan-type-option--selected {
  background: rgba(var(--v-theme-primary), 0.08);
  border-color: rgb(var(--v-theme-primary));
}

.loan-type-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.loan-type-info h3 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 6px 0;
  color: rgb(var(--v-theme-on-surface));
}

.loan-type-info p {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.loan-type-meta {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.selected-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
}

/* Borrower Section */
.borrower-mode-toggle {
  margin-bottom: 24px;
}

.existing-borrower-section,
.new-borrower-section {
  margin-bottom: 24px;
}

.borrower-search {
  margin-bottom: 20px;
}

.borrower-search :deep(.v-field) {
  border-radius: 12px;
}

.borrower-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.borrower-results.compact {
  gap: 8px;
  margin-top: 16px;
}

.borrower-option {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.borrower-option.compact {
  padding: 12px;
  gap: 12px;
}

.borrower-option:hover {
  background: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.borrower-option--selected {
  background: rgba(var(--v-theme-primary), 0.08);
  border-color: rgb(var(--v-theme-primary));
}

.borrower-details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.borrower-name {
  font-weight: 600;
  font-size: 15px;
  color: rgb(var(--v-theme-on-surface));
}

.borrower-email {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.borrower-meta {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.avatar-text-small {
  font-size: 11px;
  font-weight: 600;
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.no-results p {
  margin: 16px 0;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-grid .full-width {
  grid-column: 1 / -1;
}

/* Co-Borrower Section */
.co-borrower-section {
  padding-top: 20px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.co-borrower-search {
  margin-top: 16px;
}

/* Loan Details Form */
.loan-type-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: rgba(var(--v-theme-primary), 0.08);
  border-radius: 12px;
  font-size: 14px;
  color: rgb(var(--v-theme-primary));
  margin-bottom: 28px;
}

.loan-details-form .form-section {
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

/* Interest Rate Input */
.interest-rate-input {
  display: flex;
  align-items: center;
  gap: 24px;
}

.rate-slider {
  flex: 1;
}

.rate-input {
  width: 100px;
}

.rate-note {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin-top: 8px;
}

/* Documents */
.documents-checklist {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.document-item--uploaded {
  background: rgba(var(--v-theme-success), 0.06);
  border-color: rgba(var(--v-theme-success), 0.3);
}

.document-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.document-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 10px;
}

.document-text {
  display: flex;
  flex-direction: column;
}

.document-name {
  font-weight: 600;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
  display: flex;
  align-items: center;
  gap: 8px;
}

.document-description {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.document-actions {
  display: flex;
  gap: 4px;
}

.no-documents-required {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.no-documents-required p {
  margin-top: 16px;
}

.upload-progress {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 20px;
  padding: 16px;
  background: rgba(var(--v-theme-primary), 0.08);
  border-radius: 12px;
}

.upload-progress span {
  font-size: 14px;
  color: rgb(var(--v-theme-primary));
}

/* Review Sections */
.review-sections {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-section {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-radius: 14px;
  padding: 20px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.review-header h3 {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.review-item {
  display: flex;
  gap: 12px;
}

.review-item .label {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  min-width: 120px;
}

.review-item .value {
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
  font-weight: 500;
}

.review-item .value.highlight {
  font-size: 18px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
}

.missing-docs-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: rgba(var(--v-theme-warning), 0.1);
  border-radius: 8px;
  font-size: 13px;
  color: rgb(var(--v-theme-warning));
}

/* Navigation Footer */
.navigation-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  padding: 16px 32px;
  background: rgb(var(--v-theme-surface));
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  z-index: 100;
}

.submit-actions {
  display: flex;
  gap: 12px;
}

/* Dialog */
.upload-dialog {
  border-radius: 16px;
}

.dialog-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  padding: 20px 24px 16px;
}

.upload-label {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin-bottom: 16px;
}

.dialog-actions {
  padding: 12px 20px 16px;
}

/* Responsive */
@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .loan-types-grid {
    grid-template-columns: 1fr;
  }

  .interest-rate-input {
    flex-direction: column;
    align-items: stretch;
  }

  .rate-input {
    width: 100%;
  }

  .navigation-footer {
    padding: 12px 16px;
  }

  .submit-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
