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
        <span class="ml-2">Basic Identification</span>
      </v-card-title>

      <v-divider />

      <v-card-text class="pa-6">
        <v-form ref="formRef" v-model="formValid">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.name"
                label="Full Name *"
                prepend-inner-icon="mdi-account"
                :rules="[rules.required]"
                variant="outlined"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.date_of_birth"
                label="Date of Birth"
                prepend-inner-icon="mdi-calendar"
                type="date"
                variant="outlined"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.ssn_tax_id"
                label="SSN / Tax ID"
                prepend-inner-icon="mdi-card-account-details"
                variant="outlined"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.government_id_type"
                label="Government ID Type"
                prepend-inner-icon="mdi-card-account-details-outline"
                :items="governmentIdTypes"
                variant="outlined"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.government_id_number"
                label="Government ID Number"
                prepend-inner-icon="mdi-numeric"
                variant="outlined"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-select
                v-model="formData.secondary_id_type"
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
                v-model="formData.id_proof_file"
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
  name: 'AccountsCreateBasic',

  data () {
    return {
      formRef: null as any,
      formValid: false,
      governmentIdTypes: [
        { title: "Driver's License", value: 'drivers_license' },
        { title: 'Passport', value: 'passport' },
        { title: 'State ID', value: 'state_id' },
        { title: 'Military ID', value: 'military_id' }
      ],
      secondaryIdTypes: [
        { title: 'Birth Certificate', value: 'birth_certificate' },
        { title: 'Social Security Card', value: 'social_security_card' },
        { title: 'Utility Bill', value: 'utility_bill' }
      ],
      rules: {
        required: (v: string) => !!v || 'This field is required'
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
      return this.$route.query.id as string | undefined
    },

    isEditMode () {
      return !!this.accountId
    }
  },

  async mounted () {
    if (this.isEditMode && this.accountId) {
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('id', this.accountId)
        .single()

      if (!error && data) {
        this.formData.name = data.name || ''
        this.formData.date_of_birth = data.date_of_birth || null
        this.formData.ssn_tax_id = data.ssn_tax_id || null
        this.formData.government_id_type = data.government_id_type || null
        this.formData.government_id_number = data.government_id_number || null
        this.formData.secondary_id_type = data.secondary_id_type || null
      }
    }
  },

  methods: {
    goBack () {
      if (this.isEditMode) {
        this.$router.push(`/accounts/${this.accountId}`)
      } else {
        this.$router.push('/accounts/create')
      }
    },

    async handleSave () {
      if (this.formRef) {
        const { valid } = await this.formRef.validate()
        if (!valid) {
          return
        }
      }

      if (this.isEditMode && this.accountId) {
        const result = await this.accountsStore.updateAccount(this.accountId, {
          name: this.formData.name,
          date_of_birth: this.formData.date_of_birth,
          ssn_tax_id: this.formData.ssn_tax_id,
          government_id_type: this.formData.government_id_type,
          government_id_number: this.formData.government_id_number,
          secondary_id_type: this.formData.secondary_id_type
        })

        if (result.success) {
          this.$router.push(`/accounts/create?id=${this.accountId}`)
        }
      } else {
        const result = await this.creationStore.saveBasicInfo()
        if (result.success) {
          this.$router.push('/accounts/create')
        }
      }
    }
  }
})

definePageMeta({
  middleware: 'auth'
})
</script>
