<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" lg="10">
        <v-card>
          <v-card-title class="d-flex align-center">
            <v-btn icon variant="text" @click="$router.back()">
              <v-icon>mdi-arrow-left</v-icon>
            </v-btn>
            <span class="ml-2">Create New Loan</span>
          </v-card-title>

          <v-divider />

          <v-card-text class="pt-6">
            <v-form ref="formRef" v-model="formValid" @submit.prevent="handleSubmit">
              <v-row>
                <!-- Loan Details -->
                <v-col cols="12" md="6">
                  <h3 class="text-h6 mb-4">
                    Loan Details
                  </h3>

                  <v-select
                    v-model="form.account_id"
                    :items="accountOptions"
                    item-title="name"
                    item-value="id"
                    label="Select Account *"
                    prepend-inner-icon="mdi-account"
                    :rules="[rules.required]"
                    variant="outlined"
                    class="mb-4"
                    :loading="accountsLoading"
                  />

                  <label for="loan-principal-amount" class="font-weight-medium">Principal Amount *</label>
                  <v-text-field
                    id="loan-principal-amount"
                    v-model.number="form.principal_amount"
                    type="number"
                    prepend-inner-icon="mdi-cash"
                    :rules="[rules.required, rules.positive]"
                    variant="solo"
                    flat
                    class="mb-4"
                    hide-details="auto"
                    density="comfortable"
                    autocomplete="off"
                  />

                  <div class="mb-4">
                    <v-slider
                      v-model="form.interest_rate"
                      :min="3"
                      :max="5"
                      :step="0.5"
                      thumb-label
                      class="mb-2"
                    >
                      <template #prepend>
                        <span class="text-body-2">3%</span>
                      </template>
                      <template #append>
                        <span class="text-body-2">5%</span>
                      </template>
                    </v-slider>
                    <label for="loan-interest-rate" class="font-weight-medium">Interest Rate (% per month) *</label>
                    <v-text-field
                      id="loan-interest-rate"
                      v-model.number="form.interest_rate"
                      type="number"
                      prepend-inner-icon="mdi-percent"
                      :rules="[rules.required, rules.interestRate]"
                      variant="solo"
                      flat
                      suffix="%"
                      hide-details="auto"
                      density="comfortable"
                      autocomplete="off"
                    />
                  </div>

                  <v-select
                    v-model="form.tenure_months"
                    :items="tenureOptions"
                    label="Tenure (Months) *"
                    prepend-inner-icon="mdi-calendar"
                    :rules="[rules.required]"
                    variant="outlined"
                    class="mb-4"
                  />

                  <v-select
                    v-model="form.payment_frequency"
                    :items="frequencyOptions"
                    item-title="label"
                    item-value="value"
                    label="Payment Frequency *"
                    prepend-inner-icon="mdi-calendar-clock"
                    :rules="[rules.required]"
                    variant="outlined"
                    class="mb-4"
                  />

                  <v-text-field
                    v-model="form.start_date"
                    label="Start Date"
                    type="date"
                    prepend-inner-icon="mdi-calendar-start"
                    variant="outlined"
                    hint="Leave empty to use approval date"
                    autocomplete="off"
                  />
                </v-col>

                <!-- Amortization Preview -->
                <v-col cols="12" md="6">
                  <h3 class="text-h6 mb-4">
                    Amortization Preview
                  </h3>

                  <v-card variant="outlined" class="mb-4">
                    <v-card-text>
                      <div class="d-flex justify-space-between mb-2">
                        <span class="text-grey">Total Amount:</span>
                        <span class="font-weight-bold">{{ formatCurrency(totalAmount) }}</span>
                      </div>
                      <div class="d-flex justify-space-between mb-2">
                        <span class="text-grey">Total Interest:</span>
                        <span class="font-weight-bold text-warning">{{ formatCurrency(totalInterest) }}</span>
                      </div>
                      <div class="d-flex justify-space-between">
                        <span class="text-grey">Number of Payments:</span>
                        <span class="font-weight-bold">{{ schedulePreview.length }}</span>
                      </div>
                    </v-card-text>
                  </v-card>

                  <div v-if="schedulePreview.length > 0" style="max-height: 400px; overflow-y: auto;">
                    <v-table density="compact">
                      <thead>
                        <tr>
                          <th>#</th>
                          <th>Due Date</th>
                          <th>Amount</th>
                          <th>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr v-for="item in schedulePreview" :key="item.payment_number">
                          <td>{{ item.payment_number }}</td>
                          <td>{{ formatDate(item.due_date) }}</td>
                          <td>{{ formatCurrency(item.total_due) }}</td>
                          <td>{{ formatCurrency(item.remaining_balance) }}</td>
                        </tr>
                      </tbody>
                    </v-table>
                  </div>
                </v-col>
              </v-row>

              <v-alert v-if="error" type="error" variant="tonal" class="mb-4 mt-4">
                {{ error }}
              </v-alert>

              <v-alert v-if="success" type="success" variant="tonal" class="mb-4 mt-4">
                Loan created successfully! Pending admin approval.
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
                  Create Loan
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
import { mapState, mapActions } from 'pinia'
import { formatCurrency, formatDate } from '~/utils/formatters'
import type { PaymentFrequency } from '~/types'

export default defineComponent({
  name: 'LoansCreate',

  data () {
    return {
      formRef: null as any,
      formValid: false,
      loading: false,
      error: '',
      success: false,
      form: {
        account_id: (this.$route.query.account_id as string) || '',
        principal_amount: 0,
        interest_rate: 3.5,
        tenure_months: 6,
        payment_frequency: 'monthly' as PaymentFrequency,
        start_date: ''
      },
      tenureOptions: Array.from({ length: 11 }, (_, i) => ({
        title: `${i + 2} months`,
        value: i + 2
      })),
      frequencyOptions: [
        { label: 'Bi-Monthly (Every 15 days)', value: 'bi-monthly' },
        { label: 'Monthly', value: 'monthly' },
        { label: 'Weekly', value: 'weekly' }
      ],
      rules: {
        required: (v: any) => !!v || 'This field is required',
        positive: (v: number) => v > 0 || 'Must be greater than 0',
        interestRate: (v: number) => (v >= 3 && v <= 5) || 'Interest rate must be between 3% and 5%'
      }
    }
  },

  computed: {
    ...mapState(useAccountsStore, {
      accountOptions: 'accounts',
      accountsLoading: 'loading'
    }),

    schedulePreview () {
      return this.generateSchedulePreview(this.form)
    },

    totalInterest () {
      return this.schedulePreview.reduce((sum, item) => sum + item.interest_due, 0)
    },

    totalAmount () {
      return this.form.principal_amount + this.totalInterest
    },

    canSubmit () {
      return this.form.account_id && this.form.principal_amount > 0
    }
  },

  async mounted () {
    try {
      await this.fetchAccounts()
    } catch (error: any) {
      this.showError('Failed to load accounts')
    }
  },

  methods: {
    ...mapActions(useAccountsStore, ['fetchAccounts']),
    ...mapActions(useLoansStore, ['createLoan', 'generateSchedulePreview']),
    ...mapActions(useUIStore, ['showError', 'showSuccess']),

    formatCurrency,
    formatDate,

    async handleSubmit () {
      if (!this.formRef) { return }

      const { valid } = await this.formRef.validate()
      if (!valid) { return }

      this.loading = true
      this.error = ''
      this.success = false

      const result = await this.createLoan(this.form)

      if (result.success) {
        this.success = true
        this.showSuccess('Loan created and pending approval')
        setTimeout(() => {
          this.$router.push('/loans')
        }, 2000)
      } else {
        this.error = result.error || 'Failed to create loan'
        this.showError(this.error)
      }

      this.loading = false
    }
  }
})

definePageMeta({
  middleware: 'auth'
})
</script>
