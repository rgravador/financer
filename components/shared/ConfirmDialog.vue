<template>
  <v-dialog
    v-model="internalShow"
    :max-width="maxWidth"
    persistent
    class="confirm-dialog"
    role="alertdialog"
    :aria-label="title"
  >
    <v-card class="confirm-card">
      <!-- Icon -->
      <div v-if="icon" class="dialog-icon" :class="iconClass">
        <v-icon :size="48">{{ icon }}</v-icon>
      </div>

      <!-- Title -->
      <v-card-title class="dialog-title">
        {{ title }}
      </v-card-title>

      <!-- Message -->
      <v-card-text class="dialog-message">
        {{ message }}
      </v-card-text>

      <!-- Actions -->
      <v-card-actions class="dialog-actions">
        <v-btn
          variant="outlined"
          :color="cancelColor"
          @click="handleCancel"
          :disabled="loading"
        >
          {{ cancelText }}
        </v-btn>
        <v-btn
          variant="flat"
          :color="confirmColor"
          @click="handleConfirm"
          :loading="loading"
        >
          {{ confirmText }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  confirmColor?: 'primary' | 'error' | 'warning' | 'success'
  cancelColor?: string
  icon?: string
  loading?: boolean
  maxWidth?: number | string
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmColor: 'primary',
  cancelColor: 'grey',
  icon: undefined,
  loading: false,
  maxWidth: '400',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
  cancel: []
}>()

const internalShow = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const iconClass = computed(() => {
  return `icon-${props.confirmColor}`
})

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  internalShow.value = false
}
</script>

<style scoped>
.confirm-card {
  padding: 24px;
  text-align: center;
  border-radius: 16px !important;
}

.dialog-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  border-radius: 50%;
}

.dialog-icon.icon-primary {
  background: rgba(var(--v-theme-primary), 0.1);
  color: rgb(var(--v-theme-primary));
}

.dialog-icon.icon-error {
  background: rgba(var(--v-theme-error), 0.1);
  color: rgb(var(--v-theme-error));
}

.dialog-icon.icon-warning {
  background: rgba(var(--v-theme-warning), 0.1);
  color: rgb(var(--v-theme-warning));
}

.dialog-icon.icon-success {
  background: rgba(var(--v-theme-success), 0.1);
  color: rgb(var(--v-theme-success));
}

.dialog-title {
  font-family: var(--font-display, 'Sora', sans-serif);
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
  padding: 0 0 8px 0;
  justify-content: center;
}

.dialog-message {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 14px;
  color: var(--text-secondary);
  padding: 0 0 24px 0;
  line-height: 1.6;
}

.dialog-actions {
  padding: 0;
  justify-content: center;
  gap: 12px;
}

.dialog-actions .v-btn {
  min-width: 100px;
  text-transform: none;
  font-weight: 500;
}
</style>
