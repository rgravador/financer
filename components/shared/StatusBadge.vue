<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  status: string
}>()

const statusConfig = computed(() => {
  const configs: Record<string, { color: string; label: string }> = {
    draft: { color: 'grey', label: 'Draft' },
    submitted: { color: 'blue', label: 'Submitted' },
    under_review: { color: 'indigo', label: 'Under Review' },
    pending_documents: { color: 'amber', label: 'Pending Documents' },
    approved: { color: 'success', label: 'Approved' },
    rejected: { color: 'error', label: 'Rejected' },
    disbursed: { color: 'teal', label: 'Disbursed' },
  }

  return configs[props.status] || { color: 'grey', label: props.status }
})
</script>

<template>
  <v-chip
    :color="statusConfig.color"
    size="small"
    label
  >
    {{ statusConfig.label }}
  </v-chip>
</template>
