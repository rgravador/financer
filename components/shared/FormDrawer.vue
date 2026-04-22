<template>
  <v-navigation-drawer
    v-model="internalShow"
    location="right"
    temporary
    :width="responsiveWidth"
    class="form-drawer"
    aria-modal="true"
    role="dialog"
    :aria-label="title"
  >
    <!-- Header -->
    <div class="drawer-header">
      <div class="header-content">
        <h2 class="drawer-title">{{ title }}</h2>
        <p v-if="subtitle" class="drawer-subtitle">{{ subtitle }}</p>
      </div>
      <v-btn
        icon
        variant="text"
        size="small"
        aria-label="Close drawer"
        @click="handleClose"
        :disabled="loading"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <v-divider />

    <!-- Content -->
    <div class="drawer-content">
      <slot />
    </div>

    <!-- Footer Actions -->
    <template v-if="showActions">
      <v-divider />
      <div class="drawer-actions">
        <slot name="actions">
          <v-btn
            variant="outlined"
            color="grey"
            @click="handleClose"
            :disabled="loading"
          >
            {{ cancelText }}
          </v-btn>
          <v-btn
            variant="flat"
            :color="saveColor"
            @click="handleSave"
            :loading="loading"
            :disabled="saveDisabled"
          >
            {{ saveText }}
          </v-btn>
        </slot>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean
  title: string
  subtitle?: string
  width?: number | string
  saveText?: string
  cancelText?: string
  saveColor?: string
  loading?: boolean
  saveDisabled?: boolean
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: undefined,
  width: 480,
  saveText: 'Save',
  cancelText: 'Cancel',
  saveColor: 'primary',
  loading: false,
  saveDisabled: false,
  showActions: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  save: []
  close: []
}>()

// Responsive width: cap at viewport width on mobile
const responsiveWidth = computed(() => {
  if (typeof window !== 'undefined' && window.innerWidth < 520) {
    return window.innerWidth
  }
  return props.width
})

const internalShow = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
})

const handleClose = () => {
  emit('close')
  internalShow.value = false
}

const handleSave = () => {
  emit('save')
}
</script>

<style scoped>
.form-drawer {
  background: var(--bg-card) !important;
}

.drawer-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 24px;
  gap: 16px;
}

.header-content {
  flex: 1;
}

.drawer-title {
  font-family: var(--font-display, 'Sora', sans-serif);
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.3;
}

.drawer-subtitle {
  font-family: var(--font-sans, 'Plus Jakarta Sans', sans-serif);
  font-size: 13px;
  color: var(--text-secondary);
  margin: 4px 0 0 0;
}

.drawer-content {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.drawer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background: var(--bg-hover);
}

.drawer-actions .v-btn {
  min-width: 100px;
  text-transform: none;
  font-weight: 500;
}
</style>
