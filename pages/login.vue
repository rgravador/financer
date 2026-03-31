<template>
  <div class="login-page">
    <!-- Decorative Background Elements -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-circle bg-circle-3"></div>
    </div>

    <!-- Left Section - Login Form -->
    <div class="login-section">
      <div class="login-container">
        <!-- Mobile Logo (hidden on desktop) -->
        <div class="mobile-logo">
          <img src="/logo-transparent.png" alt="Ascendent" class="mobile-logo-img" />
          <span class="mobile-brand-name">Ascendent</span>
        </div>

        <!-- Welcome -->
        <div class="welcome-section">
          <h1 class="welcome-title">Welcome back</h1>
          <p class="welcome-subtitle">Sign in to continue to your dashboard</p>
        </div>

        <!-- Error Alert -->
        <v-alert
          v-if="authStore.error"
          type="error"
          variant="tonal"
          closable
          class="mb-6 error-alert"
          @click:close="authStore.clearError()"
        >
          {{ authStore.error }}
        </v-alert>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label class="form-label">Email address</label>
            <div class="input-wrapper" :class="{ 'input-focused': emailFocused, 'input-error': emailError }">
              <v-icon class="input-icon">mdi-email-outline</v-icon>
              <input
                v-model="email"
                type="email"
                class="form-input"
                placeholder="you@company.com"
                :disabled="authStore.loading"
                @focus="emailFocused = true"
                @blur="emailFocused = false"
              >
            </div>
            <span v-if="emailError" class="field-error">{{ emailError }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Password</label>
            <div class="input-wrapper" :class="{ 'input-focused': passwordFocused, 'input-error': passwordError }">
              <v-icon class="input-icon">mdi-lock-outline</v-icon>
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Enter your password"
                :disabled="authStore.loading"
                @focus="passwordFocused = true"
                @blur="passwordFocused = false"
              >
              <v-icon
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                {{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}
              </v-icon>
            </div>
            <span v-if="passwordError" class="field-error">{{ passwordError }}</span>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input v-model="rememberMe" type="checkbox" class="checkbox-input">
              <span class="checkbox-custom"></span>
              <span class="checkbox-text">Remember me</span>
            </label>
            <a href="#" class="forgot-link">Forgot password?</a>
          </div>

          <button type="submit" class="submit-button" :disabled="authStore.loading">
            <span v-if="authStore.loading" class="loading-state">
              <v-progress-circular indeterminate size="20" width="2" color="white" />
              <span>Signing in...</span>
            </span>
            <span v-else class="button-content">
              Sign in
              <v-icon size="20">mdi-arrow-right</v-icon>
            </span>
          </button>
        </form>

        <!-- Demo Accounts -->
        <div class="demo-section">
          <div class="demo-divider">
            <span class="demo-divider-text">Quick Access</span>
          </div>
          <div class="demo-chips">
            <button
              v-for="account in demoAccounts"
              :key="account.email"
              type="button"
              class="demo-chip"
              :class="getDemoChipClass(account.label)"
              @click="fillDemoAccount(account)"
            >
              <v-icon size="16" class="chip-icon">{{ getDemoIcon(account.label) }}</v-icon>
              {{ account.label }}
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="login-footer">
          <span>&copy; {{ currentYear }} Ascendent. All rights reserved.</span>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="section-divider"></div>

    <!-- Right Section - Branding -->
    <div class="branding-section">
      <div class="branding-content">
        <!-- Logo & Brand -->
        <div class="brand-header">
          <img src="/logo-transparent.png" alt="Ascendent" class="brand-logo" />
          <div class="brand-info">
            <h1 class="brand-name">Ascendent</h1>
            <span class="brand-tagline">Lending Platform</span>
          </div>
        </div>

        <!-- Main Headline -->
        <div class="brand-headline">
          <h2 class="headline-text">Empowering Financial Growth Through Smart Lending</h2>
          <p class="headline-sub">A modern multi-tenant platform designed to streamline your lending operations from application to disbursement.</p>
        </div>

        <!-- Features -->
        <div class="brand-features">
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="24">mdi-lightning-bolt</v-icon>
            </div>
            <div class="feature-text">
              <h4>Fast Processing</h4>
              <p>Streamlined workflows for quick loan approvals</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="24">mdi-shield-check</v-icon>
            </div>
            <div class="feature-text">
              <h4>Secure & Compliant</h4>
              <p>Enterprise-grade security for your peace of mind</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="24">mdi-chart-line</v-icon>
            </div>
            <div class="feature-text">
              <h4>Real-time Analytics</h4>
              <p>Data-driven insights to optimize operations</p>
            </div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">
              <v-icon size="24">mdi-account-group</v-icon>
            </div>
            <div class="feature-text">
              <h4>Multi-tenant Ready</h4>
              <p>Scale across multiple organizations seamlessly</p>
            </div>
          </div>
        </div>

        <!-- Trust Badge -->
        <div class="trust-section">
          <p class="trust-text">Trusted by lending institutions nationwide</p>
          <div class="trust-stats">
            <div class="stat-item">
              <span class="stat-value">500+</span>
              <span class="stat-label">Active Users</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">₱50M+</span>
              <span class="stat-label">Loans Processed</span>
            </div>
            <div class="stat-divider"></div>
            <div class="stat-item">
              <span class="stat-value">99.9%</span>
              <span class="stat-label">Uptime</span>
            </div>
          </div>
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
const showPassword = ref(false)
const emailError = ref('')
const passwordError = ref('')
const emailFocused = ref(false)
const passwordFocused = ref(false)

const currentYear = new Date().getFullYear()

const demoAccounts = [
  { label: 'System Admin', email: 'admin@ascendent.com', password: 'Admin@123' },
  { label: 'Tenant Admin', email: 'admin@fral.com', password: 'Just1234!' },
  { label: 'Officer', email: 'redgiegravador@gmail.com', password: 'Just1234!' },
  { label: 'Approver', email: 'demo.approver@ascendent.com', password: 'Demo@123' },
]

const getDemoIcon = (label: string) => {
  const icons: Record<string, string> = {
    'System Admin': 'mdi-shield-crown',
    'Tenant Admin': 'mdi-account-cog',
    'Officer': 'mdi-account-tie',
    'Approver': 'mdi-account-check',
  }
  return icons[label] || 'mdi-account'
}

const getDemoChipClass = (label: string) => {
  const classes: Record<string, string> = {
    'System Admin': 'chip-system',
    'Tenant Admin': 'chip-admin',
    'Officer': 'chip-officer',
    'Approver': 'chip-approver',
  }
  return classes[label] || ''
}

const fillDemoAccount = (account: { email: string; password: string }) => {
  email.value = account.email
  password.value = account.password
}

const handleLogin = async () => {
  emailError.value = ''
  passwordError.value = ''
  authStore.clearError()

  if (!email.value) {
    emailError.value = 'Please enter your email address'
    return
  }

  if (!password.value) {
    passwordError.value = 'Please enter your password'
    return
  }

  try {
    await authStore.login({
      email: email.value,
      password: password.value,
    })

    const role = authStore.userRole
    if (role === 'system_admin') {
      router.push('/system/dashboard')
    } else if (role === 'tenant_admin') {
      router.push('/tenant/dashboard')
    } else if (role === 'tenant_officer') {
      router.push('/officer/applications')
    } else if (role === 'tenant_approver') {
      router.push('/approver/queue')
    } else {
      router.push('/')
    }
  } catch (error) {
    console.error('Login failed:', error)
  }
}

onMounted(() => {
  authStore.initAuth()
  if (authStore.isAuthenticated) {
    router.push('/')
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1e40af 100%);
  position: relative;
  overflow: hidden;
}

/* Left Section - Login Form */
.login-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  position: relative;
}

.login-container {
  width: 100%;
  max-width: 420px;
  position: relative;
  z-index: 1;
}

/* Mobile Logo (hidden on desktop) */
.mobile-logo {
  display: none;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 32px;
}

.mobile-logo-img {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.mobile-brand-name {
  font-family: 'Sora', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
}

/* Welcome Section */
.welcome-section {
  margin-bottom: 32px;
}

.welcome-title {
  font-family: 'Sora', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  color: #94a3b8;
  margin: 0;
}

/* Section Divider */
.section-divider {
  width: 1px;
  align-self: stretch;
  background: linear-gradient(180deg, transparent 0%, rgba(255, 255, 255, 0.2) 20%, rgba(255, 255, 255, 0.2) 80%, transparent 100%);
  position: relative;
  z-index: 1;
}

/* Right Section - Branding */
.branding-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px;
  position: relative;
}

/* Decorative Background */
.bg-decoration {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  background: linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%);
  animation: float 20s ease-in-out infinite;
}

.bg-circle-1 {
  width: 500px;
  height: 500px;
  top: -150px;
  right: -100px;
  animation-delay: 0s;
}

.bg-circle-2 {
  width: 350px;
  height: 350px;
  bottom: -80px;
  left: -80px;
  animation-delay: -7s;
}

.bg-circle-3 {
  width: 250px;
  height: 250px;
  top: 40%;
  left: 5%;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  50% { transform: translateY(-20px) rotate(3deg); }
}

.branding-content {
  position: relative;
  z-index: 1;
  max-width: 500px;
  color: white;
}

/* Brand Header */
.brand-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 48px;
}

.brand-logo {
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.brand-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-name {
  font-family: 'Sora', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: -0.02em;
  margin: 0;
}

.brand-tagline {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 600;
  color: #fbbf24;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

/* Main Headline */
.brand-headline {
  margin-bottom: 48px;
}

.headline-text {
  font-family: 'Sora', sans-serif;
  font-size: 36px;
  font-weight: 700;
  color: #ffffff;
  line-height: 1.2;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
}

.headline-sub {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.6;
  margin: 0;
}

/* Features */
.brand-features {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 48px;
}

.feature-item {
  display: flex;
  gap: 14px;
}

.feature-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fbbf24;
  flex-shrink: 0;
}

.feature-text h4 {
  font-family: 'Sora', sans-serif;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 4px 0;
}

.feature-text p {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.4;
}

/* Trust Section */
.trust-section {
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.trust-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 20px 0;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.trust-stats {
  display: flex;
  align-items: center;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-value {
  font-family: 'Sora', sans-serif;
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
}

.stat-label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.15);
}

/* Error Alert */
.error-alert {
  border-radius: 12px;
}

/* Form Styles */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid #334155;
  border-radius: 12px;
  background: #1e293b;
  transition: all 0.2s ease;
}

.input-wrapper.input-focused {
  border-color: #3b82f6;
  background: #0f172a;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.input-wrapper.input-error {
  border-color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.input-icon {
  color: #64748b;
  flex-shrink: 0;
}

.input-focused .input-icon {
  color: #3b82f6;
}

.form-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 15px;
  color: #ffffff;
  outline: none;
}

.form-input::placeholder {
  color: #64748b;
}

.form-input:-webkit-autofill,
.form-input:-webkit-autofill:hover,
.form-input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px #1e293b inset;
  -webkit-text-fill-color: #ffffff;
  caret-color: #ffffff;
}

.form-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.toggle-password {
  color: #64748b;
  cursor: pointer;
  transition: color 0.2s;
}

.toggle-password:hover {
  color: #94a3b8;
}

.field-error {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  color: #ef4444;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Form Options */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-input {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #475569;
  border-radius: 6px;
  transition: all 0.2s;
  position: relative;
  background: #1e293b;
}

.checkbox-input:checked + .checkbox-custom {
  background: #3b82f6;
  border-color: #3b82f6;
}

.checkbox-input:checked + .checkbox-custom::after {
  content: '';
  position: absolute;
  left: 6px;
  top: 2px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.checkbox-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  color: #94a3b8;
}

.forgot-link {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: #60a5fa;
  text-decoration: none;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #93c5fd;
  text-decoration: underline;
}

/* Submit Button */
.submit-button {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: 'Sora', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.5);
}

.submit-button:active:not(:disabled) {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

/* Demo Section */
.demo-section {
  margin-top: 32px;
}

.demo-divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.demo-divider::before,
.demo-divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #334155;
}

.demo-divider-text {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.demo-chips {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.demo-chip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: #94a3b8;
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-chip:hover {
  background: #0f172a;
  border-color: #3b82f6;
  color: #60a5fa;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.chip-icon {
  opacity: 0.8;
}

.demo-chip:hover .chip-icon {
  opacity: 1;
  color: inherit;
}

.chip-system:hover {
  border-color: #a78bfa;
  color: #a78bfa;
  box-shadow: 0 4px 12px rgba(167, 139, 250, 0.2);
}

.chip-admin:hover {
  border-color: #22d3ee;
  color: #22d3ee;
  box-shadow: 0 4px 12px rgba(34, 211, 238, 0.2);
}

.chip-officer:hover {
  border-color: #34d399;
  color: #34d399;
  box-shadow: 0 4px 12px rgba(52, 211, 153, 0.2);
}

.chip-approver:hover {
  border-color: #fbbf24;
  color: #fbbf24;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}

/* Footer */
.login-footer {
  margin-top: 40px;
  text-align: center;
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 13px;
  color: #64748b;
}

/* Responsive - Tablet */
@media (max-width: 1024px) {
  .branding-section {
    padding: 40px;
  }

  .headline-text {
    font-size: 28px;
  }

  .brand-features {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .trust-stats {
    flex-wrap: wrap;
    gap: 24px;
  }

  .stat-divider {
    display: none;
  }
}

/* Responsive - Mobile */
@media (max-width: 768px) {
  .login-page {
    flex-direction: column;
  }

  .section-divider {
    display: none;
  }

  .branding-section {
    display: none;
  }

  .login-section {
    padding: 24px;
  }

  .mobile-logo {
    display: flex;
  }

  .welcome-title {
    font-size: 24px;
  }

  .demo-chips {
    grid-template-columns: 1fr;
  }
}

/* Responsive - Small Mobile */
@media (max-width: 480px) {
  .login-section {
    padding: 20px;
  }

  .welcome-title {
    font-size: 22px;
  }

  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>
