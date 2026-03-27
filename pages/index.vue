<template>
  <div class="loading-container">
    <v-progress-circular indeterminate color="navy" size="64" />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  // Initialize auth state from localStorage
  authStore.initAuth()

  // Redirect based on authentication status
  if (authStore.isAuthenticated) {
    // Redirect based on user role
    const role = authStore.userRole
    if (role === 'system_admin') {
      router.push('/system/dashboard')
    } else if (role === 'tenant_admin') {
      router.push('/tenant/dashboard')
    } else if (role === 'tenant_officer') {
      router.push('/officer/dashboard')
    } else if (role === 'tenant_approver') {
      router.push('/approver/dashboard')
    } else {
      router.push('/login')
    }
  } else {
    router.push('/login')
  }
})
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
}
</style>
