<template>
  <v-container class="fill-height flat-auth-container" fluid>
    <v-row align="center" justify="center" class="ma-0">
      <v-col cols="12" sm="8" md="5" lg="4" class="pa-8">
        <!-- Header -->
        <div class="text-center mb-10">
          <h1 class="text-h3 font-weight-bold text-white mb-3">LoanStar</h1>
          <p class="text-body-1 text-grey-lighten-1">Lending Management System</p>
        </div>

        <!-- Login Form -->
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleLogin">
          <v-text-field
            v-model="form.email"
            label="Email"
            type="email"
            prepend-inner-icon="mdi-email"
            :rules="[rules.required, rules.email]"
            variant="outlined"
            flat
            bg-color="rgba(255, 255, 255, 0.15)"
            color="white"
            class="mb-4 white-input"
            hide-details="auto"
            density="comfortable"
            autocomplete="username"
          />

          <v-text-field
            v-model="form.password"
            label="Password"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required]"
            variant="outlined"
            flat
            bg-color="rgba(255, 255, 255, 0.15)"
            color="white"
            class="mb-4 white-input"
            hide-details="auto"
            density="comfortable"
            autocomplete="current-password"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4 error-alert">
            {{ error }}
          </v-alert>

          <v-btn
            type="submit"
            color="white"
            size="x-large"
            block
            flat
            :loading="loading"
            :disabled="!formValid"
            class="mb-6 text-none font-weight-bold login-btn"
          >
            Login
          </v-btn>

          <div class="d-flex justify-space-between align-center">
            <v-btn variant="text" size="small" to="/auth/reset-password" class="text-none text-white">
              Forgot Password?
            </v-btn>
            <v-btn variant="text" size="small" to="/auth/signup" class="text-none text-white">
              Sign Up
            </v-btn>
          </div>
        </v-form>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})

const formRef = ref()
const formValid = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

const form = reactive({
  email: '',
  password: ''
})

const rules = {
  required: (v: string) => !!v || 'Field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
}

const { login, isAdmin } = useAuth()
const router = useRouter()

const handleLogin = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  error.value = ''

  const result = await login(form.email, form.password)

  if (result.success) {
    // Redirect based on role
    if (isAdmin.value) {
      router.push('/admin/dashboard')
    } else {
      router.push('/dashboard')
    }
  } else {
    error.value = result.error || 'Login failed'
  }

  loading.value = false
}
</script>

<style scoped>
.flat-auth-container {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
  min-height: 100vh;
}

.flat-auth-container .v-col {
  background: transparent;
  border-radius: 0;
  max-width: 450px;
}

/* White input styling */
:deep(.white-input .v-field) {
  background-color: rgba(255, 255, 255, 0.15) !important;
}

:deep(.white-input .v-field__input) {
  color: white !important;
  opacity: 1;
}

:deep(.white-input .v-field__input::placeholder) {
  color: rgba(255, 255, 255, 0.5) !important;
}

:deep(.white-input .v-label) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.white-input .v-field--focused .v-label) {
  color: white !important;
}

:deep(.white-input .v-field__prepend-inner),
:deep(.white-input .v-field__append-inner) {
  color: rgba(255, 255, 255, 0.8) !important;
}

:deep(.white-input .v-messages__message) {
  color: rgba(255, 255, 255, 0.8);
}

/* Login button */
.login-btn {
  background: white !important;
  color: #1a1a2e !important;
  letter-spacing: 0.5px;
}

.login-btn:hover {
  background: rgba(255, 255, 255, 0.9) !important;
}

/* Error alert */
:deep(.error-alert) {
  background-color: rgba(244, 67, 54, 0.2) !important;
  color: white !important;
}

:deep(.error-alert .v-alert__content) {
  color: white !important;
}

@media (max-width: 600px) {
  .flat-auth-container .v-col {
    border-radius: 0;
    height: 100vh;
  }
}
</style>
