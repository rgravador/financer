<template>
  <v-container fluid>
    <v-row>
      <v-col cols="12">
        <div class="mb-4">
          <h1 class="text-h4">
            Cashout Management
          </h1>
          <p class="text-subtitle-1 text-grey">
            Review and process agent cashout requests
          </p>
        </div>
      </v-col>
    </v-row>

    <!-- Stats -->
    <v-row>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Pending Requests
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
              Total Pending Amount
            </div>
            <div class="text-h5">
              {{ formatCurrency(totalPendingAmount) }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Approved Today
            </div>
            <div class="text-h5 text-success">
              {{ approvedTodayCount }}
            </div>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6" md="3">
        <v-card>
          <v-card-text>
            <div class="text-caption text-grey">
              Total Processed Today
            </div>
            <div class="text-h5 text-success">
              {{ formatCurrency(approvedTodayAmount) }}
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
          <v-card-title>
            <v-tabs v-model="tab">
              <v-tab value="pending">
                Pending ({{ pendingCashouts.length }})
              </v-tab>
              <v-tab value="approved">
                Approved
              </v-tab>
              <v-tab value="rejected">
                Rejected
              </v-tab>
            </v-tabs>
          </v-card-title>
          <v-divider />

          <v-window v-model="tab">
            <!-- Pending Tab -->
            <v-window-item value="pending">
              <v-table v-if="pendingCashouts.length > 0">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Request Date</th>
                    <th>Amount</th>
                    <th>Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cashout in pendingCashouts" :key="cashout.id">
                    <td>
                      <div>
                        <div class="font-weight-bold">
                          {{ cashout.agent?.full_name }}
                        </div>
                        <div class="text-caption text-grey">
                          {{ cashout.agent?.display_name || cashout.agent?.email }}
                        </div>
                      </div>
                    </td>
                    <td>{{ formatDate(cashout.created_at) }}</td>
                    <td class="font-weight-bold">
                      {{ formatCurrency(cashout.amount) }}
                    </td>
                    <td>
                      <span v-if="cashout.notes" class="text-caption">{{ cashout.notes }}</span>
                      <span v-else class="text-grey text-caption">-</span>
                    </td>
                    <td>
                      <div class="d-flex gap-1">
                        <v-btn
                          size="small"
                          color="success"
                          variant="tonal"
                          @click="openApproveDialog(cashout)"
                        >
                          Approve
                        </v-btn>
                        <v-btn
                          size="small"
                          color="error"
                          variant="outlined"
                          @click="openRejectDialog(cashout)"
                        >
                          Reject
                        </v-btn>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </v-table>
              <v-card-text v-else class="text-center text-grey py-8">
                No pending cashout requests
              </v-card-text>
            </v-window-item>

            <!-- Approved Tab -->
            <v-window-item value="approved">
              <v-table v-if="approvedCashouts.length > 0">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Request Date</th>
                    <th>Amount</th>
                    <th>Processed Date</th>
                    <th>Processed By</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cashout in approvedCashouts" :key="cashout.id">
                    <td>{{ cashout.agent?.full_name }}</td>
                    <td>{{ formatDate(cashout.created_at) }}</td>
                    <td class="font-weight-bold text-success">
                      {{ formatCurrency(cashout.amount) }}
                    </td>
                    <td>{{ cashout.processed_at ? formatDate(cashout.processed_at) : '-' }}</td>
                    <td>{{ cashout.processed_by_user?.full_name || '-' }}</td>
                  </tr>
                </tbody>
              </v-table>
              <v-card-text v-else class="text-center text-grey py-8">
                No approved cashouts yet
              </v-card-text>
            </v-window-item>

            <!-- Rejected Tab -->
            <v-window-item value="rejected">
              <v-table v-if="rejectedCashouts.length > 0">
                <thead>
                  <tr>
                    <th>Agent</th>
                    <th>Request Date</th>
                    <th>Amount</th>
                    <th>Processed Date</th>
                    <th>Rejection Reason</th>
                    <th>Processed By</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="cashout in rejectedCashouts" :key="cashout.id">
                    <td>{{ cashout.agent?.full_name }}</td>
                    <td>{{ formatDate(cashout.created_at) }}</td>
                    <td class="font-weight-bold">
                      {{ formatCurrency(cashout.amount) }}
                    </td>
                    <td>{{ cashout.processed_at ? formatDate(cashout.processed_at) : '-' }}</td>
                    <td>
                      <span v-if="cashout.notes" class="text-caption text-error">{{ cashout.notes }}</span>
                      <span v-else>-</span>
                    </td>
                    <td>{{ cashout.processed_by_user?.full_name || '-' }}</td>
                  </tr>
                </tbody>
              </v-table>
              <v-card-text v-else class="text-center text-grey py-8">
                No rejected cashouts
              </v-card-text>
            </v-window-item>
          </v-window>
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
          No cashout requests
        </h3>
        <p class="text-body-2 text-grey">
          Agent cashout requests will appear here
        </p>
      </v-col>
    </v-row>

    <!-- Approve Dialog -->
    <v-dialog v-model="approveDialog" max-width="500">
      <v-card v-if="selectedCashout">
        <v-card-title>Approve Cashout</v-card-title>
        <v-card-text>
          <v-alert type="info" variant="tonal" class="mb-4">
            <div class="mb-2">
              <strong>Agent:</strong> {{ selectedCashout.agent?.full_name }}
            </div>
            <div class="mb-2">
              <strong>Amount:</strong> {{ formatCurrency(selectedCashout.amount) }}
            </div>
            <div v-if="selectedCashout.notes">
              <strong>Notes:</strong> {{ selectedCashout.notes }}
            </div>
          </v-alert>

          <p>Are you sure you want to approve this cashout request?</p>
          <p class="text-caption text-grey mt-2">
            This will deduct {{ formatCurrency(selectedCashout.amount) }} from the agent's collectible earnings.
          </p>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="approveDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="success"
            :loading="actionLoading"
            @click="handleApproveCashout"
          >
            Approve
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Reject Dialog -->
    <v-dialog v-model="rejectDialog" max-width="500">
      <v-card v-if="selectedCashout">
        <v-card-title>Reject Cashout</v-card-title>
        <v-card-text>
          <v-alert type="warning" variant="tonal" class="mb-4">
            <div class="mb-2">
              <strong>Agent:</strong> {{ selectedCashout.agent?.full_name }}
            </div>
            <div>
              <strong>Amount:</strong> {{ formatCurrency(selectedCashout.amount) }}
            </div>
          </v-alert>

          <v-textarea
            v-model="rejectionReason"
            label="Reason for rejection *"
            variant="outlined"
            rows="3"
            :rules="[rules.required]"
            placeholder="Please provide a reason for rejecting this cashout request..."
          />
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn variant="text" @click="rejectDialog = false">
            Cancel
          </v-btn>
          <v-btn
            color="error"
            :loading="actionLoading"
            :disabled="!rejectionReason"
            @click="handleRejectCashout"
          >
            Reject
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
  name: 'AdminCashouts',

  data () {
    return {
      tab: 'pending',
      approveDialog: false,
      rejectDialog: false,
      selectedCashout: null as Cashout | null,
      rejectionReason: '',
      actionLoading: false
    }
  },

  computed: {
    cashoutsStore () {
      return useCashouts()
    },

    uiStore () {
      return useUIStore()
    },

    pendingCashouts () {
      return this.cashoutsStore.cashouts.filter((c: Cashout) => c.status === 'pending')
    },

    approvedCashouts () {
      return this.cashoutsStore.cashouts.filter((c: Cashout) => c.status === 'approved')
    },

    rejectedCashouts () {
      return this.cashoutsStore.cashouts.filter((c: Cashout) => c.status === 'rejected')
    },

    totalPendingAmount () {
      return this.pendingCashouts.reduce((sum: number, c: Cashout) => sum + c.amount, 0)
    },

    approvedTodayCount () {
      const today = new Date().toDateString()
      return this.approvedCashouts.filter(
        (c: Cashout) => c.processed_at && new Date(c.processed_at).toDateString() === today
      ).length
    },

    approvedTodayAmount () {
      const today = new Date().toDateString()
      return this.approvedCashouts
        .filter((c: Cashout) => c.processed_at && new Date(c.processed_at).toDateString() === today)
        .reduce((sum: number, c: Cashout) => sum + c.amount, 0)
    },

    rules () {
      return {
        required: (v: any) => !!v || 'This field is required'
      }
    }
  },

  async mounted () {
    try {
      await this.cashoutsStore.fetchCashouts()
    } catch (error: any) {
      this.uiStore.showError('Failed to load cashout requests')
    }
  },

  methods: {
    formatCurrency,
    formatDate,

    openApproveDialog (cashout: Cashout) {
      this.selectedCashout = cashout
      this.approveDialog = true
    },

    openRejectDialog (cashout: Cashout) {
      this.selectedCashout = cashout
      this.rejectionReason = ''
      this.rejectDialog = true
    },

    async handleApproveCashout () {
      if (!this.selectedCashout) { return }

      this.actionLoading = true
      const result = await this.cashoutsStore.approveCashout(this.selectedCashout.id)

      if (result.success) {
        this.uiStore.showSuccess('Cashout approved successfully')
        this.approveDialog = false
        this.selectedCashout = null
        await this.cashoutsStore.fetchCashouts()
      } else {
        this.uiStore.showError(result.error || 'Failed to approve cashout')
      }

      this.actionLoading = false
    },

    async handleRejectCashout () {
      if (!this.selectedCashout || !this.rejectionReason) { return }

      this.actionLoading = true
      const result = await this.cashoutsStore.rejectCashout(
        this.selectedCashout.id,
        this.rejectionReason
      )

      if (result.success) {
        this.uiStore.showSuccess('Cashout rejected')
        this.rejectDialog = false
        this.selectedCashout = null
        this.rejectionReason = ''
        await this.cashoutsStore.fetchCashouts()
      } else {
        this.uiStore.showError(result.error || 'Failed to reject cashout')
      }

      this.actionLoading = false
    }
  }
})

definePageMeta({
  middleware: ['auth', 'admin']
})
</script>
