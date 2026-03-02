<template>
  <v-container fluid class="wf-content-padding">
    <!-- Page Header -->
    <div class="wf-page-header">
      <h1>Loan Types</h1>
    </div>
    <p class="wf-page-subtitle">Manage loan products and document requirements</p>

    <!-- Toolbar -->
    <div class="wf-toolbar mb-6">
      <v-btn color="primary" prepend-icon="mdi-plus" @click="$router.push('/admin/loan-types/new')">
        New Loan Type
      </v-btn>
    </div>

    <!-- Stats Cards -->
    <v-row class="wf-section-gap">
      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ loanTypesStore.totalLoanTypes }}</div>
            <div class="wf-stat-label">Total Loan Types</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ loanTypesStore.activeLoanTypes.length }}</div>
            <div class="wf-stat-label">Active</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ loanTypesStore.inactiveLoanTypes.length }}</div>
            <div class="wf-stat-label">Inactive</div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" sm="6" md="3">
        <v-card class="wf-stat-card">
          <v-card-text>
            <div class="wf-stat-value">{{ avgRequiredDocs }}</div>
            <div class="wf-stat-label">Avg. Documents</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loan Types Grid -->
    <v-row class="wf-section-gap">
      <v-col
        v-for="loanType in loanTypesStore.activeLoanTypes"
        :key="loanType.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="wf-card loan-type-card" @click="$router.push(`/admin/loan-types/${loanType.id}`)">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>{{ loanType.name }}</span>
            <span
              class="wf-status-badge"
              :class="loanType.isActive ? 'active' : 'inactive'"
            >
              <span class="wf-status-dot"></span>
              {{ loanType.isActive ? 'Active' : 'Inactive' }}
            </span>
          </v-card-title>

          <v-card-text>
            <p v-if="loanType.description" class="loan-description">
              {{ loanType.description }}
            </p>

            <div class="wf-info-row">
              <span class="wf-info-label">Interest Rate</span>
              <span class="wf-info-value">{{ loanType.defaultInterestRate }}%</span>
            </div>

            <div class="wf-info-row">
              <span class="wf-info-label">Loan Amount</span>
              <span class="wf-info-value">
                ₱{{ formatAmount(loanType.minLoanAmount) }} - ₱{{ formatAmount(loanType.maxLoanAmount) }}
              </span>
            </div>

            <div class="wf-info-row">
              <span class="wf-info-label">Available Terms</span>
              <div class="d-flex flex-wrap gap-1 mt-1">
                <span
                  v-for="term in loanType.availableTerms"
                  :key="term"
                  class="term-badge"
                >
                  {{ term }} months
                </span>
              </div>
            </div>

            <div class="wf-info-row">
              <span class="wf-info-label">Required Documents</span>
              <span class="wf-info-value">
                {{ loanType.requiredDocuments.length }} documents
              </span>
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
        <v-card class="wf-section-card">
          <div class="wf-empty-state">
            <v-icon class="empty-icon">mdi-file-document-multiple-outline</v-icon>
            <div class="empty-title">No loan types found</div>
            <div class="empty-message">Create your first loan type to get started</div>
            <v-btn color="primary" class="mt-4" @click="$router.push('/admin/loan-types/new')">
              Create Loan Type
            </v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Inactive Loan Types Section -->
    <v-row v-if="loanTypesStore.inactiveLoanTypes.length > 0" class="mt-6">
      <v-col cols="12">
        <h2 class="wf-section-title">Inactive Loan Types</h2>
      </v-col>

      <v-col
        v-for="loanType in loanTypesStore.inactiveLoanTypes"
        :key="loanType.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="wf-card inactive-card">
          <v-card-title class="d-flex align-center justify-space-between">
            <span>{{ loanType.name }}</span>
            <span class="wf-status-badge inactive">
              <span class="wf-status-dot"></span>
              Inactive
            </span>
          </v-card-title>

          <v-card-text>
            <p v-if="loanType.description" class="loan-description">
              {{ loanType.description }}
            </p>
            <div class="loan-summary">
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
  middleware: ['role'],
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
.wf-stat-card {
  text-align: center;
  padding: 24px;
}

.wf-stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #1e3a8a;
  margin-bottom: 8px;
}

.wf-stat-label {
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
}

.loan-type-card {
  cursor: pointer;
  transition: all 0.2s;
}

.loan-type-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.loan-description {
  color: #6b7280;
  font-size: 14px;
  margin-bottom: 16px;
}

.term-badge {
  display: inline-block;
  padding: 4px 10px;
  background: #f0f4ff;
  color: #1e3a8a;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.inactive-card {
  opacity: 0.7;
}

.loan-summary {
  color: #6b7280;
  font-size: 13px;
  margin-top: 8px;
}

.gap-1 {
  gap: 4px;
}
</style>
