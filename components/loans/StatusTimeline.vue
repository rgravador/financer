<template>
  <div class="status-timeline" role="list" aria-label="Status history">
    <div
      v-for="(item, index) in sortedItems"
      :key="index"
      class="timeline-item"
      role="listitem"
      :class="{
        'timeline-item--current': index === 0,
        'timeline-item--completed': isCompleted(item.status),
        'timeline-item--error': isError(item.status),
      }"
    >
      <!-- Timeline Marker -->
      <div class="timeline-marker">
        <div
          class="marker-dot"
          :style="{ backgroundColor: getStatusColorHex(item.status) }"
        >
          <v-icon
            v-if="showIcons"
            :color="index === 0 ? 'white' : 'inherit'"
            size="14"
          >
            {{ getStatusIcon(item.status) }}
          </v-icon>
        </div>
        <div
          v-if="index < sortedItems.length - 1"
          class="marker-line"
          :class="{ 'marker-line--completed': isCompleted(item.status) }"
        />
      </div>

      <!-- Timeline Content -->
      <div class="timeline-content">
        <div class="timeline-header">
          <v-chip
            v-if="showChips"
            :color="getStatusColor(item.status)"
            size="small"
            variant="tonal"
            class="status-chip"
          >
            {{ formatStatus(item.status) }}
          </v-chip>
          <span v-else class="status-text" :style="{ color: getStatusColorHex(item.status) }">
            {{ formatStatus(item.status) }}
          </span>
          <span class="timeline-date">{{ formatDate(item.timestamp) }}</span>
        </div>

        <p v-if="item.notes" class="timeline-notes">{{ item.notes }}</p>

        <div v-if="showUser && item.changedBy" class="timeline-user">
          <v-avatar v-if="showAvatar" size="20" color="grey-lighten-2">
            <span class="avatar-text">{{ getInitials(item.changedBy) }}</span>
          </v-avatar>
          <span>{{ item.changedBy }}</span>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="sortedItems.length === 0" class="timeline-empty">
      <v-icon size="48" color="grey-lighten-1">mdi-history</v-icon>
      <p>{{ emptyText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface StatusHistoryItem {
  status: string
  timestamp: Date | string
  changedBy?: string
  notes?: string
}

interface Props {
  items: StatusHistoryItem[]
  showIcons?: boolean
  showChips?: boolean
  showUser?: boolean
  showAvatar?: boolean
  emptyText?: string
  sortOrder?: 'asc' | 'desc'
  statusConfig?: Record<string, { label: string; color: string; colorHex: string; icon: string }>
}

const props = withDefaults(defineProps<Props>(), {
  showIcons: false,
  showChips: true,
  showUser: true,
  showAvatar: false,
  emptyText: 'No history available',
  sortOrder: 'desc',
})

// Default status configuration
const defaultStatusConfig: Record<string, { label: string; color: string; colorHex: string; icon: string }> = {
  draft: {
    label: 'Draft',
    color: 'grey',
    colorHex: '#9e9e9e',
    icon: 'mdi-file-document-outline',
  },
  submitted: {
    label: 'Submitted',
    color: 'primary',
    colorHex: '#1e3a8a',
    icon: 'mdi-send',
  },
  under_review: {
    label: 'Under Review',
    color: 'info',
    colorHex: '#0288d1',
    icon: 'mdi-eye',
  },
  pending_documents: {
    label: 'Pending Documents',
    color: 'warning',
    colorHex: '#f59e0b',
    icon: 'mdi-file-alert-outline',
  },
  approved: {
    label: 'Approved',
    color: 'success',
    colorHex: '#10b981',
    icon: 'mdi-check-circle',
  },
  rejected: {
    label: 'Rejected',
    color: 'error',
    colorHex: '#ef4444',
    icon: 'mdi-close-circle',
  },
  disbursed: {
    label: 'Disbursed',
    color: 'success',
    colorHex: '#10b981',
    icon: 'mdi-cash-check',
  },
}

// Computed
const statusConfig = computed(() => ({
  ...defaultStatusConfig,
  ...(props.statusConfig || {}),
}))

const sortedItems = computed(() => {
  const items = [...props.items]
  items.sort((a, b) => {
    const dateA = new Date(a.timestamp).getTime()
    const dateB = new Date(b.timestamp).getTime()
    return props.sortOrder === 'desc' ? dateB - dateA : dateA - dateB
  })
  return items
})

// Methods
const getStatusColor = (status: string): string => {
  return statusConfig.value[status]?.color || 'grey'
}

const getStatusColorHex = (status: string): string => {
  return statusConfig.value[status]?.colorHex || '#9e9e9e'
}

const getStatusIcon = (status: string): string => {
  return statusConfig.value[status]?.icon || 'mdi-help-circle'
}

const formatStatus = (status: string): string => {
  return statusConfig.value[status]?.label || status
}

const isCompleted = (status: string): boolean => {
  return ['approved', 'disbursed'].includes(status)
}

const isError = (status: string): boolean => {
  return status === 'rejected'
}

const formatDate = (date: Date | string): string => {
  const d = new Date(date)
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

const getInitials = (name: string): string => {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}
</script>

<style scoped>
.status-timeline {
  display: flex;
  flex-direction: column;
}

/* Timeline Item */
.timeline-item {
  display: flex;
  gap: 16px;
  position: relative;
}

/* Timeline Marker */
.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 24px;
  flex-shrink: 0;
}

.marker-dot {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  background: rgba(var(--v-theme-on-surface), 0.4);
}

.timeline-item--current .marker-dot {
  width: 28px;
  height: 28px;
  box-shadow: 0 0 0 4px rgba(var(--v-theme-primary), 0.2);
}

.marker-line {
  width: 2px;
  flex: 1;
  min-height: 20px;
  background: rgba(var(--v-theme-on-surface), 0.12);
  margin-top: 4px;
}

.marker-line--completed {
  background: rgba(var(--v-theme-success), 0.4);
}

/* Timeline Content */
.timeline-content {
  flex: 1;
  padding-bottom: 24px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.status-chip {
  font-size: 12px;
  font-weight: 600;
}

.status-text {
  font-weight: 600;
  font-size: 14px;
}

.timeline-date {
  font-size: 13px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.timeline-notes {
  font-size: 14px;
  color: rgb(var(--v-theme-on-surface));
  margin: 0 0 8px 0;
  line-height: 1.5;
}

.timeline-user {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.avatar-text {
  font-size: 10px;
  font-weight: 600;
}

/* Current Item Highlight */
.timeline-item--current .timeline-content {
  background: rgba(var(--v-theme-primary), 0.04);
  border-radius: 12px;
  padding: 16px;
  margin: -8px -12px 16px -12px;
}

/* Completed State */
.timeline-item--completed .marker-dot {
  background: rgb(var(--v-theme-success));
}

/* Error State */
.timeline-item--error .marker-dot {
  background: rgb(var(--v-theme-error));
}

/* Empty State */
.timeline-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.5);
}

.timeline-empty p {
  margin-top: 16px;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 960px) {
  .timeline-content {
    padding-bottom: 20px;
  }

  .timeline-item--current .timeline-content {
    padding: 12px;
    margin: -6px -8px 12px -8px;
  }
}

@media (max-width: 600px) {
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .timeline-marker {
    width: 20px;
  }

  .marker-dot {
    width: 20px;
    height: 20px;
  }

  .timeline-item--current .marker-dot {
    width: 24px;
    height: 24px;
  }
}
</style>
