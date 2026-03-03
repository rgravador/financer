<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo -->
      <div class="logo">
        <div class="logo-box">A</div>
        <div class="logo-text">ASCENDENT</div>
      </div>

      <div class="login-title">Sign in to continue</div>

      <!-- Error Alert -->
      <div v-if="authStore.error" class="error-alert">
        {{ authStore.error }}
        <button class="close-btn" @click="authStore.clearError()">×</button>
      </div>

      <!-- Login Form -->
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label class="form-label">Email</label>
          <input
            v-model="email"
            type="email"
            class="form-input"
            :class="{ 'input-error': emailError }"
            placeholder="your.email@example.com"
            :disabled="authStore.loading"
          >
          <span v-if="emailError" class="field-error">{{ emailError }}</span>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <input
            v-model="password"
            type="password"
            class="form-input"
            :class="{ 'input-error': passwordError }"
            placeholder="••••••••"
            :disabled="authStore.loading"
          >
          <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
        </div>

        <div class="checkbox-group">
          <input v-model="rememberMe" type="checkbox" id="remember">
          <label for="remember">Remember me</label>
        </div>

        <button type="submit" class="submit-button" :disabled="authStore.loading">
          <span v-if="authStore.loading">Signing in...</span>
          <span v-else>Sign In</span>
        </button>

        <div class="forgot-password">
          <a href="#">Forgot password?</a>
        </div>
      </form>

      <!-- Demo Accounts -->
      <div class="demo-section">
        <div class="demo-title">Quick Access (Demo Accounts)</div>
        <div class="demo-chips">
          <button
            v-for="account in demoAccounts"
            :key="account.email"
            type="button"
            class="demo-chip"
            @click="fillDemoAccount(account)"
          >
            {{ account.label }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: false,
})

const authStore = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const emailError = ref('')
const passwordError = ref('')

const demoAccounts = [
  { label: 'System Admin', email: 'admin@ascendent.com', password: 'Admin@123' },
  { label: 'Tenant Admin', email: 'demo.admin@ascendent.com', password: 'Demo@123' },
  { label: 'Officer', email: 'demo.officer@ascendent.com', password: 'Demo@123' },
  { label: 'Approver', email: 'demo.approver@ascendent.com', password: 'Demo@123' },
]

const fillDemoAccount = (account: { email: string; password: string }) => {
  email.value = account.email
  password.value = account.password
}

const handleLogin = async () => {
  // Clear previous errors
  emailError.value = ''
  passwordError.value = ''
  authStore.clearError()

  // Basic validation
  if (!email.value) {
    emailError.value = 'Email is required'
    return
  }

  if (!password.value) {
    passwordError.value = 'Password is required'
    return
  }

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })

    // Redirect based on user role
    const role = authStore.userRole
    if (role === 'system_admin') {
      router.push('/system/dashboard')
    } else if (role === 'tenant_admin') {
      router.push('/admin/dashboard')
    } else if (role === 'tenant_officer') {
      router.push('/officer/dashboard')
    } else if (role === 'tenant_approver') {
      router.push('/approver/dashboard')
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Login failed:', error)
  }
}

// Redirect if already logged in
onMounted(() => {
  authStore.initAuth()
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
.login-page {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.login-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  padding: 48px;
  width: 100%;
  max-width: 420px;
}

.logo {
  text-align: center;
  margin-bottom: 32px;
}

.logo-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 16px;
  color: white;
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 16px;
}

.logo-text {
  font-size: 28px;
  font-weight: 700;
  color: #1e3a8a;
  letter-spacing: -0.5px;
}

.login-title {
  text-align: center;
  color: #6b7280;
  font-size: 16px;
  margin-bottom: 32px;
}

.error-alert {
  background: #fee2e2;
  color: #991b1b;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.close-btn {
  background: none;
  border: none;
  color: #991b1b;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 15px;
  transition: all 0.3s;
  font-family: inherit;
}

.form-input:focus {
  outline: none;
  border-color: #1e3a8a;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
}

.form-input.input-error {
  border-color: #ef4444;
}

.form-input:disabled {
  background: #f3f4f6;
  cursor: not-allowed;
}

.field-error {
  display: block;
  color: #ef4444;
  font-size: 13px;
  margin-top: 6px;
}

.checkbox-group {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
}

.checkbox-group input[type="checkbox"] {
  width: 18px;
  height: 18px;
  margin-right: 8px;
  accent-color: #1e3a8a;
}

.checkbox-group label {
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
}

.submit-button {
  width: 100%;
  padding: 14px;
  background: #1e3a8a;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.submit-button:hover:not(:disabled) {
  background: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 58, 138, 0.3);
}

.submit-button:disabled {
  background: #9ca3af;
  cursor: not-allowed;
  transform: none;
}

.forgot-password {
  text-align: center;
  margin-top: 24px;
}

.forgot-password a {
  color: #1e3a8a;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
}

.forgot-password a:hover {
  text-decoration: underline;
}

.demo-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e5e7eb;
}

.demo-title {
  text-align: center;
  color: #9ca3af;
  font-size: 12px;
  margin-bottom: 12px;
}

.demo-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}

.demo-chip {
  padding: 6px 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.demo-chip:hover {
  background: #e5e7eb;
  border-color: #1e3a8a;
}
</style>
