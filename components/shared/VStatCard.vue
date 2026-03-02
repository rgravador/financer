<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  value: string | number
  subtitle?: string
  icon?: string
  color?: string
  trend?: 'up' | 'down' | 'neutral'
}>(), {
  color: 'primary',
  trend: 'neutral'
})

const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up':
      return 'mdi-trending-up'
    case 'down':
      return 'mdi-trending-down'
    default:
      return ''
  }
})

const trendColor = computed(() => {
  switch (props.trend) {
    case 'up':
      return 'success'
    case 'down':
      return 'error'
    default:
      return 'grey'
  }
})
</script>

<template>
  <v-card hover class="stat-card">
    <v-card-text class="pa-6">
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="text-subtitle-2 text-medium-emphasis text-uppercase">
          {{ title }}
        </div>
        <v-icon
          v-if="icon"
          :icon="icon"
          :color="color"
          size="32"
        />
      </div>

      <div class="text-h3 font-weight-bold mb-2" :style="{ color: `rgb(var(--v-theme-${color}))` }">
        {{ value }}
      </div>

      <div v-if="subtitle || trend !== 'neutral'" class="d-flex align-center gap-2">
        <span v-if="subtitle" class="text-body-2 text-medium-emphasis">
          {{ subtitle }}
        </span>
        <v-icon
          v-if="trend !== 'neutral'"
          :icon="trendIcon"
          :color="trendColor"
          size="16"
        />
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.stat-card {
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}
</style>
