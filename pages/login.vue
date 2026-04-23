<template>
  <div class="login-page">
    <!-- Decorative Background Elements -->
    <div class="bg-decoration" aria-hidden="true">
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
          role="alert"
          @click:close="authStore.clearError()"
        >
          {{ authStore.error }}
        </v-alert>

        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form" aria-label="Sign in">
          <div class="form-group">
            <label for="email-input" class="form-label">Email address</label>
            <div class="input-wrapper" :class="{ 'input-focused': emailFocused, 'input-error': emailError }">
              <v-icon class="input-icon" aria-hidden="true">mdi-email-outline</v-icon>
              <input
                id="email-input"
                v-model="email"
                type="email"
                class="form-input"
                placeholder="you@company.com"
                autocomplete="email"
                :disabled="authStore.loading"
                :aria-invalid="!!emailError"
                :aria-describedby="emailError ? 'email-error' : undefined"
                @focus="emailFocused = true"
                @blur="emailFocused = false"
              >
            </div>
            <span v-if="emailError" id="email-error" class="field-error" role="alert">{{ emailError }}</span>
          </div>

          <div class="form-group">
            <label for="password-input" class="form-label">Password</label>
            <div class="input-wrapper" :class="{ 'input-focused': passwordFocused, 'input-error': passwordError }">
              <v-icon class="input-icon" aria-hidden="true">mdi-lock-outline</v-icon>
              <input
                id="password-input"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                placeholder="Enter your password"
                autocomplete="current-password"
                :disabled="authStore.loading"
                :aria-invalid="!!passwordError"
                :aria-describedby="passwordError ? 'password-error' : undefined"
                @focus="passwordFocused = true"
                @blur="passwordFocused = false"
              >
              <button
                type="button"
                class="toggle-password"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <v-icon>{{ showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline' }}</v-icon>
              </button>
            </div>
            <span v-if="passwordError" id="password-error" class="field-error" role="alert">{{ passwordError }}</span>
          </div>

          <div class="form-options">
            <label class="checkbox-label">
              <input v-model="rememberMe" type="checkbox" class="checkbox-input">
              <span class="checkbox-custom" aria-hidden="true"></span>
              <span class="checkbox-text">Remember me</span>
            </label>
            <a href="#" class="forgot-link" aria-label="Forgot your password?">Forgot password?</a>
          </div>

          <button type="submit" class="submit-button" :disabled="authStore.loading" aria-label="Sign in to your account">
            <span v-if="authStore.loading" class="loading-state">
              <v-progress-circular indeterminate size="20" width="2" color="white" aria-hidden="true" />
              <span>Signing in...</span>
            </span>
            <span v-else class="button-content">
              Sign in
              <v-icon size="20" aria-hidden="true">mdi-arrow-right</v-icon>
            </span>
          </button>
        </form>

        <!-- Demo Accounts -->
        <div class="demo-section">
          <div class="demo-divider">
            <span class="demo-divider-text">Quick Access</span>
          </div>
          <div class="demo-chips" role="group" aria-label="Demo account credentials">
            <button
              v-for="account in demoAccounts"
              :key="account.email"
              type="button"
              class="demo-chip"
              :class="getDemoChipClass(account.label)"
              :aria-label="`Sign in as ${account.label}`"
              @click="fillDemoAccount(account)"
            >
              <v-icon size="16" class="chip-icon" aria-hidden="true">{{ getDemoIcon(account.label) }}</v-icon>
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
    <div class="section-divider" aria-hidden="true"></div>

    <!-- Right Section - Branding -->
    <div class="branding-section" aria-hidden="true">
      <div class="branding-content">
        <!-- Logo & Brand -->
        <div class="brand-header">
          <img src="/logo-transparent.png" alt="" class="brand-logo" />
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
  { label: 'Officer', email: 'demo.officer@ascendent.com', password: 'Officer@123' },
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
  } catch {
    // Auth store handles error state via authStore.error
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
/* ============================================================================
   LOGIN PAGE — Custom Color Tokens
   This page uses a fixed dark theme (not switchable) so we define
   page-scoped tokens referencing the global :root palette where possible.
   ============================================================================ */
.login-page {
  /* Page-scoped color tokens (referencing :root vars where available) */
  --login-bg-dark: var(--color-slate-950, #0f172a);
  --login-bg-medium: var(--color-slate-900, #1e293b);
  --login-bg-input: var(--color-slate-900, #1e293b);
  --login-border: var(--color-slate-800, #334155);
  --login-border-hover: var(--color-slate-700, #475569);
  --login-text-primary: #ffffff;
  --login-text-secondary: var(--color-slate-500, #94a3b8);
  --login-text-muted: var(--color-slate-600, #64748b);
  --login-text-label: var(--color-slate-300, #e2e8f0);
  --login-accent: var(--color-amber-400, #fbbf24);
  --login-primary: var(--color-info, #3b82f6);
  --login-primary-dark: #2563eb;
  --login-primary-light: #60a5fa;
  --login-primary-lighter: #93c5fd;
  --login-error: var(--color-error, #ef4444);

  min-height: 100vh;
  display: flex;
  background: linear-gradient(135deg, var(--login-bg-dark) 0%, #1e3a8a 50%, #1e40af 100%);
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
  font-family: var(--font-display, 'Sora', sans-serif);
  font-size: 24px;
  font-weight: 700;
  color: var(--login-text-primary);
}

/* Welcome Section */
.welcome-section {
  margin-bottom: 32px;
}

.welcome-title {
  font-family: var(--font-display, 'Sora', sans-serif);
  font-size: 28px;
  font-weight: 700;
  color: var(--login-text-primary);
  margin: 0 0 8px 0;
  letter-spacing: -0.02em;
}

.welcome-subtitle {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 15px;
  color: var(--login-text-secondary);
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
  font-family: var(--font-display, 'Sora', sans-serif);
  font-size: 32px;
  font-weight: 700;
  color: var(--login-text-primary);
  letter-spacing: -0.02em;
  margin: 0;
}

.brand-tagline {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 13px;
  font-weight: 600;
  color: var(--login-accent);
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

/* Main Headline */
.brand-headline {
  margin-bottom: 48px;
}

.headline-text {
  font-family: var(--font-display, 'Sora', sans-serif);
  font-size: 36px;
  font-weight: 700;
  color: var(--login-text-primary);
  line-height: 1.2;
  margin: 0 0 16px 0;
  letter-spacing: -0.02em;
}

.headline-sub {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
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
  color: var(--login-accent);
  flex-shrink: 0;
}

.feature-text h4 {
  font-family: var(--font-display, 'Sora', sans-serif);
  font-size: 15px;
  font-weight: 600;
  color: var(--login-text-primary);
  margin: 0 0 4px 0;
}

.feature-text p {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
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
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
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
  font-family: var(--font-display, 'Sora', sans-serif);
  font-size: 28px;
  font-weight: 700;
  color: var(--login-text-primary);
}

.stat-label {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
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
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 14px;
  font-weight: 600;
  color: var(--login-text-label);
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 2px solid var(--login-border);
  border-radius: 12px;
  background: var(--login-bg-input);
  transition: all 0.2s ease;
}

.input-wrapper:focus-within {
  border-color: var(--login-primary);
  background: var(--login-bg-dark);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.input-wrapper.input-focused {
  border-color: var(--login-primary);
  background: var(--login-bg-dark);
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
}

.input-wrapper.input-error {
  border-color: var(--login-error);
  background: rgba(239, 68, 68, 0.1);
}

.input-icon {
  color: var(--login-text-muted);
  flex-shrink: 0;
}

.input-focused .input-icon {
  color: var(--login-primary);
}

.form-input {
  flex: 1;
  border: none;
  background: transparent;
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 15px;
  color: var(--login-text-primary);
  outline: none;
}

.form-input::placeholder {
  color: var(--login-text-muted);
}

.form-input:-webkit-autofill,
.form-input:-webkit-autofill:hover,
.form-input:-webkit-autofill:focus {
  -webkit-box-shadow: 0 0 0 1000px var(--login-bg-input) inset;
  -webkit-text-fill-color: var(--login-text-primary);
  caret-color: var(--login-text-primary);
}

.form-input:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.toggle-password {
  background: none;
  border: none;
  padding: 4px;
  color: var(--login-text-muted);
  cursor: pointer;
  transition: color 0.2s;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.toggle-password:hover {
  color: var(--login-text-secondary);
}

.toggle-password:focus-visible {
  outline: 2px solid var(--login-primary);
  outline-offset: 2px;
}

.field-error {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 13px;
  color: var(--login-error);
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
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid var(--login-border-hover);
  border-radius: 6px;
  transition: all 0.2s;
  position: relative;
  background: var(--login-bg-input);
}

.checkbox-input:focus-visible + .checkbox-custom {
  outline: 2px solid var(--login-primary);
  outline-offset: 2px;
}

.checkbox-input:checked + .checkbox-custom {
  background: var(--login-primary);
  border-color: var(--login-primary);
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
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 14px;
  color: var(--login-text-secondary);
}

.forgot-link {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 14px;
  font-weight: 500;
  color: var(--login-primary-light);
  text-decoration: none;
  transition: color 0.2s;
  border-radius: 4px;
  padding: 2px 4px;
  margin: -2px -4px;
}

.forgot-link:hover {
  color: var(--login-primary-lighter);
  text-decoration: underline;
}

.forgot-link:focus-visible {
  outline: 2px solid var(--login-primary);
  outline-offset: 2px;
}

/* Submit Button */
.submit-button {
  width: 100%;
  padding: 16px 24px;
  background: linear-gradient(135deg, var(--login-primary) 0%, var(--login-primary-dark) 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: var(--font-display, 'Sora', sans-serif);
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

.submit-button:focus-visible {
  outline: 2px solid var(--login-primary-lighter);
  outline-offset: 2px;
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
  background: var(--login-border);
}

.demo-divider-text {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 12px;
  font-weight: 500;
  color: var(--login-text-muted);
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
  background: var(--login-bg-medium);
  border: 1px solid var(--login-border);
  border-radius: 10px;
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 13px;
  font-weight: 500;
  color: var(--login-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.demo-chip:hover {
  background: var(--login-bg-dark);
  border-color: var(--login-primary);
  color: var(--login-primary-light);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.demo-chip:focus-visible {
  outline: 2px solid var(--login-primary);
  outline-offset: 2px;
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
  border-color: var(--login-accent);
  color: var(--login-accent);
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.2);
}

/* Footer */
.login-footer {
  margin-top: 40px;
  text-align: center;
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 13px;
  color: var(--login-text-muted);
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
