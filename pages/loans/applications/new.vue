<template>
  <div class="new-application-page">
    <a-page-header
      title="New Loan Application"
      @back="() => navigateTo('/loans/applications')"
    />

    <a-card>
      <a-form
        :model="formState"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 14 }"
        @finish="handleSubmit"
      >
        <a-divider orientation="left">Borrower Information</a-divider>

        <a-form-item
          label="Borrower"
          name="borrowerId"
          :rules="[{ required: true, message: 'Please select a borrower' }]"
        >
          <a-select
            v-model:value="formState.borrowerId"
            placeholder="Select borrower"
            show-search
            :filter-option="false"
            :options="borrowerOptions"
            @search="handleBorrowerSearch"
          >
            <template #notFoundContent>
              <a-empty description="No borrowers found">
                <a-button type="link" @click="navigateTo('/borrowers/new')">
                  Add New Borrower
                </a-button>
              </a-empty>
            </template>
          </a-select>
        </a-form-item>

        <a-form-item label="Co-Borrower (Optional)" name="coBorrowerId">
          <a-select
            v-model:value="formState.coBorrowerId"
            placeholder="Select co-borrower (optional)"
            show-search
            :filter-option="false"
            :options="coBorrowerOptions"
            @search="handleCoBorrowerSearch"
            allow-clear
          />
        </a-form-item>

        <a-divider orientation="left">Loan Details</a-divider>

        <a-form-item
          label="Loan Type"
          name="loanTypeId"
          :rules="[{ required: true, message: 'Please select loan type' }]"
        >
          <a-select v-model:value="formState.loanTypeId" @change="handleLoanTypeChange">
            <a-select-option
              v-for="loanType in loanTypes"
              :key="loanType.id"
              :value="loanType.id"
            >
              {{ loanType.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          v-if="selectedLoanType"
          label="Requested Amount"
          name="requestedAmount"
          :rules="[
            { required: true, message: 'Please enter requested amount' },
            {
              type: 'number',
              min: selectedLoanType.minLoanAmount,
              max: selectedLoanType.maxLoanAmount,
              message: `Amount must be between ${formatCurrency(selectedLoanType.minLoanAmount)} and ${formatCurrency(selectedLoanType.maxLoanAmount)}`,
            },
          ]"
        >
          <a-input-number
            v-model:value="formState.requestedAmount"
            :min="selectedLoanType.minLoanAmount"
            :max="selectedLoanType.maxLoanAmount"
            :formatter="(value) => `₱ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')"
            :parser="(value) => value.replace(/₱\s?|(,*)/g, '')"
            style="width: 100%"
          />
          <div style="margin-top: 4px; color: rgba(0, 0, 0, 0.45)">
            Range: {{ formatCurrency(selectedLoanType.minLoanAmount) }} - {{ formatCurrency(selectedLoanType.maxLoanAmount) }}
          </div>
        </a-form-item>

        <a-form-item
          v-if="selectedLoanType"
          label="Loan Term (months)"
          name="requestedTerm"
          :rules="[{ required: true, message: 'Please select loan term' }]"
        >
          <a-select v-model:value="formState.requestedTerm">
            <a-select-option
              v-for="term in selectedLoanType.availableTerms"
              :key="term"
              :value="term"
            >
              {{ term }} months
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item
          v-if="selectedLoanType"
          label="Interest Rate (%)"
          name="suggestedInterestRate"
          :rules="[
            { required: true, message: 'Please enter interest rate' },
            {
              type: 'number',
              min: selectedLoanType.minInterestRate,
              max: selectedLoanType.maxInterestRate,
              message: `Rate must be between ${selectedLoanType.minInterestRate}% and ${selectedLoanType.maxInterestRate}%`,
            },
          ]"
        >
          <a-input-number
            v-model:value="formState.suggestedInterestRate"
            :min="selectedLoanType.minInterestRate"
            :max="selectedLoanType.maxInterestRate"
            :step="0.1"
            style="width: 100%"
          />
          <div style="margin-top: 4px; color: rgba(0, 0, 0, 0.45)">
            Range: {{ selectedLoanType.minInterestRate }}% - {{ selectedLoanType.maxInterestRate }}%
            (Default: {{ selectedLoanType.defaultInterestRate }}%)
          </div>
        </a-form-item>

        <a-form-item label="Officer Notes" name="officerNotes">
          <a-textarea v-model:value="formState.officerNotes" :rows="4" />
        </a-form-item>

        <a-form-item :wrapper-col="{ offset: 6, span: 14 }">
          <a-space>
            <a-button
              type="primary"
              html-type="submit"
              :loading="loansStore.loading"
            >
              Create Application
            </a-button>
            <a-button @click="navigateTo('/loans/applications')">Cancel</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoansStore } from '~/stores/loans'
import { useBorrowersStore } from '~/stores/borrowers'
import { useLoanTypesStore } from '~/stores/loanTypes'
import type { LoanType } from '~/types'

definePageMeta({
  // Auth handled by auth.global.ts middleware
  layout: 'default',
})

const route = useRoute()
const loansStore = useLoansStore()
const borrowersStore = useBorrowersStore()
const loanTypesStore = useLoanTypesStore()

const borrowerOptions = ref<any[]>([])
const coBorrowerOptions = ref<any[]>([])

const formState = reactive({
  borrowerId: '',
  coBorrowerId: '',
  loanTypeId: '',
  requestedAmount: 0,
  requestedTerm: 0,
  suggestedInterestRate: 0,
  officerNotes: '',
})

const loanTypes = computed(() => loanTypesStore.activeLoanTypes)
const selectedLoanType = computed(() =>
  loanTypes.value.find((lt) => lt.id === formState.loanTypeId)
)

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

const handleBorrowerSearch = async (value: string) => {
  if (value) {
    await borrowersStore.fetchBorrowers({ search: value, limit: 20 })
    borrowerOptions.value = borrowersStore.borrowers.map((b) => ({
      label: `${b.firstName} ${b.lastName} (${b.email})`,
      value: b.id,
    }))
  }
}

const handleCoBorrowerSearch = async (value: string) => {
  if (value) {
    await borrowersStore.fetchBorrowers({ search: value, limit: 20 })
    coBorrowerOptions.value = borrowersStore.borrowers
      .filter((b) => b.id !== formState.borrowerId)
      .map((b) => ({
        label: `${b.firstName} ${b.lastName} (${b.email})`,
        value: b.id,
      }))
  }
}

const handleLoanTypeChange = () => {
  if (selectedLoanType.value) {
    formState.suggestedInterestRate = selectedLoanType.value.defaultInterestRate
  }
}

const handleSubmit = async () => {
  try {
    const payload = {
      borrowerId: formState.borrowerId,
      coBorrowerId: formState.coBorrowerId || undefined,
      loanTypeId: formState.loanTypeId,
      loanDetails: {
        requestedAmount: formState.requestedAmount,
        requestedTerm: formState.requestedTerm,
        suggestedInterestRate: formState.suggestedInterestRate,
        officerNotes: formState.officerNotes,
      },
    }

    const application = await loansStore.createApplication(payload)

    message.success('Application created successfully')
    navigateTo(`/loans/applications/${application.id}`)
  } catch (error: any) {
    message.error(error.message || 'Failed to create application')
  }
}

onMounted(async () => {
  await loanTypesStore.fetchLoanTypes()

  // Pre-select borrower if provided in query
  if (route.query.borrowerId) {
    formState.borrowerId = route.query.borrowerId as string
    await borrowersStore.fetchBorrowers({ limit: 20 })
    borrowerOptions.value = borrowersStore.borrowers.map((b) => ({
      label: `${b.firstName} ${b.lastName} (${b.email})`,
      value: b.id,
    }))
  }
})
</script>

<style scoped>
.new-application-page {
  padding: 24px;
}
</style>
