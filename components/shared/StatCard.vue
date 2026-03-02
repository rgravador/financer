<script setup lang="ts">
interface Props {
  label: string
  value: string | number
  subtext?: string
  trend?: 'up' | 'down' | 'neutral'
  color?: string
  icon?: string
}

const props = withDefaults(defineProps<Props>(), {
  subtext: '',
  trend: 'neutral',
  color: '#1e3a8a', // Navy blue primary color
  icon: '',
})

const trendIcon = {
  up: '↑',
  down: '↓',
  neutral: '→',
}

const trendColor = {
  up: '#10b981',
  down: '#ef4444',
  neutral: '#6b7280',
}
</script>

<template>
  <div class="stat-card">
    <div class="stat-header">
      <span class="stat-label">{{ label }}</span>
      <div v-if="icon" class="stat-icon" :style="{ backgroundColor: color }">
        {{ icon }}
      </div>
    </div>

    <div class="stat-value" :style="{ color: color }">
      {{ value }}
    </div>

    <div v-if="subtext || trend !== 'neutral'" class="stat-footer">
      <span v-if="subtext" class="stat-subtext">{{ subtext }}</span>
      <span
        v-if="trend !== 'neutral'"
        class="stat-trend"
        :style="{ color: trendColor[trend] }"
      >
        <span class="trend-icon">{{ trendIcon[trend] }}</span>
        {{ subtext }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.stat-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  transition: all 0.2s;
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.stat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 18px;
  color: white;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-footer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-subtext {
  font-size: 13px;
  color: #9ca3af;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
}

.trend-icon {
  font-size: 16px;
}
</style>
