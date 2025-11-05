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
          <v-text-field
            v-model="form.email"
            label="Email"
            type="email"
            prepend-inner-icon="mdi-email"
            :rules="[rules.required, rules.email]"
            variant="outlined"
            flat
            class="mb-4"
            hide-details="auto"
            density="comfortable"
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

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'LoginPage',

  data () {
    return {
      formValid: false,
      showPassword: false,
      loading: false,
      error: '',
      form: {
        email: '',
        password: ''
      },
      rules: {
        required: (v: string) => !!v || 'Field is required',
        email: (v: string) => /.+@.+\..+/.test(v) || 'E-mail must be valid'
      }
    }
  },

  computed: {
    authStore () {
      return useAuthStore()
    }
  },

  methods: {
    async handleLogin () {
      const formRef = this.$refs.formRef as any
      if (!formRef) { return }

      const { valid } = await formRef.validate()
      if (!valid) { return }

      this.loading = true
      this.error = ''

      const result = await this.authStore.login(this.form.email, this.form.password)

      if (result.success) {
        // Redirect based on role
        if (this.authStore.isAdmin) {
          this.$router.push('/admin/dashboard')
        } else {
          this.$router.push('/dashboard')
        }
      } else {
        this.error = result.error || 'Login failed'
      }

      this.loading = false
    }
  }
})

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
