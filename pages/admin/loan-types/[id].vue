<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center mb-4">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="$router.push('/admin/loan-types')"
          />
          <h1 class="text-h4 ml-2">{{ isNew ? 'New Loan Type' : 'Edit Loan Type' }}</h1>
        </div>
      </v-col>
    </v-row>

    <v-row v-if="!loading && loanType">
      <v-col cols="12" md="8">
        <AdminLoanTypeForm
          :loan-type="isNew ? null : loanType"
          @created="handleCreated"
          @updated="handleUpdated"
          @cancel="$router.push('/admin/loan-types')"
        />
      </v-col>

      <v-col cols="12" md="4">
        <v-card v-if="!isNew">
          <v-card-title>Loan Type Information</v-card-title>
          <v-card-text>
            <div class="mb-3">
              <div class="text-caption text-medium-emphasis">Status</div>
              <v-chip :color="loanType.isActive ? 'success' : 'error'" size="small" class="mt-1">
                {{ loanType.isActive ? 'Active' : 'Inactive' }}
              </v-chip>
            </div>

            <div class="mb-3">
              <div class="text-caption text-medium-emphasis">Created</div>
              <div class="text-body-2">{{ formatDate(loanType.createdAt) }}</div>
            </div>

            <div class="mb-3">
              <div class="text-caption text-medium-emphasis">Last Updated</div>
              <div class="text-body-2">{{ formatDate(loanType.updatedAt) }}</div>
            </div>

            <v-divider class="my-4" />

            <v-btn
              v-if="loanType.isActive"
              block
              color="error"
              variant="outlined"
              prepend-icon="mdi-close-circle"
              @click="handleDeactivate"
            >
              Deactivate Loan Type
            </v-btn>
            <v-btn
              v-else
              block
              color="success"
              variant="outlined"
              prepend-icon="mdi-check-circle"
              @click="handleActivate"
            >
              Activate Loan Type
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <v-row v-if="loading">
      <v-col cols="12" class="text-center py-8">
        <v-progress-circular indeterminate color="primary" size="64" />
        <div class="text-body-1 mt-4">Loading loan type...</div>
      </v-col>
    </v-row>

    <!-- Success Snackbar -->
    <v-snackbar v-model="showSnackbar" :color="snackbarColor" :timeout="3000">
      {{ snackbarMessage }}
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { LoanType } from '~/types'

definePageMeta({
  middleware: ['role'],
  role: ['tenant_admin'],
})

const route = useRoute()
const router = useRouter()
const loanTypesStore = useLoanTypesStore()

const loanTypeId = computed(() => route.params.id as string)
const isNew = computed(() => loanTypeId.value === 'new')

const loanType = ref<LoanType | null>(null)
const loading = ref(false)
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Format date
const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Handle created
const handleCreated = (newLoanType: LoanType) => {
  snackbarMessage.value = `Loan type "${newLoanType.name}" created successfully`
  snackbarColor.value = 'success'
  showSnackbar.value = true

  // Redirect to index page after a brief delay
  setTimeout(() => {
    router.push('/admin/loan-types')
  }, 1500)
}

// Handle updated
const handleUpdated = (updatedLoanType: LoanType) => {
  loanType.value = updatedLoanType
  snackbarMessage.value = `Loan type "${updatedLoanType.name}" updated successfully`
  snackbarColor.value = 'success'
  showSnackbar.value = true
}

// Handle deactivate
const handleDeactivate = async () => {
  if (!loanType.value) return

  if (!confirm(`Are you sure you want to deactivate "${loanType.value.name}"?`)) {
    return
  }

  try {
    await loanTypesStore.deactivateLoanType(loanType.value.id)
    loanType.value.isActive = false
    snackbarMessage.value = `Loan type "${loanType.value.name}" deactivated successfully`
    snackbarColor.value = 'success'
    showSnackbar.value = true
  } catch (error: any) {
    snackbarMessage.value = error.data?.statusMessage || 'Failed to deactivate loan type'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
}

// Handle activate
const handleActivate = async () => {
  if (!loanType.value) return

  try {
    await loanTypesStore.activateLoanType(loanType.value.id)
    loanType.value.isActive = true
    snackbarMessage.value = `Loan type "${loanType.value.name}" activated successfully`
    snackbarColor.value = 'success'
    showSnackbar.value = true
  } catch (error: any) {
    snackbarMessage.value = error.data?.statusMessage || 'Failed to activate loan type'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
}

// Load loan type on mount (if editing)
onMounted(async () => {
  if (!isNew.value) {
    loading.value = true
    try {
      loanType.value = await loanTypesStore.fetchLoanType(loanTypeId.value)
    } catch (error: any) {
      snackbarMessage.value = error.data?.statusMessage || 'Failed to load loan type'
      snackbarColor.value = 'error'
      showSnackbar.value = true
      // Redirect back to index if not found
      setTimeout(() => {
        router.push('/admin/loan-types')
      }, 2000)
    } finally {
      loading.value = false
    }
  }
})
</script>
