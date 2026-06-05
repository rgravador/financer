<template>
  <div class="dashboard-page">
    <!-- Greeting + period toggle -->
    <header class="greeting-row">
      <div class="greeting-left">
        <div class="greeting-avatar">
          <v-icon size="32" color="primary">mdi-clipboard-check-outline</v-icon>
        </div>
        <div>
          <h1 class="greeting-title">Good {{ greeting }}, {{ userName }}</h1>
          <p class="greeting-sub">Here's your review activity and queue status.</p>
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
            <h3 class="card-title">Daily Reviews</h3>
            <span class="card-subtitle">Last 14 days</span>
          </div>
          <v-icon size="16" class="card-more">mdi-dots-horizontal</v-icon>
        </div>
        <div class="chart-area">
          <Bar :data="dailyReviewData" :options="stackedBarOptions" />
        </div>
      </article>
    </section>

    <!-- Row: Decision donut + Stats -->
    <section class="bottom-grid">
      <article class="side-card" style="min-height: 300px;">
        <div class="card-head">
          <h3 class="card-title">Decision Breakdown</h3>
          <v-icon size="16" class="card-more">mdi-dots-horizontal</v-icon>
        </div>
        <div class="donut-wrap">
          <Doughnut :data="decisionDonutData" :options="donutOptions" />
        </div>
      </article>

      <!-- Right: Stat cards stacked -->
      <div class="stat-stack">
        <article class="mini-stat-card">
          <div class="mini-stat-top">
            <span class="mini-stat-label">Processing Time</span>
          </div>
          <span class="mini-stat-value">2.4h</span>
          <div class="mini-stat-bottom">
            <span class="mini-trend trend-up">-18% vs last month</span>
            <button class="see-all-btn">Details <v-icon size="14">mdi-arrow-right</v-icon></button>
          </div>
        </article>

        <article class="mini-stat-card">
          <div class="mini-stat-top">
            <span class="mini-stat-label">Consistency Score</span>
          </div>
          <span class="mini-stat-value">94%</span>
          <div class="mini-stat-bottom">
            <span class="mini-trend trend-up">+2% this month</span>
            <button class="see-all-btn">Details <v-icon size="14">mdi-arrow-right</v-icon></button>
          </div>
        </article>
      </div>
    </section>

    <!-- Extra bottom row: Queue by Type + Next in Queue list -->
    <section class="bottom-grid">
      <article class="chart-card-wide">
        <div class="card-head">
          <div>
            <h3 class="card-title">Queue by Loan Type</h3>
            <span class="card-subtitle">Current queue</span>
          </div>
          <v-icon size="16" class="card-more">mdi-dots-horizontal</v-icon>
        </div>
        <div class="chart-area">
          <Bar :data="queueByTypeData" :options="horizontalBarOptions" />
        </div>
      </article>

      <article class="side-card" style="padding: 0;">
        <div class="card-head" style="padding: 20px 20px 0;">
          <h3 class="card-title">Next in Queue</h3>
          <v-icon size="16" class="card-more">mdi-dots-horizontal</v-icon>
        </div>
        <div class="queue-list">
          <div v-for="item in queueItems" :key="item.name" class="queue-row">
            <div class="queue-avatar" :style="{ background: item.bg }">{{ item.initials }}</div>
            <div class="queue-info">
              <span class="queue-name">{{ item.name }}</span>
              <span class="queue-meta">{{ item.type }} &middot; ₱{{ item.amount }}</span>
            </div>
            <span class="wait-badge" :class="item.urgent ? 'wait-urgent' : 'wait-normal'">{{ item.waiting }}</span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Bar, Doughnut } from 'vue-chartjs'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: ['role'], meta: { allowedRoles: ['tenant_approver'] } })

const authStore = useAuthStore()
const period = ref('Monthly')
const periods = ['Weekly', 'Monthly', 'Yearly']
const greeting = computed(() => { const h = new Date().getHours(); return h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening' })
const userName = computed(() => authStore.user?.firstName || 'Approver')

const kpiCards = [
  { label: 'Queue Size', value: '12', icon: 'mdi-clipboard-text-clock-outline', iconBg: 'rgba(251, 191, 36, 0.12)', iconColor: '#FBBF24', trend: '-3', trendUp: true },
  { label: 'Reviewed Today', value: '8', icon: 'mdi-check-decagram-outline', iconBg: 'rgba(139, 92, 246, 0.12)', iconColor: '#8B5CF6', trend: '+2', trendUp: true },
  { label: 'Avg Processing', value: '2.4h', icon: 'mdi-timer-outline', iconBg: 'rgba(34, 211, 238, 0.12)', iconColor: '#22D3EE', trend: '-18%', trendUp: true },
  { label: 'Approval Rate', value: '82%', icon: 'mdi-thumb-up-outline', iconBg: 'rgba(16, 185, 129, 0.12)', iconColor: '#10B981', trend: '+4%', trendUp: true },
]

const decisionDonutData = {
  labels: ['Approved', 'Rejected', 'Returned'],
  datasets: [{ data: [312, 68, 45], backgroundColor: ['#10B981', '#FB7185', '#FBBF24'], borderWidth: 0, spacing: 3 }]
}

const days = Array.from({ length: 14 }, (_, i) => `D${i + 1}`)
const dailyReviewData = {
  labels: days,
  datasets: [
    { label: 'Approved', data: [5, 7, 4, 8, 6, 3, 0, 7, 9, 5, 8, 6, 4, 8], backgroundColor: '#10B981' },
    { label: 'Rejected', data: [1, 2, 1, 1, 2, 0, 0, 1, 2, 1, 1, 2, 0, 1], backgroundColor: '#FB7185' },
  ]
}

const queueByTypeData = {
  labels: ['Personal', 'Business', 'Salary', 'Emergency', 'Housing'],
  datasets: [{ label: 'In Queue', data: [4, 3, 2, 2, 1], backgroundColor: ['#8B5CF6', '#22D3EE', '#FB7185', '#FBBF24', '#10B981'] }]
}

const queueItems = [
  { name: 'Miguel Torres', initials: 'MT', type: 'Personal Loan', amount: '200,000', waiting: '3h', urgent: false, bg: 'rgba(139, 92, 246, 0.10)' },
  { name: 'Carmen Reyes', initials: 'CR', type: 'Business Loan', amount: '750,000', waiting: '6h', urgent: false, bg: 'rgba(34, 211, 238, 0.10)' },
  { name: 'Roberto Lim', initials: 'RL', type: 'Salary Loan', amount: '50,000', waiting: '12h', urgent: true, bg: 'rgba(251, 113, 133, 0.10)' },
  { name: 'Grace Tan', initials: 'GT', type: 'Emergency', amount: '30,000', waiting: '1d', urgent: true, bg: 'rgba(251, 191, 36, 0.10)' },
  { name: 'Paulo Santos', initials: 'PS', type: 'Housing Loan', amount: '1,500,000', waiting: '2h', urgent: false, bg: 'rgba(16, 185, 129, 0.10)' },
]

const donutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' as const, labels: { boxWidth: 10, padding: 14, font: { size: 12 } } } }, cutout: '60%' }
const stackedBarOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const, labels: { boxWidth: 10, padding: 14, font: { size: 12 } } } }, scales: { y: { beginAtZero: true, stacked: true, grid: { color: 'rgba(99,102,241,0.06)' } }, x: { stacked: true, grid: { display: false } } } }
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

/* Queue list in side card */
.queue-list { padding: 8px 20px 16px; display: flex; flex-direction: column; }
.queue-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--glass-border-soft); }
.queue-row:last-child { border-bottom: none; }
.queue-avatar { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 12px; font-weight: 700; color: var(--text-primary); flex-shrink: 0; }
.queue-info { flex: 1; min-width: 0; }
.queue-name { font-size: 13px; font-weight: 600; color: var(--text-primary); display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.queue-meta { font-size: 11px; color: var(--text-muted); }
.wait-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 12px; flex-shrink: 0; }
.wait-normal { background: rgba(139, 92, 246, 0.10); color: #7C3AED; }
.wait-urgent { background: rgba(239, 68, 68, 0.10); color: #DC2626; }

@media (max-width: 1200px) {
  .main-grid { grid-template-columns: 1fr; }
  .kpi-zone { grid-column: span 1; }
  .bottom-grid { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .kpi-zone { grid-template-columns: 1fr; }
  .greeting-row { flex-direction: column; align-items: stretch; }
}
</style>
