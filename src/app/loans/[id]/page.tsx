'use client'

import { use } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { useAmortization } from '@/hooks/useAmortization'
import { useLoanPenalties } from '@/hooks/usePenalties'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/react'
import { formatDate, formatCurrency } from '@/utils/formatters'
import Link from 'next/link'

export default function LoanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { user, isAdmin } = useAuth()
  const { data: loan, isLoading, refetch } = trpc.loans.getById.useQuery({ id })
  const approveMutation = trpc.loans.approve.useMutation({
    onSuccess: () => refetch(),
  })
  const rejectMutation = trpc.loans.reject.useMutation({
    onSuccess: () => refetch(),
  })

  const amortization = useAmortization({
    principalAmount: loan?.principal_amount || 0,
    interestRate: loan?.interest_rate || 0,
    tenureMonths: loan?.tenure_months || 0,
    paymentFrequency: loan?.payment_frequency || 'monthly',
    startDate: loan?.start_date || new Date().toISOString(),
  })

  const penalties = useLoanPenalties({
    amortizationSchedule: loan?.amortization_schedule || [],
    payments: (loan as any)?.payments || [],
  })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!loan) {
    return <div>Loan not found</div>
  }

  const handleApprove = async () => {
    if (confirm('Are you sure you want to approve this loan?')) {
      await approveMutation.mutateAsync({ id })
    }
  }

  const handleReject = async () => {
    const reason = prompt('Please provide a reason for rejection:')
    if (reason) {
      await rejectMutation.mutateAsync({ id, reason })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="light" onPress={() => router.back()}>
            ← Back
          </Button>
          <h1 className="text-3xl font-bold">Loan Details</h1>
          <Chip
            color={
              loan.status === 'active'
                ? 'success'
                : loan.status === 'pending_approval'
                ? 'warning'
                : loan.status === 'rejected'
                ? 'danger'
                : 'default'
            }
          >
            {loan.status.replace('_', ' ').toUpperCase()}
          </Chip>
        </div>

        {isAdmin && loan.status === 'pending_approval' && (
          <div className="flex gap-2">
            <Button
              color="success"
              onPress={handleApprove}
              isLoading={approveMutation.isPending}
            >
              Approve
            </Button>
            <Button
              color="danger"
              variant="flat"
              onPress={handleReject}
              isLoading={rejectMutation.isPending}
            >
              Reject
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Loan Information</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Principal Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(loan.principal_amount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Interest Rate</p>
              <p className="font-medium">{loan.interest_rate}% per month</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tenure</p>
              <p className="font-medium">{loan.tenure_months} months</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Frequency</p>
              <p className="font-medium">{loan.payment_frequency}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Start Date</p>
              <p className="font-medium">{formatDate(loan.start_date)}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Financial Summary</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">EMI Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(amortization.emi)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Interest</p>
              <p className="font-medium">{formatCurrency(amortization.totalInterest)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Payment</p>
              <p className="font-medium">{formatCurrency(amortization.totalPayment)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number of Payments</p>
              <p className="font-medium">{amortization.numPayments}</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold">Payment Status</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Current Balance</p>
              <p className="text-2xl font-bold">{formatCurrency(loan.current_balance)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="font-medium text-green-600">
                {formatCurrency(loan.total_paid)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Penalties</p>
              <p className="font-medium text-red-600">
                {formatCurrency(penalties.totalPenalties)}
              </p>
            </div>
            {penalties.totalOverdue > 0 && (
              <div>
                <p className="text-sm text-gray-600">Amount Overdue</p>
                <p className="font-medium text-red-600">
                  {formatCurrency(penalties.totalOverdue)}
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {loan.rejection_reason && (
        <Card className="border-2 border-danger">
          <CardHeader>
            <h2 className="text-lg font-semibold text-danger">Rejection Reason</h2>
          </CardHeader>
          <CardBody>
            <p>{loan.rejection_reason}</p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Amortization Schedule</h2>
          <Link href={`/payments/create?loanId=${loan.id}`}>
            <Button color="primary" size="sm">
              Record Payment
            </Button>
          </Link>
        </CardHeader>
        <Divider />
        <CardBody>
          <Table aria-label="Amortization schedule">
            <TableHeader>
              <TableColumn>#</TableColumn>
              <TableColumn>DUE DATE</TableColumn>
              <TableColumn>PRINCIPAL</TableColumn>
              <TableColumn>INTEREST</TableColumn>
              <TableColumn>TOTAL DUE</TableColumn>
              <TableColumn>BALANCE</TableColumn>
            </TableHeader>
            <TableBody>
              {amortization.schedule.map((item) => (
                <TableRow key={item.payment_number}>
                  <TableCell>{item.payment_number}</TableCell>
                  <TableCell>{formatDate(item.due_date)}</TableCell>
                  <TableCell>{formatCurrency(item.principal_due)}</TableCell>
                  <TableCell>{formatCurrency(item.interest_due)}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(item.total_due)}
                  </TableCell>
                  <TableCell>{formatCurrency(item.remaining_balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      {penalties.penaltiesByPayment.length > 0 && (
        <Card className="border-2 border-warning">
          <CardHeader>
            <h2 className="text-xl font-semibold text-warning">Penalties</h2>
          </CardHeader>
          <Divider />
          <CardBody>
            <Table aria-label="Penalties breakdown">
              <TableHeader>
                <TableColumn>PAYMENT #</TableColumn>
                <TableColumn>DUE DATE</TableColumn>
                <TableColumn>DAYS OVERDUE</TableColumn>
                <TableColumn>AMOUNT DUE</TableColumn>
                <TableColumn>AMOUNT PAID</TableColumn>
                <TableColumn>PENALTY</TableColumn>
              </TableHeader>
              <TableBody>
                {penalties.penaltiesByPayment.map((penalty) => (
                  <TableRow key={penalty.paymentNumber}>
                    <TableCell>{penalty.paymentNumber}</TableCell>
                    <TableCell>{formatDate(penalty.dueDate)}</TableCell>
                    <TableCell className="text-red-600">{penalty.daysOverdue} days</TableCell>
                    <TableCell>{formatCurrency(penalty.amountDue)}</TableCell>
                    <TableCell>{formatCurrency(penalty.amountPaid)}</TableCell>
                    <TableCell className="font-semibold text-red-600">
                      {formatCurrency(penalty.penaltyAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardBody>
        </Card>
      )}
    </div>
  )
}
