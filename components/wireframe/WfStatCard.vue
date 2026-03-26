<template>
  <div class="stat-card" :class="{ 'has-accent': accentColor }">
    <div v-if="accentColor" class="card-accent" :style="{ background: accentGradient }"></div>

    <div class="card-content">
      <div class="stat-icon" v-if="icon" :style="{ background: iconBackground }">
        <v-icon size="22" :color="iconColor">{{ icon }}</v-icon>
      </div>

      <div class="stat-info">
        <div class="stat-label">{{ label }}</div>
        <div class="stat-value">{{ formattedValue }}</div>

        <div v-if="trend" class="stat-trend" :class="trendClass">
          <v-icon size="14">{{ trendIcon }}</v-icon>
          <span>{{ trend }}</span>
          <span v-if="trendLabel" class="trend-label">{{ trendLabel }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  value: string | number
  label: string
  icon?: string
  trend?: string
  trendPositive?: boolean
  trendLabel?: string
  accentColor?: 'primary' | 'success' | 'warning' | 'error' | 'info'
  format?: 'number' | 'currency' | 'percent' | 'none'
}

const props = withDefaults(defineProps<Props>(), {
  icon: undefined,
  trend: undefined,
  trendPositive: true,
  trendLabel: undefined,
  accentColor: undefined,
  format: 'none',
})

// Format value based on type
const formattedValue = computed(() => {
  if (props.format === 'none' || typeof props.value === 'string') {
    return props.value
  }

  const num = Number(props.value)

  switch (props.format) {
    case 'number':
      return num.toLocaleString()
    case 'currency':
      return `$${num.toLocaleString()}`
    case 'percent':
      return `${num}%`
    default:
      return props.value
  }
})

// Accent color gradients
const accentGradient = computed(() => {
  const gradients: Record<string, string> = {
    primary: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    success: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
    warning: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    error: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
    info: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
  }
  return props.accentColor ? gradients[props.accentColor] : ''
})

// Icon background colors
const iconBackground = computed(() => {
  const backgrounds: Record<string, string> = {
    primary: 'rgba(30, 58, 138, 0.1)',
    success: 'rgba(16, 185, 129, 0.1)',
    warning: 'rgba(245, 158, 11, 0.1)',
    error: 'rgba(239, 68, 68, 0.1)',
    info: 'rgba(14, 165, 233, 0.1)',
  }
  return props.accentColor ? backgrounds[props.accentColor] : 'rgba(30, 58, 138, 0.1)'
})

// Icon colors
const iconColor = computed(() => {
  const colors: Record<string, string> = {
    primary: '#1e3a8a',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
    info: '#0284c7',
  }
  return props.accentColor ? colors[props.accentColor] : '#1e3a8a'
})

// Trend styling
const trendClass = computed(() => ({
  positive: props.trendPositive,
  negative: !props.trendPositive,
}))

const trendIcon = computed(() =>
  props.trendPositive ? 'mdi-trending-up' : 'mdi-trending-down'
)
</script>

<style scoped>
.stat-card {
  --color-primary: #1e3a8a;
  --color-text: #1e293b;
  --color-text-muted: #64748b;
  --color-border: #e2e8f0;
  --color-bg: #ffffff;
  --font-heading: 'Sora', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;

  position: relative;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.08);
  border-color: transparent;
}

/* Accent bar at top */
.card-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
}

.card-content {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 24px;
}

/* Icon */
.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  flex-shrink: 0;
}

/* Info */
.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-label {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-muted);
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.stat-value {
  font-family: var(--font-heading);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
  margin-bottom: 8px;
}

/* Trend */
.stat-trend {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 20px;
}

.stat-trend.positive {
  color: #059669;
  background: rgba(16, 185, 129, 0.1);
}

.stat-trend.negative {
  color: #dc2626;
  background: rgba(239, 68, 68, 0.1);
}

.trend-label {
  font-weight: 400;
  color: var(--color-text-muted);
  margin-left: 4px;
}

/* Responsive */
@media (max-width: 640px) {
  .card-content {
    padding: 20px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-icon {
    width: 40px;
    height: 40px;
  }
}
</style>
