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
        <span class="ml-2">Debt & Expenses</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="formValid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.monthly_expenses"
                label="Monthly Expenses"
                prepend-inner-icon="mdi-calculator"
                type="number"
                variant="outlined"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.monthly_debt_obligations"
                label="Monthly Debt Payments"
                prepend-inner-icon="mdi-credit-card"
                type="number"
                variant="outlined"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="formData.existing_loans_details"
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
                v-model="formData.credit_accounts_details"
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
const { formData, saveDebtInfo, accountId, calculatedDTI } = creationStore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { loading } = accountsStore

void formData
void saveDebtInfo
void accountId
void calculatedDTI
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

  const result = await saveDebtInfo()
  if (result.success) {
    router.push('/accounts/create')
  }
}
</script>
