<template>
  <v-container class="fill-height flat-auth-container" fluid>
    <v-row align="center" justify="center" class="ma-0">
      <v-col cols="12" sm="8" md="5" lg="4" class="pa-8">
        <!-- Header -->
        <div class="text-center mb-10">
          <h1 class="text-h3 font-weight-bold mb-3">
            Financer
          </h1>
          <p class="text-body-1 text-grey">
            Lending Management System
          </p>
        </div>

        <!-- Login Form -->
        <v-form ref="formRef" v-model="formValid" @submit.prevent="handleLogin">
          <label for="login-email" class="font-weight-medium">Email</label>
          <v-text-field
            id="login-email"
            v-model="form.email"
            type="email"
            prepend-inner-icon="mdi-email"
            :rules="[rules.required, rules.email]"
            variant="solo"
            flat
            class="mb-4"
            hide-details="auto"
            density="comfortable"
          />

          <label for="login-password" class="font-weight-medium">Password</label>
          <v-text-field
            id="login-password"
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :rules="[rules.required]"
            variant="solo"
            flat
            class="mb-4"
            hide-details="auto"
            density="comfortable"
            @click:append-inner="showPassword = !showPassword"
          />

          <v-alert v-if="error" type="error" variant="tonal" class="mb-4 error-alert">
            {{ error }}
          </v-alert>

          <v-btn
            type="submit"
            color="primary"
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
import { ref, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

// Initialize stores
const authStore = useAuthStore()
const router = useRouter()

// Extract reactive state/getters using storeToRefs
const { isAdmin } = storeToRefs(authStore)

// Extract actions directly from store
const { login } = authStore

// Component state
const formRef = ref<any>(null)
const formValid = ref(false)
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

// Form data
const form = reactive({
  email: '',
  password: ''
})

// Validation rules
const rules = {
  required: (v: string) => !!v || 'Field is required',
  email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
}

// Methods
const handleLogin = async () => {
  if (!formRef.value) { return }

  const { valid } = await formRef.value.validate()
  if (!valid) { return }

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

<script lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'guest'
})
</script>

<style scoped>
.flat-auth-container {
  min-height: 100vh;
}

.flat-auth-container .v-col {
  background: transparent;
  border-radius: 0;
  max-width: 450px;
}

@media (max-width: 600px) {
  .flat-auth-container .v-col {
    border-radius: 0;
    height: 100vh;
  }
}
</style>
