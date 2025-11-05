<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4">
              Loans
            </h1>
            <p class="text-subtitle-1 text-grey">
              Manage all loans
            </p>
          </div>
          <v-btn color="primary" prepend-icon="mdi-plus" to="/loans/create">
            Create Loan
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Status Tabs -->
    <v-row>
      <v-col cols="12">
        <v-tabs v-model="activeTab" color="primary">
          <v-tab value="all">
            All ({{ loans.length }})
          </v-tab>
          <v-tab value="pending">
            Pending Approval ({{ pendingApprovalLoans.length }})
          </v-tab>
          <v-tab value="active">
            Active ({{ activeLoans.length }})
          </v-tab>
          <v-tab value="overdue">
            Overdue ({{ overdueLoans.length }})
          </v-tab>
        </v-tabs>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="loading" class="mt-4">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4 text-grey">
          Loading loans...
        </p>
      </v-col>
    </v-row>

    <!-- Loans List -->
    <v-row v-else-if="filteredLoans.length > 0" class="mt-4">
      <v-col
        v-for="loan in filteredLoans"
        :key="loan.id"
        cols="12"
        md="6"
        lg="4"
      >
        <v-card class="card-hover" :to="`/loans/${loan.id}`">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>{{ formatCurrency(loan.principal_amount) }}</span>
            <v-chip :color="getLoanStatusColor(loan.status)" size="small">
              {{ loan.status.replace('_', ' ') }}
            </v-chip>
          </v-card-title>

          <v-card-text>
            <div class="mb-2">
              <v-icon size="small" class="mr-2">
                mdi-account
              </v-icon>
              <span class="text-body-2">{{ loan.account?.name || 'N/A' }}</span>
            </div>
            <div class="mb-2">
              <v-icon size="small" class="mr-2">
                mdi-percent
              </v-icon>
              <span class="text-body-2">{{ loan.interest_rate }}% monthly</span>
            </div>
            <div class="mb-2">
              <v-icon size="small" class="mr-2">
                mdi-calendar
              </v-icon>
              <span class="text-body-2">{{ loan.tenure_months }} months • {{ loan.payment_frequency }}</span>
            </div>
            <div class="mb-2">
              <v-icon size="small" class="mr-2">
                mdi-cash
              </v-icon>
              <span class="text-body-2">Balance: {{ formatCurrency(loan.current_balance) }}</span>
            </div>
            <div v-if="loan.total_penalties > 0" class="text-error">
              <v-icon size="small" class="mr-2">
                mdi-alert-circle
              </v-icon>
              <span class="text-body-2">Penalties: {{ formatCurrency(loan.total_penalties) }}</span>
            </div>
          </v-card-text>

          <v-divider />

          <v-card-actions>
            <v-btn
              size="small"
              variant="text"
              prepend-icon="mdi-eye"
              :to="`/loans/${loan.id}`"
            >
              View Details
            </v-btn>
            <v-spacer />
            <v-btn
              v-if="loan.status === 'active'"
              size="small"
              variant="text"
              color="primary"
              prepend-icon="mdi-cash-plus"
              :to="`/payments/create?loan_id=${loan.id}`"
            >
              Record Payment
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else class="mt-8">
      <v-col cols="12" class="text-center">
        <v-icon size="120" color="grey-lighten-2">
          mdi-file-document-outline
        </v-icon>
        <h3 class="text-h6 mt-4 text-grey">
          No loans found
        </h3>
        <p class="text-body-2 text-grey mb-4">
          Create your first loan to get started
        </p>
        <v-btn color="primary" prepend-icon="mdi-plus" to="/loans/create">
          Create Loan
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { formatCurrency } from '~/utils/formatters'

export default defineComponent({
  name: 'LoansIndex',

  data () {
    return {
      activeTab: 'all'
    }
  },

  computed: {
    loansStore () {
      return useLoansStore()
    },

    uiStore () {
      return useUIStore()
    },

    loans () {
      return this.loansStore.loans
    },

    loading () {
      return this.loansStore.loading
    },

    pendingApprovalLoans () {
      return this.loansStore.pendingApprovalLoans
    },

    activeLoans () {
      return this.loansStore.activeLoans
    },

    overdueLoans () {
      return this.loansStore.overdueLoans
    },

    filteredLoans () {
      switch (this.activeTab) {
        case 'pending':
          return this.pendingApprovalLoans
        case 'active':
          return this.activeLoans
        case 'overdue':
          return this.overdueLoans
        default:
          return this.loans
      }
    }
  },

  async mounted () {
    try {
      await this.loansStore.fetchLoans()
    } catch (error: any) {
      this.uiStore.showError('Failed to load loans')
    }
  },

  methods: {
    formatCurrency,

    getLoanStatusColor (status: string) {
      const colors: Record<string, string> = {
        pending_approval: 'warning',
        approved: 'info',
        active: 'success',
        closed: 'grey',
        rejected: 'error'
      }
      return colors[status] || 'grey'
    }
  }
})

definePageMeta({
  middleware: 'auth'
})
</script>

<style scoped>
.card-hover {
  transition: transform 0.2s ease;
}

.card-hover:hover {
  transform: translateY(-4px);
}
</style>
