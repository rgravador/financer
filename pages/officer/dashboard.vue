<template>
  <div class="dashboard-page">
    <!-- Greeting + period toggle -->
    <header class="greeting-row">
      <div class="greeting-left">
        <div class="greeting-avatar">
          <v-icon size="32" color="primary">mdi-file-document-edit-outline</v-icon>
        </div>
        <div>
          <h1 class="greeting-title">Good {{ greeting }}, {{ userName }}</h1>
          <p class="greeting-sub">Here's your loan origination activity at a glance.</p>
        </div>
      </div>
      <div class="period-toggle">
        <button v-for="p in periods" :key="p" class="period-btn" :class="{ active: period === p }" @click="period = p">{{ p }}</button>
      </div>
    </header>

    <!-- Main grid: KPIs (2x2) + Right card -->
    <section class="main-grid">
      <!-- Left: 2x2 KPI cards -->
      <div class="kpi-zone">
        <article v-for="kpi in kpiCards" :key="kpi.label" class="kpi-card">
          <div class="kpi-deco" aria-hidden="true"></div>
          <div class="kpi-top-row">
            <div class="kpi-icon" :style="{ background: kpi.iconBg, color: kpi.iconColor }">
              <v-icon size="20">{{ kpi.icon }}</v-icon>
            </div>
            <span class="kpi-value">{{ kpi.value }}</span>
          </div>
          <span class="kpi-label">{{ kpi.label }}</span>
          <div class="kpi-footer">
            <span class="kpi-trend" :class="kpi.trendUp ? 'trend-up' : 'trend-down'">{{ kpi.trend }}</span>
            <span class="kpi-period">This Month</span>
          </div>
        </article>
      </div>
      <article class="chart-card-wide">
        <div class="card-head">
          <div>
            <h3 class="card-title">Weekly Submissions</h3>
            <span class="card-subtitle">Last 12 weeks</span>
          </div>
          <v-icon size="16" class="card-more">mdi-dots-horizontal</v-icon>
        </div>
        <div class="chart-area">
          <Line :data="weeklySubmissionData" :options="areaLineOptions" />
        </div>
      </article>
    </section>

    <!-- Row: Status donut + Disbursement + Pending Actions -->
    <section class="triple-grid">
      <article class="side-card">
        <div class="card-head">
          <h3 class="card-title">Application Status</h3>
          <v-icon size="16" class="card-more">mdi-dots-horizontal</v-icon>
        </div>
        <div class="donut-wrap"><Doughnut :data="statusDonutData" :options="donutOptions" /></div>
      </article>
      <article class="chart-card-wide">
        <div class="card-head">
          <div><h3 class="card-title">Disbursement by Type</h3><span class="card-subtitle">This quarter</span></div>
          <v-icon size="16" class="card-more">mdi-dots-horizontal</v-icon>
        </div>
        <div class="chart-area"><Bar :data="disbursementData" :options="horizontalBarOptions" /></div>
      </article>
      <article class="side-card" style="padding: 0;">
        <div class="card-head" style="padding: 20px 20px 0;">
          <h3 class="card-title">Pending Actions</h3>
          <v-icon size="16" class="card-more">mdi-dots-horizontal</v-icon>
        </div>
        <div class="action-list">
          <div v-for="action in pendingActions" :key="action.label" class="action-row">
            <div class="action-dot" :style="{ background: action.color }"></div>
            <div class="action-info">
              <span class="action-name">{{ action.label }}</span>
              <span class="action-desc">{{ action.desc }}</span>
            </div>
            <span class="action-count" :style="{ color: action.color }">{{ action.count }}</span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Line, Bar, Doughnut } from 'vue-chartjs'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: ['role'], meta: { allowedRoles: ['tenant_officer'] } })

const authStore = useAuthStore()
const period = ref('Monthly')
const periods = ['Weekly', 'Monthly', 'Yearly']
const greeting = computed(() => { const h = new Date().getHours(); return h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening' })
const userName = computed(() => authStore.user?.firstName || 'Officer')

const kpiCards = [
  { label: 'My Applications', value: '67', icon: 'mdi-file-document-outline', iconBg: 'rgba(139, 92, 246, 0.12)', iconColor: '#8B5CF6', trend: '+12', trendUp: true },
  { label: 'Approved', value: '48', icon: 'mdi-check-circle-outline', iconBg: 'rgba(16, 185, 129, 0.12)', iconColor: '#10B981', trend: '+8', trendUp: true },
  { label: 'Total Disbursed', value: '₱4.8M', icon: 'mdi-cash-check', iconBg: 'rgba(34, 211, 238, 0.12)', iconColor: '#22D3EE', trend: '+28%', trendUp: true },
  { label: 'Borrowers', value: '52', icon: 'mdi-account-group', iconBg: 'rgba(251, 113, 133, 0.12)', iconColor: '#FB7185', trend: '+6', trendUp: true },
]

const statusDonutData = {
  labels: ['Approved', 'Submitted', 'Under Review', 'Draft', 'Rejected'],
  datasets: [{ data: [48, 8, 4, 4, 3], backgroundColor: ['#10B981', '#8B5CF6', '#FBBF24', '#94A3B8', '#FB7185'], borderWidth: 0, spacing: 3 }]
}

const weeks = ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7', 'W8', 'W9', 'W10', 'W11', 'W12']
const weeklySubmissionData = {
  labels: weeks,
  datasets: [{ label: 'Submissions', data: [3, 5, 4, 7, 6, 8, 5, 9, 7, 10, 8, 12], borderColor: '#8B5CF6', backgroundColor: 'rgba(139, 92, 246, 0.06)', fill: true, pointBackgroundColor: '#8B5CF6', pointRadius: 3 }]
}

const disbursementData = {
  labels: ['Personal', 'Business', 'Salary', 'Emergency'],
  datasets: [{ label: 'Amount (₱M)', data: [1.8, 1.2, 0.98, 0.42], backgroundColor: ['#8B5CF6', '#22D3EE', '#FB7185', '#FBBF24'] }]
}

const pendingActions = [
  { label: 'Incomplete Drafts', desc: 'Missing documents or info', count: 4, color: '#D97706' },
  { label: 'Pending Documents', desc: 'Awaiting borrower upload', count: 3, color: '#8B5CF6' },
  { label: 'Follow-up Required', desc: 'Overdue responses', count: 2, color: '#FB7185' },
  { label: 'Ready to Submit', desc: 'Complete, needs submission', count: 2, color: '#10B981' },
]

const donutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' as const, labels: { boxWidth: 10, padding: 14, font: { size: 12 } } } }, cutout: '60%' }
const areaLineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(99,102,241,0.06)' } }, x: { grid: { display: false } } } }
const horizontalBarOptions = { responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, grid: { color: 'rgba(99,102,241,0.06)' } }, y: { grid: { display: false } } } }
</script>

<style scoped>
.dashboard-page { display: flex; flex-direction: column; gap: 20px; }

/* Greeting + period toggle */
.greeting-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.period-toggle { display: flex; gap: 4px; background: var(--glass-heavy); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border-soft); border-radius: 12px; padding: 4px; box-shadow: var(--shadow-sm); }
.period-btn { padding: 8px 18px; border-radius: 10px; border: none; background: transparent; font-family: var(--font-display); font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all var(--transition-base); }
.period-btn.active { background: var(--accent-primary); color: #fff; box-shadow: 0 2px 8px rgba(139, 92, 246, 0.25); }
.greeting-left { display: flex; align-items: center; gap: 18px; }
.greeting-avatar { width: 56px; height: 56px; border-radius: 14px; background: var(--glass-heavy); border: 1px solid var(--glass-border-soft); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); }
.greeting-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; margin: 0; line-height: 1.2; }
.greeting-sub { font-size: 14px; color: var(--text-muted); margin: 2px 0 0; }

/* Main grid: 2x2 KPIs + side card */
.main-grid { display: grid; grid-template-columns: 40% 1fr; gap: 16px; }
.kpi-zone { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

.kpi-card {
  background: var(--glass-heavy);   border: 1px solid var(--glass-border); border-radius: 16px; padding: 24px;
  box-shadow: var(--shadow-card), var(--depth-edge), var(--shadow-glass-inset); transition: all var(--transition-base);
  display: flex; flex-direction: column; gap: 14px; position: relative; overflow: hidden;
}
.kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover), var(--depth-edge), var(--shadow-glass-inset); }
.kpi-deco { position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; border-radius: 50%; border: 24px solid rgba(139, 92, 246, 0.04); pointer-events: none; }
.kpi-top-row { display: flex; align-items: center; gap: 14px; flex-wrap: nowrap; }
.kpi-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-value { font-family: var(--font-display); font-size: 32px; font-weight: 700; color: var(--text-primary); line-height: 1; white-space: nowrap; }
.kpi-label { font-size: 14px; color: var(--text-muted); font-weight: 500; margin-top: -4px; }
.kpi-footer { display: flex; align-items: center; gap: 10px; padding-top: 14px; border-top: 1px solid var(--glass-border-soft); }
.kpi-trend { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 8px; }
.trend-up { background: rgba(16, 185, 129, 0.10); color: #059669; }
.trend-down { background: rgba(239, 68, 68, 0.10); color: #dc2626; }
.kpi-period { font-size: 12px; color: var(--text-muted); }

.side-card {
  background: var(--glass-heavy);   border: 1px solid var(--glass-border-soft); border-radius: 16px; padding: 20px;
  box-shadow: var(--shadow-card), var(--depth-edge), var(--shadow-glass-inset); display: flex; flex-direction: column;
}
.card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title { font-family: var(--font-display); font-size: 15px; font-weight: 600; color: var(--text-primary); }
.card-subtitle { font-size: 12px; color: var(--text-muted); }
.card-more { color: var(--text-muted); cursor: pointer; }
.donut-wrap { flex: 1; min-height: 0; }

/* Bottom grid: wide chart + stat stack */
.triple-grid { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 16px; }
.triple-grid > * { min-height: 340px; }
.triple-grid .donut-wrap { height: 240px; }
.triple-grid .chart-area { height: 240px; }
.bottom-grid { display: grid; grid-template-columns: 1fr 280px; gap: 16px; }

.chart-card-wide {
  background: var(--glass-heavy);   border: 1px solid var(--glass-border-soft); border-radius: 16px; padding: 20px;
  box-shadow: var(--shadow-card), var(--depth-edge), var(--shadow-glass-inset);
}
.chart-area { height: 240px; margin-top: 12px; }

.stat-stack { display: flex; flex-direction: column; gap: 16px; }

.mini-stat-card {
  background: var(--glass-heavy);   border: 1px solid var(--glass-border-soft); border-radius: 16px; padding: 18px;
  box-shadow: var(--shadow-card), var(--depth-edge), var(--shadow-glass-inset); flex: 1; display: flex; flex-direction: column; gap: 10px;
}
.mini-stat-top { display: flex; align-items: center; justify-content: space-between; }
.mini-stat-label { font-size: 13px; color: var(--text-muted); font-weight: 500; }
.mini-stat-value { font-family: var(--font-display); font-size: 24px; font-weight: 700; color: var(--text-primary); }
.mini-stat-bottom { display: flex; align-items: center; justify-content: space-between; }
.mini-avatars { display: flex; gap: -4px; }
.mini-av { width: 28px; height: 28px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 11px; font-weight: 700; color: var(--text-primary); margin-right: -4px; border: 2px solid var(--glass-heavy); }
.mini-trend { font-size: 12px; font-weight: 600; }
.see-all-btn { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--accent-primary); background: none; border: none; cursor: pointer; padding: 0; }

/* Action list in side card */
.action-list { padding: 8px 20px 16px; display: flex; flex-direction: column; }
.action-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--glass-border-soft); }
.action-row:last-child { border-bottom: none; }
.action-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.action-info { flex: 1; }
.action-name { font-size: 13px; font-weight: 600; color: var(--text-primary); display: block; }
.action-desc { font-size: 11px; color: var(--text-muted); }
.action-count { font-family: var(--font-display); font-size: 18px; font-weight: 700; }

@media (max-width: 1200px) {
  .main-grid { grid-template-columns: 1fr; }
  .kpi-zone { grid-column: span 1; }
  .bottom-grid { grid-template-columns: 1fr; }
  .triple-grid { grid-template-columns: 1fr; }
  .triple-grid > * { min-height: auto; }
}
@media (max-width: 640px) {
  .kpi-zone { grid-template-columns: 1fr; }
  .greeting-row { flex-direction: column; align-items: stretch; }
}
</style>
