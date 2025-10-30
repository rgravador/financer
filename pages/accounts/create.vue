<template>
  <v-container fluid class="pt-4 pl-4 pr-4">
    <!-- Account Creation Checklist -->
    <div class="mb-6">
      <!-- Progress Overview -->
      <v-sheet color="surface-variant" rounded="lg" class="pa-4 mb-6">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h2 class="text-h6 mb-1">
              Account Creation Progress
            </h2>
            <span class="text-caption text-medium-emphasis">
              Complete all required fields to create account
            </span>
          </div>
          <v-progress-circular
            :model-value="completionPercentage"
            size="60"
            width="6"
            color="primary"
          >
            {{ completionPercentage }}%
          </v-progress-circular>
        </div>
      </v-sheet>

      <!-- Checklist Sections -->
      <v-form ref="mainFormRef" v-model="formValid">
        <!-- Basic Identification -->
        <v-expansion-panels v-model="expandedPanels" class="mb-4">
          <v-expansion-panel
            :value="0"
            :color="getChecklistSectionColor('basic')"
            elevation="2"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon
                  :color="isBasicComplete ? 'success' : 'primary'"
                  class="mr-3"
                >
                  {{ isBasicComplete ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                </v-icon>
                <div>
                  <span class="text-h6">Basic Identification</span>
                  <div class="text-caption text-medium-emphasis">
                    {{ getCompletedFieldsCount('basic') }}/{{ getTotalFieldsCount('basic') }} fields completed
                  </div>
                </div>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.name"
                    label="Full Name *"
                    prepend-inner-icon="mdi-account"
                    :rules="[rules.required]"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.date_of_birth"
                    label="Date of Birth"
                    prepend-inner-icon="mdi-calendar"
                    type="date"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.ssn_tax_id"
                    label="SSN / Tax ID"
                    prepend-inner-icon="mdi-card-account-details"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.government_id_type"
                    label="Government ID Type"
                    prepend-inner-icon="mdi-card-account-details-outline"
                    :items="governmentIdTypes"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.government_id_number"
                    label="Government ID Number"
                    prepend-inner-icon="mdi-numeric"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.secondary_id_type"
                    label="Secondary ID Type (Optional)"
                    prepend-inner-icon="mdi-card-plus-outline"
                    :items="secondaryIdTypes"
                    variant="outlined"
                    class="mb-4"
                    clearable
                  />
                </v-col>
                <v-col cols="12">
                  <v-file-input
                    v-model="form.id_proof_file"
                    label="Government ID Upload (Optional)"
                    prepend-inner-icon="mdi-file-image"
                    variant="outlined"
                    accept="image/*,.pdf"
                    hint="Upload a clear photo or scan of your government-issued ID"
                    show-size
                    class="mb-4"
                  />
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Contact Information -->
          <v-expansion-panel
            :value="1"
            :color="getChecklistSectionColor('contact')"
            elevation="2"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon
                  :color="isContactComplete ? 'success' : 'primary'"
                  class="mr-3"
                >
                  {{ isContactComplete ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                </v-icon>
                <div>
                  <span class="text-h6">Contact Information</span>
                  <div class="text-caption text-medium-emphasis">
                    {{ getCompletedFieldsCount('contact') }}/{{ getTotalFieldsCount('contact') }} fields completed
                  </div>
                </div>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.phone_number"
                    label="Phone Number *"
                    prepend-inner-icon="mdi-phone"
                    :rules="[rules.required]"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.email"
                    label="Email Address *"
                    prepend-inner-icon="mdi-email"
                    :rules="[rules.required, rules.email]"
                    type="email"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.current_address"
                    label="Current Address *"
                    prepend-inner-icon="mdi-map-marker"
                    :rules="[rules.required]"
                    variant="outlined"
                    rows="3"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.previous_address"
                    label="Previous Address (Optional)"
                    prepend-inner-icon="mdi-map-marker-outline"
                    variant="outlined"
                    rows="3"
                    hint="Required if you moved within the last 2 years"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12">
                  <v-file-input
                    v-model="form.proof_of_address_file"
                    label="Proof of Address (Optional)"
                    prepend-inner-icon="mdi-file-document"
                    variant="outlined"
                    accept="image/*,.pdf"
                    hint="Recent utility bill, bank statement, or lease agreement (within 2-3 months)"
                    show-size
                    class="mb-4"
                  />
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Employment Details -->
          <v-expansion-panel
            :value="2"
            :color="getChecklistSectionColor('employment')"
            elevation="2"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon
                  :color="isEmploymentComplete ? 'success' : 'primary'"
                  class="mr-3"
                >
                  {{ isEmploymentComplete ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                </v-icon>
                <div>
                  <span class="text-h6">Employment Details</span>
                  <div class="text-caption text-medium-emphasis">
                    {{ getCompletedFieldsCount('employment') }}/{{ getTotalFieldsCount('employment') }} fields completed
                  </div>
                </div>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.employer_name"
                    label="Employer Name"
                    prepend-inner-icon="mdi-office-building"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.employer_phone"
                    label="Employer Phone"
                    prepend-inner-icon="mdi-phone-outline"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.job_title"
                    label="Job Title"
                    prepend-inner-icon="mdi-briefcase"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.employment_length_months"
                    label="Employment Length (months)"
                    prepend-inner-icon="mdi-calendar-clock"
                    type="number"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12">
                  <v-file-input
                    v-model="form.employment_verification_file"
                    label="Employment Verification Letter (Optional)"
                    prepend-inner-icon="mdi-file-check"
                    variant="outlined"
                    accept=".pdf,image/*"
                    hint="Letter from employer confirming employment"
                    show-size
                    class="mb-4"
                  />
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Income & Financial Information -->
          <v-expansion-panel
            :value="3"
            :color="getChecklistSectionColor('income')"
            elevation="2"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon
                  :color="isIncomeComplete ? 'success' : 'primary'"
                  class="mr-3"
                >
                  {{ isIncomeComplete ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                </v-icon>
                <div>
                  <span class="text-h6">Income & Financial Information</span>
                  <div class="text-caption text-medium-emphasis">
                    {{ getCompletedFieldsCount('income') }}/{{ getTotalFieldsCount('income') }} fields completed
                  </div>
                </div>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.annual_income"
                    label="Annual Income"
                    prepend-inner-icon="mdi-currency-usd"
                    type="number"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.monthly_income"
                    label="Monthly Income"
                    prepend-inner-icon="mdi-currency-usd"
                    type="number"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-file-input
                    v-model="form.pay_stubs_file"
                    label="Pay Stubs (Optional)"
                    prepend-inner-icon="mdi-file-document-outline"
                    variant="outlined"
                    accept=".pdf,image/*"
                    hint="Last 1-2 months"
                    show-size
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-file-input
                    v-model="form.tax_returns_file"
                    label="Tax Returns (Optional)"
                    prepend-inner-icon="mdi-file-table"
                    variant="outlined"
                    accept=".pdf"
                    hint="Last 1-2 years"
                    show-size
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="4">
                  <v-file-input
                    v-model="form.bank_statements_file"
                    label="Bank Statements (Optional)"
                    prepend-inner-icon="mdi-bank"
                    variant="outlined"
                    accept=".pdf,image/*"
                    hint="Last 2-3 months"
                    show-size
                    class="mb-4"
                  />
                </v-col>
              </v-row>
            </v-expansion-panel-text>
          </v-expansion-panel>

          <!-- Debt & Expenses -->
          <v-expansion-panel
            :value="4"
            :color="getChecklistSectionColor('debt')"
            elevation="2"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center">
                <v-icon
                  :color="isDebtComplete ? 'success' : 'primary'"
                  class="mr-3"
                >
                  {{ isDebtComplete ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                </v-icon>
                <div>
                  <span class="text-h6">Debt & Expenses</span>
                  <div class="text-caption text-medium-emphasis">
                    {{ getCompletedFieldsCount('debt') }}/{{ getTotalFieldsCount('debt') }} fields completed
                  </div>
                </div>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <v-row>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.monthly_expenses"
                    label="Monthly Expenses"
                    prepend-inner-icon="mdi-calculator"
                    type="number"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12" md="6">
                  <v-text-field
                    v-model="form.monthly_debt_obligations"
                    label="Monthly Debt Payments"
                    prepend-inner-icon="mdi-credit-card"
                    type="number"
                    variant="outlined"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.existing_loans_details"
                    label="Existing Loans Details (Optional)"
                    prepend-inner-icon="mdi-bank-transfer"
                    variant="outlined"
                    rows="3"
                    hint="List any existing loans with amounts and payment details"
                    class="mb-4"
                  />
                </v-col>
                <v-col cols="12">
                  <v-textarea
                    v-model="form.credit_accounts_details"
                    label="Credit Accounts Details (Optional)"
                    prepend-inner-icon="mdi-credit-card-outline"
                    variant="outlined"
                    rows="3"
                    hint="List credit cards and other credit accounts"
                    class="mb-4"
                  />
                </v-col>
              </v-row>

              <v-alert v-if="calculatedDTI" type="info" variant="tonal" class="mt-4">
                <strong>Calculated Debt-to-Income Ratio: {{ calculatedDTI }}%</strong>
              </v-alert>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-form>
    </div>

    <!-- Alerts -->
    <v-alert v-if="error" type="error" variant="tonal" class="mt-4">
      {{ error }}
    </v-alert>

    <v-alert v-if="success" type="success" variant="tonal" class="mt-4">
      Account created successfully! Redirecting...
    </v-alert>
  </v-container>
</template>

<script setup lang="ts">
import type { GovernmentIdType, SecondaryIdType } from '~/types'

definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const accountsStore = useAccounts()

const { loading } = accountsStore
const uiStore = useUI()

// Checklist state
const accountId = ref<string | null>(null)
const expandedPanels = ref(0) // Only first panel open by default
const mainFormRef = ref()
const formValid = ref(false)

const error = ref('')
const success = ref(false)

// Legacy stepper state (for navigation compatibility)
const currentStep = ref(1)

// Form data
const form = reactive({
  // Basic Identification (Step 1)
  name: '',
  date_of_birth: '',
  ssn_tax_id: '',
  government_id_type: null as GovernmentIdType | null,
  government_id_number: '',
  secondary_id_type: null as SecondaryIdType | null,
  id_proof_file: null as File | null,

  // Contact Information (Step 2)
  phone_number: '',
  email: '',
  current_address: '',
  previous_address: '',
  proof_of_address_file: null as File | null,

  // Employment Details (Step 3)
  employer_name: '',
  employer_phone: '',
  job_title: '',
  employment_length_months: '',
  employment_verification_file: null as File | null,

  // Income & Financial Information (Step 4)
  annual_income: '',
  monthly_income: '',
  pay_stubs_file: null as File | null,
  tax_returns_file: null as File | null,
  bank_statements_file: null as File | null,

  // Debt & Expenses (Step 5)
  monthly_expenses: '',
  monthly_debt_obligations: '',
  existing_loans_details: '',
  credit_accounts_details: ''
})

// Dropdown options
const governmentIdTypes = [
  { title: "Driver's License", value: 'drivers_license' },
  { title: 'Passport', value: 'passport' },
  { title: 'State ID', value: 'state_id' },
  { title: 'Military ID', value: 'military_id' }
]

const secondaryIdTypes = [
  { title: 'Birth Certificate', value: 'birth_certificate' },
  { title: 'Social Security Card', value: 'social_security_card' },
  { title: 'Utility Bill', value: 'utility_bill' }
]

// Section field definitions for progress tracking
const sectionFields = {
  basic: ['name', 'date_of_birth', 'ssn_tax_id', 'government_id_type', 'government_id_number', 'secondary_id_type'],
  contact: ['phone_number', 'email', 'current_address', 'previous_address'],
  employment: ['employer_name', 'employer_phone', 'job_title', 'employment_length_months'],
  income: ['annual_income', 'monthly_income'],
  debt: ['monthly_expenses', 'monthly_debt_obligations', 'existing_loans_details', 'credit_accounts_details']
}

// Required fields for each section
const requiredFields = {
  basic: ['name'],
  contact: ['phone_number', 'email', 'current_address'],
  employment: [],
  income: [],
  debt: []
}

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !v || pattern.test(v) || 'Invalid email format'
  }
}

// Computed properties for checklist functionality
const completionPercentage = computed(() => {
  const totalFields = Object.values(sectionFields).flat().length
  const completedFields = Object.values(sectionFields).flat().filter((field) => {
    const value = form[field as keyof typeof form]
    return value !== null && value !== undefined && value !== ''
  }).length

  return Math.round((completedFields / totalFields) * 100)
})

// Section completion checks
const isBasicComplete = computed(() => {
  return requiredFields.basic.every((field) => {
    const value = form[field as keyof typeof form]
    return value !== null && value !== undefined && value !== ''
  })
})

const isContactComplete = computed(() => {
  return requiredFields.contact.every((field) => {
    const value = form[field as keyof typeof form]
    return value !== null && value !== undefined && value !== ''
  })
})

const isEmploymentComplete = computed(() => {
  return requiredFields.employment.every((field) => {
    const value = form[field as keyof typeof form]
    return value !== null && value !== undefined && value !== ''
  })
})

const isIncomeComplete = computed(() => {
  return requiredFields.income.every((field) => {
    const value = form[field as keyof typeof form]
    return value !== null && value !== undefined && value !== ''
  })
})

const isDebtComplete = computed(() => {
  return requiredFields.debt.every((field) => {
    const value = form[field as keyof typeof form]
    return value !== null && value !== undefined && value !== ''
  })
})

// Legacy computed for navigation compatibility
const isCurrentStepValid = computed(() => {
  return formValid.value
})

const calculatedDTI = computed(() => {
  const monthlyIncome = parseFloat(form.monthly_income) || parseFloat(form.annual_income) / 12
  const monthlyDebt = parseFloat(form.monthly_debt_obligations)

  if (monthlyIncome && monthlyDebt) {
    return Math.round((monthlyDebt / monthlyIncome) * 100)
  }
  return null
})

// Helper methods for checklist
const getCompletedFieldsCount = (section: keyof typeof sectionFields) => {
  return sectionFields[section].filter((field) => {
    const value = form[field as keyof typeof form]
    return value !== null && value !== undefined && value !== ''
  }).length
}

const getTotalFieldsCount = (section: keyof typeof sectionFields) => {
  return sectionFields[section].length
}

const getChecklistSectionColor = (section: string) => {
  const sectionKey = section as keyof typeof sectionFields
  const completed = getCompletedFieldsCount(sectionKey)
  const total = getTotalFieldsCount(sectionKey)
  const isRequired = requiredFields[sectionKey]

  // Check if required fields are completed
  const requiredCompleted = isRequired.every((field) => {
    const value = form[field as keyof typeof form]
    return value !== null && value !== undefined && value !== ''
  })

  if (requiredCompleted) { return 'success' }
  if (completed > 0) { return 'warning' }
  return 'surface'
}

const saveAccountData = async () => {
  try {
    // Prepare all form data for account creation
    const accountData = {
      name: form.name,
      date_of_birth: form.date_of_birth || null,
      ssn_tax_id: form.ssn_tax_id || null,
      government_id_type: form.government_id_type,
      government_id_number: form.government_id_number || null,
      secondary_id_type: form.secondary_id_type,
      id_proof_file: form.id_proof_file
    }

    const result = await accountsStore.createAccountMultiStep(accountData)

    if (result.success && result.data) {
      accountId.value = (result.data as any).id

      // Update account with additional fields
      const additionalData = {
        phone_number: form.phone_number || null,
        email: form.email || null,
        current_address: form.current_address || null,
        previous_address: form.previous_address || null,
        employer_name: form.employer_name || null,
        employer_phone: form.employer_phone || null,
        job_title: form.job_title || null,
        employment_length_months: form.employment_length_months ? parseInt(form.employment_length_months) : null,
        annual_income: form.annual_income ? parseFloat(form.annual_income) : null,
        monthly_income: form.monthly_income ? parseFloat(form.monthly_income) : null,
        monthly_expenses: form.monthly_expenses ? parseFloat(form.monthly_expenses) : null,
        monthly_debt_obligations: form.monthly_debt_obligations ? parseFloat(form.monthly_debt_obligations) : null,
        debt_to_income_ratio: calculatedDTI.value,
        existing_loans_details: form.existing_loans_details || null,
        credit_accounts_details: form.credit_accounts_details || null
      }

      await accountsStore.updateAccount(accountId.value, additionalData)

      // Handle file uploads
      await handleFileUploads()

      return true
    } else {
      throw new Error(result.error || 'Failed to create account')
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to save account data'
    uiStore.showError(error.value)
    return false
  }
}

const handleFileUploads = async () => {
  if (!accountId.value) { return }

  const fileUploads: Array<{ file: File; type: string; field: string }> = []

  // Collect all files that need to be uploaded
  if (form.proof_of_address_file) {
    fileUploads.push({
      file: form.proof_of_address_file,
      type: 'proof-of-address',
      field: 'proof_of_address_url'
    })
  }

  if (form.employment_verification_file) {
    fileUploads.push({
      file: form.employment_verification_file,
      type: 'employment-verification',
      field: 'employment_verification_url'
    })
  }

  if (form.pay_stubs_file) {
    fileUploads.push({
      file: form.pay_stubs_file,
      type: 'pay-stubs',
      field: 'pay_stubs_url'
    })
  }

  if (form.tax_returns_file) {
    fileUploads.push({
      file: form.tax_returns_file,
      type: 'tax-returns',
      field: 'tax_returns_url'
    })
  }

  if (form.bank_statements_file) {
    fileUploads.push({
      file: form.bank_statements_file,
      type: 'bank-statements',
      field: 'bank_statements_url'
    })
  }

  // Upload files and update account with URLs
  for (const upload of fileUploads) {
    const result = await accountsStore.uploadAccountDocument(
      accountId.value,
      upload.file,
      upload.type
    )

    if (result.success) {
      // Update the account with the file URL
      await accountsStore.updateAccount(accountId.value, {
        [upload.field]: result.url
      })
    }
  }
}

const handleSubmit = async () => {
  if (mainFormRef.value) {
    const { valid } = await mainFormRef.value.validate()
    if (!valid) {
      error.value = 'Please complete all required fields'
      return
    }
  }

  error.value = ''
  success.value = false

  try {
    const result = await saveAccountData()

    if (result) {
      success.value = true
      uiStore.showSuccess('Account created successfully')
      setTimeout(() => {
        router.push('/accounts')
      }, 1500)
    }
  } catch (err: any) {
    error.value = err.message || 'Failed to create account'
    uiStore.showError(error.value)
  }
}

</script>
