<template>
  <div class="settings-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Configure Settings</h1>
        <p class="page-subtitle">
          Manage system-wide settings and configurations
        </p>
      </div>
    </div>

    <!-- Settings Sections -->
    <div class="settings-grid">
      <!-- Default Password Section -->
      <v-card class="settings-card" elevation="0">
        <div class="card-header">
          <div class="card-icon">
            <v-icon size="24">mdi-key-variant</v-icon>
          </div>
          <div class="card-title-group">
            <h3 class="card-title">Default Tenant Admin Password</h3>
            <p class="card-description">
              Set a default password for all new tenant administrator accounts. When configured, this password will be used instead of generating random passwords.
            </p>
          </div>
        </div>

        <v-divider class="my-4" />

        <div class="card-content">
          <!-- Status Indicator -->
          <div class="status-row">
            <div class="status-indicator" :class="defaultPasswordStatus?.isSet ? 'status-active' : 'status-inactive'">
              <span class="status-dot"></span>
              <span class="status-text">
                {{ defaultPasswordStatus?.isSet ? 'Default password is configured' : 'No default password set' }}
              </span>
            </div>
            <span v-if="defaultPasswordStatus?.isSet && defaultPasswordStatus?.updatedAt" class="status-date">
              Updated {{ formatDate(defaultPasswordStatus.updatedAt) }}
            </span>
          </div>

          <!-- Password Form -->
          <v-form ref="passwordFormRef" class="password-form" @submit.prevent="handleSetPassword">
            <v-text-field
              v-model="passwordForm.password"
              :type="showPassword ? 'text' : 'password'"
              label="Default Password"
              placeholder="Enter default password"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.minLength(8)]"
              :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showPassword = !showPassword"
              class="password-input"
            />
            <v-text-field
              v-model="passwordForm.confirmPassword"
              :type="showConfirmPassword ? 'text' : 'password'"
              label="Confirm Password"
              placeholder="Confirm default password"
              variant="outlined"
              density="comfortable"
              :rules="[rules.required, rules.passwordMatch]"
              :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
              @click:append-inner="showConfirmPassword = !showConfirmPassword"
              class="password-input"
            />
          </v-form>

          <!-- Actions -->
          <div class="card-actions">
            <v-btn
              v-if="defaultPasswordStatus?.isSet"
              variant="outlined"
              color="error"
              :loading="removeLoading"
              @click="handleRemovePassword"
            >
              <v-icon start>mdi-delete-outline</v-icon>
              Remove Default Password
            </v-btn>
            <v-spacer />
            <v-btn
              color="primary"
              :loading="saveLoading"
              @click="handleSetPassword"
            >
              <v-icon start>mdi-content-save</v-icon>
              {{ defaultPasswordStatus?.isSet ? 'Update Password' : 'Set Password' }}
            </v-btn>
          </div>
        </div>
      </v-card>

      <!-- Info Card -->
      <v-card class="info-card" elevation="0">
        <div class="info-icon">
          <v-icon size="32" color="info">mdi-information-outline</v-icon>
        </div>
        <h4 class="info-title">How Default Password Works</h4>
        <ul class="info-list">
          <li>
            <v-icon size="16" class="list-icon">mdi-check</v-icon>
            When a default password is set, all new tenant admin accounts will be created with this password
          </li>
          <li>
            <v-icon size="16" class="list-icon">mdi-check</v-icon>
            Users will still be required to change their password on first login
          </li>
          <li>
            <v-icon size="16" class="list-icon">mdi-check</v-icon>
            You can reset any tenant admin's password to the default from their profile
          </li>
          <li>
            <v-icon size="16" class="list-icon">mdi-check</v-icon>
            If no default password is set, random secure passwords will be generated
          </li>
        </ul>
      </v-card>
    </div>

    <!-- Snackbar for notifications -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" :timeout="4000">
      {{ snackbar.message }}
      <template #actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import { useSystemStore } from '~/stores/system'

definePageMeta({
  middleware: ['role'],
  allowedRoles: ['system_admin'],
})

const systemStore = useSystemStore()

// Reactive state
const passwordFormRef = ref()
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const saveLoading = ref(false)
const removeLoading = ref(false)

const passwordForm = ref({
  password: '',
  confirmPassword: '',
})

const snackbar = ref({
  show: false,
  message: '',
  color: 'success',
})

// Computed
const defaultPasswordStatus = computed(() => systemStore.defaultPasswordStatus)

// Validation rules
const rules = {
  required: (v: string) => !!v || 'This field is required',
  minLength: (min: number) => (v: string) => (v && v.length >= min) || `Minimum ${min} characters`,
  passwordMatch: (v: string) => v === passwordForm.value.password || 'Passwords do not match',
}

// Methods
const formatDate = (date: string | null) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const handleSetPassword = async () => {
  const { valid } = await passwordFormRef.value?.validate()
  if (!valid) return

  saveLoading.value = true
  try {
    await systemStore.setDefaultPassword(passwordForm.value.password)
    showSnackbar('Default password has been configured successfully', 'success')
    // Clear form
    passwordForm.value = { password: '', confirmPassword: '' }
    passwordFormRef.value?.resetValidation()
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Failed to set default password', 'error')
  } finally {
    saveLoading.value = false
  }
}

const handleRemovePassword = async () => {
  removeLoading.value = true
  try {
    await systemStore.removeDefaultPassword()
    showSnackbar('Default password has been removed. New accounts will receive random passwords.', 'success')
  } catch (error: any) {
    showSnackbar(error.data?.statusMessage || 'Failed to remove default password', 'error')
  } finally {
    removeLoading.value = false
  }
}

const showSnackbar = (message: string, color: string) => {
  snackbar.value = { show: true, message, color }
}

// Lifecycle
onMounted(async () => {
  try {
    await systemStore.fetchDefaultPasswordStatus()
  } catch (error) {
    console.error('Failed to fetch default password status:', error)
  }
})
</script>

<style scoped>
.settings-page {
  padding: 0;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 6px 0;
  letter-spacing: -0.02em;
}

.page-subtitle {
  font-size: 15px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
}

/* Settings Grid */
.settings-grid {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
}

/* Settings Card */
.settings-card {
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
  padding: 24px;
}

.card-header {
  display: flex;
  gap: 16px;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: rgba(var(--v-theme-primary), 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgb(var(--v-theme-primary));
  flex-shrink: 0;
}

.card-title-group {
  flex: 1;
}

.card-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 6px 0;
}

.card-description {
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.6);
  margin: 0;
  line-height: 1.5;
}

.card-content {
  padding-top: 8px;
}

/* Status Row */
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.status-indicator {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.status-active {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.status-active .status-dot {
  background: #10b981;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.status-inactive {
  background: rgba(var(--v-theme-on-surface), 0.08);
  color: rgba(var(--v-theme-on-surface), 0.6);
}

.status-inactive .status-dot {
  background: rgba(var(--v-theme-on-surface), 0.3);
}

.status-date {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

/* Password Form */
.password-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 24px;
}

.password-input {
  max-width: 400px;
}

/* Card Actions */
.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Info Card */
.info-card {
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-info), 0.2);
  background: rgba(var(--v-theme-info), 0.04);
  padding: 24px;
}

.info-icon {
  margin-bottom: 16px;
}

.info-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 16px 0;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 14px;
  color: rgba(var(--v-theme-on-surface), 0.7);
  line-height: 1.5;
}

.list-icon {
  color: rgb(var(--v-theme-success));
  flex-shrink: 0;
  margin-top: 2px;
}

/* Responsive */
@media (max-width: 1024px) {
  .settings-grid {
    grid-template-columns: 1fr;
  }

  .info-card {
    order: -1;
  }
}

@media (max-width: 600px) {
  .card-header {
    flex-direction: column;
  }

  .card-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .password-input {
    max-width: 100%;
  }
}
</style>
