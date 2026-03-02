<template>
  <v-dialog v-model="isOpen" max-width="600px" persistent>
    <v-card>
      <v-card-title class="text-h5 pa-4">
        <v-icon start>mdi-office-building-plus</v-icon>
        Add New Tenant
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="handleSubmit">
          <v-text-field
            v-model="formData.name"
            label="Tenant Name"
            variant="outlined"
            :rules="nameRules"
            :disabled="loading"
            placeholder="e.g., ABC Corporation"
            class="mb-3"
            @input="generateSlug"
          />

          <v-text-field
            v-model="formData.slug"
            label="Slug (URL-friendly identifier)"
            variant="outlined"
            :rules="slugRules"
            :disabled="loading"
            hint="Lowercase letters, numbers, and hyphens only"
            persistent-hint
            class="mb-3"
          />

          <v-alert v-if="error" type="error" variant="tonal" class="mb-3" closable @click:close="error = null">
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
          Create Tenant
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
  'created': [tenant: any]
}>()

const systemStore = useSystemStore()

const form = ref()
const loading = ref(false)
const error = ref<string | null>(null)

const formData = ref({
  name: '',
  slug: '',
})

const isOpen = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

// Validation rules
const nameRules = [
  (v: string) => !!v || 'Tenant name is required',
  (v: string) => v.length >= 2 || 'Tenant name must be at least 2 characters',
  (v: string) => v.length <= 100 || 'Tenant name must not exceed 100 characters',
]

const slugRules = [
  (v: string) => !!v || 'Slug is required',
  (v: string) => v.length >= 2 || 'Slug must be at least 2 characters',
  (v: string) => v.length <= 50 || 'Slug must not exceed 50 characters',
  (v: string) => /^[a-z0-9-]+$/.test(v) || 'Slug can only contain lowercase letters, numbers, and hyphens',
  (v: string) => !v.startsWith('-') && !v.endsWith('-') || 'Slug cannot start or end with a hyphen',
  (v: string) => !/--/.test(v) || 'Slug cannot contain consecutive hyphens',
]

// Auto-generate slug from name
const generateSlug = () => {
  if (!formData.value.slug) {
    formData.value.slug = formData.value.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
  }
}

// Handle form submission
const handleSubmit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loading.value = true
  error.value = null

  try {
    const tenant = await systemStore.createTenant(formData.value)
    emit('created', tenant)
    handleCancel()
  } catch (err: any) {
    error.value = err.data?.statusMessage || 'Failed to create tenant'
  } finally {
    loading.value = false
  }
}

// Handle cancel
const handleCancel = () => {
  form.value.reset()
  formData.value = { name: '', slug: '' }
  error.value = null
  isOpen.value = false
}
</script>
