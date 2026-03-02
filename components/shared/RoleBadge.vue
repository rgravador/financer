<template>
  <v-chip :color="roleColor" size="small" variant="flat">
    <v-icon v-if="roleIcon" start size="small">{{ roleIcon }}</v-icon>
    {{ roleLabel }}
  </v-chip>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  role: string
}>()

// Role configuration
const roleConfig: Record<string, { label: string; color: string; icon?: string }> = {
  system_admin: {
    label: 'System Admin',
    color: 'purple-darken-2',
    icon: 'mdi-shield-crown',
  },
  tenant_admin: {
    label: 'Tenant Admin',
    color: 'indigo',
    icon: 'mdi-shield-account',
  },
  tenant_officer: {
    label: 'Loan Officer',
    color: 'blue',
    icon: 'mdi-account-tie',
  },
  tenant_approver: {
    label: 'Approver',
    color: 'amber-darken-2',
    icon: 'mdi-check-decagram',
  },
}

const roleLabel = computed(() => {
  return roleConfig[props.role]?.label || props.role
})

const roleColor = computed(() => {
  return roleConfig[props.role]?.color || 'grey'
})

const roleIcon = computed(() => {
  return roleConfig[props.role]?.icon
})
</script>
