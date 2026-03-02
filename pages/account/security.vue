<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">Account Security</h1>
      </v-col>
    </v-row>

    <!-- Change Password Section -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon start>mdi-lock-reset</v-icon>
            Change Password
          </v-card-title>

          <v-card-text>
            <v-form ref="passwordForm" @submit.prevent="handleChangePassword">
              <v-text-field
                v-model="currentPassword"
                label="Current Password"
                :type="showCurrentPassword ? 'text' : 'password'"
                variant="outlined"
                :rules="currentPasswordRules"
                :disabled="loading"
                :append-inner-icon="showCurrentPassword ? 'mdi-eye-off' : 'mdi-eye'"
                class="mb-3"
                @click:append-inner="showCurrentPassword = !showCurrentPassword"
              />

              <v-text-field
                v-model="newPassword"
                label="New Password"
                :type="showNewPassword ? 'text' : 'password'"
                variant="outlined"
                :rules="newPasswordRules"
                :disabled="loading"
                :append-inner-icon="showNewPassword ? 'mdi-eye-off' : 'mdi-eye'"
                class="mb-3"
                @click:append-inner="showNewPassword = !showNewPassword"
              />

              <v-text-field
                v-model="confirmNewPassword"
                label="Confirm New Password"
                :type="showConfirmPassword ? 'text' : 'password'"
                variant="outlined"
                :rules="confirmPasswordRules"
                :disabled="loading"
                :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                class="mb-3"
                @click:append-inner="showConfirmPassword = !showConfirmPassword"
              />

              <v-card v-if="strengthInfo" variant="tonal" :color="strengthInfo.color" class="mb-4 pa-3">
                <div class="text-caption font-weight-bold mb-1">
                  Password Strength: {{ strengthInfo.label }}
                </div>
                <v-progress-linear
                  :model-value="strengthInfo.score * 25"
                  :color="strengthInfo.color"
                  height="6"
                  rounded
                />
              </v-card>

              <v-alert
                v-if="passwordError"
                type="error"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="passwordError = null"
              >
                {{ passwordError }}
              </v-alert>

              <v-alert
                v-if="passwordSuccess"
                type="success"
                variant="tonal"
                class="mb-4"
                closable
                @click:close="passwordSuccess = null"
              >
                {{ passwordSuccess }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                :loading="loading"
                block
              >
                Change Password
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>

        <!-- Password Requirements -->
        <v-card class="mt-4" variant="tonal">
          <v-card-title class="text-h6">
            <v-icon start>mdi-shield-check</v-icon>
            Password Requirements
          </v-card-title>
          <v-card-text>
            <v-list density="compact">
              <v-list-item>
                <v-icon start size="small">mdi-check-circle</v-icon>
                At least 8 characters long
              </v-list-item>
              <v-list-item>
                <v-icon start size="small">mdi-check-circle</v-icon>
                Contains uppercase letter (A-Z)
              </v-list-item>
              <v-list-item>
                <v-icon start size="small">mdi-check-circle</v-icon>
                Contains lowercase letter (a-z)
              </v-list-item>
              <v-list-item>
                <v-icon start size="small">mdi-check-circle</v-icon>
                Contains number (0-9)
              </v-list-item>
              <v-list-item>
                <v-icon start size="small">mdi-check-circle</v-icon>
                Contains special character (!@#$%^&*...)
              </v-list-item>
              <v-list-item>
                <v-icon start size="small">mdi-check-circle</v-icon>
                Not a common password
              </v-list-item>
            </v-list>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Active Sessions Section -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title class="d-flex align-center justify-space-between">
            <div>
              <v-icon start>mdi-devices</v-icon>
              Active Sessions
            </div>
            <v-btn
              color="error"
              variant="outlined"
              size="small"
              :disabled="sessionsLoading || !activeSessions.length"
              @click="handleLogoutAllDevices"
            >
              <v-icon start>mdi-logout</v-icon>
              Logout All Devices
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-progress-linear v-if="sessionsLoading" indeterminate color="primary" class="mb-4" />

            <v-alert
              v-if="sessionsError"
              type="error"
              variant="tonal"
              class="mb-4"
              closable
              @click:close="sessionsError = null"
            >
              {{ sessionsError }}
            </v-alert>

            <v-data-table
              :headers="sessionHeaders"
              :items="activeSessions"
              :loading="sessionsLoading"
              :items-per-page="10"
              class="elevation-1"
            >
              <template #item.device="{ item }">
                <div class="d-flex align-center">
                  <v-icon start>{{ getDeviceIcon(item.device) }}</v-icon>
                  <div>
                    <div class="font-weight-medium">{{ formatDevice(item.device) }}</div>
                    <div v-if="item.isCurrent" class="text-caption text-success">Current Session</div>
                  </div>
                </div>
              </template>

              <template #item.ipAddress="{ item }">
                <v-chip size="small" variant="tonal">
                  {{ item.ipAddress }}
                </v-chip>
              </template>

              <template #item.lastActive="{ item }">
                {{ formatDate(item.lastActive) }}
              </template>

              <template #item.actions="{ item }">
                <v-btn
                  v-if="!item.isCurrent"
                  icon="mdi-logout"
                  size="small"
                  variant="text"
                  color="error"
                  :disabled="sessionsLoading"
                  @click="handleLogoutSession(item.tokenId)"
                >
                  <v-icon>mdi-logout</v-icon>
                  <v-tooltip activator="parent" location="top">
                    Logout this device
                  </v-tooltip>
                </v-btn>
              </template>

              <template #no-data>
                <div class="text-center pa-4">
                  <v-icon size="64" color="grey-lighten-1">mdi-devices-off</v-icon>
                  <div class="text-body-1 mt-2">No active sessions found</div>
                </div>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

definePageMeta({
  middleware: 'auth',
})

const { authenticatedFetch, logout, logoutAllDevices } = useAuth()

// Password change form
const passwordForm = ref()
const currentPassword = ref('')
const newPassword = ref('')
const confirmNewPassword = ref('')
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const passwordError = ref<string | null>(null)
const passwordSuccess = ref<string | null>(null)

// Sessions
const activeSessions = ref<any[]>([])
const sessionsLoading = ref(false)
const sessionsError = ref<string | null>(null)

// Password strength
const strengthInfo = computed(() => {
  if (!newPassword.value) return null

  const password = newPassword.value
  let score = 0

  // Length
  if (password.length >= 8) score++
  if (password.length >= 12) score++

  // Character types
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++

  // Normalize to 0-4
  const normalizedScore = Math.min(Math.floor(score / 1.5), 4)

  const labels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const colors = ['error', 'warning', 'info', 'success', 'success']

  return {
    score: normalizedScore,
    label: labels[normalizedScore],
    color: colors[normalizedScore],
  }
})

// Validation rules
const currentPasswordRules = [
  (v: string) => !!v || 'Current password is required',
]

const newPasswordRules = [
  (v: string) => !!v || 'New password is required',
  (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
  (v: string) => /[A-Z]/.test(v) || 'Password must contain an uppercase letter',
  (v: string) => /[a-z]/.test(v) || 'Password must contain a lowercase letter',
  (v: string) => /[0-9]/.test(v) || 'Password must contain a number',
  (v: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) || 'Password must contain a special character',
  (v: string) => v !== currentPassword.value || 'New password must be different from current password',
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Please confirm your new password',
  (v: string) => v === newPassword.value || 'Passwords do not match',
]

// Session table headers
const sessionHeaders = [
  { title: 'Device', key: 'device', sortable: false },
  { title: 'IP Address', key: 'ipAddress', sortable: false },
  { title: 'Last Active', key: 'lastActive', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false, align: 'end' as const },
]

// Fetch active sessions
const fetchActiveSessions = async () => {
  sessionsLoading.value = true
  sessionsError.value = null

  try {
    const response = await authenticatedFetch<{ sessions: any[] }>('/api/auth/sessions')
    activeSessions.value = response.sessions || []
  } catch (error: any) {
    sessionsError.value = error.data?.statusMessage || 'Failed to load active sessions'
  } finally {
    sessionsLoading.value = false
  }
}

// Handle password change
const handleChangePassword = async () => {
  const { valid } = await passwordForm.value.validate()
  if (!valid) return

  loading.value = true
  passwordError.value = null
  passwordSuccess.value = null

  try {
    await authenticatedFetch('/api/auth/change-password', {
      method: 'POST',
      body: {
        currentPassword: currentPassword.value,
        newPassword: newPassword.value,
      },
    })

    passwordSuccess.value = 'Password changed successfully!'
    currentPassword.value = ''
    newPassword.value = ''
    confirmNewPassword.value = ''
    passwordForm.value.reset()
  } catch (error: any) {
    passwordError.value = error.data?.statusMessage || 'Failed to change password'
  } finally {
    loading.value = false
  }
}

// Handle logout from specific device
const handleLogoutSession = async (tokenId: string) => {
  if (!confirm('Are you sure you want to logout from this device?')) return

  sessionsLoading.value = true
  try {
    await authenticatedFetch('/api/auth/revoke-session', {
      method: 'POST',
      body: { tokenId },
    })
    await fetchActiveSessions()
  } catch (error: any) {
    sessionsError.value = error.data?.statusMessage || 'Failed to logout session'
  } finally {
    sessionsLoading.value = false
  }
}

// Handle logout from all devices
const handleLogoutAllDevices = async () => {
  if (!confirm('Are you sure you want to logout from all devices? You will need to login again.')) return

  const result = await logoutAllDevices()
  if (!result.success) {
    sessionsError.value = result.error || 'Failed to logout from all devices'
  }
}

// Format device string
const formatDevice = (device: string) => {
  if (!device || device === 'Unknown') return 'Unknown Device'

  // Extract browser and OS from user agent
  const browser = device.match(/(Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)?.[1] || 'Unknown Browser'
  const os = device.match(/(Windows|Mac|Linux|Android|iOS)/)?.[1] || 'Unknown OS'

  return `${browser} on ${os}`
}

// Get device icon
const getDeviceIcon = (device: string) => {
  if (!device) return 'mdi-devices'
  if (device.includes('Mobile') || device.includes('Android') || device.includes('iOS')) {
    return 'mdi-cellphone'
  }
  if (device.includes('Tablet') || device.includes('iPad')) {
    return 'mdi-tablet'
  }
  return 'mdi-desktop-mac'
}

// Format date
const formatDate = (date: string | Date) => {
  if (!date) return 'Unknown'
  return new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

// Load sessions on mount
onMounted(() => {
  fetchActiveSessions()
})
</script>

<style scoped>
.v-data-table {
  background: transparent;
}
</style>
