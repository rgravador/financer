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
              <v-text-field
                v-model="formData.phone_number"
                label="Phone Number *"
                prepend-inner-icon="mdi-phone"
                :rules="[rules.required]"
                variant="outlined"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.email"
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

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const creationStore = useAccountCreation()
const accountsStore = useAccounts()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { formData, saveContactInfo, accountId } = creationStore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { loading } = accountsStore

void formData
void saveContactInfo
void accountId
void loading

const formRef = ref()
const formValid = ref(false)

const rules = {
  required: (v: string) => !!v || 'This field is required',
  email: (v: string) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return !v || pattern.test(v) || 'Invalid email format'
  }
}

const goBack = () => {
  router.push('/accounts/create')
}

const handleSave = async () => {
  if (formRef.value) {
    const { valid } = await formRef.value.validate()
    if (!valid) {
      return
    }
  }

  // Check if basic info is completed first
  if (!accountId) {
    alert('Please complete Basic Identification first')
    router.push('/accounts/create/basic')
    return
  }

  const result = await saveContactInfo()
  if (result.success) {
    router.push('/accounts/create')
  }
}
</script>
