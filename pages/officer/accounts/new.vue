<template>
  <div class="new-account-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-back">
        <v-btn
          variant="text"
          icon="mdi-arrow-left"
          @click="goBack"
        />
      </div>
      <div class="header-content">
        <h1 class="page-title">Create Account</h1>
        <p class="page-subtitle">Add a new borrower account to your organization</p>
      </div>
    </div>

    <!-- Stepper -->
    <v-stepper
      v-model="currentStep"
      class="account-stepper"
      :items="stepItems"
      flat
      hide-actions
    >
      <!-- Step 1: Personal Info -->
      <template #item.1>
        <div class="step-content">
          <h2 class="step-title">Personal Information</h2>
          <p class="step-description">Basic identity and contact details</p>

          <v-form ref="step1Ref" class="form-fields">
            <v-text-field
              v-model="formData.firstName"
              label="First Name"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model="formData.middleName"
              label="Middle Name"
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
            <v-text-field
              v-model="formData.suffix"
              label="Suffix (Jr., Sr., III)"
              variant="outlined"
              density="comfortable"
            />
            <v-menu
              v-model="dobMenuOpen"
              :close-on-content-click="false"
            >
              <template #activator="{ props }">
                <v-text-field
                  :model-value="formattedDateOfBirth"
                  label="Date of Birth"
                  prepend-inner-icon="mdi-calendar"
                  variant="outlined"
                  density="comfortable"
                  readonly
                  clearable
                  v-bind="props"
                  @click:clear="formData.dateOfBirth = null"
                />
              </template>
              <v-date-picker
                v-model="formData.dateOfBirth"
                color="primary"
                @update:model-value="dobMenuOpen = false"
              />
            </v-menu>
            <v-text-field
              v-model="formData.email"
              label="Email Address"
              type="email"
              :rules="[rules.required, rules.email]"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model="formData.contactNumber"
              label="Contact Number"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
            />
          </v-form>
        </div>
      </template>

      <!-- Step 2: Address & Stability -->
      <template #item.2>
        <div class="step-content">
          <h2 class="step-title">Address & Stability</h2>
          <p class="step-description">Current residence and housing details</p>

          <v-form ref="step2Ref" class="form-fields">
            <v-text-field
              v-model="formData.address"
              label="Current Address"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
            />
            <v-select
              v-model="formData.housingStatus"
              :items="housingStatuses"
              item-title="label"
              item-value="value"
              label="Housing Status"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model.number="formData.yearsAtCurrentAddress"
              label="Years at Current Address"
              type="number"
              min="0"
              step="0.5"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model="formData.previousAddress"
              label="Previous Address"
              variant="outlined"
              density="comfortable"
              hint="If recently moved"
              persistent-hint
            />
          </v-form>
        </div>
      </template>

      <!-- Step 3: Employment & Income -->
      <template #item.3>
        <div class="step-content">
          <h2 class="step-title">Employment & Income</h2>
          <p class="step-description">Employment status, income source, and financial capacity</p>

          <v-form ref="step3Ref" class="form-fields">
            <v-select
              v-model="formData.employmentType"
              :items="employmentTypes"
              item-title="label"
              item-value="value"
              label="Employment Status"
              :rules="[rules.required]"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model="formData.employer"
              label="Employer / Business Name"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model.number="formData.employmentYears"
              label="Employment Length (Years)"
              type="number"
              min="0"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model.number="formData.employmentMonths"
              label="Employment Length (Months)"
              type="number"
              min="0"
              max="11"
              variant="outlined"
              density="comfortable"
            />

            <v-divider class="my-2" />

            <v-select
              v-model="formData.incomeSource"
              :items="incomeSources"
              item-title="label"
              item-value="value"
              label="Source of Income"
              variant="outlined"
              density="comfortable"
              clearable
            />
            <v-text-field
              v-model.number="formData.monthlyIncome"
              label="Monthly Income"
              type="number"
              prefix="₱"
              :rules="[rules.required, rules.positiveNumber]"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model.number="formData.existingObligations"
              label="Existing Monthly Obligations"
              type="number"
              prefix="₱"
              variant="outlined"
              density="comfortable"
              hint="Other loans, credit cards, etc."
              persistent-hint
            />
            <v-text-field
              v-model.number="formData.dependentsCount"
              label="Number of Dependents"
              type="number"
              min="0"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model.number="formData.monthlyRent"
              label="Monthly Rent / Housing Cost"
              type="number"
              prefix="₱"
              variant="outlined"
              density="comfortable"
            />
          </v-form>
        </div>
      </template>

      <!-- Step 4: Financial History -->
      <template #item.4>
        <div class="step-content">
          <h2 class="step-title">Financial History</h2>
          <p class="step-description">Past loans and banking information</p>

          <!-- Past Loans -->
          <div class="sub-section">
            <div class="sub-section-header">
              <span class="sub-section-title">Past Loans</span>
              <v-btn
                variant="tonal"
                color="primary"
                size="small"
                prepend-icon="mdi-plus"
                @click="addPastLoan"
              >
                Add
              </v-btn>
            </div>
            <div v-if="formData.pastLoans.length === 0" class="empty-sub-section">
              <v-icon size="40" color="grey-lighten-1">mdi-file-document-outline</v-icon>
              <span>No past loans recorded</span>
            </div>
            <div
              v-for="(loan, index) in formData.pastLoans"
              :key="index"
              class="sub-item"
            >
              <v-text-field
                v-model="loan.lender"
                label="Lender"
                variant="outlined"
                density="compact"
                hide-details
              />
              <v-text-field
                v-model.number="loan.amount"
                label="Amount"
                type="number"
                prefix="₱"
                variant="outlined"
                density="compact"
                hide-details
                class="mt-3"
              />
              <v-select
                v-model="loan.status"
                :items="pastLoanStatuses"
                item-title="label"
                item-value="value"
                label="Status"
                variant="outlined"
                density="compact"
                hide-details
                class="mt-3"
              />
              <v-text-field
                v-model="loan.remarks"
                label="Remarks"
                variant="outlined"
                density="compact"
                hide-details
                class="mt-3"
              />
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                color="error"
                size="x-small"
                class="sub-item-delete"
                @click="formData.pastLoans.splice(index, 1)"
              />
            </div>
          </div>

          <v-divider class="my-6" />

          <!-- Banking -->
          <div class="sub-section">
            <span class="sub-section-title">Banking & Financial Footprint</span>
            <div class="form-fields mt-4">
              <v-text-field
                v-model="formData.bankName"
                label="Bank Name"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="formData.bankAccountNumber"
                label="Bank Account Number"
                variant="outlined"
                density="comfortable"
              />
            </div>
            <v-checkbox
              v-model="formData.hasBankStatements"
              label="Bank statements provided (proof of cash flow)"
              color="primary"
              hide-details
              density="compact"
              class="mt-2"
            />
          </div>
        </div>
      </template>

      <!-- Step 5: References & Notes -->
      <template #item.5>
        <div class="step-content">
          <h2 class="step-title">References & Notes</h2>
          <p class="step-description">Personal references and additional context</p>

          <!-- References -->
          <div class="sub-section">
            <div class="sub-section-header">
              <span class="sub-section-title">Personal or Professional References</span>
              <v-btn
                variant="tonal"
                color="primary"
                size="small"
                prepend-icon="mdi-plus"
                @click="addReference"
              >
                Add
              </v-btn>
            </div>
            <div v-if="formData.references.length === 0" class="empty-sub-section">
              <v-icon size="40" color="grey-lighten-1">mdi-account-group-outline</v-icon>
              <span>No references added</span>
            </div>
            <div
              v-for="(ref, index) in formData.references"
              :key="index"
              class="sub-item"
            >
              <v-text-field
                v-model="ref.name"
                label="Full Name"
                variant="outlined"
                density="compact"
                hide-details
              />
              <v-text-field
                v-model="ref.relationship"
                label="Relationship"
                variant="outlined"
                density="compact"
                hide-details
                class="mt-3"
              />
              <v-text-field
                v-model="ref.contactNumber"
                label="Contact Number"
                variant="outlined"
                density="compact"
                hide-details
                class="mt-3"
              />
              <v-text-field
                v-model="ref.address"
                label="Address (optional)"
                variant="outlined"
                density="compact"
                hide-details
                class="mt-3"
              />
              <v-btn
                icon="mdi-delete-outline"
                variant="text"
                color="error"
                size="x-small"
                class="sub-item-delete"
                @click="formData.references.splice(index, 1)"
              />
            </div>
          </div>

          <v-divider class="my-6" />

          <!-- Notes -->
          <v-textarea
            v-model="formData.notes"
            label="Additional Notes (optional)"
            variant="outlined"
            density="comfortable"
            rows="3"
            hint="Any additional observations or context"
            persistent-hint
          />
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
      <v-btn
        v-else
        color="primary"
        :loading="saving"
        @click="submitForm"
      >
        <v-icon start>mdi-check</v-icon>
        Create Account
      </v-btn>
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
import { useBorrowersStore } from '~/stores/borrowers'
import type { BorrowerReference, BorrowerPastLoan } from '~/types'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['tenant_officer', 'tenant_admin'],
})

const route = useRoute()
const borrowersStore = useBorrowersStore()

// Stepper
const currentStep = ref(1)
const stepItems = [
  { title: 'Personal Info', value: 1 },
  { title: 'Address', value: 2 },
  { title: 'Employment & Income', value: 3 },
  { title: 'Financial History', value: 4 },
  { title: 'References', value: 5 },
]

// Form refs per step
const step1Ref = ref()
const step2Ref = ref()
const step3Ref = ref()

const saving = ref(false)
const dobMenuOpen = ref(false)

const formData = ref({
  // Step 1: Personal Info
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  dateOfBirth: null as Date | null,
  email: '',
  contactNumber: '',

  // Step 2: Address & Stability
  address: '',
  housingStatus: 'renting',
  previousAddress: '',
  yearsAtCurrentAddress: null as number | null,

  // Step 3: Employment & Income
  employmentType: 'employed',
  employer: '',
  employmentYears: null as number | null,
  employmentMonths: null as number | null,
  incomeSource: '',
  monthlyIncome: 0,
  existingObligations: null as number | null,
  dependentsCount: null as number | null,
  monthlyRent: null as number | null,

  // Step 4: Financial History
  pastLoans: [] as BorrowerPastLoan[],
  bankName: '',
  bankAccountNumber: '',
  hasBankStatements: false,

  // Step 5: References & Notes
  references: [] as BorrowerReference[],
  notes: '',
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Options
const employmentTypes = [
  { label: 'Employed', value: 'employed' },
  { label: 'Self-Employed', value: 'self_employed' },
  { label: 'Business Owner', value: 'business_owner' },
  { label: 'OFW', value: 'ofw' },
  { label: 'Other', value: 'other' },
]

const housingStatuses = [
  { label: 'Owned', value: 'owned' },
  { label: 'Renting', value: 'renting' },
  { label: 'Living with Relatives', value: 'living_with_relatives' },
  { label: 'Company-Provided', value: 'company_provided' },
  { label: 'Other', value: 'other' },
]

const incomeSources = [
  { label: 'Salary', value: 'salary' },
  { label: 'Business', value: 'business' },
  { label: 'Freelance', value: 'freelance' },
  { label: 'Remittance', value: 'remittance' },
  { label: 'Pension', value: 'pension' },
  { label: 'Rental Income', value: 'rental' },
  { label: 'Investments', value: 'investments' },
  { label: 'Other', value: 'other' },
]

const pastLoanStatuses = [
  { label: 'Fully Paid', value: 'paid' },
  { label: 'Current / Active', value: 'current' },
  { label: 'Defaulted', value: 'defaulted' },
  { label: 'Restructured', value: 'restructured' },
]

// Validation rules
const rules = {
  required: (v: any) => !!v || v === 0 || 'This field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'Invalid email address',
  positiveNumber: (v: number) => v > 0 || 'Must be a positive number',
}

const formattedDateOfBirth = computed(() => {
  if (!formData.value.dateOfBirth) return ''
  const d = new Date(formData.value.dateOfBirth)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})

const returnTo = computed(() => route.query.returnTo as string | undefined)

// Can proceed to next step
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1:
      return !!(formData.value.firstName && formData.value.lastName && formData.value.email && formData.value.contactNumber)
    case 2:
      return !!formData.value.address
    case 3:
      return !!(formData.value.employmentType && formData.value.monthlyIncome > 0)
    case 4:
    case 5:
      return true
    default:
      return true
  }
})

const goBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--
    return
  }
  if (returnTo.value) {
    navigateTo(returnTo.value)
  } else {
    navigateTo('/officer/accounts')
  }
}

const nextStep = async () => {
  const stepRefs: Record<number, any> = { 1: step1Ref, 2: step2Ref, 3: step3Ref }
  const ref = stepRefs[currentStep.value]
  if (ref?.value) {
    const { valid } = await ref.value.validate()
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

const addPastLoan = () => {
  formData.value.pastLoans.push({ lender: '', amount: 0, status: 'paid', remarks: '' })
}

const addReference = () => {
  formData.value.references.push({ name: '', relationship: '', contactNumber: '', address: '' })
}

const buildPayload = () => {
  const d = formData.value
  return {
    firstName: d.firstName,
    middleName: d.middleName || undefined,
    lastName: d.lastName,
    suffix: d.suffix || undefined,
    dateOfBirth: d.dateOfBirth ? new Date(d.dateOfBirth).toISOString() : undefined,
    email: d.email,
    contactNumber: d.contactNumber,
    address: d.address,
    housingStatus: d.housingStatus || undefined,
    previousAddress: d.previousAddress || undefined,
    yearsAtCurrentAddress: d.yearsAtCurrentAddress ?? undefined,
    employmentType: d.employmentType,
    employer: d.employer || undefined,
    employmentLength: (d.employmentYears || d.employmentMonths)
      ? ((d.employmentYears ?? 0) * 12) + (d.employmentMonths ?? 0)
      : undefined,
    incomeSource: d.incomeSource || undefined,
    monthlyIncome: d.monthlyIncome,
    existingObligations: d.existingObligations ?? undefined,
    dependentsCount: d.dependentsCount ?? undefined,
    monthlyRent: d.monthlyRent ?? undefined,
    pastLoans: d.pastLoans.filter(l => l.lender),
    bankName: d.bankName || undefined,
    bankAccountNumber: d.bankAccountNumber || undefined,
    hasBankStatements: d.hasBankStatements || undefined,
    references: d.references.filter(r => r.name && r.contactNumber),
    notes: d.notes || undefined,
  }
}

const submitForm = async () => {
  saving.value = true
  try {
    const payload = buildPayload()
    const created = await borrowersStore.createBorrower(payload) as any

    if (returnTo.value) {
      navigateTo(`${returnTo.value}?borrowerId=${created.id}`)
    } else {
      snackbar.value = { show: true, message: 'Account created successfully', color: 'success' }
      await new Promise(resolve => setTimeout(resolve, 1000))
      navigateTo('/officer/accounts')
    }
  } catch (error: any) {
    snackbar.value = {
      show: true,
      message: error.data?.statusMessage || 'Failed to create account',
      color: 'error',
    }
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.new-account-page {
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
.account-stepper {
  background: transparent;
}

.account-stepper :deep(.v-stepper-header) {
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

/* Form Fields - single column */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Sub-sections (past loans, references) */
.sub-section {
  margin-top: 0;
}

.sub-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.sub-section-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(var(--v-theme-on-surface), 0.7);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.empty-sub-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px;
  text-align: center;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-radius: 12px;
  color: rgba(var(--v-theme-on-surface), 0.4);
  font-size: 14px;
}

.sub-item {
  position: relative;
  padding: 16px;
  padding-right: 44px;
  background: rgba(var(--v-theme-on-surface), 0.02);
  border-radius: 12px;
  margin-bottom: 12px;
}

.sub-item:last-child {
  margin-bottom: 0;
}

.sub-item-delete {
  position: absolute;
  top: 12px;
  right: 8px;
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

/* Responsive */
@media (max-width: 768px) {
  .navigation-footer {
    padding: 12px 16px;
  }

  .step-content {
    padding: 20px;
  }
}
</style>
