<template>
  <v-container fluid class="wf-content-padding">
    <!-- Loading State -->
    <v-progress-circular
      v-if="loansStore.loading && !application"
      indeterminate
      color="primary"
      class="mx-auto d-block my-16"
    />

    <!-- Application Details -->
    <div v-else-if="application">
      <!-- Back Button -->
      <NuxtLink to="/approver/queue" class="back-btn">
        ← Back to Queue
      </NuxtLink>

      <!-- Page Header -->
      <div class="wf-page-header">
        <div class="d-flex align-center justify-space-between">
          <h1>Application Review</h1>
          <span class="wf-status-badge" :class="getStatusClass(application.status)">
            <span class="wf-status-dot"></span>
            {{ getStatusLabel(application.status) }}
          </span>
        </div>
      </div>

      <div class="details-grid">
        <!-- Left Panel -->
        <div>
          <!-- Applicant Information -->
          <v-card class="wf-section-card mb-6">
            <div class="card-title">Applicant Information</div>
            <div class="wf-info-row">
              <span class="wf-info-label">Name</span>
              <span class="wf-info-value">{{ application.applicantName || 'N/A' }}</span>
            </div>
            <div class="wf-info-row">
              <span class="wf-info-label">Email</span>
              <span class="wf-info-value">{{ application.borrowerId?.email || 'N/A' }}</span>
            </div>
            <div class="wf-info-row">
              <span class="wf-info-label">Phone</span>
              <span class="wf-info-value">{{ application.borrowerId?.phoneNumber || 'N/A' }}</span>
            </div>
            <div class="wf-info-row">
              <span class="wf-info-label">Employment Status</span>
              <span class="wf-info-value">{{ application.borrowerId?.employmentStatus || 'N/A' }}</span>
            </div>
          </v-card>

          <!-- Loan Details -->
          <v-card class="wf-section-card mb-6">
            <div class="card-title">Loan Details</div>
            <div class="wf-info-row">
              <span class="wf-info-label">Loan Type</span>
              <span class="wf-info-value">{{ application.loanTypeName || 'N/A' }}</span>
            </div>
            <div class="wf-info-row">
              <span class="wf-info-label">Requested Amount</span>
              <span class="wf-info-value wf-amount">{{ formatCurrency(application.loanDetails.requestedAmount) }}</span>
            </div>
            <div class="wf-info-row">
              <span class="wf-info-label">Term</span>
              <span class="wf-info-value">{{ application.loanDetails.requestedTerm }} months</span>
            </div>
            <div class="wf-info-row">
              <span class="wf-info-label">Officer Notes</span>
              <span class="wf-info-value">{{ application.loanDetails.officerNotes || 'None' }}</span>
            </div>
          </v-card>

          <!-- Documents -->
          <v-card class="wf-section-card mb-6">
            <div class="card-title">Uploaded Documents ({{ application.documents?.length || 0 }})</div>
            <div v-if="application.documents && application.documents.length > 0" class="documents-list">
              <div v-for="doc in application.documents" :key="doc.id" class="document-item">
                <v-icon class="document-icon">mdi-file-document</v-icon>
                <div class="document-info">
                  <div class="document-name">{{ doc.documentName }}</div>
                  <div class="wf-table-subtext">Uploaded {{ formatDate(doc.uploadedAt) }}</div>
                </div>
                <v-btn
                  size="small"
                  color="primary"
                  variant="text"
                  :href="doc.fileUrl"
                  target="_blank"
                >
                  View
                </v-btn>
              </div>
            </div>
            <div v-else class="wf-empty-state pa-8">
              <v-icon class="empty-icon">mdi-file-document-outline</v-icon>
              <div class="empty-message">No documents uploaded yet</div>
            </div>
          </v-card>

          <!-- Rate Decision (Only show when under review) -->
          <v-card v-if="application.status === 'under_review'" class="wf-section-card mb-6">
            <RateDecisionBox
              v-if="application.loanTypeId"
              :default-rate="application.defaultRate || 0"
              :suggested-rate="application.suggestedRate || 0"
              :min-rate="application.loanTypeId.minInterestRate"
              :max-rate="application.loanTypeId.maxInterestRate"
              v-model="finalRate"
              @validate="(valid) => (isRateValid = valid)"
            />
          </v-card>

          <!-- Decision Notes -->
          <v-card v-if="application.status === 'under_review'" class="wf-section-card mb-6">
            <div class="card-title">Decision Notes</div>
            <v-textarea
              v-model="approvalNotes"
              rows="4"
              variant="outlined"
              placeholder="Add any notes about your decision (optional)..."
            />
          </v-card>

          <!-- Reject Form -->
          <v-card v-if="showRejectForm" class="wf-section-card mb-6 reject-section">
            <div class="card-title">Rejection Reason</div>
            <v-textarea
              v-model="rejectNotes"
              rows="4"
              variant="outlined"
              placeholder="Explain why this application is being rejected (required)..."
            />
            <div class="d-flex gap-3 mt-4">
              <v-btn variant="outlined" @click="showRejectForm = false" :disabled="actionLoading">
                Cancel
              </v-btn>
              <v-btn
                color="error"
                @click="handleReject"
                :disabled="!rejectNotes.trim() || actionLoading"
              >
                {{ actionLoading ? 'Rejecting...' : 'Confirm Rejection' }}
              </v-btn>
            </div>
          </v-card>

          <!-- Action Buttons -->
          <v-card class="wf-section-card">
            <div class="d-flex flex-column gap-3">
              <v-btn
                v-if="canStartReview"
                color="primary"
                size="large"
                block
                @click="handleStartReview"
                :disabled="actionLoading"
              >
                {{ actionLoading ? 'Starting...' : 'Start Review' }}
              </v-btn>

              <template v-if="application.status === 'under_review'">
                <v-btn
                  color="success"
                  size="large"
                  block
                  @click="handleApprove"
                  :disabled="!canApprove || actionLoading"
                >
                  {{ actionLoading ? 'Approving...' : 'Approve Application' }}
                </v-btn>

                <v-btn
                  v-if="!showRejectForm"
                  color="error"
                  variant="outlined"
                  size="large"
                  block
                  @click="showRejectForm = true"
                  :disabled="actionLoading"
                >
                  Reject Application
                </v-btn>

                <v-btn
                  variant="outlined"
                  size="large"
                  block
                  @click="showRequestDocsModal = true"
                  :disabled="actionLoading"
                >
                  Request Documents
                </v-btn>
              </template>
            </div>
          </v-card>
        </div>

        <!-- Right Panel -->
        <div>
          <!-- Loan Summary -->
          <v-card class="wf-card mb-6">
            <div class="card-title">Loan Summary</div>
            <div class="summary-grid">
              <div class="summary-item">
                <span class="summary-label">Requested</span>
                <span class="summary-value">{{ formatCurrency(application.loanDetails.requestedAmount) }}</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Term</span>
                <span class="summary-value">{{ application.loanDetails.requestedTerm }} mo</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Default Rate</span>
                <span class="summary-value">{{ application.defaultRate?.toFixed(2) }}%</span>
              </div>
              <div class="summary-item">
                <span class="summary-label">Suggested Rate</span>
                <span class="summary-value">{{ application.suggestedRate?.toFixed(2) }}%</span>
              </div>
            </div>
          </v-card>

          <!-- Status Timeline -->
          <v-card class="wf-card">
            <div class="card-title">Status History</div>
            <v-timeline side="end" density="compact">
              <v-timeline-item
                v-for="(entry, index) in application.statusHistory"
                :key="entry.id || index"
                :dot-color="getTimelineColor(entry.status)"
                size="small"
              >
                <template v-slot:opposite>
                  <div class="timeline-date">{{ formatDateTime(entry.timestamp) }}</div>
                </template>
                <div class="timeline-content">
                  <div class="timeline-status">{{ getStatusLabel(entry.status) }}</div>
                  <div v-if="entry.notes" class="timeline-notes">{{ entry.notes }}</div>
                </div>
              </v-timeline-item>
            </v-timeline>
          </v-card>
        </div>
      </div>
    </div>

    <!-- Request Documents Modal -->
    <RequestDocumentsModal
      :show="showRequestDocsModal"
      :application-id="applicationId"
      :loading="actionLoading"
      @close="showRequestDocsModal = false"
      @submit="handleRequestDocuments"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoansStore } from '~/stores/loans'
import RateDecisionBox from '~/components/approver/RateDecisionBox.vue'
import RequestDocumentsModal from '~/components/approver/RequestDocumentsModal.vue'

definePageMeta({
  layout: 'default',
  middleware: ['role'],
  allowedRoles: ['tenant_approver', 'tenant_admin'],
})

const route = useRoute()
const router = useRouter()
const loansStore = useLoansStore()

const applicationId = route.params.id as string

const showRejectForm = ref(false)
const showRequestDocsModal = ref(false)
const rejectNotes = ref('')
const finalRate = ref(0)
const approvalNotes = ref('')
const isRateValid = ref(false)
const actionLoading = ref(false)

onMounted(async () => {
  await loansStore.fetchApplicationById(applicationId)
  if (loansStore.currentApplication) {
    finalRate.value = loansStore.currentApplication.loanDetails.suggestedInterestRate
  }
})

const application = computed(() => loansStore.currentApplication)

const canStartReview = computed(() => {
  return application.value?.status === 'submitted'
})

const canApprove = computed(() => {
  return application.value?.status === 'under_review' && isRateValid.value
})

const handleStartReview = async () => {
  if (!application.value) return

  actionLoading.value = true
  try {
    await loansStore.startReview(application.value.id)
    await loansStore.fetchApplicationById(applicationId)
  } catch (error) {
    console.error('Failed to start review:', error)
    alert('Failed to start review. Please try again.')
  } finally {
    actionLoading.value = false
  }
}

const handleApprove = async () => {
  if (!application.value || !canApprove.value) return

  const confirmed = confirm(
    `Are you sure you want to approve this application with a final rate of ${finalRate.value.toFixed(2)}%?`
  )

  if (!confirmed) return

  actionLoading.value = true
  try {
    await loansStore.approveApplication(application.value.id, {
      finalInterestRate: finalRate.value,
      notes: approvalNotes.value.trim() || undefined,
    })

    alert('Application approved successfully!')
    router.push('/approver/queue')
  } catch (error) {
    console.error('Failed to approve application:', error)
    alert('Failed to approve application. Please try again.')
  } finally {
    actionLoading.value = false
  }
}

const handleReject = async () => {
  if (!application.value || !rejectNotes.value.trim()) return

  const confirmed = confirm(
    'Are you sure you want to reject this application? This action cannot be undone.'
  )

  if (!confirmed) return

  actionLoading.value = true
  try {
    await loansStore.rejectApplication(application.value.id, {
      notes: rejectNotes.value.trim(),
    })

    alert('Application rejected.')
    router.push('/approver/queue')
  } catch (error) {
    console.error('Failed to reject application:', error)
    alert('Failed to reject application. Please try again.')
  } finally {
    actionLoading.value = false
  }
}

const handleRequestDocuments = async (payload: any) => {
  if (!application.value) return

  actionLoading.value = true
  try {
    await loansStore.requestDocuments(application.value.id, payload)
    showRequestDocsModal.value = false

    alert('Document request sent successfully!')
    await loansStore.fetchApplicationById(applicationId)
  } catch (error) {
    console.error('Failed to request documents:', error)
    alert('Failed to request documents. Please try again.')
  } finally {
    actionLoading.value = false
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusClass = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: 'pending',
    submitted: 'review',
    under_review: 'review',
    pending_documents: 'pending',
    approved: 'approved',
    rejected: 'rejected',
    disbursed: 'approved',
  }
  return statusMap[status] || 'pending'
}

const getStatusLabel = (status: string) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const getTimelineColor = (status: string) => {
  const colorMap: Record<string, string> = {
    submitted: 'blue',
    under_review: 'orange',
    pending_documents: 'purple',
    approved: 'success',
    rejected: 'error',
  }
  return colorMap[status] || 'grey'
}
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

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
}

.document-icon {
  color: #6b7280;
}

.document-info {
  flex: 1;
}

.document-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.reject-section {
  border: 2px solid #ef4444;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
}

.summary-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.summary-value {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.timeline-date {
  font-size: 12px;
  color: #6b7280;
  text-align: right;
}

.timeline-content {
  padding-left: 8px;
}

.timeline-status {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.timeline-notes {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  padding: 8px;
  background: #f9fafb;
  border-radius: 4px;
  margin-top: 8px;
}

@media (max-width: 1024px) {
  .details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
