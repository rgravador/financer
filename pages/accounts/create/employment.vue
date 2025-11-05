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
        <span class="ml-2">Employment Details</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="formValid">
          <v-row>
            <v-col cols="12" md="6">
              <label for="employment-employer-name" class="font-weight-medium">Employer Name</label>
              <v-text-field
                id="employment-employer-name"
                v-model="formData.employer_name"
                prepend-inner-icon="mdi-office-building"
                variant="solo"
                flat
                class="mb-4"
                hide-details="auto"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="6">
              <label for="employment-employer-phone" class="font-weight-medium">Employer Phone</label>
              <v-text-field
                id="employment-employer-phone"
                v-model="formData.employer_phone"
                prepend-inner-icon="mdi-phone-outline"
                variant="solo"
                flat
                class="mb-4"
                hide-details="auto"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="6">
              <label for="employment-job-title" class="font-weight-medium">Job Title</label>
              <v-text-field
                id="employment-job-title"
                v-model="formData.job_title"
                prepend-inner-icon="mdi-briefcase"
                variant="solo"
                flat
                class="mb-4"
                hide-details="auto"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="6">
              <label for="employment-length" class="font-weight-medium">Employment Length (months)</label>
              <v-text-field
                id="employment-length"
                v-model="formData.employment_length_months"
                prepend-inner-icon="mdi-calendar-clock"
                type="number"
                variant="solo"
                flat
                class="mb-4"
                hide-details="auto"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12">
              <v-file-input
                v-model="formData.employment_verification_file"
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
  name: 'AccountsCreateEmployment',

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

      const result = await this.creationStore.saveEmploymentInfo()
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
