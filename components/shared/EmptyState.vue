<template>
  <v-sheet class="empty-state" :class="{ compact }">
    <!-- Icon -->
    <div v-if="icon" class="empty-icon" :class="iconColorClass">
      <v-icon :size="iconSize">{{ icon }}</v-icon>
    </div>

    <!-- Title -->
    <h3 class="empty-title">{{ title }}</h3>

    <!-- Description -->
    <p v-if="description" class="empty-description">{{ description }}</p>

    <!-- Action Button -->
    <v-btn
      v-if="actionText"
      :color="actionColor"
      variant="flat"
      class="empty-action"
      @click="handleAction"
    >
      <v-icon v-if="actionIcon" start>{{ actionIcon }}</v-icon>
      {{ actionText }}
    </v-btn>

    <!-- Custom slot -->
    <slot />
  </v-sheet>
</template>

<script setup lang="ts">
interface Props {
  icon?: string
  iconColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
  title: string
  description?: string
  actionText?: string
  actionIcon?: string
  actionColor?: string
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  icon: 'mdi-inbox-outline',
  iconColor: 'secondary',
  description: undefined,
  actionText: undefined,
  actionIcon: undefined,
  actionColor: 'primary',
  compact: false,
})

const emit = defineEmits<{
  action: []
}>()

const iconSize = computed(() => props.compact ? 48 : 64)

const iconColorClass = computed(() => `icon-${props.iconColor}`)

const handleAction = () => {
  emit('action')
}
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  background: transparent !important;
  min-height: 300px;
}

.empty-state.compact {
  padding: 32px 16px;
  min-height: 200px;
}

.empty-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 96px;
  height: 96px;
  border-radius: 50%;
  margin-bottom: 24px;
}

.compact .empty-icon {
  width: 72px;
  height: 72px;
  margin-bottom: 16px;
}

.empty-icon.icon-primary {
  background: rgba(30, 58, 138, 0.08);
  color: #1e3a8a;
}

.empty-icon.icon-secondary {
  background: rgba(100, 116, 139, 0.08);
  color: #64748b;
}

.empty-icon.icon-success {
  background: rgba(16, 185, 129, 0.08);
  color: #10b981;
}

.empty-icon.icon-warning {
  background: rgba(245, 158, 11, 0.08);
  color: #f59e0b;
}

.empty-icon.icon-error {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.empty-icon.icon-info {
  background: rgba(14, 165, 233, 0.08);
  color: #0ea5e9;
}

.empty-title {
  font-family: 'Sora', sans-serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.compact .empty-title {
  font-size: 16px;
}

.empty-description {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0 0 24px 0;
  max-width: 400px;
  line-height: 1.6;
}

.compact .empty-description {
  font-size: 13px;
  margin-bottom: 16px;
}

.empty-action {
  text-transform: none;
  font-weight: 500;
}
</style>
