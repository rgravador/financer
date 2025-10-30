<template>
  <v-container fluid class="pt-4 pl-4 pr-4">
    <v-card elevation="2">
      <v-card-title class="d-flex align-center pa-4 bg-primary">
        <v-btn
          icon
          variant="text"
          @click="goBack"
        >
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <span class="ml-2">Income & Financial Information</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="formValid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.annual_income"
                label="Annual Income"
                prepend-inner-icon="mdi-currency-usd"
                type="number"
                variant="outlined"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.monthly_income"
                label="Monthly Income"
                prepend-inner-icon="mdi-currency-usd"
                type="number"
                variant="outlined"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="4">
              <v-file-input
                v-model="formData.pay_stubs_file"
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
                v-model="formData.tax_returns_file"
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
                v-model="formData.bank_statements_file"
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
        </v-form>
      </v-card-text>

      <v-divider />

      <v-card-actions class="pa-4">
        <v-btn
          variant="outlined"
          @click="goBack"
        >
          Cancel
        </v-btn>
        <v-spacer />
        <v-btn
          color="primary"
          variant="flat"
          :loading="loading"
          @click="handleSave"
        >
          Save & Continue
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const creationStore = useAccountCreation()
const accountsStore = useAccounts()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { formData, saveIncomeInfo, accountId } = creationStore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { loading } = accountsStore

void formData
void saveIncomeInfo
void accountId
void loading

const formRef = ref()
const formValid = ref(false)

const goBack = () => {
  router.push('/accounts/create')
}

const handleSave = async () => {
  // Check if basic info is completed first
  if (!accountId) {
    alert('Please complete Basic Identification first')
    router.push('/accounts/create/basic')
    return
  }

  const result = await saveIncomeInfo()
  if (result.success) {
    router.push('/accounts/create')
  }
}
</script>
