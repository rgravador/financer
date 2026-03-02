<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6">
        <v-card elevation="2" class="text-center pa-8">
          <v-icon
            icon="mdi-shield-alert"
            size="80"
            color="error"
            class="mb-4"
          />

          <v-card-title class="text-h4 mb-2">
            Access Denied
          </v-card-title>

          <v-card-text class="text-body-1 text-medium-emphasis mb-6">
            You don't have permission to access this page.
            Please contact your administrator if you believe this is an error.
          </v-card-text>

          <v-card-text v-if="currentUser" class="mb-4">
            <v-chip color="primary" variant="tonal" class="ma-1">
              <v-icon start>mdi-account</v-icon>
              {{ currentUser.email }}
            </v-chip>
            <v-chip color="secondary" variant="tonal" class="ma-1">
              <v-icon start>mdi-shield-account</v-icon>
              {{ getRoleLabel(currentUser.role) }}
            </v-chip>
          </v-card-text>

          <v-card-actions class="justify-center">
            <v-btn
              color="primary"
              size="large"
              prepend-icon="mdi-view-dashboard"
              @click="goToDashboard"
            >
              Go to Dashboard
            </v-btn>

            <v-btn
              variant="text"
              size="large"
              prepend-icon="mdi-logout"
              @click="authStore.logout"
            >
              Logout
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

definePageMeta({
  layout: 'default',
})

const authStore = useAuthStore()
const router = useRouter()

const currentUser = computed(() => authStore.currentUser)

const getRoleLabel = (role: string) => {
  const roleLabels: Record<string, string> = {
    system_admin: 'System Administrator',
    tenant_admin: 'Tenant Administrator',
    tenant_officer: 'Loan Officer',
    tenant_approver: 'Approver',
  }
  return roleLabels[role] || role
}

const goToDashboard = () => {
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
</script>
