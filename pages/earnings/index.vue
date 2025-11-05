<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4">
              My Earnings
            </h1>
            <p class="text-subtitle-1 text-grey">
              Commission tracking and cashout management
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-cash-fast"
            :disabled="!canRequestCashout"
            @click="cashoutDialog = true"
          >
            Request Cashout
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Stats Cards -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Total Earnings
            </div>
            <div class="text-h5">
              {{ formatCurrency(earnings?.total_earnings || 0) }}
            </div>
            <div class="text-caption text-success mt-1">
              All time
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Collectible Earnings
            </div>
            <div class="text-h5 text-success">
              {{ formatCurrency(earnings?.collectible_earnings || 0) }}
            </div>
            <div class="text-caption mt-1">
              Available for cashout
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Cashed Out
            </div>
            <div class="text-h5">
              {{ formatCurrency(earnings?.cashed_out || 0) }}
            </div>
            <div class="text-caption text-info mt-1">
              Successfully withdrawn
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Commission Rate
            </div>
            <div class="text-h5">
              {{ earnings?.commission_percentage || 0 }}%
            </div>
            <div class="text-caption mt-1">
              On interest collected
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="earningsStore.loading" class="mt-4">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4 text-grey">
          Loading earnings...
        </p>
      </v-col>
    </v-row>

    <!-- Earnings Breakdown -->
    <template v-else-if="earnings">
      <v-row class="mt-4">
        <!-- Recent Earnings Activity -->
        <v-col cols="12" md="8">
          <v-card>
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Recent Commissions</span>
              <v-chip size="small" color="primary">
                {{ paymentsWithCommission.length }} payments
              </v-chip>
            </v-card-title>
            <v-divider />
            <v-list v-if="paymentsWithCommission.length > 0">
              <v-list-item
                v-for="payment in paymentsWithCommission"
                :key="payment.id"
                :to="`/loans/${payment.loan_id}`"
              >
                <template #prepend>
                  <v-avatar color="success">
                    <v-icon>mdi-cash-check</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title>
                  {{ formatCurrency(payment.amount) }} payment
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(payment.payment_date) }} •
                  {{ payment.loan?.account?.name || 'N/A' }} •
                  Commission: {{ formatCurrency(calculateCommissionAmount(payment)) }}
                </v-list-item-subtitle>
                <template #append>
                  <v-chip size="small" color="success" variant="tonal">
                    +{{ formatCurrency(calculateCommissionAmount(payment)) }}
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
            <v-card-text v-else class="text-center text-grey py-8">
              <v-icon size="64" color="grey-lighten-2">
                mdi-cash-remove
              </v-icon>
              <p class="mt-2">
                No commission earnings yet
              </p>
              <p class="text-caption">
                Record payments to start earning commissions
              </p>
            </v-card-text>
          </v-card>
        </v-col>

        <!-- Earnings Summary & Info -->
        <v-col cols="12" md="4">
          <v-card class="mb-4">
            <v-card-title>Earnings Summary</v-card-title>
            <v-divider />
            <v-card-text>
              <div class="d-flex justify-space-between mb-3">
                <span class="text-body-2">Total Earned:</span>
                <span class="font-weight-bold">{{ formatCurrency(earnings.total_earnings) }}</span>
              </div>
              <div class="d-flex justify-space-between mb-3">
                <span class="text-body-2">Collectible:</span>
                <span class="font-weight-bold text-success">{{ formatCurrency(earnings.collectible_earnings) }}</span>
              </div>
              <div class="d-flex justify-space-between mb-3">
                <span class="text-body-2">Cashed Out:</span>
                <span class="font-weight-bold text-info">{{ formatCurrency(earnings.cashed_out) }}</span>
              </div>
              <v-divider class="my-3" />
              <div class="d-flex justify-space-between">
                <span class="text-body-2">Last Updated:</span>
                <span class="text-caption">{{ formatDate(earnings.updated_at) }}</span>
              </div>
            </v-card-text>
          </v-card>

          <v-card>
            <v-card-title>How Commissions Work</v-card-title>
            <v-divider />
            <v-card-text>
              <p class="text-body-2 mb-3">
                You earn {{ earnings.commission_percentage }}% commission on all interest collected from payments.
              </p>
              <v-alert type="info" variant="tonal" density="compact">
                Commission = Interest Amount × {{ earnings.commission_percentage }}%
              </v-alert>
              <p class="text-caption text-grey mt-3">
                Example: On a ₱100 interest payment, you earn ₱{{ (100 * earnings.commission_percentage / 100).toFixed(2) }}
              </p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Cashout History -->
      <v-row class="mt-4">
        <v-col cols="12">
          <v-card>
            <v-card-title>Cashout History ({{ cashoutsStore.cashouts.length }})</v-card-title>
            <v-divider />
            <v-table v-if="cashoutsStore.cashouts.length > 0">
              <thead>
                <tr>
                  <th>Request Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Processed Date</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="cashout in cashoutsStore.cashouts" :key="cashout.id">
                  <td>{{ formatDate(cashout.created_at) }}</td>
                  <td class="font-weight-bold">
                    {{ formatCurrency(cashout.amount) }}
                  </td>
                  <td>
                    <v-chip
                      size="small"
                      :color="getCashoutStatusColor(cashout.status)"
                    >
                      {{ cashout.status.toUpperCase() }}
                    </v-chip>
                  </td>
                  <td>{{ cashout.processed_at ? formatDate(cashout.processed_at) : '-' }}</td>
                  <td>
                    <span v-if="cashout.notes" class="text-caption">{{ cashout.notes }}</span>
                    <span v-else class="text-grey text-caption">-</span>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <v-card-text v-else class="text-center text-grey py-8">
              No cashout history yet
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Cashout Request Dialog -->
    <v-dialog v-model="cashoutDialog" max-width="500">
      <v-card>
        <v-card-title>Request Cashout</v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            Available for cashout: {{ formatCurrency(earnings?.collectible_earnings || 0) }}
          </v-alert>

          <v-form ref="cashoutFormRef" v-model="cashoutFormValid">
            <v-text-field
              v-model.number="cashoutForm.amount"
              label="Amount to Cashout *"
              type="number"
              prepend-inner-icon="mdi-cash"
              :rules="[
                rules.required,
                rules.positive,
                rules.maxAmount
              ]"
              variant="outlined"
              class="mb-4"
              autocomplete="off"
            />

            <v-textarea
              v-model="cashoutForm.notes"
              label="Notes (Optional)"
              prepend-inner-icon="mdi-note-text"
              variant="outlined"
              rows="3"
              placeholder="Add any additional information..."
            />
          </v-form>

          <v-alert v-if="cashoutError" type="error" variant="tonal" class="mt-4">
            {{ cashoutError }}
          </v-alert>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="closeCashoutDialog">
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            :loading="cashoutLoading"
            :disabled="!cashoutFormValid"
            @click="handleCashoutRequest"
          >
            Submit Request
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { formatCurrency, formatDate } from '~/utils/formatters'
import type { Payment } from '~/types'

export default defineComponent({
  name: 'EarningsIndex',

  data () {
    return {
      cashoutDialog: false,
      cashoutFormValid: false,
      cashoutLoading: false,
      cashoutError: '',
      cashoutForm: {
        amount: 0,
        notes: ''
      }
    }
  },

  computed: {
    earningsStore () {
      return useEarningsStore()
    },

    cashoutsStore () {
      return useCashouts()
    },

    paymentsStore () {
      return usePaymentsStore()
    },

    uiStore () {
      return useUIStore()
    },

    earnings () {
      return this.earningsStore.earnings
    },

    canRequestCashout () {
      return this.earnings && this.earnings.collectible_earnings > 0
    },

    paymentsWithCommission () {
      return this.paymentsStore.payments.filter((p: Payment) => p.applied_to_interest > 0)
    },

    rules () {
      return {
        required: (v: any) => !!v || 'This field is required',
        positive: (v: number) => v > 0 || 'Amount must be greater than 0',
        maxAmount: (v: number) => {
          const max = this.earnings?.collectible_earnings || 0
          return v <= max || `Amount cannot exceed ${formatCurrency(max)}`
        }
      }
    }
  },

  async mounted () {
    try {
      await Promise.all([
        this.earningsStore.fetchEarnings(),
        this.cashoutsStore.fetchCashouts(),
        this.paymentsStore.fetchPayments()
      ])
    } catch (error: any) {
      this.uiStore.showError('Failed to load earnings data')
    }
  },

  methods: {
    formatCurrency,
    formatDate,

    calculateCommissionAmount (payment: Payment) {
      const commissionRate = this.earnings?.commission_percentage || 0
      return payment.applied_to_interest * (commissionRate / 100)
    },

    getCashoutStatusColor (status: string) {
      const colors: Record<string, string> = {
        pending: 'warning',
        approved: 'success',
        rejected: 'error'
      }
      return colors[status] || 'grey'
    },

    closeCashoutDialog () {
      this.cashoutDialog = false
      this.cashoutForm.amount = 0
      this.cashoutForm.notes = ''
      this.cashoutError = ''
    },

    async handleCashoutRequest () {
      const formRef = this.$refs.cashoutFormRef as any
      if (!formRef) { return }

      const { valid } = await formRef.validate()
      if (!valid) { return }

      this.cashoutLoading = true
      this.cashoutError = ''

      const result = await this.cashoutsStore.requestCashout({
        amount: this.cashoutForm.amount,
        notes: this.cashoutForm.notes
      })

      if (result.success) {
        this.uiStore.showSuccess('Cashout request submitted successfully')
        this.closeCashoutDialog()
        // Refresh data
        await this.earningsStore.fetchEarnings()
      } else {
        this.cashoutError = result.error || 'Failed to submit cashout request'
      }

      this.cashoutLoading = false
    }
  }
})

definePageMeta({
  middleware: 'auth'
})
</script>
