<script setup lang="ts">
import { ref, computed, watch } from 'vue'

interface Props {
  defaultRate: number
  suggestedRate: number
  minRate: number
  maxRate: number
  modelValue?: number
}

interface Emits {
  (e: 'update:modelValue', value: number): void
  (e: 'validate', isValid: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
})

const emit = defineEmits<Emits>()

const finalRate = ref(props.modelValue || props.suggestedRate)

// Watch for external changes to modelValue
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== finalRate.value) {
    finalRate.value = newValue
  }
})

// Watch finalRate and emit changes
watch(finalRate, (newValue) => {
  emit('update:modelValue', newValue)
  emit('validate', isRateValid.value)
})

const isRateValid = computed(() => {
  return finalRate.value >= props.minRate && finalRate.value <= props.maxRate
})

const rateStatus = computed(() => {
  if (!isRateValid.value) return 'invalid'
  if (finalRate.value === props.defaultRate) return 'default'
  if (finalRate.value === props.suggestedRate) return 'suggested'
  return 'custom'
})

const variance = computed(() => {
  return finalRate.value - props.defaultRate
})

const variancePercent = computed(() => {
  if (props.defaultRate === 0) return 0
  return ((variance.value / props.defaultRate) * 100).toFixed(2)
})

const statusColor = computed(() => {
  if (!isRateValid.value) return '#ef4444'
  if (Math.abs(variance.value) < 0.5) return '#10b981'
  if (Math.abs(variance.value) < 1.5) return '#f59e0b'
  return '#ef4444'
})

const statusText = computed(() => {
  if (!isRateValid.value) {
    return `Rate must be between ${props.minRate}% and ${props.maxRate}%`
  }
  if (finalRate.value === props.defaultRate) {
    return 'Using default rate'
  }
  if (finalRate.value === props.suggestedRate) {
    return 'Using officer suggested rate'
  }
  return `${variance.value > 0 ? '+' : ''}${variance.value.toFixed(2)}% from default`
})

const applyRate = (rate: number) => {
  finalRate.value = rate
}
</script>

<template>
  <div class="rate-decision-box">
    <div class="header">
      <h3>Interest Rate Decision</h3>
      <div class="status-badge" :style="{ backgroundColor: statusColor }">
        {{ isRateValid ? 'Valid' : 'Invalid' }}
      </div>
    </div>

    <div class="rate-info-grid">
      <div class="rate-info-item">
        <span class="label">Default Rate</span>
        <span class="value">{{ defaultRate.toFixed(2) }}%</span>
        <button
          class="apply-button"
          @click="applyRate(defaultRate)"
          :disabled="finalRate === defaultRate"
        >
          Apply
        </button>
      </div>

      <div class="rate-info-item">
        <span class="label">Officer Suggested</span>
        <span class="value">{{ suggestedRate.toFixed(2) }}%</span>
        <button
          class="apply-button"
          @click="applyRate(suggestedRate)"
          :disabled="finalRate === suggestedRate"
        >
          Apply
        </button>
      </div>

      <div class="rate-info-item highlight">
        <span class="label">Allowable Range</span>
        <span class="value">{{ minRate.toFixed(2) }}% - {{ maxRate.toFixed(2) }}%</span>
      </div>
    </div>

    <div class="final-rate-input">
      <label for="finalRate">Final Approved Rate</label>
      <div class="input-wrapper">
        <input
          id="finalRate"
          v-model.number="finalRate"
          type="number"
          step="0.01"
          min="0"
          max="100"
          :class="{ invalid: !isRateValid }"
        />
        <span class="input-suffix">%</span>
      </div>
    </div>

    <div class="status-message" :style="{ color: statusColor }">
      {{ statusText }}
    </div>

    <div class="variance-display">
      <div class="variance-label">Variance from Default</div>
      <div class="variance-value" :style="{ color: statusColor }">
        {{ variance > 0 ? '+' : '' }}{{ variance.toFixed(2) }}%
        <span class="variance-percent">({{ variancePercent > 0 ? '+' : '' }}{{ variancePercent }}%)</span>
      </div>
    </div>

    <div class="rate-range-slider">
      <div class="slider-track">
        <div
          class="slider-range"
          :style="{
            left: `${((minRate / maxRate) * 100)}%`,
            width: `${(((maxRate - minRate) / maxRate) * 100)}%`
          }"
        />
        <div
          class="slider-marker default"
          :style="{ left: `${(defaultRate / maxRate) * 100}%` }"
          title="Default Rate"
        />
        <div
          class="slider-marker suggested"
          :style="{ left: `${(suggestedRate / maxRate) * 100}%` }"
          title="Suggested Rate"
        />
        <div
          class="slider-marker final"
          :style="{ left: `${(finalRate / maxRate) * 100}%` }"
          :class="{ invalid: !isRateValid }"
          title="Final Rate"
        />
      </div>
      <div class="slider-labels">
        <span>0%</span>
        <span>{{ maxRate.toFixed(0) }}%</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rate-decision-box {
  padding: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}

.status-badge {
  padding: 4px 12px;
  color: white;
  font-size: 12px;
  font-weight: 600;
  border-radius: 12px;
  text-transform: uppercase;
}

.rate-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.rate-info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
}

.rate-info-item.highlight {
  background: #eff6ff;
  border: 1px solid #3b82f6;
}

.rate-info-item .label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.rate-info-item .value {
  font-size: 20px;
  font-weight: 700;
  color: #111827;
}

.apply-button {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.apply-button:hover:not(:disabled) {
  background: #2563eb;
}

.apply-button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.final-rate-input {
  margin-bottom: 16px;
}

.final-rate-input label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #111827;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  flex: 1;
  padding: 10px 40px 10px 12px;
  font-size: 18px;
  font-weight: 600;
  border: 2px solid #d1d5db;
  border-radius: 6px;
  transition: border-color 0.2s;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #3b82f6;
}

.input-wrapper input.invalid {
  border-color: #ef4444;
}

.input-suffix {
  position: absolute;
  right: 12px;
  font-size: 18px;
  font-weight: 600;
  color: #6b7280;
}

.status-message {
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  margin-bottom: 20px;
}

.variance-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9fafb;
  border-radius: 6px;
  margin-bottom: 20px;
}

.variance-label {
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
}

.variance-value {
  font-size: 18px;
  font-weight: 700;
}

.variance-percent {
  font-size: 14px;
  font-weight: 500;
  margin-left: 8px;
}

.rate-range-slider {
  margin-top: 24px;
}

.slider-track {
  position: relative;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  margin-bottom: 8px;
}

.slider-range {
  position: absolute;
  height: 100%;
  background: #bfdbfe;
  border-radius: 4px;
}

.slider-marker {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 2;
}

.slider-marker.default {
  background: #6b7280;
}

.slider-marker.suggested {
  background: #f59e0b;
}

.slider-marker.final {
  background: #10b981;
  width: 16px;
  height: 16px;
  z-index: 3;
}

.slider-marker.final.invalid {
  background: #ef4444;
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
}
</style>
