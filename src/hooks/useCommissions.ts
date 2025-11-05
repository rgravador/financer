import { useMemo } from 'react'

interface CommissionParams {
  totalInterest: number
  commissionPercentage: number // e.g., 10 for 10%
}

export function useCommissions({
  totalInterest,
  commissionPercentage,
}: CommissionParams) {
  const commission = useMemo(() => {
    if (!totalInterest || !commissionPercentage) {
      return {
        commissionAmount: 0,
        commissionRate: 0,
      }
    }

    const commissionAmount = (totalInterest * commissionPercentage) / 100

    return {
      commissionAmount: Math.round(commissionAmount * 100) / 100,
      commissionRate: commissionPercentage,
    }
  }, [totalInterest, commissionPercentage])

  return commission
}

interface LoanCommissionsParams {
  loans: Array<{
    principal_amount: number
    interest_rate: number
    tenure_months: number
    total_paid: number
    status: string
  }>
  commissionPercentage: number
}

export function useLoanCommissions({
  loans,
  commissionPercentage,
}: LoanCommissionsParams) {
  const commissionsBreakdown = useMemo(() => {
    if (!loans || loans.length === 0 || !commissionPercentage) {
      return {
        totalCommissions: 0,
        earnedCommissions: 0,
        projectedCommissions: 0,
        commissionsByLoan: [],
      }
    }

    let totalCommissions = 0
    let earnedCommissions = 0
    let projectedCommissions = 0

    const commissionsByLoan = loans.map((loan) => {
      // Calculate total interest for the loan
      const monthlyRate = loan.interest_rate / 100
      const emi =
        (loan.principal_amount *
          monthlyRate *
          Math.pow(1 + monthlyRate, loan.tenure_months)) /
        (Math.pow(1 + monthlyRate, loan.tenure_months) - 1)
      const totalPayment = emi * loan.tenure_months
      const totalInterest = totalPayment - loan.principal_amount

      // Calculate commission on interest
      const fullCommission = (totalInterest * commissionPercentage) / 100

      // Calculate earned commission based on payments made
      const paymentProgress = loan.total_paid / totalPayment
      const earned = fullCommission * paymentProgress

      totalCommissions += fullCommission
      earnedCommissions += earned

      if (loan.status === 'active') {
        projectedCommissions += fullCommission - earned
      }

      return {
        loanId: loan.principal_amount, // Using amount as identifier for now
        totalInterest: Math.round(totalInterest * 100) / 100,
        fullCommission: Math.round(fullCommission * 100) / 100,
        earnedCommission: Math.round(earned * 100) / 100,
        projectedCommission: Math.round((fullCommission - earned) * 100) / 100,
      }
    })

    return {
      totalCommissions: Math.round(totalCommissions * 100) / 100,
      earnedCommissions: Math.round(earnedCommissions * 100) / 100,
      projectedCommissions: Math.round(projectedCommissions * 100) / 100,
      commissionsByLoan,
    }
  }, [loans, commissionPercentage])

  return commissionsBreakdown
}
