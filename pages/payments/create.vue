<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-btn icon variant="text" @click="$router.back()">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <span class="ml-2">Record Payment</span>
          </v-card-title>

          <v-divider />

          <v-card-text class="pt-6">
            <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="form.loan_id"
                    :items="activeLoanOptions"
                    item-title="label"
                    item-value="id"
                    label="Select Loan *"
                    prepend-inner-icon="mdi-file-document"
                    :rules="[rules.required]"
                    variant="outlined"
                    :loading="loansStore.loading"
                    @update:model-value="onLoanSelected"
                  />

                  <!-- Loan Summary -->
                  <v-card v-if="selectedLoan" variant="outlined" class="mb-4">
                    <v-card-text>
                      <div class="text-caption text-grey mb-2">
                        Loan Summary
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span class="text-body-2">Principal:</span>
                        <span class="font-weight-bold">{{ formatCurrency(selectedLoan.principal_amount) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span class="text-body-2">Current Balance:</span>
                        <span class="font-weight-bold text-warning">{{ formatCurrency(selectedLoan.current_balance) }}</span>
                      </div>
                      <div v-if="selectedLoan.total_penalties > 0" class="d-flex justify-space-between mb-1">
                        <span class="text-body-2">Penalties:</span>
                        <span class="font-weight-bold text-error">{{ formatCurrency(selectedLoan.total_penalties) }}</span>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span class="text-body-2">Total Paid:</span>
                        <span class="font-weight-bold text-success">{{ formatCurrency(selectedLoan.total_paid) }}</span>
                      </div>
                    </v-card-text>
                  </v-card>

                  <v-text-field
                    v-model.number="form.amount"
                    label="Payment Amount *"
                    type="number"
                    prepend-inner-icon="mdi-cash"
                    :rules="[rules.required, rules.positive]"
                    variant="outlined"
                    class="mb-4"
                    autocomplete="off"
                  />

                  <v-text-field
                    v-model="form.payment_date"
                    label="Payment Date *"
                    type="date"
                    prepend-inner-icon="mdi-calendar"
                    :rules="[rules.required]"
                    variant="outlined"
                    :max="today"
                    class="mb-4"
                    autocomplete="off"
                  />

                  <v-textarea
                    v-model="form.notes"
                    label="Notes (Optional)"
                    prepend-inner-icon="mdi-note-text"
                    variant="outlined"
                    rows="3"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <h3 class="text-h6 mb-4">
                    Payment Application Preview
                  </h3>

                  <v-card variant="outlined" color="info" class="mb-4">
                    <v-card-text>
                      <div class="text-caption text-grey mb-3">
                        This payment will be applied as:
                      </div>

                      <div v-if="paymentBreakdown.penalty > 0" class="d-flex justify-space-between mb-2">
                        <span>To Penalties:</span>
                        <span class="font-weight-bold text-error">
                          {{ formatCurrency(paymentBreakdown.penalty) }}
                        </span>
                      </div>

                      <div class="d-flex justify-space-between mb-2">
                        <span>To Interest:</span>
                        <span class="font-weight-bold text-warning">
                          {{ formatCurrency(paymentBreakdown.interest) }}
                        </span>
                      </div>

                      <div class="d-flex justify-space-between mb-3">
                        <span>To Principal:</span>
                        <span class="font-weight-bold text-success">
                          {{ formatCurrency(paymentBreakdown.principal) }}
                        </span>
                      </div>

                      <v-divider class="my-3" />

                      <div class="d-flex justify-space-between">
                        <span class="font-weight-bold">Total:</span>
                        <span class="font-weight-bold">{{ formatCurrency(form.amount) }}</span>
                      </div>
                    </v-card-text>
                  </v-card>

                  <v-card variant="outlined" color="success" class="mb-4">
                    <v-card-text>
                      <div class="text-caption text-grey mb-2">
                        After Payment
                      </div>
                      <div class="d-flex justify-space-between mb-1">
                        <span>New Balance:</span>
                        <span class="font-weight-bold">
                          {{ formatCurrency(afterPayment.newBalance) }}
                        </span>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span>Remaining Penalties:</span>
                        <span class="font-weight-bold">
                          {{ formatCurrency(afterPayment.newPenalties) }}
                        </span>
                      </div>
                    </v-card-text>
                  </v-card>

                  <v-alert v-if="selectedLoan?.status === 'closed'" type="warning" variant="tonal">
                    This loan is already closed
                  </v-alert>
                </v-col>
              </v-row>

              <v-alert v-if="error" type="error" variant="tonal" class="mb-4">
                {{ error }}
              </v-alert>

              <v-alert v-if="success" type="success" variant="tonal" class="mb-4">
                Payment recorded successfully!
              </v-alert>

              <v-divider class="my-4" />

              <div class="d-flex gap-2">
                <v-btn
                  type="submit"
                  color="primary"
                  size="large"
                  :loading="loading"
                  :disabled="!formValid || !canSubmit"
                >
                  Record Payment
                </v-btn>
                <v-btn
                  variant="outlined"
                  size="large"
                  :disabled="loading"
                  @click="$router.back()"
                >
                  Cancel
                </v-btn>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { formatCurrency } from '~/utils/formatters'

export default defineComponent({
  name: 'PaymentsCreate',

  data () {
    const today = new Date().toISOString().split('T')[0]

    return {
      formRef: null as any,
      formValid: false,
      loading: false,
      error: '',
      success: false,
      today,
      form: {
        loan_id: (this.$route.query.loan_id as string) || '',
        amount: 0,
        payment_date: today,
        notes: ''
      },
      rules: {
        required: (v: any) => !!v || 'This field is required',
        positive: (v: number) => v > 0 || 'Amount must be greater than 0'
      }
    }
  },

  computed: {
    loansStore () {
      return useLoansStore()
    },

    paymentsStore () {
      return usePaymentsStore()
    },

    uiStore () {
      return useUIStore()
    },

    activeLoanOptions () {
      return this.loansStore.activeLoans.map(loan => ({
        id: loan.id,
        label: `${loan.account?.name} - ${formatCurrency(loan.principal_amount)} (Balance: ${formatCurrency(loan.current_balance)})`
      }))
    },

    selectedLoan () {
      return this.loansStore.loans.find(l => l.id === this.form.loan_id)
    },

    paymentBreakdown () {
      if (!this.selectedLoan || this.form.amount <= 0) {
        return { penalty: 0, interest: 0, principal: 0 }
      }

      let remaining = this.form.amount
      let penalty = 0
      let interest = 0
      let principal = 0

      if (this.selectedLoan.total_penalties > 0) {
        penalty = Math.min(remaining, this.selectedLoan.total_penalties)
        remaining -= penalty
      }

      if (remaining > 0) {
        const schedule = this.selectedLoan.amortization_schedule
        const totalPaid = this.selectedLoan.total_paid

        let accumulated = 0
        for (const item of schedule) {
          accumulated += item.total_due
          if (accumulated > totalPaid) {
            const dueForPayment = accumulated - totalPaid
            const portionToApply = Math.min(remaining, dueForPayment)
            const interestPortion = item.interest_due / item.total_due

            interest = portionToApply * interestPortion
            principal = portionToApply * (1 - interestPortion)
            remaining -= portionToApply
            break
          }
        }

        if (remaining > 0) {
          principal += remaining
        }
      }

      return {
        penalty: Math.round(penalty * 100) / 100,
        interest: Math.round(interest * 100) / 100,
        principal: Math.round(principal * 100) / 100
      }
    },

    afterPayment () {
      if (!this.selectedLoan) {
        return { newBalance: 0, newPenalties: 0 }
      }

      return {
        newBalance: Math.max(0, this.selectedLoan.current_balance - this.paymentBreakdown.principal),
        newPenalties: Math.max(0, this.selectedLoan.total_penalties - this.paymentBreakdown.penalty)
      }
    },

    canSubmit () {
      return this.form.loan_id && this.form.amount > 0 && this.selectedLoan?.status === 'active'
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

    onLoanSelected () {
      // Could fetch loan details if needed
    },

    async handleSubmit () {
      if (!this.formRef) { return }

      const { valid } = await this.formRef.validate()
      if (!valid) { return }

      this.loading = true
      this.error = ''
      this.success = false

      const result = await this.paymentsStore.recordPayment({
        loan_id: this.form.loan_id,
        amount: this.form.amount,
        payment_date: this.form.payment_date,
        notes: this.form.notes
      })

      if (result.success) {
        this.success = true
        this.uiStore.showSuccess('Payment recorded successfully')
        setTimeout(() => {
          this.$router.push('/payments')
        }, 1500)
      } else {
        this.error = result.error || 'Failed to record payment'
        this.uiStore.showError(this.error)
      }

      this.loading = false
    }
  }
})

definePageMeta({
  middleware: 'auth'
})
</script>
