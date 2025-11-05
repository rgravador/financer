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

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AccountsCreateIncome',

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

      const result = await this.creationStore.saveIncomeInfo()
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
