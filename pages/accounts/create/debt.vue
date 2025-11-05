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
              <label for="debt-monthly-expenses" class="font-weight-medium">Monthly Expenses</label>
              <v-text-field
                id="debt-monthly-expenses"
                v-model="formData.monthly_expenses"
                prepend-inner-icon="mdi-calculator"
                type="number"
                variant="solo"
                flat
                class="mb-4"
                hide-details="auto"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="6">
              <label for="debt-monthly-payments" class="font-weight-medium">Monthly Debt Payments</label>
              <v-text-field
                id="debt-monthly-payments"
                v-model="formData.monthly_debt_obligations"
                prepend-inner-icon="mdi-credit-card"
                type="number"
                variant="solo"
                flat
                class="mb-4"
                hide-details="auto"
                density="comfortable"
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

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AccountsCreateDebt',

  data () {
    return {
      formRef: null as any,
      formValid: false
    }
  },

  computed: {
    creationStore () {
      return useAccountCreation()
    },

    accountsStore () {
      return useAccountsStore()
    },

    formData () {
      return this.creationStore.formData
    },

    loading () {
      return this.accountsStore.loading
    },

    accountId () {
      return this.creationStore.accountId
    },

    calculatedDTI () {
      return this.creationStore.calculatedDTI
    }
  },

  methods: {
    goBack () {
      this.$router.push('/accounts/create')
    },

    async handleSave () {
      if (!this.accountId) {
        alert('Please complete Basic Identification first')
        this.$router.push('/accounts/create/basic')
        return
      }

      const result = await this.creationStore.saveDebtInfo()
      if (result.success) {
        this.$router.push('/accounts/create')
      }
    }
  }
})

definePageMeta({
  middleware: 'auth'
})
</script>
