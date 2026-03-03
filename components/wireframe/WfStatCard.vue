<template>
  <v-card class="stat-card" elevation="0">
    <v-card-text>
      <div class="stat-value">{{ value }}</div>
      <div class="stat-label">{{ label }}</div>
      <div v-if="trend" class="stat-trend" :class="{ positive: trendPositive, negative: !trendPositive }">
        <v-icon size="16">{{ trendPositive ? 'mdi-arrow-up' : 'mdi-arrow-down' }}</v-icon>
        <span>{{ trend }}</span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  value: string | number
  label: string
  trend?: string
  trendPositive?: boolean
}

withDefaults(defineProps<Props>(), {
  trend: undefined,
  trendPositive: true,
})
</script>

<style scoped>
.stat-card {
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 32px;
  font-weight: 600;
  color: rgb(var(--v-theme-navy));
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.6);
  margin-bottom: 8px;
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 500;
}

.stat-trend.positive {
  color: #22c55e;
}

.stat-trend.negative {
  color: #ef4444;
}
</style>
