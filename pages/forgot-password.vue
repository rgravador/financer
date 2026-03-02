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
                    mdi-lock-reset
                  </v-icon>
                  <span>Reset Password</span>
                </div>
              </v-card-title>

              <v-card-subtitle class="text-center pb-4">
                Enter your email address and we'll send you instructions to reset your password
              </v-card-subtitle>

              <v-card-text>
                <v-form v-if="!submitted" ref="forgotPasswordForm" @submit.prevent="handleSubmit">
                  <v-text-field
                    v-model="email"
                    label="Email Address"
                    type="email"
                    variant="outlined"
                    prepend-inner-icon="mdi-email"
                    :rules="emailRules"
                    :disabled="loading"
                    autocomplete="email"
                    class="mb-3"
                  />

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
                    Send Reset Instructions
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
                  <v-alert-title>Check Your Email</v-alert-title>
                  <div>
                    If an account exists with the email <strong>{{ email }}</strong>,
                    you will receive password reset instructions shortly.
                  </div>
                  <div class="mt-3">
                    <small>Didn't receive the email? Check your spam folder or try again in a few minutes.</small>
                  </div>
                </v-alert>

                <v-btn
                  v-if="submitted"
                  color="primary"
                  variant="outlined"
                  block
                  @click="goToLogin"
                >
                  Return to Login
                </v-btn>
              </v-card-text>
            </v-card>

            <v-card variant="tonal" class="mt-4 text-center pa-4">
              <div class="text-caption text-medium-emphasis">
                Need help? Contact your administrator
              </div>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: false,
})

const router = useRouter()

// Form data
const email = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const submitted = ref(false)

// Validation rules
const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
]

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
  error.value = null
  loading.value = true

  try {
    const response = await $fetch('/api/auth/forgot-password', {
      method: 'POST',
      body: {
        email: email.value,
      },
    })

    submitted.value = true
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'An error occurred. Please try again.'
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
