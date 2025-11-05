<template>
  <v-container fluid class="pt-4 pl-4 pr-4">
    <!-- Account Creation Checklist -->
    <div class="mb-6">
      <!-- Progress Overview -->
      <v-sheet rounded="lg" class="pa-4 mb-6">
        <div class="d-flex justify-space-between align-center">
          <div>
            <h2 class="text-h6 mb-1">
              Account Creation Progress
            </h2>
            <p class="text-body-2 text-high-emphasis mb-0">
              Complete all required fields to create account
            </p>
          </div>
          <v-progress-circular
            :model-value="completionPercentage"
            size="60"
            width="6"
            color="primary"
          >
            {{ completionPercentage }}%
          </v-progress-circular>
        </div>
      </v-sheet>

      <!-- Step Cards -->
      <v-row>
        <v-col
          v-for="step in steps"
          :key="step.key"
          cols="12"
          md="6"
        >
          <v-card
            :color="getStepColor(step.key)"
            elevation="2"
            class="h-100"
          >
            <v-card-text class="pa-4">
              <div class="d-flex align-center mb-3">
                <v-icon
                  :color="isSectionComplete(step.key) ? 'success' : 'primary'"
                  size="32"
                  class="mr-3"
                >
                  {{ isSectionComplete(step.key) ? 'mdi-check-circle' : 'mdi-circle-outline' }}
                </v-icon>
                <div class="flex-grow-1">
                  <h3 class="text-h6 mb-1">
                    {{ step.title }}
                  </h3>
                  <div class="text-caption text-medium-emphasis">
                    {{ getCompletedFieldsCount(step.key) }}/{{ getTotalFieldsCount(step.key) }} fields completed
                  </div>
                </div>
              </div>

              <p class="text-body-2 mb-3">
                {{ step.description }}
              </p>

              <v-btn
                :color="isSectionComplete(step.key) ? 'success' : 'primary'"
                variant="flat"
                block
                @click="navigateToStep(step.route)"
              >
                <v-icon start>
                  {{ isSectionComplete(step.key) ? 'mdi-pencil' : 'mdi-arrow-right' }}
                </v-icon>
                {{ isSectionComplete(step.key) ? 'Edit' : 'Start' }}
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Action Buttons -->
      <v-row class="mt-4">
        <v-col cols="12" class="d-flex gap-2">
          <v-btn
            variant="outlined"
            @click="handleCancel"
          >
            Cancel
          </v-btn>
          <v-spacer />
          <v-btn
            v-if="accountId"
            color="success"
            variant="flat"
            :disabled="!isAllRequiredComplete"
            @click="handleComplete"
          >
            Complete Account Creation
          </v-btn>
        </v-col>
      </v-row>
    </div>
  </v-container>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AccountCreation',

  data () {
    return {
      steps: [
        {
          key: 'basic' as const,
          title: 'Basic Identification',
          description: 'Enter your name, date of birth, and ID information',
          route: '/accounts/create/basic'
        },
        {
          key: 'contact' as const,
          title: 'Contact Information',
          description: 'Provide your phone, email, and address details',
          route: '/accounts/create/contact'
        },
        {
          key: 'employment' as const,
          title: 'Employment Details',
          description: 'Share information about your current employer',
          route: '/accounts/create/employment'
        },
        {
          key: 'income' as const,
          title: 'Income & Financial Information',
          description: 'Enter your income and upload financial documents',
          route: '/accounts/create/income'
        },
        {
          key: 'debt' as const,
          title: 'Debt & Expenses',
          description: 'Provide details about your monthly expenses and debts',
          route: '/accounts/create/debt'
        }
      ]
    }
  },

  computed: {
    creationStore () {
      return useAccountCreation()
    },

    completionPercentage () {
      return this.creationStore.completionPercentage
    },

    accountId () {
      return this.creationStore.accountId
    },

    getCompletedFieldsCount () {
      return this.creationStore.getCompletedFieldsCount
    },

    getTotalFieldsCount () {
      return this.creationStore.getTotalFieldsCount
    },

    isSectionComplete () {
      return this.creationStore.isSectionComplete
    },

    isAllRequiredComplete () {
      return this.isSectionComplete('basic') && this.isSectionComplete('contact')
    }
  },

  mounted () {
    // If there's a draft in progress, we can load it here
    // For now, we just ensure the form is ready
  },

  methods: {
    getStepColor (stepKey: typeof this.steps[number]['key']) {
      if (this.isSectionComplete(stepKey)) {
        return 'success-lighten-5'
      }
      if (this.getCompletedFieldsCount(stepKey) > 0) {
        return 'warning-lighten-5'
      }
      return 'surface'
    },

    navigateToStep (route: string) {
      if (this.accountId) {
        // If account is already created, add the account ID to the route
        this.$router.push(`${route}?id=${this.accountId}`)
      } else {
        this.$router.push(route)
      }
    },

    handleCancel () {
      if (confirm('Are you sure you want to cancel? All unsaved data will be lost.')) {
        this.creationStore.resetForm()
        this.$router.push('/accounts')
      }
    },

    handleComplete () {
      if (this.accountId) {
        this.$router.push(`/accounts/${this.accountId}`)
      }
    }
  }
})

definePageMeta({
  middleware: 'auth'
})
</script>
