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
        <span class="ml-2">Contact Information</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="formValid">
          <v-row>
            <v-col cols="12" md="6">
              <label for="contact-phone" class="font-weight-medium">Phone Number *</label>
              <v-text-field
                id="contact-phone"
                v-model="formData.phone_number"
                prepend-inner-icon="mdi-phone"
                :rules="[rules.required]"
                variant="solo"
                flat
                class="mb-4"
                hide-details="auto"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" md="6">
              <label for="contact-email" class="font-weight-medium">Email Address *</label>
              <v-text-field
                id="contact-email"
                v-model="formData.email"
                prepend-inner-icon="mdi-email"
                :rules="[rules.required, rules.email]"
                type="email"
                variant="solo"
                flat
                class="mb-4"
                hide-details="auto"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="formData.current_address"
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
                v-model="formData.previous_address"
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
                v-model="formData.proof_of_address_file"
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
          :disabled="!formValid"
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
  name: 'AccountsCreateContact',

  data () {
    return {
      formRef: null as any,
      formValid: false,
      rules: {
        required: (v: string) => !!v || 'This field is required',
        email: (v: string) => {
          const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
          return !v || pattern.test(v) || 'Invalid email format'
        }
      }
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
      if (this.formRef) {
        const { valid } = await this.formRef.validate()
        if (!valid) {
          return
        }
      }

      if (!this.accountId) {
        alert('Please complete Basic Identification first')
        this.$router.push('/accounts/create/basic')
        return
      }

      const result = await this.creationStore.saveContactInfo()
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
