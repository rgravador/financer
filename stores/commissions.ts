import { defineStore } from 'pinia'

export const useCommissionsStore = defineStore('commissions', {
  actions: {
    /**
     * Calculate commission from a payment
     * Commission is earned only on the interest portion of the payment
     */
    calculateCommission (interestPaid: number, commissionPercentage: number): number {
      const commission = interestPaid * (commissionPercentage / 100)
      return Math.round(commission * 100) / 100
    },

    /**
     * Calculate commission from payment breakdown
     */
    calculateCommissionFromPayment (
      appliedToInterest: number,
      commissionPercentage: number
    ): number {
      return this.calculateCommission(appliedToInterest, commissionPercentage)
    },

    /**
     * Calculate total commission from multiple payments
     */
    calculateTotalCommission (
      payments: Array<{ appliedToInterest: number }>,
      commissionPercentage: number
    ): number {
      const totalInterest = payments.reduce((sum, payment) => sum + payment.appliedToInterest, 0)
      return this.calculateCommission(totalInterest, commissionPercentage)
    },

    /**
     * Calculate projected commission for a loan
     * Based on the total interest that will be collected
     */
    calculateProjectedCommission (
      totalInterest: number,
      commissionPercentage: number
    ): number {
      return this.calculateCommission(totalInterest, commissionPercentage)
    }
  }
})

export type CommissionsStore = ReturnType<typeof useCommissionsStore>
