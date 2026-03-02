<template>
  <a-timeline mode="left">
    <a-timeline-item
      v-for="entry in statusHistory"
      :key="entry.id"
      :color="getStatusColor(entry.status)"
    >
      <template #dot>
        <component :is="getStatusIcon(entry.status)" />
      </template>

      <div class="timeline-content">
        <div class="timeline-header">
          <a-tag :color="getStatusColor(entry.status)">
            {{ formatStatus(entry.status) }}
          </a-tag>
          <span class="timeline-date">
            {{ formatDate(entry.timestamp) }}
          </span>
        </div>

        <div v-if="entry.notes" class="timeline-notes">
          {{ entry.notes }}
        </div>
      </div>
    </a-timeline-item>
  </a-timeline>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  FileTextOutlined,
  SendOutlined,
} from '@ant-design/icons-vue'
import type { StatusHistoryEntry } from '~/types'

interface Props {
  statusHistory: StatusHistoryEntry[]
}

const props = defineProps<Props>()

const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'gray',
    submitted: 'blue',
    under_review: 'orange',
    pending_documents: 'gold',
    approved: 'green',
    rejected: 'red',
    disbursed: 'purple',
  }
  return colors[status] || 'gray'
}

const getStatusIcon = (status: string) => {
  const icons: Record<string, any> = {
    draft: EditOutlined,
    submitted: SendOutlined,
    under_review: ClockCircleOutlined,
    pending_documents: FileTextOutlined,
    approved: CheckCircleOutlined,
    rejected: CloseCircleOutlined,
    disbursed: CheckCircleOutlined,
  }
  return icons[status] || ClockCircleOutlined
}

const formatStatus = (status: string): string => {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.timeline-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.timeline-date {
  color: rgba(0, 0, 0, 0.45);
  font-size: 14px;
}

.timeline-notes {
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
}
</style>
