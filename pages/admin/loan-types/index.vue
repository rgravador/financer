<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex align-center justify-space-between mb-4">
          <div>
            <h1 class="text-h4">Loan Types</h1>
            <p class="text-body-2 text-medium-emphasis mt-1">
              Manage loan products and document requirements
            </p>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/admin/loan-types/new')">
            New Loan Type
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">Total Loan Types</div>
                <div class="text-h4">{{ loanTypesStore.totalLoanTypes }}</div>
              </div>
              <v-icon size="48" color="primary">mdi-file-document-multiple</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">Active</div>
                <div class="text-h4">{{ loanTypesStore.activeLoanTypes.length }}</div>
              </div>
              <v-icon size="48" color="success">mdi-check-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">Inactive</div>
                <div class="text-h4">{{ loanTypesStore.inactiveLoanTypes.length }}</div>
              </div>
              <v-icon size="48" color="error">mdi-close-circle</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="d-flex align-center justify-space-between">
              <div>
                <div class="text-caption text-medium-emphasis">Avg. Documents</div>
                <div class="text-h4">{{ avgRequiredDocs }}</div>
              </div>
              <v-icon size="48" color="blue">mdi-file-document</v-icon>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loan Types Grid -->
    <v-row>
      <v-col
        v-for="loanType in loanTypesStore.activeLoanTypes"
        :key="loanType.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card hover @click="$router.push(`/admin/loan-types/${loanType.id}`)">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>{{ loanType.name }}</span>
            <v-chip :color="loanType.isActive ? 'success' : 'error'" size="small">
              {{ loanType.isActive ? 'Active' : 'Inactive' }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <p v-if="loanType.description" class="text-body-2 text-medium-emphasis mb-4">
              {{ loanType.description }}
            </p>

            <div class="mb-3">
              <div class="text-caption text-medium-emphasis">Interest Rate</div>
              <div class="text-h6 text-primary">{{ loanType.defaultInterestRate }}%</div>
              <div class="text-caption">
                Range: {{ loanType.minInterestRate }}% - {{ loanType.maxInterestRate }}%
              </div>
            </div>

            <div class="mb-3">
              <div class="text-caption text-medium-emphasis">Loan Amount</div>
              <div class="text-body-1">
                ₱{{ formatAmount(loanType.minLoanAmount) }} - ₱{{ formatAmount(loanType.maxLoanAmount) }}
              </div>
            </div>

            <div class="mb-3">
              <div class="text-caption text-medium-emphasis">Available Terms</div>
              <div class="d-flex flex-wrap gap-1 mt-1">
                <v-chip
                  v-for="term in loanType.availableTerms"
                  :key="term"
                  size="small"
                  variant="tonal"
                >
                  {{ term }} months
                </v-chip>
              </div>
            </div>

            <div>
              <div class="text-caption text-medium-emphasis">Required Documents</div>
              <div class="text-body-1">
                {{ loanType.requiredDocuments.length }} documents
                ({{ loanType.requiredDocuments.filter(d => d.isRequired).length }} required)
              </div>
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn
              variant="text"
              prepend-icon="mdi-pencil"
              @click.stop="$router.push(`/admin/loan-types/${loanType.id}`)"
            >
              Edit
            </v-btn>
            <v-spacer />
            <v-btn
              variant="text"
              color="error"
              @click.stop="handleDeactivate(loanType)"
            >
              Deactivate
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Empty state -->
      <v-col v-if="loanTypesStore.activeLoanTypes.length === 0" cols="12">
        <v-card>
          <v-card-text class="text-center pa-8">
            <v-icon size="64" color="grey-lighten-1">mdi-file-document-multiple</v-icon>
            <div class="text-body-1 mt-2">No loan types found</div>
            <div class="text-caption text-medium-emphasis">
              Create your first loan type to get started
            </div>
            <v-btn color="primary" class="mt-4" @click="$router.push('/admin/loan-types/new')">
              Create Loan Type
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Inactive Loan Types Section -->
    <v-row v-if="loanTypesStore.inactiveLoanTypes.length > 0" class="mt-4">
      <v-col cols="12">
        <h2 class="text-h5 mb-3">Inactive Loan Types</h2>
      </v-col>

      <v-col
        v-for="loanType in loanTypesStore.inactiveLoanTypes"
        :key="loanType.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <span>{{ loanType.name }}</span>
            <v-chip color="error" size="small">Inactive</v-chip>
          </v-card-title>

          <v-card-text>
            <p v-if="loanType.description" class="text-body-2 text-medium-emphasis mb-4">
              {{ loanType.description }}
            </p>
            <div class="text-caption">
              {{ loanType.defaultInterestRate }}% interest • {{ loanType.requiredDocuments.length }} documents
            </div>
          </v-card-text>

          <v-card-actions>
            <v-btn
              variant="text"
              color="success"
              prepend-icon="mdi-check-circle"
              @click="handleActivate(loanType)"
            >
              Activate
            </v-btn>
          </v-card-actions>
        </v-card>
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
  middleware: ['auth', 'role'],
  role: ['tenant_admin'],
})

const loanTypesStore = useLoanTypesStore()
const showSnackbar = ref(false)
const snackbarMessage = ref('')
const snackbarColor = ref('success')

// Computed average required docs
const avgRequiredDocs = computed(() => {
  if (loanTypesStore.loanTypes.length === 0) return 0
  const total = loanTypesStore.loanTypes.reduce(
    (sum, lt) => sum + lt.requiredDocuments.length,
    0
  )
  return Math.round(total / loanTypesStore.loanTypes.length)
})

// Format amount with thousands separator
const formatAmount = (amount: number) => {
  return amount.toLocaleString('en-PH')
}

// Handle deactivate
const handleDeactivate = async (loanType: LoanType) => {
  if (!confirm(`Are you sure you want to deactivate "${loanType.name}"?`)) {
    return
  }

  try {
    await loanTypesStore.deactivateLoanType(loanType.id)
    snackbarMessage.value = `Loan type "${loanType.name}" deactivated successfully`
    snackbarColor.value = 'success'
    showSnackbar.value = true
  } catch (error: any) {
    snackbarMessage.value = error.data?.statusMessage || 'Failed to deactivate loan type'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
}

// Handle activate
const handleActivate = async (loanType: LoanType) => {
  try {
    await loanTypesStore.activateLoanType(loanType.id)
    snackbarMessage.value = `Loan type "${loanType.name}" activated successfully`
    snackbarColor.value = 'success'
    showSnackbar.value = true
  } catch (error: any) {
    snackbarMessage.value = error.data?.statusMessage || 'Failed to activate loan type'
    snackbarColor.value = 'error'
    showSnackbar.value = true
  }
}

// Load loan types on mount
onMounted(async () => {
  await loanTypesStore.fetchLoanTypes()
})
</script>

<style scoped>
.gap-1 {
  gap: 4px;
}
</style>
