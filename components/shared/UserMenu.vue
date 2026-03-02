<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { user, logout, getUserInitials, getRoleLabel } = useAuth()
const menu = ref(false)

const handleLogout = async () => {
  await logout()
  menu.value = false
}

const getRoleBadgeColor = (role: string) => {
  const colorMap: Record<string, string> = {
    system_admin: 'purple',
    tenant_admin: 'primary',
    tenant_officer: 'info',
    tenant_approver: 'success',
  }
  return colorMap[role] || 'grey'
}
</script>

<template>
  <v-menu v-model="menu" location="bottom end" offset="8">
    <template #activator="{ props }">
      <v-btn icon v-bind="props">
        <v-avatar color="primary" size="36">
          <span class="text-subtitle-2">{{ getUserInitials() }}</span>
        </v-avatar>
      </v-btn>
    </template>

    <v-card min-width="280">
      <v-card-text class="pa-4">
        <div class="d-flex align-center mb-3">
          <v-avatar color="primary" size="48" class="mr-3">
            <span class="text-h6">{{ getUserInitials() }}</span>
          </v-avatar>
          <div class="flex-grow-1">
            <div class="text-subtitle-1 font-weight-medium">
              {{ user?.firstName }} {{ user?.lastName }}
            </div>
            <v-chip
              :color="getRoleBadgeColor(user?.role || '')"
              size="x-small"
              label
              class="mt-1"
            >
              {{ getRoleLabel() }}
            </v-chip>
          </div>
        </div>

        <div class="text-caption text-medium-emphasis mb-2">
          {{ user?.email }}
        </div>
      </v-card-text>

      <v-divider />

      <v-list density="compact" nav>
        <v-list-item
          prepend-icon="mdi-account"
          title="Profile"
          :to="user?.role === 'system_admin' ? '/system/profile' : '/profile'"
        />
        <v-list-item
          prepend-icon="mdi-cog"
          title="Settings"
          :to="user?.role === 'system_admin' ? '/system/settings' : '/settings'"
        />
      </v-list>

      <v-divider />

      <v-card-actions class="pa-2">
        <v-btn
          block
          color="error"
          variant="text"
          prepend-icon="mdi-logout"
          @click="handleLogout"
        >
          Sign Out
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-menu>
</template>

<style scoped>
/* Ensure avatar text is white on navy background */
.v-avatar {
  color: rgb(var(--v-theme-on-primary)) !important;
}
</style>
