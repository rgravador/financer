<template>
  <v-container class="fill-height flat-auth-container" fluid>
    <v-row align="center" justify="center" class="ma-0">
      <v-col cols="12" sm="10" md="6" lg="5" class="pa-8">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-h3 font-weight-bold text-white mb-3">Create Account</h1>
          <p class="text-body-1 text-grey-lighten-1">Join LoanStar</p>
        </div>

        <!-- Signup Form -->
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSignup">
          <v-text-field
            v-model="form.full_name"
            label="Full Name"
            prepend-inner-icon="mdi-account"
            :rules="[rules.required]"
            variant="outlined"
            flat
            color="white"
            class="mb-4 white-input"
            hide-details="auto"
            density="comfortable"
            autocomplete="off"
          />

          <v-text-field
            v-model="form.email"
            label="Email"
            type="email"
            prepend-inner-icon="mdi-email"
            :rules="[rules.required, rules.email]"
            variant="outlined"
            flat
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
            :rules="[rules.required, rules.password]"
            variant="outlined"
            flat
            color="white"
            class="mb-4 white-input"
            hide-details="auto"
            density="comfortable"
            autocomplete="new-password"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-text-field
            v-model="form.confirmPassword"
            label="Confirm Password"
            :type="showConfirmPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock-check"
            :append-inner-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required, rules.passwordMatch]"
            variant="outlined"
            flat
            color="white"
            class="mb-4 white-input"
            hide-details="auto"
            density="comfortable"
            autocomplete="new-password"
            @click:append-inner="showConfirmPassword = !showConfirmPassword"
          />

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4 error-alert">
            {{ error }}
          </v-alert>

          <v-alert v-if="success" type="success" variant="tonal" class="mb-4 success-alert">
            Account created successfully! Redirecting to login...
          </v-alert>

          <v-btn
            type="submit"
            color="white"
            size="x-large"
            block
            flat
            :loading="loading"
            :disabled="!formValid"
            class="mb-6 text-none font-weight-bold signup-btn"
          >
            Sign Up
          </v-btn>

          <div class="text-center">
            <span class="text-body-2 text-grey-lighten-1">Already have an account?</span>
            <v-btn variant="text" size="small" to="/auth/login" class="text-none text-white ml-1">
              Login
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
const showConfirmPassword = ref(false)
const loading = ref(false)
const error = ref('')
const success = ref(false)

const form = reactive({
  full_name: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'agent' as 'admin' | 'agent'
})

const rules = {
  required: (v: string) => !!v || 'Field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid',
  password: (v: string) => v.length >= 6 || 'Password must be at least 6 characters',
  passwordMatch: (v: string) => v === form.password || 'Passwords must match'
}

const { signup } = useAuth()
const router = useRouter()

const handleSignup = async () => {
  if (!formRef.value) return

  const { valid } = await formRef.value.validate()
  if (!valid) return

  loading.value = true
  error.value = ''
  success.value = false

  const result = await signup({
    email: form.email,
    password: form.password,
    full_name: form.full_name,
    role: form.role
  })

  if (result.success) {
    success.value = true
    setTimeout(() => {
      router.push('/auth/login')
    }, 2000)
  } else {
    error.value = result.error || 'Signup failed'
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
  max-width: 550px;
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

/* Signup button */
.signup-btn {
  background: white !important;
  color: #1a1a2e !important;
  letter-spacing: 0.5px;
}

.signup-btn:hover {
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

/* Success alert */
:deep(.success-alert) {
  background-color: rgba(76, 175, 80, 0.2) !important;
  color: white !important;
}

:deep(.success-alert .v-alert__content) {
  color: white !important;
}

@media (max-width: 600px) {
  .flat-auth-container .v-col {
    border-radius: 0;
    min-height: 100vh;
  }
}
</style>
