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
  background: rgba(var(--v-theme-primary), 0.08);
  color: rgb(var(--v-theme-primary));
}

.empty-icon.icon-secondary {
  background: rgba(var(--v-theme-secondary), 0.08);
  color: rgb(var(--v-theme-secondary));
}

.empty-icon.icon-success {
  background: rgba(var(--v-theme-success), 0.08);
  color: rgb(var(--v-theme-success));
}

.empty-icon.icon-warning {
  background: rgba(var(--v-theme-warning), 0.08);
  color: rgb(var(--v-theme-warning));
}

.empty-icon.icon-error {
  background: rgba(var(--v-theme-error), 0.08);
  color: rgb(var(--v-theme-error));
}

.empty-icon.icon-info {
  background: rgba(var(--v-theme-info), 0.08);
  color: rgb(var(--v-theme-info));
}

.empty-title {
  font-family: var(--font-display, 'Sora', sans-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.compact .empty-title {
  font-size: 16px;
}

.empty-description {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
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
