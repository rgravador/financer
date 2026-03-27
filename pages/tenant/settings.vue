<template>
  <div class="settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">
          Configure your organization's preferences, notifications, and approval workflows
        </p>
      </div>
      <div class="header-actions">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-refresh"
          :loading="loading"
          @click="loadSettings"
        >
          Refresh
        </v-btn>
        <v-btn
          color="primary"
          prepend-icon="mdi-content-save"
          :loading="saving"
          :disabled="!hasChanges"
          @click="saveAllSettings"
        >
          Save Changes
        </v-btn>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !settings" class="loading-container">
      <v-progress-circular indeterminate color="primary" size="56" width="4" />
      <p class="loading-text">Loading settings...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <v-icon size="48" color="error">mdi-alert-circle-outline</v-icon>
      </div>
      <h3 class="error-title">Unable to load settings</h3>
      <p class="error-message">{{ error }}</p>
      <v-btn color="primary" variant="outlined" @click="loadSettings">
        <v-icon start>mdi-refresh</v-icon>
        Try Again
      </v-btn>
    </div>

    <!-- Settings Content -->
    <div v-else class="settings-content">
      <!-- Branding Section -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <v-icon size="24" color="primary">mdi-palette-outline</v-icon>
          </div>
          <div class="section-info">
            <h2 class="section-title">Branding</h2>
            <p class="section-description">Customize your organization's appearance</p>
          </div>
        </div>
        <div class="section-content">
          <div class="form-grid">
            <v-text-field
              v-model="formData.branding.companyName"
              label="Company Name"
              variant="outlined"
              density="comfortable"
              hint="Displayed in reports and communications"
              persistent-hint
            />
            <v-text-field
              v-model="formData.branding.tagline"
              label="Tagline"
              variant="outlined"
              density="comfortable"
              hint="Short description of your organization"
              persistent-hint
            />
          </div>
          <div class="form-grid color-grid">
            <div class="color-picker-field">
              <label class="color-label">Primary Color</label>
              <div class="color-input-group">
                <v-text-field
                  v-model="formData.branding.primaryColor"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="#1e3a8a"
                >
                  <template #prepend-inner>
                    <div
                      class="color-preview"
                      :style="{ background: formData.branding.primaryColor || '#1e3a8a' }"
                    />
                  </template>
                </v-text-field>
              </div>
            </div>
            <div class="color-picker-field">
              <label class="color-label">Secondary Color</label>
              <div class="color-input-group">
                <v-text-field
                  v-model="formData.branding.secondaryColor"
                  variant="outlined"
                  density="compact"
                  hide-details
                  placeholder="#f59e0b"
                >
                  <template #prepend-inner>
                    <div
                      class="color-preview"
                      :style="{ background: formData.branding.secondaryColor || '#f59e0b' }"
                    />
                  </template>
                </v-text-field>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Notifications Section -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <v-icon size="24" color="success">mdi-bell-outline</v-icon>
          </div>
          <div class="section-info">
            <h2 class="section-title">Email Notifications</h2>
            <p class="section-description">Configure when to send email notifications</p>
          </div>
        </div>
        <div class="section-content">
          <div class="notification-toggles">
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-title">New Application Submitted</span>
                <span class="toggle-description">Notify officers when a new loan application is submitted</span>
              </div>
              <v-switch
                v-model="formData.notifications.emailOnNewApplication"
                color="success"
                hide-details
                inset
              />
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-title">Application Status Changed</span>
                <span class="toggle-description">Notify relevant parties when application status changes</span>
              </div>
              <v-switch
                v-model="formData.notifications.emailOnStatusChange"
                color="success"
                hide-details
                inset
              />
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-title">Documents Uploaded</span>
                <span class="toggle-description">Notify officers when borrower uploads documents</span>
              </div>
              <v-switch
                v-model="formData.notifications.emailOnDocumentUpload"
                color="success"
                hide-details
                inset
              />
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-title">Approval Required</span>
                <span class="toggle-description">Notify approvers when a loan needs their review</span>
              </div>
              <v-switch
                v-model="formData.notifications.emailOnApprovalRequired"
                color="success"
                hide-details
                inset
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Approval Rules Section -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <v-icon size="24" color="warning">mdi-shield-check-outline</v-icon>
          </div>
          <div class="section-info">
            <h2 class="section-title">Approval Rules</h2>
            <p class="section-description">Define approval workflows based on loan amounts</p>
          </div>
        </div>
        <div class="section-content">
          <!-- Approval Rules List -->
          <div class="approval-rules-list">
            <div
              v-for="(rule, index) in formData.approvalRules"
              :key="index"
              class="approval-rule"
            >
              <div class="rule-header">
                <span class="rule-number">Rule {{ index + 1 }}</span>
                <v-btn
                  icon="mdi-delete-outline"
                  variant="text"
                  size="small"
                  color="error"
                  @click="removeApprovalRule(index)"
                />
              </div>
              <div class="rule-content">
                <div class="rule-amounts">
                  <v-text-field
                    v-model.number="rule.minAmount"
                    label="Min Amount"
                    type="number"
                    variant="outlined"
                    density="compact"
                    prefix="₱"
                    hide-details
                    min="0"
                  />
                  <span class="rule-separator">to</span>
                  <v-text-field
                    v-model.number="rule.maxAmount"
                    label="Max Amount"
                    type="number"
                    variant="outlined"
                    density="compact"
                    prefix="₱"
                    hide-details
                    min="0"
                  />
                </div>
                <div class="rule-approvals">
                  <v-select
                    v-model="rule.requiredApprovals"
                    :items="[1, 2, 3, 4, 5]"
                    label="Required Approvals"
                    variant="outlined"
                    density="compact"
                    hide-details
                    :menu-props="{ contentClass: 'filter-dropdown-menu' }"
                  />
                  <v-select
                    v-model="rule.approverRoles"
                    :items="approverRoleOptions"
                    item-title="label"
                    item-value="value"
                    label="Approver Roles"
                    variant="outlined"
                    density="compact"
                    hide-details
                    multiple
                    chips
                    closable-chips
                    :menu-props="{ contentClass: 'filter-dropdown-menu' }"
                  />
                </div>
              </div>
            </div>
          </div>
          <v-btn
            variant="tonal"
            color="primary"
            class="mt-4"
            @click="addApprovalRule"
          >
            <v-icon start>mdi-plus</v-icon>
            Add Approval Rule
          </v-btn>
        </div>
      </div>

      <!-- Workflow Settings Section -->
      <div class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <v-icon size="24" color="info">mdi-cog-outline</v-icon>
          </div>
          <div class="section-info">
            <h2 class="section-title">Workflow Settings</h2>
            <p class="section-description">Configure loan processing behavior</p>
          </div>
        </div>
        <div class="section-content">
          <div class="workflow-toggles">
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-title">Require Documents Before Approval</span>
                <span class="toggle-description">All required documents must be uploaded before loan can be approved</span>
              </div>
              <v-switch
                v-model="formData.requireDocumentsBeforeApproval"
                color="primary"
                hide-details
                inset
              />
            </div>
            <div class="toggle-item">
              <div class="toggle-info">
                <span class="toggle-title">Allow Partial Approvals</span>
                <span class="toggle-description">Allow approving loans for amounts less than requested</span>
              </div>
              <v-switch
                v-model="formData.allowPartialApprovals"
                color="primary"
                hide-details
                inset
              />
            </div>
          </div>
          <div class="form-field-single">
            <v-slider
              v-model="formData.maxConcurrentApplicationsPerBorrower"
              :min="1"
              :max="10"
              :step="1"
              thumb-label
              color="primary"
              class="mt-6"
            >
              <template #prepend>
                <span class="slider-label">Max Applications per Borrower</span>
              </template>
              <template #append>
                <span class="slider-value">{{ formData.maxConcurrentApplicationsPerBorrower }}</span>
              </template>
            </v-slider>
          </div>
        </div>
      </div>
    </div>

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
definePageMeta({
  middleware: ['role'],
  allowedRoles: ['tenant_admin'],
})

interface ApprovalRule {
  minAmount: number
  maxAmount: number
  requiredApprovals: number
  approverRoles: string[]
}

interface Settings {
  id: string
  tenantId: string
  branding: {
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
    companyName?: string
    tagline?: string
  }
  notifications: {
    emailOnNewApplication: boolean
    emailOnStatusChange: boolean
    emailOnDocumentUpload: boolean
    emailOnApprovalRequired: boolean
  }
  approvalRules: ApprovalRule[]
  defaultLoanOfficerId?: string | null
  requireDocumentsBeforeApproval: boolean
  allowPartialApprovals: boolean
  maxConcurrentApplicationsPerBorrower: number
}

const { authenticatedFetch } = useAuth()

// Reactive state
const settings = ref<Settings | null>(null)
const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)

const formData = ref({
  branding: {
    primaryColor: '',
    secondaryColor: '',
    logoUrl: '',
    companyName: '',
    tagline: '',
  },
  notifications: {
    emailOnNewApplication: true,
    emailOnStatusChange: true,
    emailOnDocumentUpload: true,
    emailOnApprovalRequired: true,
  },
  approvalRules: [] as ApprovalRule[],
  requireDocumentsBeforeApproval: true,
  allowPartialApprovals: false,
  maxConcurrentApplicationsPerBorrower: 3,
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Options
const approverRoleOptions = [
  { label: 'Approver', value: 'tenant_approver' },
  { label: 'Administrator', value: 'tenant_admin' },
]

// Computed
const hasChanges = computed(() => {
  if (!settings.value) return false

  // Compare branding
  const brandingChanged =
    formData.value.branding.primaryColor !== (settings.value.branding.primaryColor || '') ||
    formData.value.branding.secondaryColor !== (settings.value.branding.secondaryColor || '') ||
    formData.value.branding.companyName !== (settings.value.branding.companyName || '') ||
    formData.value.branding.tagline !== (settings.value.branding.tagline || '')

  // Compare notifications
  const notifChanged =
    formData.value.notifications.emailOnNewApplication !== settings.value.notifications.emailOnNewApplication ||
    formData.value.notifications.emailOnStatusChange !== settings.value.notifications.emailOnStatusChange ||
    formData.value.notifications.emailOnDocumentUpload !== settings.value.notifications.emailOnDocumentUpload ||
    formData.value.notifications.emailOnApprovalRequired !== settings.value.notifications.emailOnApprovalRequired

  // Compare workflow settings
  const workflowChanged =
    formData.value.requireDocumentsBeforeApproval !== settings.value.requireDocumentsBeforeApproval ||
    formData.value.allowPartialApprovals !== settings.value.allowPartialApprovals ||
    formData.value.maxConcurrentApplicationsPerBorrower !== settings.value.maxConcurrentApplicationsPerBorrower

  // Compare approval rules (simple length + JSON comparison)
  const rulesChanged = JSON.stringify(formData.value.approvalRules) !== JSON.stringify(settings.value.approvalRules)

  return brandingChanged || notifChanged || workflowChanged || rulesChanged
})

// Methods
const loadSettings = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await authenticatedFetch<Settings>('/api/tenant/settings')
    settings.value = data

    // Populate form data
    formData.value = {
      branding: {
        primaryColor: data.branding.primaryColor || '',
        secondaryColor: data.branding.secondaryColor || '',
        logoUrl: data.branding.logoUrl || '',
        companyName: data.branding.companyName || '',
        tagline: data.branding.tagline || '',
      },
      notifications: {
        emailOnNewApplication: data.notifications.emailOnNewApplication,
        emailOnStatusChange: data.notifications.emailOnStatusChange,
        emailOnDocumentUpload: data.notifications.emailOnDocumentUpload,
        emailOnApprovalRequired: data.notifications.emailOnApprovalRequired,
      },
      approvalRules: data.approvalRules.map(r => ({ ...r })),
      requireDocumentsBeforeApproval: data.requireDocumentsBeforeApproval,
      allowPartialApprovals: data.allowPartialApprovals,
      maxConcurrentApplicationsPerBorrower: data.maxConcurrentApplicationsPerBorrower,
    }
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to load settings'
    console.error('Failed to load settings:', err)
  } finally {
    loading.value = false
  }
}

const saveAllSettings = async () => {
  saving.value = true

  try {
    // Validate approval rules
    for (const rule of formData.value.approvalRules) {
      if (rule.minAmount >= rule.maxAmount) {
        showSnackbar('Min amount must be less than max amount in approval rules', 'error')
        saving.value = false
        return
      }
      if (rule.approverRoles.length === 0) {
        showSnackbar('Each approval rule must have at least one approver role', 'error')
        saving.value = false
        return
      }
    }

    const data = await authenticatedFetch<Settings>('/api/tenant/settings', {
      method: 'PATCH',
      body: {
        branding: formData.value.branding,
        notifications: formData.value.notifications,
        approvalRules: formData.value.approvalRules,
        requireDocumentsBeforeApproval: formData.value.requireDocumentsBeforeApproval,
        allowPartialApprovals: formData.value.allowPartialApprovals,
        maxConcurrentApplicationsPerBorrower: formData.value.maxConcurrentApplicationsPerBorrower,
      },
    })

    settings.value = data
    showSnackbar('Settings saved successfully', 'success')
  } catch (err: any) {
    showSnackbar(err.data?.statusMessage || 'Failed to save settings', 'error')
  } finally {
    saving.value = false
  }
}

const addApprovalRule = () => {
  const lastRule = formData.value.approvalRules[formData.value.approvalRules.length - 1]
  const newMinAmount = lastRule ? lastRule.maxAmount + 1 : 0

  formData.value.approvalRules.push({
    minAmount: newMinAmount,
    maxAmount: newMinAmount + 500000,
    requiredApprovals: 1,
    approverRoles: ['tenant_approver', 'tenant_admin'],
  })
}

const removeApprovalRule = (index: number) => {
  formData.value.approvalRules.splice(index, 1)
}

const showSnackbar = (message: string, color: string) => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(() => {
  loadSettings()
})
</script>

<style scoped>
.settings-page {
  padding: 0;
}

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
  margin-bottom: 40px;
}

.header-content {
  flex: 1;
}

.page-title {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 15px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  line-height: 1.5;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
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
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
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
  color: rgb(var(--v-theme-on-surface));
  margin: 24px 0 12px;
}

.error-message {
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin-bottom: 28px;
  max-width: 400px;
  font-size: 15px;
  line-height: 1.6;
}

/* Settings Content */
.settings-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Settings Section */
.settings-section {
  background: rgb(var(--v-theme-surface));
  border-radius: 20px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  overflow: hidden;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 28px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  background: rgba(var(--v-theme-on-surface), 0.02);
}

.section-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(var(--v-theme-primary), 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-info {
  flex: 1;
}

.section-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 4px 0;
}

.section-description {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
}

.section-content {
  padding: 28px;
}

/* Form Grid */
.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.color-grid {
  margin-top: 20px;
}

.color-picker-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-label {
  font-size: 13px;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
}

.color-input-group {
  display: flex;
  gap: 12px;
  align-items: center;
}

.color-preview {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid rgba(var(--v-theme-on-surface), 0.12);
}

/* Notification Toggles */
.notification-toggles,
.workflow-toggles {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-radius: 12px;
  transition: background 0.2s ease;
}

.toggle-item:hover {
  background: rgba(var(--v-theme-on-surface), 0.03);
}

.toggle-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.toggle-title {
  font-size: 15px;
  font-weight: 500;
  color: rgb(var(--v-theme-on-surface));
}

.toggle-description {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.55);
}

/* Approval Rules */
.approval-rules-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.approval-rule {
  padding: 20px;
  background: rgba(var(--v-theme-on-surface), 0.03);
  border-radius: 14px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.06);
}

.rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rule-number {
  font-size: 13px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.rule-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.rule-amounts {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rule-amounts .v-text-field {
  flex: 1;
}

.rule-separator {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.5);
  padding: 0 4px;
}

.rule-approvals {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 12px;
}

/* Slider */
.form-field-single {
  margin-top: 20px;
}

.slider-label {
  font-size: 14px;
  font-weight: 500;
  color: rgba(var(--v-theme-on-surface), 0.7);
  white-space: nowrap;
}

.slider-value {
  font-size: 16px;
  font-weight: 700;
  color: rgb(var(--v-theme-primary));
  min-width: 24px;
  text-align: center;
}

/* Responsive */
@media (max-width: 960px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    justify-content: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .rule-amounts {
    flex-direction: column;
    align-items: stretch;
  }

  .rule-separator {
    text-align: center;
    padding: 4px 0;
  }

  .rule-approvals {
    grid-template-columns: 1fr;
  }
}
</style>
