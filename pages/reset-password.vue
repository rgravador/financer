<template>
  <v-app>
    <v-main>
      <v-container fluid class="fill-height">
        <v-row align="center" justify="center">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card elevation="8" rounded="lg">
              <v-card-title class="text-h4 font-weight-bold text-center pa-6">
                <div class="d-flex flex-column align-center">
                  <v-icon size="48" color="primary" class="mb-2">
                    mdi-shield-lock
                  </v-icon>
                  <span>Set New Password</span>
                </div>
              </v-card-title>

              <v-card-subtitle class="text-center pb-4">
                Choose a strong password for your account
              </v-card-subtitle>

              <v-card-text>
                <v-form v-if="!success" ref="resetPasswordForm" @submit.prevent="handleSubmit">
                  <v-text-field
                    v-model="newPassword"
                    label="New Password"
                    :type="showPassword ? 'text' : 'password'"
                    variant="outlined"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    :rules="passwordRules"
                    :disabled="loading"
                    autocomplete="new-password"
                    class="mb-3"
                    @click:append-inner="showPassword = !showPassword"
                  />

                  <v-text-field
                    v-model="confirmPassword"
                    label="Confirm Password"
                    :type="showConfirmPassword ? 'text' : 'password'"
                    variant="outlined"
                    prepend-inner-icon="mdi-lock-check"
                    :append-inner-icon="showConfirmPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    :rules="confirmPasswordRules"
                    :disabled="loading"
                    autocomplete="new-password"
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
                    v-if="error"
                    type="error"
                    variant="tonal"
                    class="mb-4"
                    closable
                    @click:close="clearError"
                  >
                    {{ error }}
                  </v-alert>

                  <v-btn
                    type="submit"
                    color="primary"
                    size="large"
                    block
                    :loading="loading"
                    class="mb-3"
                  >
                    Reset Password
                  </v-btn>

                  <div class="text-center">
                    <v-btn
                      variant="text"
                      size="small"
                      color="primary"
                      :disabled="loading"
                      @click="goToLogin"
                    >
                      <v-icon start>mdi-arrow-left</v-icon>
                      Back to Login
                    </v-btn>
                  </div>
                </v-form>

                <v-alert
                  v-else
                  type="success"
                  variant="tonal"
                  prominent
                  class="mb-4"
                >
                  <v-alert-title>Password Reset Successfully!</v-alert-title>
                  <div>
                    Your password has been changed. You can now log in with your new password.
                  </div>
                </v-alert>

                <v-btn
                  v-if="success"
                  color="primary"
                  variant="flat"
                  block
                  @click="goToLogin"
                >
                  Go to Login
                </v-btn>
              </v-card-text>
            </v-card>

            <v-card variant="tonal" class="mt-4 text-center pa-4">
              <div class="text-caption text-medium-emphasis">
                Password must be at least 8 characters with uppercase, lowercase, number, and special character
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

definePageMeta({
  layout: false,
})

const router = useRouter()
const route = useRoute()

// Get token from query parameter
const token = ref(route.query.token as string || '')

// Form data
const newPassword = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const success = ref(false)

// Password strength info
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
const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
  (v: string) => /[A-Z]/.test(v) || 'Password must contain an uppercase letter',
  (v: string) => /[a-z]/.test(v) || 'Password must contain a lowercase letter',
  (v: string) => /[0-9]/.test(v) || 'Password must contain a number',
  (v: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) || 'Password must contain a special character',
]

const confirmPasswordRules = [
  (v: string) => !!v || 'Please confirm your password',
  (v: string) => v === newPassword.value || 'Passwords do not match',
]

// Check if token exists
if (!token.value) {
  error.value = 'Invalid or missing reset token'
}

// Clear error
const clearError = () => {
  error.value = null
}

// Go to login
const goToLogin = () => {
  router.push('/login')
}

// Handle form submission
const handleSubmit = async () => {
  if (!token.value) {
    error.value = 'Invalid reset token'
    return
  }

  error.value = null
  loading.value = true

  try {
    const response = await $fetch('/api/auth/reset-password', {
      method: 'POST',
      body: {
        token: token.value,
        newPassword: newPassword.value,
      },
    })

    success.value = true

    // Redirect to login after 3 seconds
    setTimeout(() => {
      goToLogin()
    }, 3000)
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to reset password. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.fill-height {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.v-card {
  backdrop-filter: blur(10px);
}
</style>
