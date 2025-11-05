import { useMemo } from 'react'
import { addPaymentPeriod } from '@/utils/formatters'
import type { PaymentFrequency, AmortizationScheduleItem } from '@/types/database'

interface AmortizationParams {
  principalAmount: number
  interestRate: number // Monthly interest rate (e.g., 3 for 3%)
  tenureMonths: number
  paymentFrequency: PaymentFrequency
  startDate: string
}

export function useAmortization({
  principalAmount,
  interestRate,
  tenureMonths,
  paymentFrequency,
  startDate,
}: AmortizationParams) {
  const schedule = useMemo(() => {
    if (!principalAmount || !interestRate || !tenureMonths) {
      return []
    }

    // Calculate number of payments based on frequency
    let numPayments: number
    switch (paymentFrequency) {
      case 'bi-monthly':
        numPayments = tenureMonths * 2 // 2 payments per month
        break
      case 'weekly':
        numPayments = tenureMonths * 4 // Approximately 4 weeks per month
        break
      case 'monthly':
      default:
        numPayments = tenureMonths
        break
    }

    // Convert annual to payment period rate
    const monthlyRate = interestRate / 100 // Convert percentage to decimal
    let periodRate: number

    switch (paymentFrequency) {
      case 'bi-monthly':
        periodRate = monthlyRate / 2
        break
      case 'weekly':
        periodRate = monthlyRate / 4
        break
      case 'monthly':
      default:
        periodRate = monthlyRate
        break
    }

    // Calculate EMI using formula: EMI = P * r * (1+r)^n / ((1+r)^n - 1)
    const emi =
      (principalAmount * periodRate * Math.pow(1 + periodRate, numPayments)) /
      (Math.pow(1 + periodRate, numPayments) - 1)

    // Generate amortization schedule
    const scheduleItems: AmortizationScheduleItem[] = []
    let remainingBalance = principalAmount
    let currentDate = new Date(startDate)

    for (let i = 1; i <= numPayments; i++) {
      // Calculate due date
      currentDate = addPaymentPeriod(currentDate, paymentFrequency)

      // Calculate interest for this period
      const interestDue = remainingBalance * periodRate

      // Calculate principal for this period
      const principalDue = emi - interestDue

      // Update remaining balance
      remainingBalance = Math.max(0, remainingBalance - principalDue)

      scheduleItems.push({
        payment_number: i,
        due_date: currentDate.toISOString().split('T')[0],
        principal_due: Math.round(principalDue * 100) / 100,
        interest_due: Math.round(interestDue * 100) / 100,
        total_due: Math.round(emi * 100) / 100,
        remaining_balance: Math.round(remainingBalance * 100) / 100,
      })
    }

    return scheduleItems
  }, [principalAmount, interestRate, tenureMonths, paymentFrequency, startDate])

  const totalInterest = useMemo(() => {
    return schedule.reduce((sum, item) => sum + item.interest_due, 0)
  }, [schedule])

  const totalPayment = useMemo(() => {
    return schedule.reduce((sum, item) => sum + item.total_due, 0)
  }, [schedule])

  const emi = schedule.length > 0 ? schedule[0].total_due : 0

  return {
    schedule,
    emi,
    totalInterest,
    totalPayment,
    numPayments: schedule.length,
  }
}
