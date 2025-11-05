'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardBody, CardHeader, Button } from '@heroui/react'
import Link from 'next/link'
import { formatCurrency } from '@/utils/formatters'

export default function AdminDashboardPage() {
  const { data: accounts } = trpc.accounts.getAll.useQuery()
  const { data: loans } = trpc.loans.getAll.useQuery()
  const { data: earnings } = trpc.earnings.getAll.useQuery()
  const { data: cashouts } = trpc.cashouts.getAll.useQuery()

  const pendingApprovals = loans?.filter((l) => l.status === 'pending_approval').length || 0
  const pendingCashouts = cashouts?.filter((c) => c.status === 'pending').length || 0
  const activeLoans = loans?.filter((l) => l.status === 'active').length || 0
  const totalDisbursed = loans
    ?.filter((l) => l.status === 'active' || l.status === 'closed')
    .reduce((sum, l) => sum + l.principal_amount, 0) || 0
  const totalCollected = loans?.reduce((sum, l) => sum + l.total_paid, 0) || 0
  const totalEarnings = earnings?.reduce((sum, e) => sum + e.total_earnings, 0) || 0

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-yellow-200">
          <CardHeader>
            <p className="text-sm text-gray-600">Pending Approvals</p>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold text-yellow-600">{pendingApprovals}</p>
            <Link href="/admin/approvals">
              <Button size="sm" color="warning" className="mt-2">
                Review →
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card className="border-2 border-purple-200">
          <CardHeader>
            <p className="text-sm text-gray-600">Pending Cashouts</p>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold text-purple-600">{pendingCashouts}</p>
            <Link href="/admin/cashouts">
              <Button size="sm" color="secondary" className="mt-2">
                Review →
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Active Loans</p>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold text-green-600">{activeLoans}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Total Accounts</p>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold text-blue-600">{accounts?.length || 0}</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Total Disbursed</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold">{formatCurrency(totalDisbursed)}</p>
            <p className="text-sm text-gray-600 mt-1">All-time loan disbursements</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Total Collected</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(totalCollected)}
            </p>
            <p className="text-sm text-gray-600 mt-1">All-time payments received</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Agent Commissions</h2>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-purple-600">
              {formatCurrency(totalEarnings)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total agent earnings</p>
          </CardBody>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Quick Actions</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            <Link href="/admin/approvals">
              <Button color="warning" fullWidth className="justify-start">
                📋 Review Loan Approvals ({pendingApprovals})
              </Button>
            </Link>
            <Link href="/admin/cashouts">
              <Button color="secondary" fullWidth className="justify-start">
                💰 Process Cashouts ({pendingCashouts})
              </Button>
            </Link>
            <Link href="/accounts">
              <Button variant="flat" fullWidth className="justify-start">
                👥 Manage Accounts
              </Button>
            </Link>
            <Link href="/loans">
              <Button variant="flat" fullWidth className="justify-start">
                💳 View All Loans
              </Button>
            </Link>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Recent Activity</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {loans?.slice(0, 5).map((loan) => (
                <div key={loan.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{formatCurrency(loan.principal_amount)}</p>
                      <p className="text-sm text-gray-600">
                        {loan.tenure_months} months @ {loan.interest_rate}%
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        loan.status === 'pending_approval'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {loan.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  )
}
