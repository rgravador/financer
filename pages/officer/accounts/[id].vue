<template>
  <div class="profile-page">
    <div class="back-row">
      <v-btn variant="text" size="small" @click="$router.push('/officer/accounts')">
        <v-icon start>mdi-arrow-left</v-icon>
        Back to Accounts
      </v-btn>
    </div>

    <div v-if="loading" class="loading-state">
      <v-progress-circular indeterminate color="primary" size="48" width="4" />
      <p>Loading borrower profile...</p>
    </div>

    <v-alert v-else-if="error" type="error" variant="tonal" class="mb-6">{{ error }}</v-alert>

    <template v-else-if="borrower">
      <!-- ═══ ZONE 1: Identity Header ═══ -->
      <header class="identity-header">
        <div class="identity-body">
          <div class="identity-left">
            <div class="avatar-frame">
              <v-avatar size="72" color="primary" variant="tonal">
                <span class="avatar-text">{{ borrower.firstName?.[0] }}{{ borrower.lastName?.[0] }}</span>
              </v-avatar>
            </div>
            <div class="identity-info">
              <h1 class="identity-name">{{ borrower.fullName || `${borrower.firstName} ${borrower.lastName}` }}</h1>
              <div class="identity-meta">
                <span class="meta-text">{{ borrower.email }}</span>
                <span class="meta-dot">·</span>
                <span class="meta-text">{{ borrower.contactNumber }}</span>
              </div>
            </div>
          </div>
          <div class="identity-actions">
            <v-chip :color="borrower.isActive ? 'success' : 'error'" variant="tonal" size="small">
              {{ borrower.isActive ? 'Active Account' : 'Inactive Account' }}
            </v-chip>
          </div>
        </div>

        <!-- Balance-style stat -->
        <div class="wallet-section">
          <span class="wallet-label">Total Borrowed</span>
          <div class="wallet-amount-row">
            <div class="wallet-amount-icon" style="background: rgba(139,92,246,0.08); color: #8B5CF6;"><v-icon size="22">mdi-cash-multiple</v-icon></div>
            <span class="wallet-amount">₱{{ formatNumber(totalBorrowed) }}</span>
          </div>
          <div class="wallet-pills">
            <v-btn variant="outlined" size="small" rounded="pill" @click="editBorrower"><v-icon start size="16">mdi-pencil</v-icon>Edit</v-btn>
            <v-btn variant="outlined" size="small" rounded="pill" :to="`/officer/applications/new?borrowerId=${borrower.id}`"><v-icon start size="16">mdi-plus</v-icon>New Loan</v-btn>
            <v-btn variant="outlined" size="small" rounded="pill"><v-icon start size="16">mdi-history</v-icon>History</v-btn>
          </div>
        </div>

        <!-- Dashed divider -->
        <div class="dashed-divider"></div>

        <!-- Stat strip -->
        <div class="stat-strip">
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(16,185,129,0.08); color: #10B981;"><v-icon size="20">mdi-wallet-outline</v-icon></div>
            <div class="stat-body">
              <span class="stat-value">₱{{ formatNumber(borrower.monthlyIncome) }}</span>
              <span class="stat-label">Monthly Income</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon score-ring-mini" :class="scoreClass">
              <span class="score-mini-val">{{ borrower.creditScore || '—' }}</span>
            </div>
            <div class="stat-body">
              <span class="stat-value">{{ scoreLabel }}</span>
              <span class="stat-label">Credit Score</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon" style="background: rgba(251,113,133,0.08); color: #FB7185;"><v-icon size="20">mdi-calendar-clock</v-icon></div>
            <div class="stat-body">
              <span class="stat-value">{{ loanHistory.length }}</span>
              <span class="stat-label">Applications</span>
            </div>
          </div>
        </div>
      </header>

      <!-- ═══ TIER 1: Hero Financial Cards — biggest, most prominent ═══ -->
      <div class="hero-row">
        <!-- Income card -->
        <article class="hero-card">
          <div class="hero-top">
            <div class="hero-icon" style="background: rgba(16,185,129,0.10); color: #10B981;"><v-icon size="22">mdi-cash-multiple</v-icon></div>
            <span class="hero-label">Monthly Income</span>
          </div>
          <span class="hero-number">₱{{ formatNumber(borrower.monthlyIncome) }}</span>
          <span class="hero-sub">{{ borrower.incomeSource || 'salary' }} · {{ formatEmployment(borrower.employmentType) }}</span>
        </article>

        <!-- Credit Score card -->
        <article class="hero-card hero-card--score">
          <div class="hero-top">
            <div class="hero-icon" style="background: rgba(251,191,36,0.10); color: #F59E0B;"><v-icon size="22">mdi-shield-star-outline</v-icon></div>
            <span class="hero-label">Credit Score</span>
          </div>
          <div class="hero-score-row">
            <div class="hero-ring" :class="scoreClass">
              <svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" stroke-width="6" opacity="0.1"/><circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" stroke-width="6" :stroke-dasharray="213.6" :stroke-dashoffset="213.6 - (213.6 * (borrower.creditScore || 0) / 850)" stroke-linecap="round" transform="rotate(-90 40 40)" class="score-arc"/></svg>
              <span class="hero-ring-val">{{ borrower.creditScore || '—' }}</span>
            </div>
            <div class="hero-score-meta">
              <span class="hero-score-label" :class="scoreClass">{{ scoreLabel }}</span>
              <div class="flag-mini"><v-icon :color="borrower.hasDefaults ? 'error' : 'success'" size="14">{{ borrower.hasDefaults ? 'mdi-close' : 'mdi-check' }}</v-icon><span>Defaults</span></div>
              <div class="flag-mini"><v-icon :color="borrower.hasLatePayments ? 'warning' : 'success'" size="14">{{ borrower.hasLatePayments ? 'mdi-close' : 'mdi-check' }}</v-icon><span>Late pays</span></div>
            </div>
          </div>
        </article>

        <!-- Total Borrowed -->
        <article class="hero-card">
          <div class="hero-top">
            <div class="hero-icon" style="background: rgba(139,92,246,0.10); color: #8B5CF6;"><v-icon size="22">mdi-bank-transfer</v-icon></div>
            <span class="hero-label">Total Borrowed</span>
          </div>
          <span class="hero-number">₱{{ formatNumber(totalBorrowed) }}</span>
          <span class="hero-sub">{{ loanHistory.length }} applications</span>
        </article>

        <!-- Debt Ratio -->
        <article class="hero-card">
          <div class="hero-top">
            <div class="hero-icon" style="background: rgba(251,113,133,0.10); color: #FB7185;"><v-icon size="22">mdi-scale-balance</v-icon></div>
            <span class="hero-label">Debt-to-Income</span>
          </div>
          <span class="hero-number" :class="ratioClass">{{ debtRatio }}%</span>
          <div class="hero-ratio-track"><div class="hero-ratio-fill" :style="{ width: Math.min(debtRatio, 100) + '%' }" :class="ratioClass"></div></div>
        </article>
      </div>

      <!-- ═══ TIER 2: Primary Info Cards — Business Card Style ═══ -->
      <div class="primary-row">
        <!-- Personal -->
        <article class="info-card">
          <div class="info-card-accent" style="background: #8B5CF6;"></div>
          <div class="info-card-inner">
            <div class="info-card-head">
              <div class="info-icon" style="background: rgba(139,92,246,0.08); color: #8B5CF6;"><v-icon size="18">mdi-account-outline</v-icon></div>
              <h3 class="info-title">Personal</h3>
            </div>
            <v-chip v-if="borrower.dateOfBirth" variant="tonal" size="x-small" color="purple" class="card-status-chip">
              Born {{ formatDate(borrower.dateOfBirth) }}
            </v-chip>
            <div class="card-hero-name">{{ borrower.firstName }} {{ borrower.lastName }}</div>
            <div v-if="borrower.governmentIdType" class="card-inline-detail">
              {{ formatIdType(borrower.governmentIdType) }} · {{ borrower.governmentIdNumber }}
            </div>
            <div class="card-sub-detail">Member since {{ formatDate(borrower.createdAt) }}</div>
          </div>
        </article>

        <!-- Employment -->
        <article class="info-card">
          <div class="info-card-accent" style="background: #10B981;"></div>
          <div class="info-card-inner">
            <div class="info-card-head">
              <div class="info-icon" style="background: rgba(16,185,129,0.08); color: #10B981;"><v-icon size="18">mdi-briefcase-outline</v-icon></div>
              <h3 class="info-title">Employment</h3>
            </div>
            <v-chip variant="tonal" size="x-small" color="success" class="card-status-chip">{{ formatEmployment(borrower.employmentType) }}</v-chip>
            <div class="card-hero-name">{{ borrower.employer || 'Not specified' }}</div>
            <div class="card-hero-metric">₱{{ formatNumber(borrower.existingObligations || 0) }}<span class="card-metric-context">monthly obligations</span></div>
            <div class="card-sub-detail">{{ borrower.employmentLength ? Math.floor(borrower.employmentLength / 12) + 'y ' + (borrower.employmentLength % 12) + 'm tenure' : 'Tenure not specified' }}</div>
          </div>
        </article>

        <!-- Address -->
        <article class="info-card">
          <div class="info-card-accent" style="background: #22D3EE;"></div>
          <div class="info-card-inner">
            <div class="info-card-head">
              <div class="info-icon" style="background: rgba(34,211,238,0.08); color: #22D3EE;"><v-icon size="18">mdi-home-outline</v-icon></div>
              <h3 class="info-title">Address</h3>
            </div>
            <v-chip variant="tonal" size="x-small" color="primary" class="card-status-chip">{{ formatHousing(borrower.housingStatus) }}</v-chip>
            <div class="card-hero-name">{{ borrower.address || 'No address' }}</div>
            <div class="card-inline-detail">{{ borrower.yearsAtCurrentAddress ?? '—' }} years at this address</div>
            <div class="card-sub-detail">Bank · {{ borrower.bankName || 'Not specified' }}</div>
          </div>
        </article>
      </div>

      <!-- ═══ 3-Column Detail Layout ═══ -->
      <div class="detail-columns">
        <!-- Column 1: References, External Loans, Payments -->
        <div class="detail-col">
          <article class="info-card info-card--stacked">
            <div class="info-card-accent" style="background: #64748B;"></div>
            <div class="info-card-inner">
              <div class="info-card-head"><div class="info-icon" style="background: rgba(100,116,139,0.08); color: #64748B;"><v-icon size="18">mdi-account-multiple-outline</v-icon></div><h3 class="info-title">References</h3></div>
              <div v-if="borrower.references?.length" class="ref-list">
                <div v-for="(ref, i) in borrower.references" :key="i" class="ref-card">
                  <v-avatar size="34" color="secondary" variant="tonal"><span style="font-size: 12px; font-weight: 600;">{{ ref.name?.[0] }}</span></v-avatar>
                  <div class="ref-info"><span class="ref-name">{{ ref.name }}</span><span class="ref-detail">{{ ref.relationship }} · {{ ref.contactNumber }}</span></div>
                </div>
              </div>
              <div v-else class="empty-block"><span>No references</span></div>
            </div>
          </article>

          <article v-if="borrower.pastLoans?.length" class="info-card info-card--stacked">
            <div class="info-card-accent" style="background: #F59E0B;"></div>
            <div class="info-card-inner">
              <div class="info-card-head"><div class="info-icon" style="background: rgba(251,191,36,0.08); color: #F59E0B;"><v-icon size="18">mdi-bank-outline</v-icon></div><h3 class="info-title">External Loans</h3></div>
              <div class="txn-list txn-list--compact">
                <div v-for="(loan, i) in borrower.pastLoans" :key="i" class="txn-row">
                  <div class="txn-status-bar" :class="'txn-bar--' + loan.status"></div>
                  <div class="txn-info">
                    <span class="txn-name">{{ loan.lender }}</span>
                    <span class="txn-detail">External loan</span>
                  </div>
                  <div class="txn-right">
                    <span class="txn-amount">₱{{ formatNumber(loan.amount) }}</span>
                    <v-chip :color="loanStatusColor(loan.status)" size="x-small" variant="tonal">{{ loan.status }}</v-chip>
                  </div>
                </div>
              </div>
            </div>
          </article>

          <article class="info-card info-card--stacked">
            <div class="info-card-accent" style="background: #FB7185;"></div>
            <div class="info-card-inner">
              <div class="info-card-head"><div class="info-icon" style="background: rgba(251,113,133,0.08); color: #FB7185;"><v-icon size="18">mdi-calendar-month-outline</v-icon></div><h3 class="info-title">Payments</h3></div>
              <div class="payment-calendar">
                <div v-for="(m, i) in paymentMonths" :key="i" class="cal-cell" :class="'cal--' + m.status" :title="m.label + ': ' + m.status"><span class="cal-label">{{ m.short }}</span></div>
              </div>
              <div class="cal-legend">
                <span class="cal-leg"><span class="cal-dot cal--ontime"></span>On time</span>
                <span class="cal-leg"><span class="cal-dot cal--late"></span>Late</span>
                <span class="cal-leg"><span class="cal-dot cal--missed"></span>Missed</span>
                <span class="cal-leg"><span class="cal-dot cal--none"></span>None</span>
              </div>
            </div>
          </article>
        </div>

        <!-- Column 2: Loan History -->
        <div class="detail-col detail-col--fill">
          <article class="info-card info-card--wide info-card--fill">
            <div class="fill-card-header">
              <div class="section-head">
                <div class="section-head-left">
                  <div class="info-icon" style="background: rgba(139,92,246,0.08); color: #8B5CF6;"><v-icon size="18">mdi-file-document-multiple-outline</v-icon></div>
                  <h3 class="info-title">Loan History</h3>
                  <v-chip size="x-small" variant="tonal" color="primary">{{ loanHistory.length }}</v-chip>
                </div>
              </div>
              <div class="section-divider"></div>
            </div>
            <div class="fill-card-scroll">
              <div v-if="loanHistory.length === 0" class="empty-block"><v-icon size="32">mdi-file-document-outline</v-icon><span>No loan applications yet</span></div>
              <div v-else class="txn-list">
                <div v-for="loan in loanHistory" :key="loan.id" class="txn-row">
                  <div class="txn-status-bar" :class="'txn-bar--' + loan.status"></div>
                  <div class="txn-info">
                    <span class="txn-name">{{ loan.loanTypeName || 'Loan' }}</span>
                    <span class="txn-detail">{{ loan.loanDetails?.requestedTerm }}mo term · {{ formatDate(loan.createdAt) }}</span>
                  </div>
                  <div class="txn-right">
                    <span class="txn-amount">₱{{ formatNumber(loan.loanDetails?.requestedAmount) }}</span>
                    <v-chip :color="appStatusColor(loan.status)" size="x-small" variant="tonal">{{ loan.status }}</v-chip>
                  </div>
                </div>
              </div>
            </div>
            <div class="fill-card-footer">
              <span class="section-see-all">See All Loans</span>
            </div>
          </article>
        </div>

        <!-- Column 3: Activity Timeline -->
        <div class="detail-col detail-col--fill">
          <article class="info-card info-card--fill" style="flex-direction: column;">
            <div class="fill-card-header" style="padding: 20px 20px 0;">
              <div class="info-card-head"><div class="info-icon" style="background: rgba(100,116,139,0.08); color: #64748B;"><v-icon size="18">mdi-timeline-clock-outline</v-icon></div><h3 class="info-title">Activity Timeline</h3></div>
            </div>
            <div class="fill-card-scroll" style="padding: 0 20px;">
              <v-timeline density="compact" side="end" class="activity-timeline">
                <v-timeline-item v-for="(event, i) in activityFeed" :key="i" :dot-color="event.color" size="small">
                  <div class="timeline-card"><span class="timeline-title">{{ event.title }}</span><span class="timeline-date">{{ event.date }}</span></div>
                </v-timeline-item>
              </v-timeline>
            </div>
            <div class="fill-card-footer" style="padding: 0 20px 16px;">
              <span class="section-see-all">See All Activity</span>
            </div>
          </article>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useBorrowersStore } from '~/stores/borrowers'

definePageMeta({ middleware: ['role'], meta: { allowedRoles: ['tenant_officer', 'tenant_admin'] } })

const route = useRoute()
const borrowersStore = useBorrowersStore()

const loading = ref(true)
const error = ref('')
const borrower = ref<any>(null)
const loanHistory = ref<any[]>([])
const activeTab = ref('overview')

onMounted(async () => {
  try {
    await borrowersStore.fetchBorrowerById(route.params.id as string)
    const real = borrowersStore.currentBorrower
    borrower.value = {
      ...real,
      creditScore: real?.creditScore || 720,
      creditHistory: real?.creditHistory || 'Good standing — consistent payments across 3 previous loans',
      hasDefaults: real?.hasDefaults ?? false,
      hasLatePayments: real?.hasLatePayments ?? false,
      housingStatus: real?.housingStatus || 'renting',
      yearsAtCurrentAddress: real?.yearsAtCurrentAddress ?? 3,
      employmentLength: real?.employmentLength ?? 24,
      incomeSource: real?.incomeSource || 'salary',
      existingObligations: real?.existingObligations ?? 8500,
      dependentsCount: real?.dependentsCount ?? 2,
      monthlyRent: real?.monthlyRent ?? 12000,
      bankName: real?.bankName || 'BDO Unibank',
      bankAccountNumber: real?.bankAccountNumber || '0012345678',
      hasBankStatements: real?.hasBankStatements ?? true,
      pastLoans: real?.pastLoans?.length ? real.pastLoans : [
        { lender: 'BPI', amount: 50000, status: 'paid' },
        { lender: 'Home Credit', amount: 25000, status: 'paid' },
      ],
      references: real?.references?.length ? real.references : [
        { name: 'Maria Santos', relationship: 'Sister', contactNumber: '09171234567' },
        { name: 'Carlos Reyes', relationship: 'Colleague', contactNumber: '09189876543' },
      ],
    }
    const realLoans = borrowersStore.loanHistory || []
    loanHistory.value = realLoans.length ? realLoans : [
      { id: '1', loanTypeName: 'Personal Loan', loanDetails: { requestedAmount: 50000, requestedTerm: 12 }, status: 'disbursed', createdAt: '2025-08-15' },
      { id: '2', loanTypeName: 'Salary Loan', loanDetails: { requestedAmount: 25000, requestedTerm: 6 }, status: 'approved', createdAt: '2026-01-10' },
      { id: '3', loanTypeName: 'Emergency Loan', loanDetails: { requestedAmount: 15000, requestedTerm: 3 }, status: 'draft', createdAt: '2026-05-28' },
    ]
  } catch { error.value = 'Failed to load borrower profile' }
  finally { loading.value = false }
})

onUnmounted(() => borrowersStore.clearCurrentBorrower())

const editBorrower = () => navigateTo(`/officer/accounts?edit=${route.params.id}`)
const formatDate = (d: any) => d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'
const formatNumber = (n: any) => n != null ? Number(n).toLocaleString() : '0'
const formatEmployment = (t: string) => ({ employed: 'Employed', self_employed: 'Self-Employed', business_owner: 'Business Owner', ofw: 'OFW', other: 'Other' }[t] || t || '—')
const formatHousing = (h: string) => ({ owned: 'Owned', renting: 'Renting', living_with_relatives: 'With Relatives', company_provided: 'Company', other: 'Other' }[h] || h || '—')
const formatIdType = (t: string) => ({ passport: 'Passport', drivers_license: "Driver's License", sss: 'SSS', philhealth: 'PhilHealth', pagibig: 'Pag-IBIG', tin: 'TIN', voters_id: "Voter's ID", postal_id: 'Postal ID', umid: 'UMID', national_id: 'National ID' }[t] || t)

const totalBorrowed = computed(() => loanHistory.value.reduce((sum, l) => sum + (l.loanDetails?.requestedAmount || 0), 0))
const debtRatio = computed(() => borrower.value?.monthlyIncome && borrower.value?.existingObligations ? Math.round((borrower.value.existingObligations / borrower.value.monthlyIncome) * 100) : 0)
const ratioClass = computed(() => { const r = debtRatio.value; return r <= 30 ? 'ratio-good' : r <= 50 ? 'ratio-fair' : 'ratio-poor' })
const scoreClass = computed(() => { const s = borrower.value?.creditScore; if (!s) return 'score-none'; if (s >= 750) return 'score-excellent'; if (s >= 650) return 'score-good'; if (s >= 550) return 'score-fair'; return 'score-poor' })
const scoreLabel = computed(() => { const s = borrower.value?.creditScore; if (!s) return 'N/A'; if (s >= 750) return 'Excellent'; if (s >= 650) return 'Good'; if (s >= 550) return 'Fair'; return 'Poor' })
const loanStatusColor = (s: string) => ({ paid: 'success', current: 'info', defaulted: 'error', restructured: 'warning' }[s] || 'grey')
const appStatusColor = (s: string) => ({ draft: 'grey', submitted: 'primary', under_review: 'warning', pending_documents: 'info', approved: 'success', rejected: 'error', disbursed: 'success' }[s] || 'grey')

// Mock payment calendar (12 months)
const paymentMonths = computed(() => {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
  const statuses = ['ontime', 'ontime', 'ontime', 'late', 'ontime', 'ontime', 'ontime', 'ontime', 'missed', 'ontime', 'ontime', 'none']
  return months.map((m, i) => ({ short: m, label: m + ' 2025', status: statuses[i] }))
})

// Mock activity feed
const activityFeed = computed(() => [
  { title: 'Loan application #3 created (Emergency Loan)', date: 'May 28, 2026', color: '#8B5CF6' },
  { title: 'Salary Loan approved — ₱25,000', date: 'Jan 12, 2026', color: '#10B981' },
  { title: 'Salary Loan application submitted', date: 'Jan 10, 2026', color: '#3B82F6' },
  { title: 'Personal Loan disbursed — ₱50,000', date: 'Aug 20, 2025', color: '#10B981' },
  { title: 'Personal Loan approved', date: 'Aug 18, 2025', color: '#10B981' },
  { title: 'Account created by officer', date: formatDate(borrower.value?.createdAt), color: '#8B5CF6' },
])
</script>

<style scoped>
.profile-page { max-width: 100%; }
.back-row { margin-bottom: 12px; }
.loading-state { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 80px 0; color: var(--text-muted); }

/* ═══ Identity Header ═══ */
.identity-header {
  background: var(--glass-heavy);
  border: 1px solid var(--glass-border);
  border-radius: 20px;
  box-shadow: var(--shadow-card), var(--depth-edge), var(--shadow-glass-inset);
  overflow: hidden;
  margin-bottom: 20px;
}

.identity-body { display: flex; align-items: center; justify-content: space-between; padding: 20px 24px 20px; gap: 16px; flex-wrap: wrap; }
.identity-left { display: flex; align-items: center; gap: 16px; }
.identity-info { display: flex; flex-direction: column; justify-content: center; }
.avatar-frame { padding: 3px; border-radius: 50%; background: var(--glass-heavy); box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
.avatar-text { font-family: var(--font-display); font-size: 26px; font-weight: 700; }
.identity-info { padding-top: 0; }
.identity-name { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); margin: 0 0 2px; line-height: 1.2; }
.identity-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.meta-dot { color: var(--text-muted); }
.meta-text { font-size: 13px; color: var(--text-muted); }
.identity-actions { display: flex; gap: 8px; }

/* Wallet section — balance card pattern */
.wallet-section { padding: 4px 24px 16px; }
.wallet-label { font-size: 12px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; display: block; margin-bottom: 6px; }
.wallet-amount-row { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.wallet-amount-icon { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.wallet-amount { font-family: var(--font-display); font-size: 36px; font-weight: 700; color: var(--text-primary); line-height: 1; }
.wallet-pills { display: flex; gap: 10px; flex-wrap: wrap; }
.wallet-pills .v-btn { border-color: rgba(var(--v-theme-on-surface), 0.15); font-weight: 500; }

/* Dashed divider */
.dashed-divider { margin: 0 24px; border-top: 2px dashed rgba(var(--v-theme-on-surface), 0.08); }

/* Stat strip */
.stat-strip { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 16px 24px 20px; }
.stat-card { display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 12px; background: rgba(0,0,0,0.015); }
.stat-icon { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.stat-body { display: flex; flex-direction: column; }
.stat-value { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text-primary); }
.stat-label { font-size: 11px; color: var(--text-muted); }

.score-ring-mini { width: 40px; height: 40px; border-radius: 50%; border: 3px solid; display: flex; align-items: center; justify-content: center; }
.score-mini-val { font-family: var(--font-display); font-size: 12px; font-weight: 700; }
.score-excellent { border-color: #10B981; color: #10B981; }
.score-good { border-color: #3B82F6; color: #3B82F6; }
.score-fair { border-color: #F59E0B; color: #F59E0B; }
.score-poor { border-color: #EF4444; color: #EF4444; }
.score-none { border-color: var(--text-muted); color: var(--text-muted); }

/* ═══ TIER 1: Hero cards — 4 across, big numbers ═══ */
.hero-row { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 16px; }

.hero-card {
  background: var(--glass-heavy);
  border: 1px solid var(--glass-border);
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--shadow-card), var(--depth-edge), var(--shadow-glass-inset);
  transition: transform 200ms, box-shadow 200ms;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.hero-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-card-hover), var(--depth-edge), var(--shadow-glass-inset); }

.hero-top { display: flex; align-items: center; gap: 10px; }
.hero-icon { width: 38px; height: 38px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.hero-label { font-size: 12px; font-weight: 500; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.hero-number { font-family: var(--font-display); font-size: 34px; font-weight: 700; color: var(--text-primary); line-height: 1; }
.hero-sub { font-size: 12px; color: var(--text-muted); }

/* Score ring in hero card */
.hero-score-row { display: flex; align-items: center; gap: 14px; }
.hero-ring { width: 64px; height: 64px; position: relative; flex-shrink: 0; }
.hero-ring svg { width: 100%; height: 100%; }
.score-arc { transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1); }
.hero-ring-val { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 16px; font-weight: 700; }
.hero-score-meta { display: flex; flex-direction: column; gap: 4px; }
.hero-score-label { font-family: var(--font-display); font-size: 15px; font-weight: 700; }
.flag-mini { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-muted); }

/* Debt ratio mini track */
.hero-ratio-track { height: 6px; border-radius: 3px; background: rgba(0,0,0,0.04); overflow: hidden; margin-top: 4px; }
.hero-ratio-fill { height: 100%; border-radius: 3px; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }

/* ═══ TIER 2: Primary info cards — business card style ═══ */
.primary-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 16px; }

.info-card {
  background: var(--glass-heavy);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--shadow-card), var(--depth-edge), var(--shadow-glass-inset);
  transition: transform 200ms, box-shadow 200ms;
  display: flex;
  overflow: hidden;
}
.info-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-card-hover), var(--depth-edge), var(--shadow-glass-inset); }

/* Left accent bar */
.info-card-accent {
  width: 5px;
  flex-shrink: 0;
}

/* Card inner content */
.info-card-inner {
  flex: 1;
  padding: 18px 20px;
}

.info-card-head { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color-light); }
.info-icon { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.info-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text-primary); margin: 0; text-transform: uppercase; letter-spacing: 0.03em; }
.info-address { font-size: 13px; color: var(--text-secondary); margin: 0 0 10px; line-height: 1.5; }

/* Card hierarchy classes — status > name > metric > detail */
.card-status-chip { margin-bottom: 8px; }

.card-hero-name {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.3;
  margin: 0 0 2px;
}

.card-hero-metric {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--accent-primary);
  line-height: 1;
  margin: 6px 0 2px;
}

.card-metric-context {
  font-size: 12px;
  font-weight: 400;
  color: var(--text-muted);
  margin-left: 6px;
}

.card-inline-detail {
  font-size: 13px;
  color: var(--text-secondary);
  margin: 4px 0 0;
}

.card-sub-detail {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 8px;
}

/* Legacy info rows (kept for reuse) */
.info-rows { display: flex; flex-direction: column; gap: 2px; }
.info-row { display: flex; align-items: center; gap: 10px; padding: 5px 0; }
.info-row-icon { width: 28px; height: 28px; border-radius: 6px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; background: rgba(0,0,0,0.02); }
.info-row-icon .v-icon { font-size: 15px; color: var(--text-muted); }
.info-row-content { flex: 1; display: flex; justify-content: space-between; align-items: center; }
.info-label { font-size: 12px; color: var(--text-muted); }
.info-val { font-size: 13px; font-weight: 600; color: var(--text-primary); text-align: right; }
.info-val.fw { font-weight: 700; }

/* ═══ 3-Column Detail Layout ═══ */
.detail-columns { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; align-items: stretch; }
.detail-col { display: flex; flex-direction: column; gap: 16px; }
.detail-col--fill { height: 100%; }

.info-card--stacked { height: auto; }
.info-card--wide { padding: 24px; flex-direction: column; }

/* Fill-height cards — match column 1 height, scroll overflow */
.info-card--fill {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.fill-card-header { flex-shrink: 0; }
.fill-card-scroll { flex: 1; overflow-y: auto; min-height: 0; }
.fill-card-scroll::-webkit-scrollbar { width: 4px; }
.fill-card-scroll::-webkit-scrollbar-track { background: transparent; }
.fill-card-scroll::-webkit-scrollbar-thumb { background: rgba(var(--v-theme-on-surface), 0.12); border-radius: 2px; }
.fill-card-scroll::-webkit-scrollbar-thumb:hover { background: rgba(var(--v-theme-on-surface), 0.2); }

.fill-card-footer {
  flex-shrink: 0;
  padding: 12px 24px 16px;
  border-top: 1px solid rgba(var(--v-theme-on-surface), 0.06);
  text-align: center;
  background: rgb(var(--v-theme-surface));
}

/* Legacy full-row (kept for compat) */
.full-row { margin-bottom: 16px; }

/* Section header — "Last Transaction / See All" pattern */
.section-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; width: 100%; }
.section-head-left { display: flex; align-items: center; gap: 10px; }
.section-see-all { font-size: 13px; font-weight: 600; color: rgb(var(--v-theme-primary)); cursor: pointer; transition: opacity 150ms; }
.section-see-all:hover { opacity: 0.7; }
.section-divider { border-top: 2px dashed rgba(var(--v-theme-on-surface), 0.08); margin-bottom: 4px; width: 100%; }

/* Transaction list — wallet-style rows */
.txn-list { display: flex; flex-direction: column; width: 100%; }
.txn-list--compact .txn-row { padding: 10px 0; }
.txn-row { display: flex; align-items: center; gap: 16px; padding: 16px 0; border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.06); transition: background 150ms; width: 100%; }
.txn-row:last-child { border-bottom: none; }
.txn-row:hover { background: rgba(var(--v-theme-primary), 0.02); margin: 0 -8px; padding-left: 8px; padding-right: 8px; border-radius: 10px; }

.txn-status-bar { width: 4px; height: 40px; border-radius: 2px; flex-shrink: 0; }
.txn-bar--disbursed, .txn-bar--approved, .txn-bar--paid { background: #10B981; }
.txn-bar--submitted, .txn-bar--under_review, .txn-bar--current { background: #8B5CF6; }
.txn-bar--pending_documents, .txn-bar--restructured { background: #F59E0B; }
.txn-bar--rejected, .txn-bar--defaulted { background: #EF4444; }
.txn-bar--draft { background: #94A3B8; }

.txn-info { flex: 1; display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.txn-name { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.txn-detail { font-size: 13px; color: var(--text-muted); }

.txn-right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0; margin-left: auto; }
.txn-amount { font-family: var(--font-display); font-size: 20px; font-weight: 700; color: var(--text-primary); }


.empty-block { display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 24px 0; color: var(--text-muted); font-size: 13px; }

/* Payment calendar in narrower column */

/* Loan cards */
.loan-cards { display: flex; flex-direction: column; gap: 10px; }
.loan-card { display: flex; border-radius: 12px; background: rgba(0,0,0,0.015); overflow: hidden; transition: background 150ms; }
.loan-card:hover { background: rgba(0,0,0,0.03); }
.loan-card-bar { width: 4px; flex-shrink: 0; }
.loan-card--disbursed .loan-card-bar, .loan-card--approved .loan-card-bar { background: #10B981; }
.loan-card--submitted .loan-card-bar, .loan-card--under_review .loan-card-bar { background: #8B5CF6; }
.loan-card--pending_documents .loan-card-bar { background: #F59E0B; }
.loan-card--rejected .loan-card-bar { background: #EF4444; }
.loan-card--draft .loan-card-bar { background: #94A3B8; }
.loan-card-body { padding: 12px 16px; flex: 1; }
.loan-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
.loan-card-type { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.loan-card-amount { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--accent-primary); display: block; }
.loan-card-meta { font-size: 12px; color: var(--text-muted); }

/* Ratio bar */
.ratio-block { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color-light); }
.past-section { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color-light); }
.past-heading { font-family: var(--font-display); font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: var(--text-muted); margin: 0 0 10px; }
.ratio-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.ratio-title { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; }
.ratio-pct { font-family: var(--font-display); font-size: 16px; font-weight: 700; }
.ratio-track { height: 8px; border-radius: 4px; background: rgba(0,0,0,0.04); overflow: hidden; }
.ratio-fill { height: 100%; border-radius: 4px; transition: width 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
.ratio-good { color: #10B981; } .ratio-good.ratio-fill { background: linear-gradient(90deg, #10B981, #34D399); }
.ratio-fair { color: #F59E0B; } .ratio-fair.ratio-fill { background: linear-gradient(90deg, #F59E0B, #FBBF24); }
.ratio-poor { color: #EF4444; } .ratio-poor.ratio-fill { background: linear-gradient(90deg, #EF4444, #FB7185); }
.ratio-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-muted); margin-top: 4px; }

/* Payment calendar */
.payment-calendar { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; }
.cal-cell { height: 40px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 600; }
.cal-label { opacity: 0.7; }
.cal--ontime { background: rgba(16,185,129,0.12); color: #10B981; }
.cal--late { background: rgba(245,158,11,0.12); color: #F59E0B; }
.cal--missed { background: rgba(239,68,68,0.12); color: #EF4444; }
.cal--none { background: rgba(0,0,0,0.03); color: var(--text-muted); }
.cal-legend { display: flex; gap: 16px; margin-top: 8px; }
.cal-leg { display: flex; align-items: center; gap: 4px; font-size: 11px; color: var(--text-muted); }
.cal-dot { width: 10px; height: 10px; border-radius: 3px; }

/* Credit tab */
.credit-hero { display: flex; gap: 28px; align-items: center; margin-bottom: 24px; }
.score-ring-large { width: 120px; height: 120px; position: relative; flex-shrink: 0; }
.score-ring-large svg { width: 100%; height: 100%; }
.score-arc { transition: stroke-dashoffset 1s cubic-bezier(0.16, 1, 0.3, 1); }
.score-center { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
.score-big { font-family: var(--font-display); font-size: 28px; font-weight: 700; line-height: 1; }
.score-sub { font-size: 11px; font-weight: 600; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.04em; }
.credit-flags { display: flex; flex-direction: column; gap: 10px; }
.flag-row { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }

/* Legacy past-row styles kept for compat */
.past-bar { width: 4px; flex-shrink: 0; }
.past-lender { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.past-amt { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--accent-primary); }

/* Activity timeline */
.activity-timeline { padding: 0; }
.timeline-card { display: flex; flex-direction: column; gap: 2px; }
.timeline-title { font-size: 13px; font-weight: 500; color: var(--text-primary); }
.timeline-date { font-size: 12px; color: var(--text-muted); }

/* References */
.ref-list { display: flex; flex-direction: column; gap: 10px; }
.ref-card { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; background: rgba(0,0,0,0.015); transition: background 150ms; }
.ref-card:hover { background: rgba(139, 92, 246, 0.03); }
.ref-info { flex: 1; }
.ref-name { font-size: 14px; font-weight: 600; color: var(--text-primary); display: block; }
.ref-detail { font-size: 12px; color: var(--text-muted); }

.notes-text { font-size: 14px; color: var(--text-secondary); line-height: 1.6; margin: 0; }

@media (max-width: 1200px) {
  .hero-row { grid-template-columns: repeat(2, 1fr); }
  .primary-row { grid-template-columns: 1fr 1fr; }
  .detail-columns { grid-template-columns: 1fr 1fr; }
  .detail-columns .detail-col:nth-child(3) { grid-column: 1 / -1; }
}

@media (max-width: 960px) {
  .hero-row, .primary-row { grid-template-columns: 1fr; }
  .detail-columns { grid-template-columns: 1fr; }
  .stat-strip { grid-template-columns: repeat(2, 1fr); }
  .identity-body { flex-direction: column; align-items: flex-start; }
  .payment-calendar { grid-template-columns: repeat(6, 1fr); }
}
</style>
