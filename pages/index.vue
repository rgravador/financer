<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

// Redirect to role-specific dashboard
definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()
const router = useRouter()

// Redirect based on user role
const redirectToDashboard = () => {
  const role = authStore.currentUser?.role
  const redirections = new Map([
    ['system_admin', '/system/dashboard'],
    ['tenant_admin', '/admin/dashboard'],
    ['tenant_officer', '/officer/dashboard'],
    ['tenant_approver', '/approver/dashboard'],
  ])

  const redirectPath = redirections.get(role) || '/login'
  router.push(redirectPath)
}

// Execute redirect on mount
onMounted(() => {
  redirectToDashboard()
})
</script>

<template>
  <v-container class="fill-height d-flex align-center justify-center">
    <v-progress-circular
      indeterminate
      color="primary"
      size="64"
    />
  </v-container>
</template>
