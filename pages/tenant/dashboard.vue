<template>
  <div class="dashboard-page">
    <header class="greeting-row">
      <div class="greeting-left">
        <div class="greeting-avatar"><v-icon size="32" color="primary">mdi-account-tie</v-icon></div>
        <div>
          <h1 class="greeting-title">Good {{ greeting }}, {{ userName }}</h1>
          <p class="greeting-sub">Monitor lending operations and track performance.</p>
        </div>
      </div>
      <div class="period-toggle">
        <button v-for="p in periods" :key="p" class="period-btn" :class="{ active: period === p }" @click="period = p">{{ p }}</button>
      </div>
    </header>

    <!-- Main grid: 2x2 KPIs + Side donut -->
    <!-- KPIs (2x2) + Disbursement chart side by side -->
    <section class="main-grid">
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
          <div><h3 class="card-title">Disbursement Trend</h3><span class="card-subtitle">₱12.4M total this year</span></div>
          <v-icon size="16" class="card-more">mdi-dots-horizontal</v-icon>
        </div>
        <div class="chart-area"><Line :data="disbursementData" :options="areaLineOptions" /></div>
      </article>
    </section>

    <!-- Application Status + Loan Types + Recent Apps — all in 1 row -->
    <section class="triple-grid">
      <article class="side-card">
        <div class="card-head"><h3 class="card-title">Application Status</h3><v-icon size="16" class="card-more">mdi-dots-horizontal</v-icon></div>
        <div class="donut-wrap"><Doughnut :data="statusData" :options="donutOptions" /></div>
      </article>
      <article class="chart-card-wide">
        <div class="card-head"><div><h3 class="card-title">Loan Type Distribution</h3></div><v-icon size="16" class="card-more">mdi-dots-horizontal</v-icon></div>
        <div class="chart-area"><Bar :data="loanTypeData" :options="horizontalBarOptions" /></div>
      </article>
      <article class="side-list-card">
        <div class="card-head"><h3 class="card-title">Recent Applications</h3><button class="see-all-btn">See All <v-icon size="14">mdi-arrow-right</v-icon></button></div>
        <div class="list-body">
          <div v-for="app in recentApps" :key="app.name" class="list-row">
            <div class="list-av" :style="{ background: app.bg }">{{ app.initials }}</div>
            <div class="list-info">
              <span class="list-name">{{ app.name }}</span>
              <span class="list-meta">₱{{ app.amount }}</span>
            </div>
            <span class="status-dot" :class="'dot-' + app.cls">{{ app.status }}</span>
          </div>
        </div>
      </article>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Line, Bar, Doughnut } from 'vue-chartjs'
import { useAuthStore } from '~/stores/auth'

definePageMeta({ middleware: ['role'], meta: { allowedRoles: ['tenant_admin'] } })

const authStore = useAuthStore()
const period = ref('Monthly')
const periods = ['Weekly', 'Monthly', 'Yearly']
const greeting = computed(() => { const h = new Date().getHours(); return h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening' })
const userName = computed(() => authStore.user?.firstName || 'Admin')

const kpiCards = [
  { label: 'Total Applications', value: '487', icon: 'mdi-file-document-multiple', iconBg: 'rgba(139,92,246,0.12)', iconColor: '#8B5CF6', trend: '+42', trendUp: true },
  { label: 'Active Officers', value: '18', icon: 'mdi-account-tie', iconBg: 'rgba(34,211,238,0.12)', iconColor: '#22D3EE', trend: '+2', trendUp: true },
  { label: 'Disbursed', value: '₱12.4M', icon: 'mdi-cash-check', iconBg: 'rgba(16,185,129,0.12)', iconColor: '#10B981', trend: '+32%', trendUp: true },
  { label: 'Pending Review', value: '34', icon: 'mdi-clock-outline', iconBg: 'rgba(251,191,36,0.12)', iconColor: '#FBBF24', trend: '-5', trendUp: true },
]

const statusData = {
  labels: ['Disbursed', 'Approved', 'Under Review', 'Submitted', 'Rejected'],
  datasets: [{ data: [193, 180, 34, 52, 28], backgroundColor: ['#10B981', '#8B5CF6', '#FBBF24', '#22D3EE', '#FB7185'], borderWidth: 0, spacing: 3 }]
}

const disbursementData = {
  labels: ['04 Jan', '08 Jan', '12 Jan', '16 Jan', '20 Jan', '24 Jan', '28 Jan', '30 Jan'],
  datasets: [{ label: 'Disbursed', data: [1.2, 2.8, 4.1, 3.5, 5.8, 7.2, 6.1, 8.4], borderColor: '#8B5CF6', backgroundColor: 'rgba(139,92,246,0.06)', fill: true, pointBackgroundColor: '#8B5CF6' }]
}

const loanTypeData = {
  labels: ['Personal Loan', 'Business Loan', 'Salary Loan', 'Emergency', 'Housing'],
  datasets: [{ data: [142, 98, 87, 65, 45], backgroundColor: ['#8B5CF6', '#22D3EE', '#FB7185', '#FBBF24', '#10B981'] }]
}

const recentApps = [
  { name: 'Pedro Lim', initials: 'PL', amount: '150,000', status: 'Approved', cls: 'success', bg: 'rgba(139,92,246,0.12)' },
  { name: 'Rosa Tan', initials: 'RT', amount: '500,000', status: 'Review', cls: 'warning', bg: 'rgba(34,211,238,0.12)' },
  { name: 'Mark Go', initials: 'MG', amount: '80,000', status: 'Submitted', cls: 'info', bg: 'rgba(251,113,133,0.12)' },
  { name: 'Joy Cruz', initials: 'JC', amount: '25,000', status: 'Rejected', cls: 'error', bg: 'rgba(251,191,36,0.12)' },
]

const donutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' as const, labels: { boxWidth: 10, padding: 14, font: { size: 12 } } } }, cutout: '60%' }
const areaLineOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(99,102,241,0.06)' } }, x: { grid: { display: false } } } }
const horizontalBarOptions = { responsive: true, maintainAspectRatio: false, indexAxis: 'y' as const, plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, grid: { color: 'rgba(99,102,241,0.06)' } }, y: { grid: { display: false } } } }
</script>

<style scoped>
.dashboard-page { display: flex; flex-direction: column; gap: 20px; }

.greeting-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; }
.period-toggle { display: flex; gap: 4px; background: var(--glass-heavy); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border-soft); border-radius: 12px; padding: 4px; box-shadow: var(--shadow-sm); }
.period-btn { padding: 8px 18px; border-radius: 10px; border: none; background: transparent; font-family: var(--font-display); font-size: 13px; font-weight: 500; color: var(--text-muted); cursor: pointer; transition: all var(--transition-base); }
.period-btn.active { background: var(--accent-primary); color: #fff; box-shadow: 0 2px 8px rgba(139,92,246,0.25); }
.greeting-left { display: flex; align-items: center; gap: 18px; }
.greeting-avatar { width: 56px; height: 56px; border-radius: 14px; background: var(--glass-heavy); border: 1px solid var(--glass-border-soft); display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-sm); flex-shrink: 0; }
.greeting-title { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; margin: 0; line-height: 1.2; }
.greeting-sub { font-size: 14px; color: var(--text-muted); margin: 2px 0 0; }

.main-grid { display: grid; grid-template-columns: 40% 1fr; gap: 16px; }
.kpi-zone { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.kpi-card { background: var(--glass-heavy);  border: 1px solid var(--glass-border); border-radius: 16px; padding: 24px; box-shadow: var(--shadow-card), var(--depth-edge), var(--shadow-glass-inset); transition: all var(--transition-base); display: flex; flex-direction: column; gap: 14px; position: relative; overflow: hidden; }
.kpi-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover), var(--depth-edge), var(--shadow-glass-inset); }
.kpi-deco { position: absolute; top: -20px; right: -20px; width: 100px; height: 100px; border-radius: 50%; border: 24px solid rgba(139, 92, 246, 0.04); pointer-events: none; }
.kpi-top-row { display: flex; align-items: center; gap: 14px; flex-wrap: nowrap; }
.kpi-icon { width: 42px; height: 42px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.kpi-value { font-family: var(--font-display); font-size: 32px; font-weight: 700; color: var(--text-primary); line-height: 1; white-space: nowrap; }
.kpi-label { font-size: 14px; color: var(--text-muted); font-weight: 500; margin-top: -4px; }
.kpi-footer { display: flex; align-items: center; gap: 10px; padding-top: 14px; border-top: 1px solid var(--glass-border-soft); }
.kpi-trend { font-size: 12px; font-weight: 600; padding: 3px 10px; border-radius: 8px; }
.trend-up { background: rgba(16,185,129,0.10); color: #059669; }
.trend-down { background: rgba(239,68,68,0.10); color: #dc2626; }
.kpi-period { font-size: 12px; color: var(--text-muted); }

.side-card { background: var(--glass-heavy);  border: 1px solid var(--glass-border); border-radius: 16px; padding: 20px; box-shadow: var(--shadow-card), var(--depth-edge), var(--shadow-glass-inset); display: flex; flex-direction: column; }
.card-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
.card-title { font-family: var(--font-display); font-size: 15px; font-weight: 600; color: var(--text-primary); }
.card-subtitle { font-size: 12px; color: var(--text-muted); }
.card-more { color: var(--text-muted); cursor: pointer; }
.donut-wrap { flex: 1; min-height: 0; }

.triple-grid { display: grid; grid-template-columns: 1fr 2fr 1fr; gap: 16px; }
.triple-grid > * { min-height: 340px; }
.triple-grid .donut-wrap { height: 240px; padding: 0; }
.triple-grid .chart-area { height: 240px; }
.triple-grid .list-body { overflow: visible; }
.bottom-grid { display: grid; grid-template-columns: 1fr 280px; gap: 16px; }
.chart-card-wide { background: var(--glass-heavy);  border: 1px solid var(--glass-border); border-radius: 16px; padding: 20px; box-shadow: var(--shadow-card), var(--depth-edge), var(--shadow-glass-inset); }
.chart-area { height: 240px; margin-top: 12px; }
.stat-stack { display: flex; flex-direction: column; gap: 16px; }
.mini-stat-card { background: var(--glass-heavy);  border: 1px solid var(--glass-border); border-radius: 16px; padding: 18px; box-shadow: var(--shadow-card), var(--depth-edge), var(--shadow-glass-inset); flex: 1; display: flex; flex-direction: column; gap: 8px; }
.mini-stat-label { font-size: 13px; color: var(--text-muted); font-weight: 500; }
.mini-stat-value { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: var(--text-primary); }
.mini-stat-bottom { display: flex; align-items: center; justify-content: space-between; }
.mini-trend { font-size: 12px; font-weight: 600; }
.see-all-btn { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--accent-primary); background: none; border: none; cursor: pointer; }

.side-list-card { background: var(--glass-heavy);  border: 1px solid var(--glass-border); border-radius: 16px; padding: 20px; box-shadow: var(--shadow-card), var(--depth-edge), var(--shadow-glass-inset); }
.list-body { display: flex; flex-direction: column; }
.list-row { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border-color-light); }
.list-row:last-child { border-bottom: none; }
.list-av { width: 34px; height: 34px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 12px; font-weight: 700; color: var(--text-primary); flex-shrink: 0; }
.list-info { flex: 1; min-width: 0; }
.list-name { font-size: 13px; font-weight: 600; color: var(--text-primary); display: block; }
.list-meta { font-size: 11px; color: var(--text-muted); }
.status-dot { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px; white-space: nowrap; }
.dot-success { background: rgba(16,185,129,0.10); color: #059669; }
.dot-warning { background: rgba(251,191,36,0.10); color: #D97706; }
.dot-info { background: rgba(139,92,246,0.10); color: #7C3AED; }
.dot-error { background: rgba(239,68,68,0.10); color: #DC2626; }

@media (max-width: 1200px) { .main-grid { grid-template-columns: 1fr; } .kpi-zone { grid-column: span 1; } .bottom-grid { grid-template-columns: 1fr; } .triple-grid { grid-template-columns: 1fr; } }
@media (max-width: 640px) { .kpi-zone { grid-template-columns: 1fr; } .dash-topbar { flex-direction: column; align-items: stretch; } .search-box { max-width: none; } }
</style>
