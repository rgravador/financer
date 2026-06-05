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
      :items="computedStepItems"
      flat
      hide-actions
      alt-labels
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

          <div v-else class="loan-type-selector">
            <!-- Searchable Dropdown -->
            <v-select
              v-model="formData.loanTypeId"
              :items="activeLoanTypes"
              item-title="name"
              item-value="id"
              label="Select a loan type"
              prepend-inner-icon="mdi-file-document-outline"
              variant="outlined"
              density="comfortable"
              clearable
              no-data-text="No loan types available"
              :menu-props="{ contentClass: 'loan-type-dropdown-menu' }"
              class="loan-type-autocomplete"
              aria-label="Select a loan type"
              @update:model-value="onLoanTypeSelected"
            />

            <!-- Selected Loan Type Detail Card -->
            <Transition name="fade-slide">
              <div v-if="selectedLoanType" class="loan-type-detail-card">
                <div class="detail-card-header">
                  <div class="detail-card-icon" :style="{ background: getLoanTypeColor(selectedLoanType.name) }">
                    <v-icon size="28" color="white">{{ getLoanTypeIcon(selectedLoanType.name) }}</v-icon>
                  </div>
                  <div class="detail-card-title-group">
                    <h3 class="detail-card-title">{{ selectedLoanType.name }}</h3>
                    <p class="detail-card-description">{{ selectedLoanType.description || 'No description available' }}</p>
                  </div>
                  <div class="detail-card-check">
                    <v-icon color="success" size="28">mdi-check-circle</v-icon>
                  </div>
                </div>

                <v-divider class="my-4" />

                <div class="detail-card-grid">
                  <div class="detail-stat">
                    <div class="detail-stat-icon">
                      <v-icon size="18" color="primary">mdi-percent</v-icon>
                    </div>
                    <div class="detail-stat-content">
                      <span class="detail-stat-label">Interest Rate</span>
                      <span class="detail-stat-value">{{ selectedLoanType.minInterestRate }}% – {{ selectedLoanType.maxInterestRate }}%</span>
                      <span class="detail-stat-note">Default: {{ selectedLoanType.defaultInterestRate }}%</span>
                    </div>
                  </div>

                  <div class="detail-stat">
                    <div class="detail-stat-icon">
                      <v-icon size="18" color="primary">mdi-cash</v-icon>
                    </div>
                    <div class="detail-stat-content">
                      <span class="detail-stat-label">Loan Amount</span>
                      <span class="detail-stat-value">{{ formatCurrency(selectedLoanType.minLoanAmount) }} – {{ formatCurrency(selectedLoanType.maxLoanAmount) }}</span>
                    </div>
                  </div>

                  <div class="detail-stat">
                    <div class="detail-stat-icon">
                      <v-icon size="18" color="primary">mdi-calendar-range</v-icon>
                    </div>
                    <div class="detail-stat-content">
                      <span class="detail-stat-label">Available Terms</span>
                      <span class="detail-stat-value">
                        {{ selectedLoanType.availableTerms.map(t => `${t}mo`).join(', ') }}
                      </span>
                    </div>
                  </div>

                  <div class="detail-stat">
                    <div class="detail-stat-icon">
                      <v-icon size="18" color="primary">mdi-file-document-check-outline</v-icon>
                    </div>
                    <div class="detail-stat-content">
                      <span class="detail-stat-label">Required Documents</span>
                      <span class="detail-stat-value">
                        {{ selectedLoanType.requiredDocuments.filter(d => d.isRequired).length }} required, {{ selectedLoanType.requiredDocuments.length }} total
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </template>

      <!-- Step 2: Borrower Information (2-column) -->
      <template #item.2>
        <div class="step-content">
          <h2 class="step-title">Borrower Information</h2>
          <p class="step-description">Search for an existing account or create a new one</p>

          <div class="borrower-columns">
            <!-- LEFT: Primary Borrower -->
            <div class="borrower-col">
              <div class="col-label-row">
                <h3 class="col-label">Primary Borrower</h3>
              </div>

              <v-menu
                v-model="showBorrowerDropdown"
                :close-on-content-click="false"
                location="bottom start"
                origin="top start"
                :offset="4"
                max-height="300"
              >
                <template #activator="{ props: menuProps }">
                  <v-text-field
                    v-model="borrowerSearch"
                    placeholder="Search by name or email..."
                    prepend-inner-icon="mdi-magnify"
                    append-inner-icon="mdi-plus-circle-outline"
                    variant="outlined"
                    density="comfortable"
                    hide-details
                    clearable
                    autocomplete="new-password"
                    name="borrower-search-nofill"
                    class="borrower-search"
                    v-bind="menuProps"
                    @update:model-value="debouncedSearchBorrowers"
                    @focus="onBorrowerSearchFocus"
                    @click:clear="onBorrowerSearchClear"
                    @click:append-inner="openNewAccountPage"
                  />
                </template>

                  <v-card class="borrower-dropdown-card" rounded="lg">
                    <div v-if="borrowersLoading" class="dropdown-loading">
                      <v-progress-circular indeterminate color="primary" size="20" width="2" />
                      <span>Searching...</span>
                    </div>
                    <template v-else-if="borrowerResults.length > 0">
                      <div v-if="!borrowerSearch" class="dropdown-label">Recent Accounts</div>
                      <v-list density="compact" class="pa-1">
                        <v-list-item
                          v-for="borrower in borrowerResults"
                          :key="borrower.id"
                          class="dropdown-list-item"
                          rounded="lg"
                          @click="selectBorrowerFromDropdown(borrower)"
                        >
                          <template #prepend>
                            <v-avatar size="32" color="primary" variant="tonal" class="mr-3">
                              <span style="font-size: 12px; font-weight: 600;">{{ borrower.firstName?.[0] }}{{ borrower.lastName?.[0] }}</span>
                            </v-avatar>
                          </template>
                          <v-list-item-title style="font-size: 13px; font-weight: 600;">{{ borrower.firstName }} {{ borrower.lastName }}</v-list-item-title>
                          <v-list-item-subtitle style="font-size: 12px;">{{ borrower.email }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </template>
                    <div v-else-if="borrowerSearch && !borrowersLoading" class="dropdown-empty">
                      <v-icon size="32" color="grey-lighten-1">mdi-account-search-outline</v-icon>
                      <span>No accounts found</span>
                      <v-btn variant="text" color="primary" size="small" @click="openNewAccountPage">Create New Account</v-btn>
                    </div>
                  </v-card>
                </v-menu>


              <Transition name="fade-slide">
                <div v-if="selectedBorrower" class="selected-borrower-card">
                  <v-avatar size="40" color="primary" variant="tonal">
                    <span style="font-size: 14px; font-weight: 600;">{{ selectedBorrower.firstName?.[0] }}{{ selectedBorrower.lastName?.[0] }}</span>
                  </v-avatar>
                  <div class="selected-borrower-info">
                    <span class="selected-borrower-name">{{ selectedBorrower.firstName }} {{ selectedBorrower.lastName }}</span>
                    <span class="selected-borrower-meta">{{ selectedBorrower.email }}</span>
                  </div>
                  <v-chip size="small" color="success" variant="tonal">
                    <v-icon start size="14">mdi-check-circle</v-icon>
                    Selected
                  </v-chip>
                  <v-btn icon="mdi-close" variant="text" size="x-small" @click="clearSelectedBorrower" />
                </div>
              </Transition>
            </div>

            <!-- RIGHT: Co-Borrower -->
            <div class="borrower-col">
              <div class="col-label-row">
                <h3 class="col-label">Co-Borrower</h3>
                <v-switch
                  v-model="waiveCoBorrower"
                  label="Waive"
                  color="warning"
                  density="compact"
                  hide-details
                  class="co-toggle"
                />
              </div>

              <template v-if="!waiveCoBorrower">
                <v-menu
                  v-model="showCoBorrowerDropdown"
                  :close-on-content-click="false"
                  location="bottom start"
                  origin="top start"
                  :offset="4"
                  max-height="300"
                >
                  <template #activator="{ props: coMenuProps }">
                    <v-text-field
                      v-model="coBorrowerSearch"
                      placeholder="Search for co-borrower..."
                      prepend-inner-icon="mdi-magnify"
                      append-inner-icon="mdi-plus-circle-outline"
                      variant="outlined"
                      density="comfortable"
                      hide-details
                      clearable
                      autocomplete="new-password"
                      name="coborrower-search-nofill"
                      class="borrower-search"
                      v-bind="coMenuProps"
                      @update:model-value="debouncedSearchCoBorrowers"
                      @focus="onCoBorrowerSearchFocus"
                      @click:clear="coBorrowerResults = []; showCoBorrowerDropdown = false"
                      @click:append-inner="openNewAccountPage"
                    />
                  </template>

                  <v-card class="borrower-dropdown-card" rounded="lg">
                    <div v-if="coBorrowersLoading" class="dropdown-loading">
                      <v-progress-circular indeterminate color="primary" size="20" width="2" />
                      <span>Searching...</span>
                    </div>
                    <template v-else-if="coBorrowerResults.length > 0">
                      <div v-if="!coBorrowerSearch" class="dropdown-label">Recent Accounts</div>
                      <v-list density="compact" class="pa-1">
                        <v-list-item
                          v-for="borrower in coBorrowerResults"
                          :key="borrower.id"
                          class="dropdown-list-item"
                          rounded="lg"
                          @click="selectCoBorrowerFromDropdown(borrower)"
                        >
                          <template #prepend>
                            <v-avatar size="32" color="primary" variant="tonal" class="mr-3">
                              <span style="font-size: 12px; font-weight: 600;">{{ borrower.firstName?.[0] }}{{ borrower.lastName?.[0] }}</span>
                            </v-avatar>
                          </template>
                          <v-list-item-title style="font-size: 13px; font-weight: 600;">{{ borrower.firstName }} {{ borrower.lastName }}</v-list-item-title>
                          <v-list-item-subtitle style="font-size: 12px;">{{ borrower.email }}</v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </template>
                    <div v-else-if="coBorrowerSearch && !coBorrowersLoading" class="dropdown-empty">
                      <v-icon size="32" color="grey-lighten-1">mdi-account-search-outline</v-icon>
                      <span>No accounts found</span>
                      <v-btn variant="text" color="primary" size="small" @click="openNewAccountPage">Create New Account</v-btn>
                    </div>
                  </v-card>
                </v-menu>

                <Transition name="fade-slide">
                  <div v-if="selectedCoBorrower" class="selected-borrower-card">
                    <v-avatar size="40" color="secondary" variant="tonal">
                      <span style="font-size: 14px; font-weight: 600;">{{ selectedCoBorrower.firstName?.[0] }}{{ selectedCoBorrower.lastName?.[0] }}</span>
                    </v-avatar>
                    <div class="selected-borrower-info">
                      <span class="selected-borrower-name">{{ selectedCoBorrower.firstName }} {{ selectedCoBorrower.lastName }}</span>
                      <span class="selected-borrower-meta">{{ selectedCoBorrower.email }}</span>
                    </div>
                    <v-chip size="small" color="info" variant="tonal">
                      <v-icon start size="14">mdi-account-plus</v-icon>
                      Co-Borrower
                    </v-chip>
                    <v-btn icon="mdi-close" variant="text" size="x-small" @click="clearSelectedCoBorrower" />
                  </div>
                </Transition>
              </template>

              <div v-if="waiveCoBorrower" class="waived-notice">
                <v-icon size="18" color="warning">mdi-information-outline</v-icon>
                <span>Co-borrower requirement has been waived</span>
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
                <template v-else>
                  <input
                    :ref="(el: any) => { if (el) fileInputRefs[doc.documentName] = el }"
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    class="hidden-file-input"
                    @change="handleFileSelected($event, doc.documentName)"
                  />
                  <v-btn
                    variant="tonal"
                    size="small"
                    color="primary"
                    :loading="uploadingDocumentName === doc.documentName && uploading"
                    @click="triggerFileInput(doc.documentName)"
                  >
                    <v-icon start size="16">mdi-upload</v-icon>
                    Upload
                  </v-btn>
                </template>
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
        variant="outlined"
        color="primary"
        :disabled="currentStep <= 1"
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

const computedStepItems = computed(() =>
  stepItems.map(item => ({
    ...item,
    complete: item.value < currentStep.value,
    icon: item.value < currentStep.value ? 'mdi-check' : undefined,
  }))
)

// Form refs
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
const borrowerSearch = ref('')
const borrowerResults = ref<Borrower[]>([])
const borrowersLoading = ref(false)
const showBorrowerDropdown = ref(false)
const selectedBorrower = ref<Borrower | null>(null)
const waiveCoBorrower = ref(false)
const coBorrowerSearch = ref('')
const coBorrowerResults = ref<Borrower[]>([])
const coBorrowersLoading = ref(false)
const showCoBorrowerDropdown = ref(false)
const selectedCoBorrower = ref<Borrower | null>(null)


// Document state
const uploadedDocuments = ref<UploadedDocument[]>([])
const uploadingDocumentName = ref('')
const uploading = ref(false)
const uploadProgress = ref(0)
const fileInputRefs: Record<string, HTMLInputElement> = {}

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

const selectedBorrowerName = computed(() => {
  const b = selectedBorrower.value
  return b ? `${b.firstName} ${b.lastName}` : 'Not selected'
})

const selectedBorrowerEmail = computed(() => {
  return selectedBorrower.value?.email || 'N/A'
})

const selectedCoBorrowerName = computed(() => {
  const b = selectedCoBorrower.value
  return b ? `${b.firstName} ${b.lastName}` : 'None'
})

const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return !!formData.value.loanTypeId
    case 2:
      return !!formData.value.borrowerId
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
    // Auto-select first loan type if none is selected
    if (activeLoanTypes.value.length > 0 && !formData.value.loanTypeId) {
      applyLoanTypeDefaults(activeLoanTypes.value[0])
    }
  } finally {
    loanTypesLoading.value = false
  }
}

const onLoanTypeSelected = (loanTypeId: string | null) => {
  if (!loanTypeId) return
  const loanType = loanTypesStore.loanTypes.find(lt => lt.id === loanTypeId)
  if (loanType) {
    applyLoanTypeDefaults(loanType)
  }
}

const applyLoanTypeDefaults = (loanType: LoanType) => {
  formData.value.loanTypeId = loanType.id
  formData.value.loanDetails.suggestedInterestRate = loanType.defaultInterestRate
  if (loanType.availableTerms.length > 0) {
    formData.value.loanDetails.requestedTerm = loanType.availableTerms[0]
  }
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
    if (!borrowerSearch.value) {
      loadRecentBorrowers()
    } else {
      borrowerResults.value = []
    }
    return
  }
  showBorrowerDropdown.value = true
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

const loadRecentBorrowers = async () => {
  borrowersLoading.value = true
  try {
    await borrowersStore.fetchBorrowers({ sort: 'recent', limit: 3 })
    borrowerResults.value = borrowersStore.borrowers
  } catch (err) {
    console.error('Failed to load recent borrowers:', err)
  } finally {
    borrowersLoading.value = false
  }
}

const onBorrowerSearchFocus = () => {
  if (!borrowerSearch.value && borrowerResults.value.length === 0) {
    loadRecentBorrowers()
  }
}

const onBorrowerSearchClear = () => {
  borrowerSearch.value = ''
  loadRecentBorrowers()
}

const selectBorrowerFromDropdown = (borrower: Borrower) => {
  selectedBorrower.value = borrower
  formData.value.borrowerId = borrower.id
  borrowerSearch.value = ''
  borrowerResults.value = []
  showBorrowerDropdown.value = false
}

const clearSelectedBorrower = () => {
  selectedBorrower.value = null
  formData.value.borrowerId = ''
}

const debouncedSearchCoBorrowers = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(searchCoBorrowers, 300)
}

const loadRecentCoBorrowers = async () => {
  coBorrowersLoading.value = true
  try {
    await borrowersStore.fetchBorrowers({ sort: 'recent', limit: 3 })
    coBorrowerResults.value = borrowersStore.borrowers.filter(b => b.id !== formData.value.borrowerId)
  } catch (err) {
    console.error('Failed to load recent co-borrowers:', err)
  } finally {
    coBorrowersLoading.value = false
  }
}

const searchCoBorrowers = async () => {
  if (!coBorrowerSearch.value || coBorrowerSearch.value.length < 2) {
    coBorrowerResults.value = []
    if (!coBorrowerSearch.value) loadRecentCoBorrowers()
    return
  }
  coBorrowersLoading.value = true
  try {
    await borrowersStore.fetchBorrowers({ search: coBorrowerSearch.value })
    coBorrowerResults.value = borrowersStore.borrowers.filter(b => b.id !== formData.value.borrowerId)
    showCoBorrowerDropdown.value = true
  } catch (err) {
    console.error('Failed to search co-borrowers:', err)
  } finally {
    coBorrowersLoading.value = false
  }
}

const onCoBorrowerSearchFocus = () => {
  if (!coBorrowerSearch.value && coBorrowerResults.value.length === 0) {
    loadRecentCoBorrowers()
  }
}

const selectCoBorrowerFromDropdown = (borrower: Borrower) => {
  selectedCoBorrower.value = borrower
  formData.value.coBorrowerId = borrower.id
  coBorrowerSearch.value = ''
  coBorrowerResults.value = []
  showCoBorrowerDropdown.value = false
}

const clearSelectedCoBorrower = () => {
  selectedCoBorrower.value = null
  formData.value.coBorrowerId = ''
}

const selectBorrower = (borrower: Borrower) => {
  formData.value.borrowerId = borrower.id
}

const selectCoBorrower = (borrower: Borrower) => {
  formData.value.coBorrowerId = borrower.id
}

// Navigate to create account page
const openNewAccountPage = () => {
  navigateTo('/officer/accounts/new?returnTo=/officer/applications/new')
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

const triggerFileInput = (docName: string) => {
  const input = fileInputRefs[docName]
  if (input) {
    input.value = ''
    input.click()
  }
}

const handleFileSelected = async (event: Event, docName: string) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingDocumentName.value = docName
  uploading.value = true
  uploadProgress.value = 0

  try {
    const reader = new FileReader()
    const base64 = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

    uploadProgress.value = 100

    uploadedDocuments.value.push({
      documentName: docName,
      fileUrl: base64,
      filePublicId: '',
      uploadedAt: new Date(),
      status: 'uploaded',
    })

    showSnackbar(`${docName} added successfully`, 'success')
  } catch {
    showSnackbar('Failed to process document', 'error')
  } finally {
    uploading.value = false
    uploadingDocumentName.value = ''
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
const saveAsDraft = async () => {
  saving.value = true
  try {
    await loansStore.createApplication({
      loanTypeId: formData.value.loanTypeId,
      borrowerId: formData.value.borrowerId,
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
    // Create application
    const result = await loansStore.createApplication({
      loanTypeId: formData.value.loanTypeId,
      borrowerId: formData.value.borrowerId,
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

// Auto-select borrower returned from the create account page
const autoSelectBorrower = async (borrowerId: string) => {
  try {
    await borrowersStore.fetchBorrowerById(borrowerId)
    const borrower = borrowersStore.currentBorrower
    if (borrower) {
      selectedBorrower.value = borrower
      formData.value.borrowerId = borrower.id
      currentStep.value = 2
      showSnackbar('Account created and selected', 'success')
    }
  } catch {
    // Borrower fetch failed — user can search manually
  }
}

// Lifecycle
onMounted(() => {
  loadLoanTypes()

  // Check if returning from create account page
  const borrowerId = route.query.borrowerId as string
  if (borrowerId) {
    autoSelectBorrower(borrowerId)
  }

  // Check for duplicate parameter
  const duplicateId = route.query.duplicate as string
  if (duplicateId) {
    loansStore.fetchApplicationById(duplicateId).then(() => {
      const app = loansStore.currentApplication
      if (app) {
        formData.value.loanTypeId = app.loanTypeId
        formData.value.loanDetails = { ...app.loanDetails }
        const loanType = loanTypesStore.loanTypes.find(lt => lt.id === app.loanTypeId)
        if (loanType) {
          applyLoanTypeDefaults(loanType)
          formData.value.loanDetails = { ...app.loanDetails }
        }
      }
    })
  }
})
</script>

<style scoped>
.new-application-page {
  max-width: 100%;
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
  box-shadow: var(--shadow-card), var(--depth-edge);
}

/* Completed step — green check icon */
.application-stepper :deep(.v-stepper-item--complete .v-stepper-item__avatar) {
  background: #10B981 !important;
  color: #fff !important;
}

.application-stepper :deep(.v-stepper-item--complete .v-stepper-item__avatar .v-icon) {
  color: #fff !important;
  font-size: 18px;
}

/* Current step — primary color */
.application-stepper :deep(.v-stepper-item--selected .v-stepper-item__avatar) {
  background: var(--accent-primary) !important;
  color: #fff !important;
}

/* Inactive steps */
.application-stepper :deep(.v-stepper-item__avatar) {
  background: rgba(var(--v-theme-on-surface), 0.08) !important;
}

.application-stepper :deep(.v-stepper-item__title) {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 600;
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

/* Loan Type Selector */
.loan-type-selector {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.loan-type-autocomplete :deep(.v-field) {
  border-radius: 12px;
}

/* Dropdown custom item */
.loan-type-list-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 4px;
}

.loan-type-list-title {
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 14px;
}

.loan-type-list-subtitle {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* Selected item in input */
.loan-type-selection {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loan-type-selection-icon {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Detail Card */
.loan-type-detail-card {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px solid rgba(var(--v-theme-primary), 0.2);
  border-radius: 16px;
  padding: 24px;
}

.detail-card-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.detail-card-icon {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-card-title-group {
  flex: 1;
  min-width: 0;
}

.detail-card-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px 0;
}

.detail-card-description {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  line-height: 1.5;
}

.detail-card-check {
  flex-shrink: 0;
}

.detail-card-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.detail-stat {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.detail-stat-icon {
  width: 36px;
  height: 36px;
  background: rgba(var(--v-theme-primary), 0.08);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.detail-stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.detail-stat-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.detail-stat-value {
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.detail-stat-note {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

/* Transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.selected-indicator {
  position: absolute;
  top: 16px;
  right: 16px;
}

/* Borrower Section */
.borrower-search {
  margin-bottom: 0;
}

/* Plus icon inside input */
.borrower-search :deep(.v-field__append-inner) {
  cursor: pointer;
  color: var(--accent-primary);
}

.borrower-search :deep(.v-field) {
  border-radius: 12px;
}

/* Dropdown */
.borrower-dropdown-card {
  width: 100%;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.borrower-col :deep(.v-overlay__content) {
  width: 100% !important;
  min-width: 100% !important;
}


.dropdown-loading {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.dropdown-label {
  padding: 10px 16px 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: rgba(var(--v-theme-on-surface), 0.4);
}

.dropdown-list-item {
  min-height: 52px;
}

.dropdown-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 24px 16px;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

/* Selected Borrower Card */
.selected-borrower-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: rgba(var(--v-theme-primary), 0.06);
  border: 1px solid rgba(var(--v-theme-primary), 0.18);
  border-radius: 12px;
  margin-bottom: 20px;
}

.selected-borrower-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.selected-borrower-name {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.selected-borrower-meta {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.selected-borrower-badge {
  flex-shrink: 0;
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
  padding: 8px 12px;
  gap: 10px;
  border-radius: 8px;
  background: transparent;
  border: none;
}

.borrower-option:hover {
  background: rgba(var(--v-theme-primary), 0.04);
  border-color: rgba(var(--v-theme-primary), 0.2);
}

.borrower-option:focus-visible {
  outline: 2px solid rgb(var(--v-theme-primary));
  outline-offset: 2px;
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

.compact-details .borrower-name { font-size: 13px; }
.compact-details .borrower-email { font-size: 12px; }

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
/* 2-column borrower layout */
.borrower-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-top: 8px;
  align-items: start;
}

.borrower-col {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.col-label {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.col-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
}

.co-toggle {
  flex-shrink: 0;
  margin: 0;
}

.co-toggle :deep(.v-input__control) {
  min-height: auto !important;
}

.co-toggle :deep(.v-selection-control) {
  min-height: auto !important;
}

.co-toggle :deep(.v-label) {
  font-size: 12px !important;
  opacity: 0.7;
}

.waived-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 16px;
  height: 48px;
  border-radius: 12px;
  background: rgba(var(--v-theme-warning), 0.06);
  font-size: 13px;
  color: var(--text-muted);
}

@media (max-width: 960px) {
  .borrower-columns {
    grid-template-columns: 1fr;
  }
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

.hidden-file-input {
  display: none;
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
  left: 312px;
  right: 0;
  display: flex;
  align-items: center;
  padding: 16px 32px;
  background: var(--glass-heavy);
  border-top: 1px solid var(--glass-border-soft);
  box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.04);
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

  .detail-card-grid {
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
