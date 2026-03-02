<template>
  <v-container fluid class="wf-content-padding">
    <!-- Back Button -->
    <NuxtLink to="/admin/loan-types" class="back-btn">
      ← Back to Loan Types
    </NuxtLink>

    <!-- Page Header -->
    <div class="wf-page-header">
      <h1>{{ isNew ? 'New Loan Type' : 'Edit Loan Type' }}</h1>
    </div>

    <!-- Loading State -->
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="primary"
      class="mx-auto d-block my-16"
    />

    <!-- Main Content -->
    <div v-else-if="loanType" class="details-grid">
      <!-- Form Section -->
      <div>
        <v-card class="wf-section-card">
          <AdminLoanTypeForm
            :loan-type="isNew ? null : loanType"
            @created="handleCreated"
            @updated="handleUpdated"
            @cancel="$router.push('/admin/loan-types')"
          />
        </v-card>
      </div>

      <!-- Sidebar Info -->
      <div>
        <v-card v-if="!isNew" class="wf-card">
          <div class="card-title">Loan Type Information</div>

          <div class="wf-info-row">
            <span class="wf-info-label">Status</span>
            <span
              class="wf-status-badge"
              :class="loanType.isActive ? 'active' : 'inactive'"
            >
              <span class="wf-status-dot"></span>
              {{ loanType.isActive ? 'Active' : 'Inactive' }}
            </span>
          </div>

          <div class="wf-info-row">
            <span class="wf-info-label">Created</span>
            <span class="wf-info-value">{{ formatDate(loanType.createdAt) }}</span>
          </div>

          <div class="wf-info-row">
            <span class="wf-info-label">Last Updated</span>
            <span class="wf-info-value">{{ formatDate(loanType.updatedAt) }}</span>
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
        </v-card>
      </div>
    </div>

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

<style scoped>
.details-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 24px;
  margin-top: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  text-decoration: none;
  font-size: 14px;
  margin-bottom: 16px;
  transition: all 0.2s;
}

.back-btn:hover {
  color: #1e3a8a;
}

@media (max-width: 1024px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
