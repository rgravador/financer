<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="d-flex justify-space-between align-center mb-4">
          <div>
            <h1 class="text-h4">
              Cashout Requests
            </h1>
            <p class="text-subtitle-1 text-grey">
              Manage your cashout requests
            </p>
          </div>
          <v-btn
            color="primary"
            prepend-icon="mdi-cash-fast"
            :disabled="!canRequestCashout"
            @click="cashoutDialog = true"
          >
            New Request
          </v-btn>
        </div>
      </v-col>
    </v-row>

    <!-- Quick Stats -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Total Requests
            </div>
            <div class="text-h5">
              {{ cashoutsStore.cashouts.length }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Pending
            </div>
            <div class="text-h5 text-warning">
              {{ pendingCashouts.length }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Approved
            </div>
            <div class="text-h5 text-success">
              {{ approvedCashouts.length }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Available Balance
            </div>
            <div class="text-h5 text-success">
              {{ formatCurrency(earningsStore.earnings?.collectible_earnings || 0) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Loading State -->
    <v-row v-if="cashoutsStore.loading" class="mt-4">
      <v-col cols="12" class="text-center">
        <v-progress-circular indeterminate color="primary" size="64" />
        <p class="mt-4 text-grey">
          Loading cashout requests...
        </p>
      </v-col>
    </v-row>

    <!-- Cashout Requests List -->
    <v-row v-else-if="cashoutsStore.cashouts.length > 0" class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>All Requests</v-card-title>
          <v-divider />

          <!-- Desktop Table View -->
          <div class="d-none d-md-block">
            <v-table>
              <thead>
                <tr>
                  <th>Request Date</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Processed Date</th>
                  <th>Processed By</th>
                  <th>Notes</th>
                  <th>Actions</th>
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
                  <td>{{ cashout.processed_by_user?.full_name || '-' }}</td>
                  <td>
                    <span v-if="cashout.notes" class="text-caption">{{ cashout.notes }}</span>
                    <span v-else class="text-grey text-caption">-</span>
                  </td>
                  <td>
                    <v-btn
                      v-if="cashout.status === 'pending'"
                      size="small"
                      color="error"
                      variant="text"
                      icon
                      @click="openCancelDialog(cashout)"
                    >
                      <v-icon>mdi-close</v-icon>
                    </v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </div>

          <!-- Mobile Card View -->
          <div class="d-md-none">
            <v-list>
              <v-list-item
                v-for="cashout in cashoutsStore.cashouts"
                :key="cashout.id"
                class="mb-2"
              >
                <template #prepend>
                  <v-avatar :color="getCashoutStatusColor(cashout.status)">
                    <v-icon>mdi-cash</v-icon>
                  </v-avatar>
                </template>
                <v-list-item-title class="font-weight-bold">
                  {{ formatCurrency(cashout.amount) }}
                </v-list-item-title>
                <v-list-item-subtitle>
                  {{ formatDate(cashout.created_at) }}
                  <v-chip
                    size="x-small"
                    :color="getCashoutStatusColor(cashout.status)"
                    class="ml-2"
                  >
                    {{ cashout.status }}
                  </v-chip>
                </v-list-item-subtitle>
                <template #append>
                  <v-btn
                    v-if="cashout.status === 'pending'"
                    size="small"
                    color="error"
                    variant="text"
                    icon
                    @click="openCancelDialog(cashout)"
                  >
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <!-- Empty State -->
    <v-row v-else class="mt-8">
      <v-col cols="12" class="text-center">
        <v-icon size="120" color="grey-lighten-2">
          mdi-cash-multiple
        </v-icon>
        <h3 class="text-h6 mt-4 text-grey">
          No cashout requests yet
        </h3>
        <p class="text-body-2 text-grey mb-4">
          Request your first cashout to withdraw your earnings
        </p>
        <v-btn
          color="primary"
          prepend-icon="mdi-cash-fast"
          :disabled="!canRequestCashout"
          @click="cashoutDialog = true"
        >
          Request Cashout
        </v-btn>
      </v-col>
    </v-row>

    <!-- New Cashout Request Dialog -->
    <v-dialog v-model="cashoutDialog" max-width="500">
      <v-card>
        <v-card-title>New Cashout Request</v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="d-flex justify-space-between">
              <span>Available Balance:</span>
              <span class="font-weight-bold">{{ formatCurrency(earningsStore.earnings?.collectible_earnings || 0) }}</span>
            </div>
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
              hint="Enter amount you want to withdraw"
              autocomplete="off"
            />

            <v-textarea
              v-model="cashoutForm.notes"
              label="Notes (Optional)"
              prepend-inner-icon="mdi-note-text"
              variant="outlined"
              rows="3"
              placeholder="Add bank details or any additional information..."
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

    <!-- Cancel Cashout Dialog -->
    <v-dialog v-model="cancelDialog" max-width="400">
      <v-card>
        <v-card-title>Cancel Cashout Request</v-card-title>
        <v-card-text>
          Are you sure you want to cancel this cashout request for {{ formatCurrency(selectedCashout?.amount || 0) }}?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="cancelDialog = false">
            No
          </v-btn>
          <v-btn
            color="error"
            :loading="cancelLoading"
            @click="handleCancelRequest"
          >
            Yes, Cancel
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { formatCurrency, formatDate } from '~/utils/formatters'
import type { Cashout } from '~/types'

export default defineComponent({
  name: 'CashoutsIndex',

  data () {
    return {
      cashoutDialog: false,
      cashoutFormValid: false,
      cashoutLoading: false,
      cashoutError: '',
      cancelDialog: false,
      cancelLoading: false,
      selectedCashout: null as Cashout | null,
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

    uiStore () {
      return useUIStore()
    },

    canRequestCashout () {
      const earnings = this.earningsStore.earnings
      return earnings && earnings.collectible_earnings > 0
    },

    pendingCashouts () {
      return this.cashoutsStore.cashouts.filter((c: Cashout) => c.status === 'pending')
    },

    approvedCashouts () {
      return this.cashoutsStore.cashouts.filter((c: Cashout) => c.status === 'approved')
    },

    rules () {
      return {
        required: (v: any) => !!v || 'This field is required',
        positive: (v: number) => v > 0 || 'Amount must be greater than 0',
        maxAmount: (v: number) => {
          const max = this.earningsStore.earnings?.collectible_earnings || 0
          return v <= max || `Amount cannot exceed ${formatCurrency(max)}`
        }
      }
    }
  },

  async mounted () {
    try {
      await Promise.all([
        this.earningsStore.fetchEarnings(),
        this.cashoutsStore.fetchCashouts()
      ])
    } catch (error: any) {
      this.uiStore.showError('Failed to load cashout data')
    }
  },

  methods: {
    formatCurrency,
    formatDate,

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
        await Promise.all([
          this.earningsStore.fetchEarnings(),
          this.cashoutsStore.fetchCashouts()
        ])
      } else {
        this.cashoutError = result.error || 'Failed to submit cashout request'
      }

      this.cashoutLoading = false
    },

    openCancelDialog (cashout: Cashout) {
      this.selectedCashout = cashout
      this.cancelDialog = true
    },

    async handleCancelRequest () {
      if (!this.selectedCashout) { return }

      this.cancelLoading = true

      const result = await this.cashoutsStore.rejectCashout(
        this.selectedCashout.id,
        'Cancelled by user'
      )

      if (result.success) {
        this.uiStore.showSuccess('Cashout request cancelled')
        this.cancelDialog = false
        this.selectedCashout = null
      } else {
        this.uiStore.showError(result.error || 'Failed to cancel request')
      }

      this.cancelLoading = false
    }
  }
})

definePageMeta({
  middleware: 'auth'
})
</script>
