'use client'

import { trpc } from '@/lib/trpc/client'
import { useLoanCommissions } from '@/hooks/useCommissions'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Divider,
  Progress,
} from '@heroui/react'
import Link from 'next/link'
import { formatCurrency } from '@/utils/formatters'

export default function EarningsPage() {
  const { data: earnings, isLoading: earningsLoading } = trpc.earnings.getMy.useQuery()
  const { data: loans, isLoading: loansLoading } = trpc.loans.getAll.useQuery()

  const commissionsBreakdown = useLoanCommissions({
    loans: loans?.filter((l) => l.status === 'active' || l.status === 'closed') || [],
    commissionPercentage: earnings?.commission_percentage || 0,
  })

  const isLoading = earningsLoading || loansLoading

  if (isLoading) {
    return <div>Loading...</div>
  }

  const collectibleAmount = (earnings?.total_earnings || 0) - (earnings?.cashed_out_amount || 0)
  const canRequestCashout = collectibleAmount >= 10 // Minimum cashout amount from constants

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Earnings</h1>
        <Link href="/cashouts">
          <Button color="primary">View Cashouts</Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Total Earnings</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold">
              {formatCurrency(commissionsBreakdown.totalCommissions)}
            </p>
            <p className="text-sm text-gray-600 mt-1">All-time commissions</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Earned Commissions</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(commissionsBreakdown.earnedCommissions)}
            </p>
            <p className="text-sm text-gray-600 mt-1">From completed payments</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Projected Earnings</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(commissionsBreakdown.projectedCommissions)}
            </p>
            <p className="text-sm text-gray-600 mt-1">From active loans</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Available to Cashout</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-purple-600">
              {formatCurrency(collectibleAmount)}
            </p>
            <Link href="/cashouts/create">
              <Button
                color="primary"
                size="sm"
                className="mt-2"
                isDisabled={!canRequestCashout}
              >
                Request Cashout
              </Button>
            </Link>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Commission Settings</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-sm text-gray-600">Commission Rate</p>
              <p className="text-2xl font-bold">{earnings?.commission_percentage || 0}%</p>
              <p className="text-sm text-gray-600 mt-1">
                Earned on interest portion of payments
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cashed Out</p>
              <p className="text-2xl font-bold text-gray-700">
                {formatCurrency(earnings?.cashed_out_amount || 0)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Lifetime withdrawals
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Commissions by Loan</h2>
        </CardHeader>
        <Divider />
        <CardBody>
          <div className="space-y-4">
            {commissionsBreakdown.commissionsByLoan.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No active loans yet</p>
            ) : (
              commissionsBreakdown.commissionsByLoan.map((commission, index) => (
                <div key={index} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">
                        Loan Amount: {formatCurrency(commission.loanId)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Interest: {formatCurrency(commission.totalInterest)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {formatCurrency(commission.fullCommission)}
                      </p>
                      <p className="text-sm text-gray-600">Total Commission</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Earned: {formatCurrency(commission.earnedCommission)}</span>
                      <span>Projected: {formatCurrency(commission.projectedCommission)}</span>
                    </div>
                    <Progress
                      value={(commission.earnedCommission / commission.fullCommission) * 100}
                      color="success"
                      className="mt-1"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardBody>
      </Card>

      <Card className="bg-blue-50 border-2 border-blue-200">
        <CardBody>
          <h3 className="font-semibold mb-2">💡 How Commissions Work</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>Commissions are earned on the <strong>interest portion</strong> of loan payments</li>
            <li>Your commission rate is <strong>{earnings?.commission_percentage || 0}%</strong> of the interest collected</li>
            <li>Commissions are earned as borrowers make payments</li>
            <li>You can request a cashout when you have at least {formatCurrency(10)} available</li>
            <li>Projected earnings show potential commissions from active loans</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
