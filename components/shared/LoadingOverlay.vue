<template>
  <v-overlay
    v-model="internalLoading"
    class="loading-overlay"
    :persistent="persistent"
    :contained="contained"
  >
    <div class="loading-content">
      <v-progress-circular
        :size="size"
        :width="4"
        :color="color"
        indeterminate
      />
      <p v-if="message" class="loading-message">{{ message }}</p>
    </div>
  </v-overlay>
</template>

<script setup lang="ts">
interface Props {
  loading: boolean
  message?: string
  size?: number
  color?: string
  persistent?: boolean
  contained?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  message: undefined,
  size: 56,
  color: 'primary',
  persistent: true,
  contained: false,
})

const internalLoading = computed(() => props.loading)
</script>

<style scoped>
.loading-overlay {
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px;
  background: var(--bg-card, #ffffff);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.loading-message {
  font-family: 'Plus Jakarta Sans', sans-serif;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  margin: 0;
  text-align: center;
  max-width: 240px;
}
</style>
