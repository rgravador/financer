<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useLoansStore } from '~/stores/loans'
import RateDecisionBox from '~/components/approver/RateDecisionBox.vue'
import RequestDocumentsModal from '~/components/approver/RequestDocumentsModal.vue'

definePageMeta({
  layout: 'default',
  // Auth handled by auth.global.ts middleware
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

const canReject = computed(() => {
  return application.value?.status === 'under_review'
})

const canRequestDocuments = computed(() => {
  return application.value?.status === 'under_review'
})

const handleStartReview = async () => {
  if (!application.value) return

  actionLoading.value = true
  try {
    await loansStore.startReview(application.value.id)
    // Refresh application
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'submitted':
      return '#3b82f6'
    case 'under_review':
      return '#f59e0b'
    case 'pending_documents':
      return '#8b5cf6'
    case 'approved':
      return '#10b981'
    case 'rejected':
      return '#ef4444'
    default:
      return '#6b7280'
  }
}

const getStatusLabel = (status: string) => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
</script>

<template>
  <div class="approval-detail-page">
    <!-- Loading State -->
    <div v-if="loansStore.loading && !application" class="loading-state">
      <div class="spinner" />
      <p>Loading application...</p>
    </div>

    <!-- Application Details -->
    <div v-else-if="application" class="detail-container">
      <!-- Header -->
      <div class="page-header">
        <button class="back-button" @click="router.push('/approver/queue')">
          ← Back to Queue
        </button>
        <div class="header-content">
          <h1>Application Review</h1>
          <span
            class="status-badge"
            :style="{ backgroundColor: getStatusColor(application.status) }"
          >
            {{ getStatusLabel(application.status) }}
          </span>
        </div>
      </div>

      <div class="content-grid">
        <!-- Left Panel -->
        <div class="left-panel">
          <!-- Applicant Information -->
          <section class="info-section">
            <h2>Applicant Information</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Name</span>
                <span class="value">{{ application.applicantName || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Email</span>
                <span class="value">{{ application.borrowerId?.email || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Phone</span>
                <span class="value">{{ application.borrowerId?.phoneNumber || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Employment Status</span>
                <span class="value">{{ application.borrowerId?.employmentStatus || 'N/A' }}</span>
              </div>
            </div>
          </section>

          <!-- Loan Details -->
          <section class="info-section">
            <h2>Loan Details</h2>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Loan Type</span>
                <span class="value">{{ application.loanTypeName || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="label">Requested Amount</span>
                <span class="value amount">{{ formatCurrency(application.loanDetails.requestedAmount) }}</span>
              </div>
              <div class="info-item">
                <span class="label">Term</span>
                <span class="value">{{ application.loanDetails.requestedTerm }} months</span>
              </div>
              <div class="info-item">
                <span class="label">Officer Notes</span>
                <span class="value">{{ application.loanDetails.officerNotes || 'None' }}</span>
              </div>
            </div>
          </section>

          <!-- Documents -->
          <section class="info-section">
            <h2>Uploaded Documents ({{ application.documents?.length || 0 }})</h2>
            <div v-if="application.documents && application.documents.length > 0" class="documents-list">
              <div
                v-for="doc in application.documents"
                :key="doc.id"
                class="document-item"
              >
                <div class="document-icon">📄</div>
                <div class="document-info">
                  <div class="document-name">{{ doc.documentName }}</div>
                  <div class="document-date">
                    Uploaded {{ formatDate(doc.uploadedAt) }}
                  </div>
                </div>
                <a :href="doc.fileUrl" target="_blank" class="document-link">
                  View
                </a>
              </div>
            </div>
            <div v-else class="empty-documents">
              No documents uploaded yet
            </div>
          </section>

          <!-- Rate Decision (Only show when under review) -->
          <section v-if="application.status === 'under_review'" class="info-section">
            <RateDecisionBox
              v-if="application.loanTypeId"
              :default-rate="application.defaultRate || 0"
              :suggested-rate="application.suggestedRate || 0"
              :min-rate="application.loanTypeId.minInterestRate"
              :max-rate="application.loanTypeId.maxInterestRate"
              v-model="finalRate"
              @validate="(valid) => (isRateValid = valid)"
            />
          </section>

          <!-- Decision Notes -->
          <section v-if="application.status === 'under_review'" class="info-section">
            <h2>Decision Notes</h2>
            <textarea
              v-model="approvalNotes"
              rows="4"
              placeholder="Add any notes about your decision (optional)..."
              class="notes-textarea"
            />
          </section>

          <!-- Reject Form -->
          <section v-if="showRejectForm" class="info-section reject-section">
            <h2>Rejection Reason</h2>
            <textarea
              v-model="rejectNotes"
              rows="4"
              placeholder="Explain why this application is being rejected (required)..."
              class="notes-textarea"
            />
            <div class="reject-actions">
              <button class="cancel-button" @click="showRejectForm = false" :disabled="actionLoading">
                Cancel
              </button>
              <button
                class="reject-button"
                @click="handleReject"
                :disabled="!rejectNotes.trim() || actionLoading"
              >
                {{ actionLoading ? 'Rejecting...' : 'Confirm Rejection' }}
              </button>
            </div>
          </section>

          <!-- Action Buttons -->
          <section class="action-section">
            <button
              v-if="canStartReview"
              class="primary-button"
              @click="handleStartReview"
              :disabled="actionLoading"
            >
              {{ actionLoading ? 'Starting...' : 'Start Review' }}
            </button>

            <template v-if="application.status === 'under_review'">
              <button
                class="approve-button"
                @click="handleApprove"
                :disabled="!canApprove || actionLoading"
              >
                {{ actionLoading ? 'Approving...' : 'Approve Application' }}
              </button>

              <button
                v-if="!showRejectForm"
                class="reject-outline-button"
                @click="showRejectForm = true"
                :disabled="actionLoading"
              >
                Reject Application
              </button>

              <button
                class="secondary-button"
                @click="showRequestDocsModal = true"
                :disabled="actionLoading"
              >
                Request Documents
              </button>
            </template>
          </section>
        </div>

        <!-- Right Panel -->
        <div class="right-panel">
          <!-- Loan Summary -->
          <section class="summary-section">
            <h2>Loan Summary</h2>
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
          </section>

          <!-- Status Timeline -->
          <section class="timeline-section">
            <h2>Status History</h2>
            <div class="timeline">
              <div
                v-for="(entry, index) in application.statusHistory"
                :key="entry.id || index"
                class="timeline-item"
              >
                <div class="timeline-dot" :style="{ backgroundColor: getStatusColor(entry.status) }" />
                <div class="timeline-content">
                  <div class="timeline-status">{{ getStatusLabel(entry.status) }}</div>
                  <div class="timeline-date">{{ formatDate(entry.timestamp) }}</div>
                  <div v-if="entry.notes" class="timeline-notes">{{ entry.notes }}</div>
                </div>
              </div>
            </div>
          </section>
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
  </div>
</template>

<style scoped>
.approval-detail-page {
  min-height: 100vh;
  background: #f9fafb;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
}

.page-header {
  margin-bottom: 32px;
}

.back-button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 16px;
}

.back-button:hover {
  background: #f9fafb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-content h1 {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
  color: #111827;
}

.status-badge {
  padding: 6px 16px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-transform: capitalize;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

.left-panel,
.right-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.info-section,
.summary-section,
.timeline-section {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
}

.info-section h2,
.summary-section h2,
.timeline-section h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-item .label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.info-item .value {
  font-size: 15px;
  color: #111827;
  font-weight: 500;
}

.info-item .value.amount {
  font-size: 18px;
  font-weight: 700;
  color: #10b981;
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
  font-size: 24px;
}

.document-info {
  flex: 1;
}

.document-name {
  font-size: 14px;
  font-weight: 500;
  color: #111827;
}

.document-date {
  font-size: 12px;
  color: #6b7280;
  margin-top: 2px;
}

.document-link {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.document-link:hover {
  background: #2563eb;
}

.empty-documents {
  padding: 40px 20px;
  text-align: center;
  color: #9ca3af;
  font-size: 14px;
}

.notes-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  transition: border-color 0.2s;
}

.notes-textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.reject-section {
  border: 2px solid #ef4444;
}

.reject-actions {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.action-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.primary-button,
.approve-button,
.reject-outline-button,
.reject-button,
.secondary-button,
.cancel-button {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.primary-button {
  background: #3b82f6;
  color: white;
}

.primary-button:hover:not(:disabled) {
  background: #2563eb;
}

.approve-button {
  background: #10b981;
  color: white;
}

.approve-button:hover:not(:disabled) {
  background: #059669;
}

.reject-outline-button {
  background: white;
  border: 2px solid #ef4444;
  color: #ef4444;
}

.reject-outline-button:hover:not(:disabled) {
  background: #fef2f2;
}

.reject-button {
  background: #ef4444;
  color: white;
}

.reject-button:hover:not(:disabled) {
  background: #dc2626;
}

.secondary-button {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.secondary-button:hover:not(:disabled) {
  background: #f9fafb;
}

.cancel-button {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
}

.cancel-button:hover:not(:disabled) {
  background: #f9fafb;
}

.primary-button:disabled,
.approve-button:disabled,
.reject-outline-button:disabled,
.reject-button:disabled,
.secondary-button:disabled,
.cancel-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.timeline {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.timeline-item {
  display: flex;
  gap: 16px;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 7px;
  top: 24px;
  bottom: -24px;
  width: 2px;
  background: #e5e7eb;
}

.timeline-dot {
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 2px #e5e7eb;
  z-index: 1;
}

.timeline-content {
  flex: 1;
}

.timeline-status {
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin-bottom: 4px;
}

.timeline-date {
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 8px;
}

.timeline-notes {
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
}
</style>
