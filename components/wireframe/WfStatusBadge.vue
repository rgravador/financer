<template>
  <v-chip
    :color="badgeColor"
    size="small"
    variant="flat"
    class="status-badge"
  >
    {{ badgeLabel }}
  </v-chip>
</template>

<script setup lang="ts">
type StatusType = 'active' | 'pending' | 'suspended' | 'inactive'

interface Props {
  status: StatusType
}

const props = defineProps<Props>()

const badgeConfig = computed(() => {
  const configs: Record<StatusType, { color: string; label: string }> = {
    active: { color: 'success', label: 'Active' },
    pending: { color: 'warning', label: 'Pending' },
    suspended: { color: 'error', label: 'Suspended' },
    inactive: { color: 'grey', label: 'Inactive' },
  }

  return configs[props.status] || configs.inactive
})

const badgeColor = computed(() => badgeConfig.value.color)
const badgeLabel = computed(() => badgeConfig.value.label)
</script>

<style scoped>
.status-badge {
  font-weight: 500;
  text-transform: capitalize;
}
</style>
