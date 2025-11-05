'use client'

import { trpc } from '@/lib/trpc/client'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
} from '@heroui/react'
import { formatDate, formatCurrency } from '@/utils/formatters'

export default function AdminApprovalsPage() {
  const { data: loans, isLoading, refetch } = trpc.loans.getAll.useQuery()
  const approveMutation = trpc.loans.approve.useMutation({
    onSuccess: () => refetch(),
  })
  const rejectMutation = trpc.loans.reject.useMutation({
    onSuccess: () => refetch(),
  })

  const pendingLoans = loans?.filter((l) => l.status === 'pending_approval') || []

  const handleApprove = async (loanId: string) => {
    if (confirm('Are you sure you want to approve this loan?')) {
      await approveMutation.mutateAsync({ id: loanId })
    }
  }

  const handleReject = async (loanId: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (reason) {
      await rejectMutation.mutateAsync({ id: loanId, reason })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Loan Approvals</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Pending Approval</p>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold text-yellow-600">{pendingLoans.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Total Amount</p>
          </CardHeader>
          <CardBody>
            <p className="text-2xl font-bold">
              {formatCurrency(
                pendingLoans.reduce((sum, l) => sum + l.principal_amount, 0)
              )}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">This Month</p>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold text-blue-600">
              {
                pendingLoans.filter((l) => {
                  const created = new Date(l.created_at)
                  const now = new Date()
                  return (
                    created.getMonth() === now.getMonth() &&
                    created.getFullYear() === now.getFullYear()
                  )
                }).length
              }
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Pending Loan Applications</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Pending loans table">
            <TableHeader>
              <TableColumn>ACCOUNT</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>RATE</TableColumn>
              <TableColumn>TENURE</TableColumn>
              <TableColumn>FREQUENCY</TableColumn>
              <TableColumn>SUBMITTED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              emptyContent="No pending loan applications"
            >
              {pendingLoans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{(loan as any).account?.name || 'N/A'}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(loan.principal_amount)}
                  </TableCell>
                  <TableCell>{loan.interest_rate}%</TableCell>
                  <TableCell>{loan.tenure_months} months</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat">
                      {loan.payment_frequency}
                    </Chip>
                  </TableCell>
                  <TableCell>{formatDate(loan.created_at)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        color="success"
                        onPress={() => handleApprove(loan.id)}
                        isLoading={approveMutation.isPending}
                      >
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        onPress={() => handleReject(loan.id)}
                        isLoading={rejectMutation.isPending}
                      >
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Card className="bg-blue-50">
        <CardBody>
          <h3 className="font-semibold mb-2">📋 Approval Guidelines</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>Verify account information is complete and accurate</li>
            <li>Check debt-to-income ratio (should be reasonable)</li>
            <li>Review employment and income documentation</li>
            <li>Ensure loan terms are within acceptable ranges (3-5% interest, 2-12 months)</li>
            <li>Consider borrower's payment history if applicable</li>
          </ul>
        </CardBody>
      </Card>
    </div>
  )
}
