<template>
  <div class="application-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="56" width="4" />
      <p class="loading-text">Loading application...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <v-icon size="48" color="error">mdi-alert-circle-outline</v-icon>
      </div>
      <h3 class="error-title">Unable to load application</h3>
      <p class="error-message">{{ error }}</p>
      <v-btn color="primary" variant="outlined" @click="loadApplication">
        <v-icon start>mdi-refresh</v-icon>
        Try Again
      </v-btn>
    </div>

    <!-- Application Content -->
    <template v-else-if="application">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-back">
          <v-btn
            variant="text"
            icon="mdi-arrow-left"
            @click="navigateTo('/officer/applications')"
          />
        </div>
        <div class="header-content">
          <div class="header-title-row">
            <div class="title-group">
              <h1 class="page-title">Application {{ formatApplicationId(application.id) }}</h1>
              <v-chip
                :color="getStatusColor(application.status)"
                size="small"
                variant="tonal"
                class="status-chip"
              >
                <v-icon start size="14">{{ getStatusIcon(application.status) }}</v-icon>
                {{ formatStatus(application.status) }}
              </v-chip>
            </div>
            <div class="header-actions">
              <v-btn
                v-if="application.status === 'draft'"
                variant="outlined"
                prepend-icon="mdi-pencil"
                @click="editMode = !editMode"
              >
                {{ editMode ? 'Cancel Edit' : 'Edit' }}
              </v-btn>
              <v-btn
                v-if="application.status === 'draft'"
                color="primary"
                prepend-icon="mdi-send"
                :loading="submitting"
                @click="submitForReview"
              >
                Submit for Review
              </v-btn>
            </div>
          </div>
          <p class="page-subtitle">
            Created on {{ formatDate(application.createdAt) }}
            <span v-if="application.updatedAt !== application.createdAt">
              | Last updated {{ formatDate(application.updatedAt) }}
            </span>
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <v-tabs v-model="activeTab" color="primary" class="detail-tabs">
        <v-tab value="overview">Overview</v-tab>
        <v-tab value="documents">
          Documents
          <v-badge
            v-if="pendingDocumentsCount > 0"
            :content="pendingDocumentsCount"
            color="warning"
            inline
          />
        </v-tab>
        <v-tab value="history">Status History</v-tab>
      </v-tabs>

      <v-tabs-window v-model="activeTab" class="tabs-content">
        <!-- Overview Tab -->
        <v-tabs-window-item value="overview">
          <div class="overview-grid">
            <!-- Loan Summary Card -->
            <div class="detail-card loan-summary-card">
              <div class="card-header">
                <h2 class="card-title">Loan Summary</h2>
                <div class="loan-type-badge">
                  <v-icon size="18" :color="getLoanTypeColor(application.loanType?.name)">
                    {{ getLoanTypeIcon(application.loanType?.name || '') }}
                  </v-icon>
                  <span>{{ application.loanType?.name || 'Unknown Type' }}</span>
                </div>
              </div>
              <div class="card-content">
                <div class="summary-grid">
                  <div class="summary-item highlight">
                    <span class="summary-label">Requested Amount</span>
                    <span class="summary-value">{{ formatCurrency(application.loanDetails?.requestedAmount) }}</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Loan Term</span>
                    <span class="summary-value">{{ application.loanDetails?.requestedTerm || 0 }} months</span>
                  </div>
                  <div class="summary-item">
                    <span class="summary-label">Suggested Rate</span>
                    <span class="summary-value">{{ application.loanDetails?.suggestedInterestRate || 0 }}%</span>
                  </div>
                  <div v-if="application.finalInterestRate" class="summary-item">
                    <span class="summary-label">Final Rate</span>
                    <span class="summary-value highlight-value">{{ application.finalInterestRate }}%</span>
                  </div>
                </div>
                <div v-if="application.loanDetails?.officerNotes" class="officer-notes">
                  <h4>Officer Notes</h4>
                  <p>{{ application.loanDetails.officerNotes }}</p>
                </div>
              </div>
            </div>

            <!-- Borrower Card -->
            <div class="detail-card borrower-card">
              <div class="card-header">
                <h2 class="card-title">Borrower Information</h2>
              </div>
              <div class="card-content">
                <div class="borrower-profile">
                  <v-avatar size="64" color="primary" variant="tonal">
                    <span class="avatar-initials-large">
                      {{ application.borrower?.firstName?.[0] }}{{ application.borrower?.lastName?.[0] }}
                    </span>
                  </v-avatar>
                  <div class="borrower-info">
                    <h3>{{ application.borrower?.firstName }} {{ application.borrower?.lastName }}</h3>
                    <span class="borrower-email">{{ application.borrower?.email }}</span>
                  </div>
                </div>
                <div class="borrower-details-grid">
                  <div class="detail-item">
                    <v-icon size="18" color="grey">mdi-phone</v-icon>
                    <span>{{ application.borrower?.contactNumber }}</span>
                  </div>
                  <div class="detail-item">
                    <v-icon size="18" color="grey">mdi-map-marker</v-icon>
                    <span>{{ application.borrower?.address }}</span>
                  </div>
                  <div class="detail-item">
                    <v-icon size="18" color="grey">mdi-briefcase</v-icon>
                    <span>{{ formatEmployment(application.borrower?.employmentType) }}</span>
                  </div>
                  <div class="detail-item">
                    <v-icon size="18" color="grey">mdi-cash</v-icon>
                    <span>{{ formatCurrency(application.borrower?.monthlyIncome) }} / month</span>
                  </div>
                </div>

                <!-- Co-Borrower -->
                <div v-if="application.coBorrower" class="co-borrower-section">
                  <h4>Co-Borrower</h4>
                  <div class="co-borrower-info">
                    <v-avatar size="40" color="secondary" variant="tonal">
                      <span class="avatar-text-small">
                        {{ application.coBorrower.firstName?.[0] }}{{ application.coBorrower.lastName?.[0] }}
                      </span>
                    </v-avatar>
                    <div>
                      <span class="name">{{ application.coBorrower.firstName }} {{ application.coBorrower.lastName }}</span>
                      <span class="email">{{ application.coBorrower.email }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Follow-up Documents Card (if any) -->
            <div v-if="application.followUpDocuments?.length > 0" class="detail-card followup-card">
              <div class="card-header">
                <h2 class="card-title">
                  <v-icon start color="warning">mdi-alert-circle</v-icon>
                  Requested Documents
                </h2>
              </div>
              <div class="card-content">
                <div class="followup-list">
                  <div
                    v-for="(doc, index) in application.followUpDocuments"
                    :key="index"
                    class="followup-item"
                  >
                    <div class="followup-info">
                      <span class="followup-name">{{ doc.documentName }}</span>
                      <span v-if="doc.notes" class="followup-notes">{{ doc.notes }}</span>
                      <span v-if="doc.dueDate" class="followup-due">
                        Due: {{ formatDate(doc.dueDate) }}
                      </span>
                    </div>
                    <v-btn
                      variant="tonal"
                      size="small"
                      color="primary"
                      @click="openUploadDialog(doc.documentName)"
                    >
                      <v-icon start size="16">mdi-upload</v-icon>
                      Upload
                    </v-btn>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-tabs-window-item>

        <!-- Documents Tab -->
        <v-tabs-window-item value="documents">
          <div class="documents-section">
            <div class="documents-header">
              <h2>Application Documents</h2>
              <v-btn
                v-if="canUploadDocuments"
                color="primary"
                prepend-icon="mdi-upload"
                @click="showUploadDialog = true"
              >
                Upload Document
              </v-btn>
            </div>

            <!-- Documents Grid -->
            <div v-if="application.documents?.length > 0" class="documents-grid">
              <div
                v-for="(doc, index) in application.documents"
                :key="index"
                class="document-card"
              >
                <div class="document-preview">
                  <v-icon v-if="isImageDocument(doc.fileUrl)" size="48" color="primary">
                    mdi-file-image
                  </v-icon>
                  <v-icon v-else-if="isPdfDocument(doc.fileUrl)" size="48" color="error">
                    mdi-file-pdf-box
                  </v-icon>
                  <v-icon v-else size="48" color="grey">
                    mdi-file-document
                  </v-icon>
                </div>
                <div class="document-info">
                  <span class="document-name">{{ doc.documentName }}</span>
                  <span class="document-date">{{ formatDate(doc.uploadedAt) }}</span>
                </div>
                <div class="document-status">
                  <v-chip :color="getDocStatusColor(doc.status)" size="x-small" variant="tonal">
                    {{ doc.status }}
                  </v-chip>
                </div>
                <div class="document-actions">
                  <v-btn
                    variant="text"
                    size="small"
                    icon="mdi-eye"
                    @click="viewDocument(doc)"
                  />
                  <v-btn
                    v-if="canUploadDocuments"
                    variant="text"
                    size="small"
                    icon="mdi-delete"
                    color="error"
                    @click="deleteDocument(doc)"
                  />
                </div>
              </div>
            </div>

            <div v-else class="no-documents">
              <v-icon size="64" color="grey-lighten-1">mdi-file-document-outline</v-icon>
              <p>No documents uploaded yet</p>
              <v-btn
                v-if="canUploadDocuments"
                color="primary"
                variant="outlined"
                @click="showUploadDialog = true"
              >
                <v-icon start>mdi-upload</v-icon>
                Upload First Document
              </v-btn>
            </div>
          </div>
        </v-tabs-window-item>

        <!-- History Tab -->
        <v-tabs-window-item value="history">
          <div class="history-section">
            <h2>Status History</h2>

            <div v-if="application.statusHistory?.length > 0" class="timeline">
              <div
                v-for="(entry, index) in sortedStatusHistory"
                :key="index"
                class="timeline-item"
                :class="{ 'timeline-item--current': index === 0 }"
              >
                <div class="timeline-marker">
                  <div class="marker-dot" :style="{ backgroundColor: getStatusColorHex(entry.status) }" />
                  <div v-if="index < sortedStatusHistory.length - 1" class="marker-line" />
                </div>
                <div class="timeline-content">
                  <div class="timeline-header">
                    <v-chip
                      :color="getStatusColor(entry.status)"
                      size="small"
                      variant="tonal"
                    >
                      {{ formatStatus(entry.status) }}
                    </v-chip>
                    <span class="timeline-date">{{ formatDateTime(entry.timestamp) }}</span>
                  </div>
                  <p v-if="entry.notes" class="timeline-notes">{{ entry.notes }}</p>
                  <span class="timeline-user">by {{ entry.changedBy }}</span>
                </div>
              </div>
            </div>

            <div v-else class="no-history">
              <v-icon size="48" color="grey-lighten-1">mdi-history</v-icon>
              <p>No status history available</p>
            </div>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </template>

    <!-- Upload Dialog -->
    <v-dialog v-model="showUploadDialog" max-width="500" persistent>
      <v-card class="upload-dialog">
        <v-card-title class="dialog-title">
          <v-icon start color="primary">mdi-upload</v-icon>
          Upload Document
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="uploadDocName"
            label="Document Name"
            variant="outlined"
            density="comfortable"
            :rules="[rules.required]"
            class="mb-4"
          />
          <v-file-input
            v-model="selectedFile"
            label="Select file"
            prepend-icon="mdi-paperclip"
            variant="outlined"
            density="comfortable"
            accept="image/*,.pdf,.doc,.docx"
            :rules="[rules.required]"
            show-size
          />
          <v-progress-linear
            v-if="uploading"
            :model-value="uploadProgress"
            color="primary"
            height="8"
            rounded
            class="mt-4"
          />
        </v-card-text>
        <v-card-actions class="dialog-actions">
          <v-spacer />
          <v-btn variant="text" @click="closeUploadDialog">Cancel</v-btn>
          <v-btn
            color="primary"
            :loading="uploading"
            :disabled="!selectedFile || !uploadDocName"
            @click="uploadDocument"
          >
            Upload
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useLoansStore } from '~/stores/loans'
import type { LoanApplication, UploadedDocument } from '~/types'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['tenant_officer'],
})

const route = useRoute()
const loansStore = useLoansStore()

// State
const loading = ref(true)
const error = ref<string | null>(null)
const activeTab = ref('overview')
const editMode = ref(false)
const submitting = ref(false)

// Upload state
const showUploadDialog = ref(false)
const uploadDocName = ref('')
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Validation rules
const rules = {
  required: (v: any) => !!v || 'This field is required',
}

// Computed
const application = computed(() => loansStore.currentApplication)

const canUploadDocuments = computed(() => {
  return ['draft', 'pending_documents'].includes(application.value?.status || '')
})

const pendingDocumentsCount = computed(() => {
  return application.value?.followUpDocuments?.length || 0
})

const sortedStatusHistory = computed(() => {
  if (!application.value?.statusHistory) return []
  return [...application.value.statusHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
})

// Methods
const loadApplication = async () => {
  loading.value = true
  error.value = null
  try {
    await loansStore.fetchApplicationById(route.params.id as string)

    // Handle edit query param
    if (route.query.edit === 'true') {
      editMode.value = true
    }

    // Handle tab query param
    if (route.query.tab) {
      activeTab.value = route.query.tab as string
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to load application'
  } finally {
    loading.value = false
  }
}

const formatApplicationId = (id: string) => {
  return `#${id.slice(-8).toUpperCase()}`
}

const formatCurrency = (amount: number | undefined) => {
  if (!amount && amount !== 0) return '---'
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return '---'
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatDateTime = (date: Date | string | undefined) => {
  if (!date) return '---'
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const formatStatus = (status: string) => {
  const statusMap: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    under_review: 'Under Review',
    pending_documents: 'Pending Documents',
    approved: 'Approved',
    rejected: 'Rejected',
    disbursed: 'Disbursed',
  }
  return statusMap[status] || status
}

const getStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    draft: 'grey',
    submitted: 'primary',
    under_review: 'info',
    pending_documents: 'warning',
    approved: 'success',
    rejected: 'error',
    disbursed: 'success',
  }
  return colorMap[status] || 'grey'
}

const getStatusColorHex = (status: string) => {
  const colorMap: Record<string, string> = {
    draft: '#9e9e9e',
    submitted: '#1e3a8a',
    under_review: '#0288d1',
    pending_documents: '#f59e0b',
    approved: '#10b981',
    rejected: '#ef4444',
    disbursed: '#10b981',
  }
  return colorMap[status] || '#9e9e9e'
}

const getStatusIcon = (status: string) => {
  const iconMap: Record<string, string> = {
    draft: 'mdi-file-document-outline',
    submitted: 'mdi-send',
    under_review: 'mdi-eye',
    pending_documents: 'mdi-file-alert-outline',
    approved: 'mdi-check-circle',
    rejected: 'mdi-close-circle',
    disbursed: 'mdi-cash-check',
  }
  return iconMap[status] || 'mdi-help-circle'
}

const formatEmployment = (type: string | undefined) => {
  if (!type) return '---'
  const map: Record<string, string> = {
    employed: 'Employed',
    self_employed: 'Self-Employed',
    business_owner: 'Business Owner',
    ofw: 'OFW',
    other: 'Other',
  }
  return map[type] || type
}

const getLoanTypeIcon = (name: string) => {
  const nameLower = name.toLowerCase()
  if (nameLower.includes('personal')) return 'mdi-account-cash'
  if (nameLower.includes('business')) return 'mdi-briefcase-outline'
  if (nameLower.includes('auto') || nameLower.includes('car')) return 'mdi-car-outline'
  if (nameLower.includes('mortgage') || nameLower.includes('home')) return 'mdi-home-outline'
  return 'mdi-file-document-outline'
}

const getLoanTypeColor = (name: string | undefined) => {
  if (!name) return 'grey'
  const nameLower = name.toLowerCase()
  if (nameLower.includes('personal')) return 'blue'
  if (nameLower.includes('business')) return 'green'
  if (nameLower.includes('auto') || nameLower.includes('car')) return 'orange'
  if (nameLower.includes('mortgage') || nameLower.includes('home')) return 'purple'
  return 'grey'
}

const getDocStatusColor = (status: string) => {
  const colorMap: Record<string, string> = {
    uploaded: 'success',
    pending: 'warning',
    waived: 'grey',
  }
  return colorMap[status] || 'grey'
}

const isImageDocument = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.startsWith('data:image')
}

const isPdfDocument = (url: string) => {
  return /\.pdf$/i.test(url) || url.includes('application/pdf')
}

const submitForReview = async () => {
  if (!application.value) return

  submitting.value = true
  try {
    await loansStore.submitApplication(application.value.id)
    showSnackbar('Application submitted for review', 'success')
    await loadApplication()
  } catch (err: any) {
    showSnackbar(err.data?.statusMessage || 'Failed to submit application', 'error')
  } finally {
    submitting.value = false
  }
}

const openUploadDialog = (docName: string = '') => {
  uploadDocName.value = docName
  selectedFile.value = null
  showUploadDialog.value = true
}

const closeUploadDialog = () => {
  showUploadDialog.value = false
  uploadDocName.value = ''
  selectedFile.value = null
  uploadProgress.value = 0
}

const uploadDocument = async () => {
  if (!selectedFile.value || !uploadDocName.value || !application.value) return

  uploading.value = true
  uploadProgress.value = 0

  try {
    // Convert file to base64
    const reader = new FileReader()
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(selectedFile.value!)
    })

    const base64 = await base64Promise
    uploadProgress.value = 50

    // Upload to API
    await loansStore.uploadDocument(application.value.id, {
      documentName: uploadDocName.value,
      fileBase64: base64,
    })

    uploadProgress.value = 100

    showSnackbar('Document uploaded successfully', 'success')
    closeUploadDialog()
    await loadApplication()
  } catch (err: any) {
    showSnackbar(err.data?.statusMessage || 'Failed to upload document', 'error')
  } finally {
    uploading.value = false
    uploadProgress.value = 0
  }
}

const viewDocument = (doc: UploadedDocument) => {
  if (doc.fileUrl) {
    window.open(doc.fileUrl, '_blank')
  }
}

const deleteDocument = async (doc: UploadedDocument) => {
  if (!application.value || !doc.id) return

  try {
    await loansStore.deleteDocument(application.value.id, doc.id)
    showSnackbar('Document deleted', 'success')
    await loadApplication()
  } catch (err: any) {
    showSnackbar(err.data?.statusMessage || 'Failed to delete document', 'error')
  }
}

const showSnackbar = (message: string, color: string) => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  loadApplication()
})

onUnmounted(() => {
  loansStore.clearCurrentApplication()
})
</script>

<style scoped>
.application-detail-page {
  max-width: 1100px;
  margin: 0 auto;
}

/* Loading/Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 24px;
  text-align: center;
}

.loading-text {
  margin-top: 24px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  font-size: 16px;
}

.error-icon {
  width: 88px;
  height: 88px;
  background: rgba(var(--v-theme-error), 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  margin: 24px 0 12px;
}

.error-message {
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 28px;
}

/* Page Header */
.page-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 24px;
}

.header-back {
  margin-top: 4px;
}

.header-content {
  flex: 1;
}

.header-title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 8px;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  letter-spacing: -0.02em;
}

.status-chip {
  font-size: 12px;
  font-weight: 600;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.page-subtitle {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
}

/* Tabs */
.detail-tabs {
  margin-bottom: 24px;
}

.tabs-content {
  min-height: 400px;
}

/* Overview Grid */
.overview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

/* Detail Cards */
.detail-card {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.card-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-content {
  padding: 24px;
}

/* Loan Summary */
.loan-type-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
}

.summary-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-item.highlight {
  grid-column: 1 / -1;
}

.summary-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.summary-value {
  font-size: 20px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
}

.summary-item.highlight .summary-value {
  font-size: 32px;
  color: rgb(var(--v-theme-primary));
}

.highlight-value {
  color: rgb(var(--v-theme-success)) !important;
}

.officer-notes {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.officer-notes h4 {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 0 0 8px 0;
}

.officer-notes p {
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
  margin: 0;
  line-height: 1.6;
}

/* Borrower Card */
.borrower-profile {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.avatar-initials-large {
  font-size: 20px;
  font-weight: 600;
  color: rgb(var(--v-theme-primary));
}

.avatar-text-small {
  font-size: 12px;
  font-weight: 600;
}

.borrower-info h3 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.borrower-info .borrower-email {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.borrower-details-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
}

.co-borrower-section {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}

.co-borrower-section h4 {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin: 0 0 12px 0;
}

.co-borrower-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.co-borrower-info .name {
  display: block;
  font-weight: 600;
  font-size: 14px;
}

.co-borrower-info .email {
  display: block;
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

/* Follow-up Card */
.followup-card {
  grid-column: 1 / -1;
}

.followup-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.followup-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: rgba(var(--v-theme-warning), 0.06);
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-warning), 0.2);
}

.followup-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.followup-name {
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
}

.followup-notes {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.followup-due {
  font-size: 12px;
  color: rgb(var(--v-theme-warning));
}

/* Documents Section */
.documents-section {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  padding: 24px;
}

.documents-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.documents-header h2 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
}

.documents-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}

.document-card {
  background: rgba(var(--v-theme-on-surface), 0.02);
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  border-radius: 14px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.document-preview {
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-on-surface), 0.04);
  border-radius: 10px;
}

.document-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.document-name {
  font-weight: 600;
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
}

.document-date {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.document-status {
  margin-top: auto;
}

.document-actions {
  display: flex;
  gap: 4px;
  margin-top: 8px;
}

.no-documents {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.no-documents p {
  margin: 16px 0;
}

/* History Section */
.history-section {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  padding: 24px;
}

.history-section h2 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 24px 0;
}

.timeline {
  display: flex;
  flex-direction: column;
}

.timeline-item {
  display: flex;
  gap: 16px;
  position: relative;
}

.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 20px;
  flex-shrink: 0;
}

.marker-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  z-index: 1;
}

.marker-line {
  width: 2px;
  flex: 1;
  background: rgba(var(--v-theme-on-surface), 0.12);
  margin-top: 4px;
}

.timeline-content {
  flex: 1;
  padding-bottom: 24px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.timeline-date {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.timeline-notes {
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.timeline-user {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.no-history {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.no-history p {
  margin-top: 16px;
}

/* Dialog */
.upload-dialog {
  border-radius: 16px;
}

.dialog-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  padding: 20px 24px 16px;
}

.dialog-actions {
  padding: 12px 20px 16px;
}

/* Responsive */
@media (max-width: 960px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .header-title-row {
    flex-direction: column;
  }

  .title-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .borrower-details-grid {
    grid-template-columns: 1fr;
  }
}
</style>
