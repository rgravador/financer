<template>
  <v-form ref="form" @submit.prevent="handleSubmit">
    <v-card>
      <v-card-title>{{ isEdit ? 'Edit Loan Type' : 'Create New Loan Type' }}</v-card-title>

      <v-card-text>
        <!-- Basic Information -->
        <div class="mb-6">
          <h3 class="text-h6 mb-3">Basic Information</h3>

          <v-text-field
            v-model="formData.name"
            label="Loan Type Name"
            variant="outlined"
            :rules="nameRules"
            :disabled="loading"
            prepend-inner-icon="mdi-file-document"
            required
          />

          <v-textarea
            v-model="formData.description"
            label="Description"
            variant="outlined"
            :disabled="loading"
            rows="3"
            hint="Optional description of this loan type"
            persistent-hint
          />
        </div>

        <!-- Interest Rates -->
        <div class="mb-6">
          <h3 class="text-h6 mb-3">Interest Rates (%)</h3>

          <v-row>
            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="formData.minInterestRate"
                label="Minimum Rate"
                type="number"
                variant="outlined"
                :rules="rateRules"
                :disabled="loading"
                suffix="%"
                required
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="formData.defaultInterestRate"
                label="Default Rate"
                type="number"
                variant="outlined"
                :rules="defaultRateRules"
                :disabled="loading"
                suffix="%"
                required
              />
            </v-col>

            <v-col cols="12" md="4">
              <v-text-field
                v-model.number="formData.maxInterestRate"
                label="Maximum Rate"
                type="number"
                variant="outlined"
                :rules="rateRules"
                :disabled="loading"
                suffix="%"
                required
              />
            </v-col>
          </v-row>
        </div>

        <!-- Loan Amounts -->
        <div class="mb-6">
          <h3 class="text-h6 mb-3">Loan Amount Range</h3>

          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.minLoanAmount"
                label="Minimum Amount"
                type="number"
                variant="outlined"
                :rules="amountRules"
                :disabled="loading"
                prefix="₱"
                required
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="formData.maxLoanAmount"
                label="Maximum Amount"
                type="number"
                variant="outlined"
                :rules="amountRules"
                :disabled="loading"
                prefix="₱"
                required
              />
            </v-col>
          </v-row>
        </div>

        <!-- Available Terms -->
        <div class="mb-6">
          <h3 class="text-h6 mb-3">Available Terms (months)</h3>

          <div class="d-flex flex-wrap gap-2 mb-2">
            <v-checkbox
              v-for="term in commonTerms"
              :key="term"
              v-model="formData.availableTerms"
              :label="`${term} months`"
              :value="term"
              hide-details
              density="compact"
            />
          </div>

          <v-text-field
            v-model="customTerm"
            label="Custom Term (months)"
            type="number"
            variant="outlined"
            density="compact"
            :disabled="loading"
            @keyup.enter="addCustomTerm"
          >
            <template #append>
              <v-btn size="small" @click="addCustomTerm">Add</v-btn>
            </template>
          </v-text-field>
        </div>

        <!-- Required Documents -->
        <div class="mb-6">
          <div class="d-flex align-center justify-space-between mb-3">
            <h3 class="text-h6">Required Documents</h3>
            <v-btn size="small" prepend-icon="mdi-plus" @click="addDocument">
              Add Document
            </v-btn>
          </div>

          <v-card v-for="(doc, index) in formData.requiredDocuments" :key="index" class="mb-2">
            <v-card-text>
              <v-row>
                <v-col cols="12" md="5">
                  <v-text-field
                    v-model="doc.documentName"
                    label="Document Name"
                    variant="outlined"
                    density="compact"
                    :rules="[(v: string) => !!v || 'Document name is required']"
                    :disabled="loading"
                    required
                  />
                </v-col>

                <v-col cols="12" md="5">
                  <v-text-field
                    v-model="doc.description"
                    label="Description (optional)"
                    variant="outlined"
                    density="compact"
                    :disabled="loading"
                  />
                </v-col>

                <v-col cols="12" md="2" class="d-flex align-center">
                  <v-checkbox
                    v-model="doc.isRequired"
                    label="Required"
                    density="compact"
                    hide-details
                  />
                  <v-btn
                    icon="mdi-delete"
                    size="small"
                    variant="text"
                    color="error"
                    @click="removeDocument(index)"
                  />
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <v-alert v-if="formData.requiredDocuments.length === 0" type="info" variant="tonal">
            No documents added yet. Click "Add Document" to specify required documents.
          </v-alert>
        </div>

        <v-alert v-if="error" type="error" variant="tonal" closable @click:close="error = null">
          {{ error }}
        </v-alert>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="$emit('cancel')">
          Cancel
        </v-btn>
        <v-btn color="primary" type="submit" :loading="loading">
          {{ isEdit ? 'Update Loan Type' : 'Create Loan Type' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { LoanType } from '~/types'

const props = defineProps<{
  loanType?: LoanType | null
}>()

const emit = defineEmits<{
  'created': [loanType: LoanType]
  'updated': [loanType: LoanType]
  'cancel': []
}>()

const loanTypesStore = useLoanTypesStore()

const form = ref()
const loading = ref(false)
const error = ref<string | null>(null)
const customTerm = ref('')

const isEdit = ref(!!props.loanType)

// Common loan terms in months
const commonTerms = [3, 6, 12, 18, 24, 36, 48, 60, 120, 180, 240, 300]

const formData = ref({
  name: '',
  description: '',
  defaultInterestRate: 12,
  minInterestRate: 10,
  maxInterestRate: 18,
  minLoanAmount: 10000,
  maxLoanAmount: 1000000,
  availableTerms: [] as number[],
  requiredDocuments: [] as Array<{
    documentName: string
    description?: string
    isRequired: boolean
  }>,
})

// Initialize form data if editing
if (props.loanType) {
  formData.value = {
    name: props.loanType.name,
    description: props.loanType.description || '',
    defaultInterestRate: props.loanType.defaultInterestRate,
    minInterestRate: props.loanType.minInterestRate,
    maxInterestRate: props.loanType.maxInterestRate,
    minLoanAmount: props.loanType.minLoanAmount,
    maxLoanAmount: props.loanType.maxLoanAmount,
    availableTerms: [...props.loanType.availableTerms],
    requiredDocuments: [...props.loanType.requiredDocuments],
  }
}

// Validation rules
const nameRules = [
  (v: string) => !!v || 'Loan type name is required',
  (v: string) => v.length >= 2 || 'Name must be at least 2 characters',
  (v: string) => v.length <= 100 || 'Name must not exceed 100 characters',
]

const rateRules = [
  (v: number) => v != null || 'Interest rate is required',
  (v: number) => v >= 0 || 'Rate must be 0 or greater',
  (v: number) => v <= 100 || 'Rate must be 100 or less',
]

const defaultRateRules = [
  ...rateRules,
  () => formData.value.defaultInterestRate >= formData.value.minInterestRate || 'Default rate must be >= minimum rate',
  () => formData.value.defaultInterestRate <= formData.value.maxInterestRate || 'Default rate must be <= maximum rate',
]

const amountRules = [
  (v: number) => v != null || 'Amount is required',
  (v: number) => v >= 0 || 'Amount must be 0 or greater',
]

// Add custom term
const addCustomTerm = () => {
  const term = parseInt(customTerm.value)
  if (term && term > 0 && !formData.value.availableTerms.includes(term)) {
    formData.value.availableTerms.push(term)
    formData.value.availableTerms.sort((a, b) => a - b)
    customTerm.value = ''
  }
}

// Add document
const addDocument = () => {
  formData.value.requiredDocuments.push({
    documentName: '',
    description: '',
    isRequired: true,
  })
}

// Remove document
const removeDocument = (index: number) => {
  formData.value.requiredDocuments.splice(index, 1)
}

// Handle form submission
const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  // Additional validation
  if (formData.value.availableTerms.length === 0) {
    error.value = 'At least one term must be selected'
    return
  }

  if (formData.value.maxInterestRate < formData.value.minInterestRate) {
    error.value = 'Maximum interest rate must be greater than or equal to minimum rate'
    return
  }

  if (formData.value.maxLoanAmount < formData.value.minLoanAmount) {
    error.value = 'Maximum loan amount must be greater than or equal to minimum amount'
    return
  }

  loading.value = true
  error.value = null

  try {
    if (isEdit.value && props.loanType) {
      // Update existing loan type
      const updated = await loanTypesStore.updateLoanType(props.loanType.id, formData.value)
      emit('updated', updated)
    } else {
      // Create new loan type
      const created = await loanTypesStore.createLoanType(formData.value)
      emit('created', created)
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || `Failed to ${isEdit.value ? 'update' : 'create'} loan type`
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
</style>
