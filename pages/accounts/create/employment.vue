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
              <v-text-field
                v-model="formData.employer_name"
                label="Employer Name"
                prepend-inner-icon="mdi-office-building"
                variant="outlined"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.employer_phone"
                label="Employer Phone"
                prepend-inner-icon="mdi-phone-outline"
                variant="outlined"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.job_title"
                label="Job Title"
                prepend-inner-icon="mdi-briefcase"
                variant="outlined"
                class="mb-4"
              />
            </v-col>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="formData.employment_length_months"
                label="Employment Length (months)"
                prepend-inner-icon="mdi-calendar-clock"
                type="number"
                variant="outlined"
                class="mb-4"
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

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})

const router = useRouter()
const creationStore = useAccountCreation()
const accountsStore = useAccounts()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { formData, saveEmploymentInfo, accountId } = creationStore
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { loading } = accountsStore

void formData
void saveEmploymentInfo
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

  const result = await saveEmploymentInfo()
  if (result.success) {
    router.push('/accounts/create')
  }
}
</script>
