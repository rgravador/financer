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
                    mdi-finance
                  </v-icon>
                  <span>Ascendent</span>
                </div>
              </v-card-title>

              <v-card-subtitle class="text-center pb-4">
                Sign in to your account
              </v-card-subtitle>

              <v-card-text>
                <v-form ref="loginForm" @submit.prevent="handleLogin">
                  <v-text-field
                    v-model="email"
                    label="Email"
                    type="email"
                    variant="outlined"
                    prepend-inner-icon="mdi-email"
                    :rules="emailRules"
                    :disabled="loading"
                    autocomplete="email"
                    class="mb-3"
                  />

                  <v-text-field
                    v-model="password"
                    label="Password"
                    :type="showPassword ? 'text' : 'password'"
                    variant="outlined"
                    prepend-inner-icon="mdi-lock"
                    :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                    :rules="passwordRules"
                    :disabled="loading"
                    autocomplete="current-password"
                    @click:append-inner="showPassword = !showPassword"
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
                    Sign In
                  </v-btn>

                  <div class="text-center">
                    <v-btn
                      variant="text"
                      size="small"
                      color="primary"
                      :disabled="loading"
                      @click="showDemoAccounts = !showDemoAccounts"
                    >
                      {{ showDemoAccounts ? 'Hide' : 'Show' }} Demo Accounts
                    </v-btn>
                  </div>
                </v-form>

                <v-expand-transition>
                  <v-card
                    v-if="showDemoAccounts"
                    variant="tonal"
                    color="info"
                    class="mt-4"
                  >
                    <v-card-title class="text-subtitle-1">
                      Demo Accounts
                    </v-card-title>
                    <v-card-text>
                      <v-list density="compact" class="bg-transparent">
                        <v-list-item
                          v-for="account in demoAccounts"
                          :key="account.email"
                          class="px-0"
                          @click="fillDemoAccount(account)"
                        >
                          <template #prepend>
                            <v-icon>{{ account.icon }}</v-icon>
                          </template>
                          <v-list-item-title class="text-body-2">
                            {{ account.label }}
                          </v-list-item-title>
                          <v-list-item-subtitle class="text-caption">
                            {{ account.email }}
                          </v-list-item-subtitle>
                        </v-list-item>
                      </v-list>
                    </v-card-text>
                  </v-card>
                </v-expand-transition>
              </v-card-text>
            </v-card>

            <v-card variant="tonal" class="mt-4 text-center pa-4">
              <div class="text-caption text-medium-emphasis">
                For testing: Use demo accounts or contact your administrator
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
import { useAuthStore } from '~/stores/auth'

// Define page meta to prevent authenticated users from accessing login
definePageMeta({
  layout: false,
})

const authStore = useAuthStore()
const router = useRouter()

// Form data
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)
const showDemoAccounts = ref(false)

// Demo accounts for testing
const demoAccounts = [
  {
    label: 'System Admin',
    email: 'admin@ascendent.com',
    password: 'Admin@123',
    icon: 'mdi-shield-account',
  },
  {
    label: 'Tenant Admin',
    email: 'demo.admin@ascendent.com',
    password: 'Demo@123',
    icon: 'mdi-account-tie',
  },
  {
    label: 'Loan Officer',
    email: 'demo.officer@ascendent.com',
    password: 'Officer@123',
    icon: 'mdi-account-cash',
  },
  {
    label: 'Approver',
    email: 'demo.approver@ascendent.com',
    password: 'Approver@123',
    icon: 'mdi-account-check',
  },
]

// Validation rules
const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
]

// Fill demo account credentials
const fillDemoAccount = (account: typeof demoAccounts[0]) => {
  email.value = account.email
  password.value = account.password
  showDemoAccounts.value = false
}

// Clear error
const clearError = () => {
  error.value = null
  authStore.clearError()
}

// Handle login
const handleLogin = async () => {
  error.value = null
  loading.value = true

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })

    // Redirect based on user role
    const role = authStore.currentUser?.role
    const redirections = new Map([
      ['system_admin', '/system/dashboard'],
      ['tenant_admin', '/admin/dashboard'],
      ['tenant_officer', '/officer/dashboard'],
      ['tenant_approver', '/approver/dashboard'],
    ])

    const redirectPath = redirections.get(role) || '/'
    router.push(redirectPath)
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Login failed. Please try again.'
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
