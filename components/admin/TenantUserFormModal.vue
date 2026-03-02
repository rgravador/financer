<template>
  <v-dialog v-model="isOpen" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-4">
        <v-icon start>mdi-account-plus</v-icon>
        Invite New User
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="handleSubmit">
          <v-row>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.firstName"
                label="First Name"
                variant="outlined"
                :rules="nameRules"
                :disabled="loading"
                prepend-inner-icon="mdi-account"
              />
            </v-col>

            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formData.lastName"
                label="Last Name"
                variant="outlined"
                :rules="nameRules"
                :disabled="loading"
              />
            </v-col>
          </v-row>

          <v-text-field
            v-model="formData.email"
            label="Email Address"
            type="email"
            variant="outlined"
            :rules="emailRules"
            :disabled="loading"
            prepend-inner-icon="mdi-email"
            class="mb-3"
          />

          <v-select
            v-model="formData.role"
            label="Role"
            variant="outlined"
            :items="roleOptions"
            :rules="roleRules"
            :disabled="loading"
            prepend-inner-icon="mdi-shield-account"
            class="mb-3"
          />

          <v-text-field
            v-model="formData.password"
            label="Temporary Password"
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            :rules="passwordRules"
            :disabled="loading"
            prepend-inner-icon="mdi-lock"
            :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
            hint="User will be prompted to change this on first login"
            persistent-hint
            @click:append-inner="showPassword = !showPassword"
          />

          <v-alert v-if="error" type="error" variant="tonal" class="mt-3" closable @click:close="error = null">
            {{ error }}
          </v-alert>
        </v-form>
      </v-card-text>

      <v-card-actions class="pa-4">
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="loading"
          @click="handleCancel"
        >
          Cancel
        </v-btn>
        <v-btn
          color="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          Invite User
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'created': [user: any]
}>()

const usersStore = useUsersStore()

const form = ref()
const loading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)

const formData = ref({
  firstName: '',
  lastName: '',
  email: '',
  role: '',
  password: '',
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// Role options (excluding system_admin)
const roleOptions = [
  { title: 'Loan Officer', value: 'tenant_officer' },
  { title: 'Approver', value: 'tenant_approver' },
  { title: 'Tenant Admin', value: 'tenant_admin' },
]

// Validation rules
const nameRules = [
  (v: string) => !!v || 'Name is required',
  (v: string) => v.length >= 2 || 'Name must be at least 2 characters',
  (v: string) => v.length <= 50 || 'Name must not exceed 50 characters',
]

const emailRules = [
  (v: string) => !!v || 'Email is required',
  (v: string) => /.+@.+\..+/.test(v) || 'Email must be valid',
]

const roleRules = [
  (v: string) => !!v || 'Role is required',
]

const passwordRules = [
  (v: string) => !!v || 'Password is required',
  (v: string) => v.length >= 8 || 'Password must be at least 8 characters',
  (v: string) => /[A-Z]/.test(v) || 'Password must contain an uppercase letter',
  (v: string) => /[a-z]/.test(v) || 'Password must contain a lowercase letter',
  (v: string) => /[0-9]/.test(v) || 'Password must contain a number',
  (v: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(v) || 'Password must contain a special character',
]

// Handle form submission
const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  error.value = null

  try {
    const user = await usersStore.createUser(formData.value)
    emit('created', user)
    handleCancel()
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to create user'
  } finally {
    loading.value = false
  }
}

// Handle cancel
const handleCancel = () => {
  form.value.reset()
  formData.value = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    password: '',
  }
  error.value = null
  isOpen.value = false
}
</script>
