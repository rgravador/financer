'use client'

import { useAuth } from '@/hooks/useAuth'
import { trpc } from '@/lib/trpc/client'
import { Card, CardBody, CardHeader } from '@heroui/react'
import { formatCurrency } from '@/utils/formatters'

export default function DashboardPage() {
  const { user } = useAuth()
  const { data: accounts } = trpc.accounts.getAll.useQuery()
  const { data: loans } = trpc.loans.getAll.useQuery()
  const { data: earnings } = trpc.earnings.getMy.useQuery(undefined, {
    enabled: user?.role === 'agent',
  })

  const activeLoans = loans?.filter((loan) => loan.status === 'active') ?? []
  const pendingLoans = loans?.filter((loan) => loan.status === 'pending_approval') ?? []

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Welcome back, {user?.display_name || user?.full_name}!
      </h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-col items-start">
            <p className="text-sm text-gray-600">Total Accounts</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold">{accounts?.length ?? 0}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-start">
            <p className="text-sm text-gray-600">Active Loans</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold">{activeLoans.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex flex-col items-start">
            <p className="text-sm text-gray-600">Pending Approvals</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold">{pendingLoans.length}</p>
          </CardBody>
        </Card>

        {user?.role === 'agent' && (
          <Card>
            <CardHeader className="flex flex-col items-start">
              <p className="text-sm text-gray-600">Total Earnings</p>
            </CardHeader>
            <CardBody>
              <p className="text-3xl font-bold">
                {formatCurrency(earnings?.total_earnings ?? 0)}
              </p>
            </CardBody>
          </Card>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Recent Accounts</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {accounts?.slice(0, 5).map((account) => (
                <div
                  key={account.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-gray-600">{account.contact_info}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      account.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {account.status}
                  </span>
                </div>
              ))}
              {!accounts || accounts.length === 0 && (
                <p className="text-gray-500 text-center py-4">No accounts yet</p>
              )}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Recent Loans</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              {loans?.slice(0, 5).map((loan) => (
                <div
                  key={loan.id}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{formatCurrency(loan.principal_amount)}</p>
                    <p className="text-sm text-gray-600">
                      {loan.tenure_months} months @ {loan.interest_rate}%
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs ${
                      loan.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : loan.status === 'pending_approval'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {loan.status.replace('_', ' ')}
                  </span>
                </div>
              ))}
              {!loans || loans.length === 0 && (
                <p className="text-gray-500 text-center py-4">No loans yet</p>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
