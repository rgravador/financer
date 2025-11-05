import { useMemo } from 'react'
import { differenceInDays, parseISO } from 'date-fns'
import { PENALTY_RATE_MONTHLY, PENALTY_DAYS_IN_MONTH } from '@/utils/constants'

interface PenaltyParams {
  dueAmount: number
  dueDate: string
  currentDate?: string
}

export function usePenalties({
  dueAmount,
  dueDate,
  currentDate = new Date().toISOString(),
}: PenaltyParams) {
  const penaltyDetails = useMemo(() => {
    if (!dueAmount || !dueDate) {
      return {
        penaltyAmount: 0,
        daysOverdue: 0,
        dailyPenaltyRate: 0,
        isPastDue: false,
      }
    }

    const due = parseISO(dueDate)
    const current = parseISO(currentDate)
    const daysOverdue = Math.max(0, differenceInDays(current, due))

    if (daysOverdue === 0) {
      return {
        penaltyAmount: 0,
        daysOverdue: 0,
        dailyPenaltyRate: 0,
        isPastDue: false,
      }
    }

    // Calculate daily penalty rate: (3% per month) / 30 days
    const dailyPenaltyRate = PENALTY_RATE_MONTHLY / PENALTY_DAYS_IN_MONTH

    // Calculate total penalty: dueAmount * dailyRate * daysOverdue
    const penaltyAmount = dueAmount * dailyPenaltyRate * daysOverdue

    return {
      penaltyAmount: Math.round(penaltyAmount * 100) / 100,
      daysOverdue,
      dailyPenaltyRate,
      isPastDue: true,
    }
  }, [dueAmount, dueDate, currentDate])

  return penaltyDetails
}

interface LoanPenaltiesParams {
  amortizationSchedule: Array<{
    due_date: string
    total_due: number
    principal_due: number
    interest_due: number
  }>
  payments: Array<{
    payment_date: string
    amount: number
    applied_to_principal: number
    applied_to_interest: number
    applied_to_penalty: number
  }>
  currentDate?: string
}

export function useLoanPenalties({
  amortizationSchedule,
  payments,
  currentDate = new Date().toISOString(),
}: LoanPenaltiesParams) {
  const penaltiesBreakdown = useMemo(() => {
    if (!amortizationSchedule || amortizationSchedule.length === 0) {
      return {
        totalPenalties: 0,
        penaltiesByPayment: [],
        totalOverdue: 0,
      }
    }

    let totalPenalties = 0
    const penaltiesByPayment: Array<{
      paymentNumber: number
      dueDate: string
      amountDue: number
      amountPaid: number
      penaltyAmount: number
      daysOverdue: number
    }> = []

    // Track payments applied to each schedule item
    const paymentTracker = new Map<number, number>()

    amortizationSchedule.forEach((scheduleItem, index) => {
      const paymentNumber = index + 1
      const amountDue = scheduleItem.total_due

      // Calculate how much was paid for this schedule item
      const amountPaid = payments
        .filter((p) => {
          const paidDate = parseISO(p.payment_date)
          const dueDate = parseISO(scheduleItem.due_date)
          return paidDate <= dueDate
        })
        .reduce((sum, p) => sum + p.applied_to_principal + p.applied_to_interest, 0)

      paymentTracker.set(paymentNumber, amountPaid)

      // If payment is past due and not fully paid
      if (amountPaid < amountDue) {
        const remainingDue = amountDue - amountPaid
        const dueDate = parseISO(scheduleItem.due_date)
        const current = parseISO(currentDate)
        const daysOverdue = Math.max(0, differenceInDays(current, dueDate))

        if (daysOverdue > 0) {
          const dailyRate = PENALTY_RATE_MONTHLY / PENALTY_DAYS_IN_MONTH
          const penaltyAmount = remainingDue * dailyRate * daysOverdue

          penaltiesByPayment.push({
            paymentNumber,
            dueDate: scheduleItem.due_date,
            amountDue,
            amountPaid,
            penaltyAmount: Math.round(penaltyAmount * 100) / 100,
            daysOverdue,
          })

          totalPenalties += penaltyAmount
        }
      }
    })

    const totalOverdue = penaltiesByPayment.reduce(
      (sum, p) => sum + (p.amountDue - p.amountPaid),
      0
    )

    return {
      totalPenalties: Math.round(totalPenalties * 100) / 100,
      penaltiesByPayment,
      totalOverdue: Math.round(totalOverdue * 100) / 100,
    }
  }, [amortizationSchedule, payments, currentDate])

  return penaltiesBreakdown
}
