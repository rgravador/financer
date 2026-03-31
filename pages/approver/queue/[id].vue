<template>
  <div class="approver-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p>Loading application...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <v-icon size="64" color="error">mdi-alert-circle</v-icon>
      <h3>Application Not Found</h3>
      <p>{{ error }}</p>
      <v-btn color="primary" @click="router.push('/approver/queue')">
        Back to Queue
      </v-btn>
    </div>

    <!-- Main Content -->
    <template v-else-if="application">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <v-btn
            variant="text"
            icon="mdi-arrow-left"
            size="small"
            @click="router.push('/approver/queue')"
          />
          <div>
            <h1 class="page-title">
              Application #{{ application.id.slice(-8).toUpperCase() }}
            </h1>
            <div class="header-meta">
              <v-chip
                :color="getStatusColor(application.status)"
                size="small"
                variant="tonal"
              >
                {{ formatStatus(application.status) }}
              </v-chip>
              <span class="meta-date">Submitted {{ formatDate(application.createdAt) }}</span>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="header-actions">
          <v-btn
            v-if="application.status === 'submitted'"
            color="info"
            variant="tonal"
            prepend-icon="mdi-eye"
            @click="startReview"
            :loading="actionLoading"
          >
            Start Review
          </v-btn>
          <template v-if="canTakeAction">
            <v-btn
              color="warning"
              variant="tonal"
              prepend-icon="mdi-file-document-plus"
              @click="showRequestDocsModal = true"
            >
              Request Docs
            </v-btn>
            <v-btn
              color="error"
              variant="tonal"
              prepend-icon="mdi-close-circle"
              @click="showRejectDialog = true"
            >
              Reject
            </v-btn>
            <v-btn
              color="success"
              prepend-icon="mdi-check-circle"
              @click="showApproveDialog = true"
            >
              Approve
            </v-btn>
          </template>
        </div>
      </div>

      <!-- Two-Column Layout -->
      <v-row>
        <!-- Left Column - Main Content -->
        <v-col cols="12" lg="8">
          <!-- Applicant Information -->
          <v-card class="section-card">
            <v-card-title class="section-title">
              <v-icon start>mdi-account</v-icon>
              Applicant Information
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6">
                  <div class="info-group">
                    <label>Full Name</label>
                    <span>{{ getApplicantName() }}</span>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="info-group">
                    <label>Email</label>
                    <span>{{ getBorrowerField('email') }}</span>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="info-group">
                    <label>Contact Number</label>
                    <span>{{ getBorrowerField('contactNumber') }}</span>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="info-group">
                    <label>Employment Type</label>
                    <span>{{ formatEmploymentType(getBorrowerField('employmentType')) }}</span>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="info-group">
                    <label>Employer</label>
                    <span>{{ getBorrowerField('employer') || 'N/A' }}</span>
                  </div>
                </v-col>
                <v-col cols="12" sm="6">
                  <div class="info-group">
                    <label>Monthly Income</label>
                    <span class="income-value">{{ formatCurrency(getBorrowerField('monthlyIncome')) }}</span>
                  </div>
                </v-col>
                <v-col cols="12">
                  <div class="info-group">
                    <label>Address</label>
                    <span>{{ getBorrowerField('address') }}</span>
                  </div>
                </v-col>
              </v-row>
            </v-card-text>
          </v-card>

          <!-- Loan Details -->
          <v-card class="section-card">
            <v-card-title class="section-title">
              <v-icon start>mdi-cash</v-icon>
              Loan Details
            </v-card-title>
            <v-card-text>
              <v-row>
                <v-col cols="12" sm="6" md="3">
                  <div class="loan-metric">
                    <span class="metric-label">Loan Type</span>
                    <span class="metric-value">{{ getLoanTypeName() }}</span>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="loan-metric">
                    <span class="metric-label">Requested Amount</span>
                    <span class="metric-value primary">
                      {{ formatCurrency(application.loanDetails.requestedAmount) }}
                    </span>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="loan-metric">
                    <span class="metric-label">Term</span>
                    <span class="metric-value">{{ application.loanDetails.requestedTerm }} months</span>
                  </div>
                </v-col>
                <v-col cols="12" sm="6" md="3">
                  <div class="loan-metric">
                    <span class="metric-label">Monthly Payment (Est.)</span>
                    <span class="metric-value">{{ formatCurrency(estimatedMonthlyPayment) }}</span>
                  </div>
                </v-col>
              </v-row>

              <!-- Officer Notes -->
              <div v-if="application.loanDetails.officerNotes" class="officer-notes">
                <label>Officer Notes</label>
                <p>{{ application.loanDetails.officerNotes }}</p>
              </div>
            </v-card-text>
          </v-card>

          <!-- Rate Decision Box -->
          <v-card class="section-card rate-decision-card">
            <v-card-title class="section-title">
              <v-icon start>mdi-percent</v-icon>
              Interest Rate Decision
            </v-card-title>
            <v-card-text>
              <div class="rate-comparison">
                <div class="rate-box">
                  <span class="rate-box-label">Default Rate</span>
                  <span class="rate-box-value default">{{ getDefaultRate() }}%</span>
                  <span class="rate-box-hint">Loan type standard</span>
                </div>
                <div class="rate-box">
                  <span class="rate-box-label">Suggested Rate</span>
                  <span
                    class="rate-box-value"
                    :class="getRateClass()"
                  >
                    {{ application.loanDetails.suggestedInterestRate }}%
                  </span>
                  <span class="rate-box-hint">Officer suggestion</span>
                </div>
                <div class="rate-box highlight">
                  <span class="rate-box-label">Final Rate</span>
                  <span
                    v-if="application.finalInterestRate !== undefined"
                    class="rate-box-value approved"
                  >
                    {{ application.finalInterestRate }}%
                  </span>
                  <span v-else class="rate-box-value pending">Pending</span>
                  <span class="rate-box-hint">Your decision</span>
                </div>
              </div>

              <div class="rate-range">
                <v-icon size="16" color="grey">mdi-information</v-icon>
                <span>
                  Allowable range: <strong>{{ getMinRate() }}%</strong> to <strong>{{ getMaxRate() }}%</strong>
                </span>
              </div>

              <!-- Rate Variance Alert -->
              <v-alert
                v-if="getRateVariance() !== 0"
                :type="getRateVariance() < 0 ? 'success' : 'warning'"
                variant="tonal"
                density="compact"
                class="rate-alert"
              >
                <template v-if="getRateVariance() < 0">
                  Officer suggests {{ Math.abs(getRateVariance()).toFixed(1) }}% below default rate
                  (potential savings for applicant)
                </template>
                <template v-else>
                  Officer suggests {{ getRateVariance().toFixed(1) }}% above default rate
                </template>
              </v-alert>
            </v-card-text>
          </v-card>

          <!-- Documents -->
          <v-card class="section-card">
            <v-card-title class="section-title">
              <v-icon start>mdi-file-document-multiple</v-icon>
              Documents
              <v-chip size="small" class="ml-2" color="primary" variant="tonal">
                {{ application.documents.length }}
              </v-chip>
            </v-card-title>
            <v-card-text>
              <div v-if="application.documents.length === 0" class="empty-docs">
                <v-icon size="48" color="grey-lighten-1">mdi-file-hidden</v-icon>
                <p>No documents uploaded yet</p>
              </div>
              <div v-else class="documents-list">
                <div
                  v-for="doc in application.documents"
                  :key="doc.id"
                  class="document-item"
                >
                  <div class="doc-icon">
                    <v-icon :color="getDocIconColor(doc)">{{ getDocIcon(doc) }}</v-icon>
                  </div>
                  <div class="doc-info">
                    <span class="doc-name">{{ doc.documentName }}</span>
                    <span class="doc-date">Uploaded {{ formatDate(doc.uploadedAt) }}</span>
                  </div>
                  <v-chip
                    size="x-small"
                    :color="getDocStatusColor(doc.status)"
                    variant="tonal"
                  >
                    {{ doc.status }}
                  </v-chip>
                  <v-btn
                    icon="mdi-open-in-new"
                    size="small"
                    variant="text"
                    :href="doc.fileUrl"
                    target="_blank"
                  />
                </div>
              </div>

              <!-- Follow-up Documents -->
              <div v-if="application.followUpDocuments.length > 0" class="followup-section">
                <h4 class="followup-title">
                  <v-icon size="18" color="warning">mdi-alert-circle</v-icon>
                  Requested Documents
                </h4>
                <div
                  v-for="followUp in application.followUpDocuments"
                  :key="followUp.id"
                  class="followup-item"
                >
                  <span class="followup-name">{{ followUp.documentName }}</span>
                  <span class="followup-notes">{{ followUp.notes }}</span>
                  <span v-if="followUp.dueDate" class="followup-due">
                    Due: {{ formatDate(followUp.dueDate) }}
                  </span>
                </div>
              </div>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Right Column - Summary & History -->
        <v-col cols="12" lg="4">
          <!-- Loan Summary -->
          <v-card class="section-card summary-card">
            <v-card-title class="section-title">
              <v-icon start>mdi-calculator</v-icon>
              Loan Summary
            </v-card-title>
            <v-card-text>
              <div class="summary-row">
                <span>Principal Amount</span>
                <strong>{{ formatCurrency(application.loanDetails.requestedAmount) }}</strong>
              </div>
              <div class="summary-row">
                <span>Interest Rate</span>
                <strong>
                  {{ application.finalInterestRate ?? application.loanDetails.suggestedInterestRate }}%
                </strong>
              </div>
              <div class="summary-row">
                <span>Term</span>
                <strong>{{ application.loanDetails.requestedTerm }} months</strong>
              </div>
              <v-divider class="my-4" />
              <div class="summary-row highlight">
                <span>Est. Monthly Payment</span>
                <strong class="primary-text">{{ formatCurrency(estimatedMonthlyPayment) }}</strong>
              </div>
              <div class="summary-row">
                <span>Total Interest</span>
                <strong>{{ formatCurrency(totalInterest) }}</strong>
              </div>
              <div class="summary-row">
                <span>Total Amount</span>
                <strong>{{ formatCurrency(totalAmount) }}</strong>
              </div>
            </v-card-text>
          </v-card>

          <!-- Assigned Officer -->
          <v-card class="section-card">
            <v-card-title class="section-title">
              <v-icon start>mdi-account-tie</v-icon>
              Assigned Officer
            </v-card-title>
            <v-card-text>
              <div class="officer-info">
                <v-avatar color="primary" size="48">
                  <span class="text-h6">{{ getOfficerInitials() }}</span>
                </v-avatar>
                <div class="officer-details">
                  <span class="officer-name">{{ getOfficerName() }}</span>
                  <span class="officer-email">{{ getOfficerEmail() }}</span>
                </div>
              </div>
            </v-card-text>
          </v-card>

          <!-- Status History -->
          <v-card class="section-card">
            <v-card-title class="section-title">
              <v-icon start>mdi-history</v-icon>
              Status History
            </v-card-title>
            <v-card-text>
              <StatusTimeline
                :items="application.statusHistory"
                :show-chips="true"
                :show-user="false"
                sort-order="desc"
              />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Approve Dialog -->
    <v-dialog v-model="showApproveDialog" max-width="500">
      <v-card>
        <v-card-title class="dialog-title success-title">
          <v-icon start color="success">mdi-check-circle</v-icon>
          Approve Application
        </v-card-title>
        <v-card-text>
          <p class="dialog-description">
            You are about to approve this loan application. Please confirm the final interest rate.
          </p>

          <v-text-field
            v-model.number="approvalForm.finalInterestRate"
            label="Final Interest Rate (%)"
            type="number"
            step="0.1"
            :min="getMinRate()"
            :max="getMaxRate()"
            :rules="[
              v => !!v || 'Rate is required',
              v => v >= getMinRate() || `Rate must be at least ${getMinRate()}%`,
              v => v <= getMaxRate() || `Rate must not exceed ${getMaxRate()}%`,
            ]"
            variant="outlined"
            class="mt-4"
          />

          <v-textarea
            v-model="approvalForm.notes"
            label="Approval Notes (Optional)"
            variant="outlined"
            rows="3"
            class="mt-2"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showApproveDialog = false">Cancel</v-btn>
          <v-btn
            color="success"
            variant="flat"
            :loading="actionLoading"
            @click="approveApplication"
          >
            Approve
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reject Dialog -->
    <v-dialog v-model="showRejectDialog" max-width="500">
      <v-card>
        <v-card-title class="dialog-title error-title">
          <v-icon start color="error">mdi-close-circle</v-icon>
          Reject Application
        </v-card-title>
        <v-card-text>
          <p class="dialog-description">
            You are about to reject this loan application. Please provide a reason.
          </p>

          <v-textarea
            v-model="rejectionForm.notes"
            label="Rejection Reason"
            variant="outlined"
            rows="4"
            :rules="[v => !!v || 'Rejection reason is required']"
            class="mt-4"
            placeholder="Please explain why this application is being rejected..."
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showRejectDialog = false">Cancel</v-btn>
          <v-btn
            color="error"
            variant="flat"
            :loading="actionLoading"
            :disabled="!rejectionForm.notes"
            @click="rejectApplication"
          >
            Reject
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Request Documents Modal -->
    <v-dialog v-model="showRequestDocsModal" max-width="600">
      <v-card>
        <v-card-title class="dialog-title">
          <v-icon start color="warning">mdi-file-document-plus</v-icon>
          Request Additional Documents
        </v-card-title>
        <v-card-text>
          <p class="dialog-description">
            Specify which additional documents are required from the applicant.
          </p>

          <!-- Document Requests -->
          <div class="doc-requests">
            <div
              v-for="(doc, index) in requestDocsForm.documents"
              :key="index"
              class="doc-request-item"
            >
              <v-text-field
                v-model="doc.documentName"
                label="Document Name"
                variant="outlined"
                density="compact"
                :rules="[v => !!v || 'Document name required']"
              />
              <v-text-field
                v-model="doc.notes"
                label="Notes / Instructions"
                variant="outlined"
                density="compact"
              />
              <v-btn
                icon="mdi-close"
                size="small"
                variant="text"
                color="error"
                :disabled="requestDocsForm.documents.length === 1"
                @click="removeDocRequest(index)"
              />
            </div>
          </div>

          <v-btn
            variant="tonal"
            color="primary"
            size="small"
            prepend-icon="mdi-plus"
            @click="addDocRequest"
          >
            Add Document
          </v-btn>

          <v-textarea
            v-model="requestDocsForm.generalNotes"
            label="General Notes (Optional)"
            variant="outlined"
            rows="2"
            class="mt-4"
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="showRequestDocsModal = false">Cancel</v-btn>
          <v-btn
            color="warning"
            variant="flat"
            :loading="actionLoading"
            :disabled="!hasValidDocRequest"
            @click="requestDocuments"
          >
            Send Request
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="3000">
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useLoansStore } from '~/stores/loans'
import StatusTimeline from '~/components/loans/StatusTimeline.vue'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['tenant_approver', 'tenant_admin'],
})

const route = useRoute()
const router = useRouter()
const loansStore = useLoansStore()

// State
const loading = ref(true)
const error = ref('')
const actionLoading = ref(false)

// Dialogs
const showApproveDialog = ref(false)
const showRejectDialog = ref(false)
const showRequestDocsModal = ref(false)

// Forms
const approvalForm = ref({
  finalInterestRate: 0,
  notes: '',
})

const rejectionForm = ref({
  notes: '',
})

const requestDocsForm = ref({
  documents: [{ documentName: '', notes: '' }],
  generalNotes: '',
})

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Computed
const application = computed(() => loansStore.currentApplication)

const canTakeAction = computed(() => {
  if (!application.value) return false
  return ['under_review', 'pending_documents'].includes(application.value.status)
})

const hasValidDocRequest = computed(() => {
  return requestDocsForm.value.documents.some(d => d.documentName.trim() !== '')
})

const estimatedMonthlyPayment = computed(() => {
  if (!application.value) return 0
  const principal = application.value.loanDetails.requestedAmount
  const rate = (application.value.finalInterestRate ?? application.value.loanDetails.suggestedInterestRate) / 100 / 12
  const term = application.value.loanDetails.requestedTerm
  if (rate === 0) return principal / term
  return (principal * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1)
})

const totalInterest = computed(() => {
  if (!application.value) return 0
  return (estimatedMonthlyPayment.value * application.value.loanDetails.requestedTerm) - application.value.loanDetails.requestedAmount
})

const totalAmount = computed(() => {
  if (!application.value) return 0
  return application.value.loanDetails.requestedAmount + totalInterest.value
})

// Methods
const loadApplication = async () => {
  loading.value = true
  error.value = ''
  try {
    await loansStore.fetchApplicationById(route.params.id as string)
    if (application.value) {
      // Pre-fill approval form with suggested rate
      approvalForm.value.finalInterestRate = application.value.loanDetails.suggestedInterestRate
    }
  } catch (e: any) {
    error.value = e.message || 'Failed to load application'
  } finally {
    loading.value = false
  }
}

const startReview = async () => {
  actionLoading.value = true
  try {
    await loansStore.startReview(application.value!.id)
    showSnackbar('Review started', 'info')
  } catch (e: any) {
    showSnackbar(e.message || 'Failed to start review', 'error')
  } finally {
    actionLoading.value = false
  }
}

const approveApplication = async () => {
  if (!approvalForm.value.finalInterestRate) return

  actionLoading.value = true
  try {
    await loansStore.approveApplication(application.value!.id, {
      finalInterestRate: approvalForm.value.finalInterestRate,
      notes: approvalForm.value.notes || undefined,
    })
    showApproveDialog.value = false
    showSnackbar('Application approved successfully', 'success')
    router.push('/approver/queue')
  } catch (e: any) {
    showSnackbar(e.message || 'Failed to approve application', 'error')
  } finally {
    actionLoading.value = false
  }
}

const rejectApplication = async () => {
  if (!rejectionForm.value.notes) return

  actionLoading.value = true
  try {
    await loansStore.rejectApplication(application.value!.id, {
      notes: rejectionForm.value.notes,
    })
    showRejectDialog.value = false
    showSnackbar('Application rejected', 'warning')
    router.push('/approver/queue')
  } catch (e: any) {
    showSnackbar(e.message || 'Failed to reject application', 'error')
  } finally {
    actionLoading.value = false
  }
}

const requestDocuments = async () => {
  const validDocs = requestDocsForm.value.documents.filter(d => d.documentName.trim())
  if (validDocs.length === 0) return

  actionLoading.value = true
  try {
    await loansStore.requestDocuments(application.value!.id, {
      requestedDocuments: validDocs.map(d => ({
        documentName: d.documentName,
        notes: d.notes,
      })),
      generalNotes: requestDocsForm.value.generalNotes || undefined,
    })
    showRequestDocsModal.value = false
    showSnackbar('Document request sent', 'success')
    // Reset form
    requestDocsForm.value = {
      documents: [{ documentName: '', notes: '' }],
      generalNotes: '',
    }
  } catch (e: any) {
    showSnackbar(e.message || 'Failed to request documents', 'error')
  } finally {
    actionLoading.value = false
  }
}

const addDocRequest = () => {
  requestDocsForm.value.documents.push({ documentName: '', notes: '' })
}

const removeDocRequest = (index: number) => {
  requestDocsForm.value.documents.splice(index, 1)
}

const showSnackbar = (message: string, color: string) => {
  snackbar.value = { show: true, message, color }
}

// Helper methods
const getApplicantName = (): string => {
  const app = application.value as any
  if (app?.applicantName) return app.applicantName
  if (app?.borrower) return `${app.borrower.firstName} ${app.borrower.lastName}`
  return 'N/A'
}

const getBorrowerField = (field: string): any => {
  const app = application.value as any
  if (app?.borrower) return app.borrower[field]
  return 'N/A'
}

const getLoanTypeName = (): string => {
  const app = application.value as any
  if (app?.loanTypeName) return app.loanTypeName
  if (app?.loanType) return app.loanType.name
  return 'N/A'
}

const getDefaultRate = (): number => {
  const app = application.value as any
  if (app?.defaultRate !== undefined) return app.defaultRate
  if (app?.loanType) return app.loanType.defaultInterestRate
  return 0
}

const getMinRate = (): number => {
  const app = application.value as any
  if (app?.loanType) return app.loanType.minInterestRate
  return 0
}

const getMaxRate = (): number => {
  const app = application.value as any
  if (app?.loanType) return app.loanType.maxInterestRate
  return 100
}

const getRateVariance = (): number => {
  if (!application.value) return 0
  return application.value.loanDetails.suggestedInterestRate - getDefaultRate()
}

const getRateClass = (): string => {
  const variance = getRateVariance()
  if (variance < 0) return 'rate-below'
  if (variance > 0) return 'rate-above'
  return ''
}

const getOfficerName = (): string => {
  const app = application.value as any
  if (app?.assignedOfficer) {
    return `${app.assignedOfficer.firstName} ${app.assignedOfficer.lastName}`
  }
  return 'N/A'
}

const getOfficerEmail = (): string => {
  const app = application.value as any
  return app?.assignedOfficer?.email || ''
}

const getOfficerInitials = (): string => {
  const name = getOfficerName()
  if (name === 'N/A') return '?'
  const parts = name.split(' ')
  return parts.length >= 2 ? `${parts[0][0]}${parts[1][0]}` : name.slice(0, 2)
}

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'grey',
    submitted: 'primary',
    under_review: 'info',
    pending_documents: 'warning',
    approved: 'success',
    rejected: 'error',
    disbursed: 'success',
  }
  return colors[status] || 'grey'
}

const formatStatus = (status: string): string => {
  const labels: Record<string, string> = {
    draft: 'Draft',
    submitted: 'Submitted',
    under_review: 'Under Review',
    pending_documents: 'Pending Docs',
    approved: 'Approved',
    rejected: 'Rejected',
    disbursed: 'Disbursed',
  }
  return labels[status] || status
}

const formatEmploymentType = (type: string): string => {
  const labels: Record<string, string> = {
    employed: 'Employed',
    self_employed: 'Self-Employed',
    business_owner: 'Business Owner',
    ofw: 'OFW',
    other: 'Other',
  }
  return labels[type] || type
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const getDocIcon = (doc: any): string => {
  const name = doc.documentName.toLowerCase()
  if (name.includes('id') || name.includes('identification')) return 'mdi-card-account-details'
  if (name.includes('income') || name.includes('payslip')) return 'mdi-cash'
  if (name.includes('photo')) return 'mdi-image'
  return 'mdi-file-document'
}

const getDocIconColor = (doc: any): string => {
  const name = doc.documentName.toLowerCase()
  if (name.includes('id')) return 'primary'
  if (name.includes('income')) return 'success'
  return 'grey'
}

const getDocStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    uploaded: 'success',
    pending: 'warning',
    waived: 'grey',
  }
  return colors[status] || 'grey'
}

// Load on mount
onMounted(() => {
  loadApplication()
})
</script>

<style scoped>
.approver-detail-page {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Loading & Error States */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 16px;
}

.error-container h3 {
  margin: 0;
  color: rgb(var(--v-theme-error));
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 16px;
  flex-wrap: wrap;
}

.header-left {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.page-title {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  font-family: 'Sora', sans-serif;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.meta-date {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.header-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

/* Section Cards */
.section-card {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  font-family: 'Sora', sans-serif;
  padding-bottom: 0;
}

/* Info Groups */
.info-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-group label {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-group span {
  font-size: 14px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.income-value {
  color: rgb(var(--v-theme-success));
  font-weight: 600;
}

/* Loan Metrics */
.loan-metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-radius: 12px;
  text-align: center;
}

.metric-label {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.metric-value {
  font-size: 18px;
  font-weight: 700;
}

.metric-value.primary {
  color: rgb(var(--v-theme-primary));
}

.officer-notes {
  margin-top: 24px;
  padding: 16px;
  background: rgba(var(--v-theme-info), 0.05);
  border-radius: 12px;
  border-left: 4px solid rgb(var(--v-theme-info));
}

.officer-notes label {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  text-transform: uppercase;
  display: block;
  margin-bottom: 8px;
}

.officer-notes p {
  margin: 0;
  font-size: 14px;
}

/* Rate Decision */
.rate-comparison {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;
}

.rate-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 16px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-radius: 12px;
  text-align: center;
}

.rate-box.highlight {
  background: rgba(var(--v-theme-primary), 0.08);
  border: 2px solid rgb(var(--v-theme-primary));
}

.rate-box-label {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  margin-bottom: 8px;
}

.rate-box-value {
  font-size: 28px;
  font-weight: 700;
}

.rate-box-value.default {
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.rate-box-value.rate-below {
  color: rgb(var(--v-theme-success));
}

.rate-box-value.rate-above {
  color: rgb(var(--v-theme-warning));
}

.rate-box-value.approved {
  color: rgb(var(--v-theme-success));
}

.rate-box-value.pending {
  color: rgba(var(--v-theme-on-surface), 0.4);
  font-size: 18px;
}

.rate-box-hint {
  font-size: 11px;
  color: rgba(var(--v-theme-on-surface), 0.4);
  margin-top: 4px;
}

.rate-range {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.rate-alert {
  margin-top: 16px;
}

/* Documents */
.empty-docs {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.documents-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.document-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-radius: 8px;
}

.doc-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--v-theme-on-surface), 0.06);
  border-radius: 8px;
}

.doc-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.doc-name {
  font-weight: 500;
  font-size: 14px;
}

.doc-date {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.followup-section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.1);
}

.followup-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.followup-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background: rgba(var(--v-theme-warning), 0.08);
  border-radius: 8px;
  margin-bottom: 8px;
}

.followup-name {
  font-weight: 600;
  font-size: 14px;
}

.followup-notes {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.followup-due {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

/* Summary Card */
.summary-card .v-card-text {
  padding: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.summary-row.highlight {
  padding: 12px 0;
}

.summary-row span {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.summary-row strong {
  font-size: 14px;
}

.primary-text {
  color: rgb(var(--v-theme-primary));
  font-size: 18px !important;
}

/* Officer Info */
.officer-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.officer-details {
  display: flex;
  flex-direction: column;
}

.officer-name {
  font-weight: 600;
  font-size: 14px;
}

.officer-email {
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

/* Dialogs */
.dialog-title {
  font-family: 'Sora', sans-serif;
  font-size: 18px;
  padding: 20px 24px 0;
}

.success-title {
  color: rgb(var(--v-theme-success));
}

.error-title {
  color: rgb(var(--v-theme-error));
}

.dialog-description {
  color: rgba(var(--v-theme-on-surface), 0.7);
  margin-bottom: 0;
}

/* Document Request Form */
.doc-requests {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 16px 0;
}

.doc-request-item {
  display: grid;
  grid-template-columns: 1fr 1fr auto;
  gap: 12px;
  align-items: start;
}

/* Responsive */
@media (max-width: 1280px) {
  .rate-comparison {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 960px) {
  .approver-detail-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .doc-request-item {
    grid-template-columns: 1fr;
  }
}
</style>
