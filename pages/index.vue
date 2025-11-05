<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-card-title class="bg-primary text-center py-6">
            <div class="text-h4 text-white">
              LoanStar
            </div>
            <div class="text-subtitle-2 text-white">
              Lending Management System
            </div>
          </v-card-title>

          <v-card-text class="pt-6">
            <v-form ref="formRef" v-model="formValid" @submit.prevent="handleLogin">
              <v-text-field
                v-model="form.email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                :rules="[rules.required, rules.email]"
                variant="outlined"
                class="mb-3"
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
                autocomplete="current-password"
                @click:append-inner="showPassword = !showPassword"
              />

              <v-alert v-if="error" type="error" variant="tonal" class="mb-3">
                {{ error }}
              </v-alert>

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                :loading="loading"
                :disabled="!formValid"
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>

          <v-divider />

          <v-card-actions class="pa-4">
            <v-btn variant="text" size="small" to="/auth/reset-password">
              Forgot Password?
            </v-btn>
            <v-spacer />
            <v-btn variant="text" size="small" to="/auth/signup">
              Sign Up
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'IndexPage',

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
        // Redirect to dashboard
        this.$router.push('/dashboard')
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
