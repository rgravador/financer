<template>
  <span class="status-badge" :class="badgeClass" :style="badgeStyle">
    <span v-if="showDot" class="status-dot"></span>
    <span class="status-text">{{ badgeLabel }}</span>
  </span>
</template>

<script setup lang="ts">
type StatusType = 'active' | 'pending' | 'suspended' | 'inactive' | 'approved' | 'rejected' | 'processing'

interface Props {
  status: StatusType
  size?: 'small' | 'default' | 'large'
  showDot?: boolean
  variant?: 'filled' | 'outlined' | 'soft'
}

const props = withDefaults(defineProps<Props>(), {
  size: 'default',
  showDot: true,
  variant: 'soft',
})

// Status configurations with colors
const statusConfigs: Record<StatusType, { label: string; color: string; bg: string; border: string }> = {
  active: {
    label: 'Active',
    color: '#059669',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  approved: {
    label: 'Approved',
    color: '#059669',
    bg: 'rgba(16, 185, 129, 0.1)',
    border: 'rgba(16, 185, 129, 0.3)',
  },
  pending: {
    label: 'Pending',
    color: '#d97706',
    bg: 'rgba(245, 158, 11, 0.1)',
    border: 'rgba(245, 158, 11, 0.3)',
  },
  processing: {
    label: 'Processing',
    color: '#0284c7',
    bg: 'rgba(14, 165, 233, 0.1)',
    border: 'rgba(14, 165, 233, 0.3)',
  },
  suspended: {
    label: 'Suspended',
    color: '#dc2626',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  rejected: {
    label: 'Rejected',
    color: '#dc2626',
    bg: 'rgba(239, 68, 68, 0.1)',
    border: 'rgba(239, 68, 68, 0.3)',
  },
  inactive: {
    label: 'Inactive',
    color: '#64748b',
    bg: 'rgba(100, 116, 139, 0.1)',
    border: 'rgba(100, 116, 139, 0.3)',
  },
}

const config = computed(() => statusConfigs[props.status] || statusConfigs.inactive)
const badgeLabel = computed(() => config.value.label)

const badgeClass = computed(() => [
  `size-${props.size}`,
  `variant-${props.variant}`,
])

const badgeStyle = computed(() => {
  const c = config.value

  if (props.variant === 'filled') {
    return {
      '--badge-color': '#ffffff',
      '--badge-bg': c.color,
      '--badge-border': c.color,
      '--dot-color': '#ffffff',
    }
  }

  if (props.variant === 'outlined') {
    return {
      '--badge-color': c.color,
      '--badge-bg': 'transparent',
      '--badge-border': c.border,
      '--dot-color': c.color,
    }
  }

  // soft (default)
  return {
    '--badge-color': c.color,
    '--badge-bg': c.bg,
    '--badge-border': 'transparent',
    '--dot-color': c.color,
  }
})
</script>

<style scoped>
.status-badge {
  --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;

  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-body);
  font-weight: 600;
  color: var(--badge-color);
  background: var(--badge-bg);
  border: 1px solid var(--badge-border);
  border-radius: 20px;
  white-space: nowrap;
}

/* Sizes */
.status-badge.size-small {
  padding: 2px 8px;
  font-size: 11px;
  gap: 4px;
}

.status-badge.size-small .status-dot {
  width: 6px;
  height: 6px;
}

.status-badge.size-default {
  padding: 4px 12px;
  font-size: 12px;
}

.status-badge.size-large {
  padding: 6px 16px;
  font-size: 14px;
  gap: 8px;
}

.status-badge.size-large .status-dot {
  width: 10px;
  height: 10px;
}

/* Dot indicator */
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--dot-color);
  flex-shrink: 0;
}

/* Filled variant - add pulse animation to dot */
.variant-filled .status-dot {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-text {
  line-height: 1;
}
</style>
