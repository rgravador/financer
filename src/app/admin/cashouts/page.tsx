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

export default function AdminCashoutsPage() {
  const { data: cashouts, isLoading, refetch } = trpc.cashouts.getAll.useQuery()
  const approveMutation = trpc.cashouts.approve.useMutation({
    onSuccess: () => refetch(),
  })
  const rejectMutation = trpc.cashouts.reject.useMutation({
    onSuccess: () => refetch(),
  })

  const pendingCashouts = cashouts?.filter((c) => c.status === 'pending') || []

  const handleApprove = async (cashoutId: string) => {
    if (confirm('Are you sure you want to approve this cashout request?')) {
      await approveMutation.mutateAsync({ id: cashoutId })
    }
  }

  const handleReject = async (cashoutId: string) => {
    const reason = prompt('Please provide a reason for rejection:')
    if (reason) {
      await rejectMutation.mutateAsync({ id: cashoutId, reason })
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Cashout Requests</h1>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Pending</p>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold text-yellow-600">{pendingCashouts.length}</p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Pending Amount</p>
          </CardHeader>
          <CardBody>
            <p className="text-2xl font-bold">
              {formatCurrency(
                pendingCashouts.reduce((sum, c) => sum + c.amount, 0)
              )}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Approved Today</p>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold text-green-600">
              {
                cashouts?.filter((c) => {
                  if (!c.approval_date) return false
                  const approved = new Date(c.approval_date)
                  const today = new Date()
                  return (
                    approved.toDateString() === today.toDateString() &&
                    c.status === 'approved'
                  )
                }).length || 0
              }
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Total Processed</p>
          </CardHeader>
          <CardBody>
            <p className="text-4xl font-bold text-blue-600">
              {cashouts?.filter((c) => c.status !== 'pending').length || 0}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Pending Cashout Requests</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Pending cashouts table">
            <TableHeader>
              <TableColumn>AGENT</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>REQUEST DATE</TableColumn>
              <TableColumn>DAYS PENDING</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              emptyContent="No pending cashout requests"
            >
              {pendingCashouts.map((cashout) => {
                const daysPending = Math.floor(
                  (new Date().getTime() - new Date(cashout.request_date).getTime()) /
                    (1000 * 60 * 60 * 24)
                )
                return (
                  <TableRow key={cashout.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{cashout.agent?.full_name || 'N/A'}</p>
                        <p className="text-sm text-gray-600">{cashout.agent?.email}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-lg">
                      {formatCurrency(cashout.amount)}
                    </TableCell>
                    <TableCell>{formatDate(cashout.request_date)}</TableCell>
                    <TableCell>
                      <Chip
                        size="sm"
                        color={daysPending > 3 ? 'danger' : daysPending > 1 ? 'warning' : 'default'}
                      >
                        {daysPending} days
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          color="success"
                          onPress={() => handleApprove(cashout.id)}
                          isLoading={approveMutation.isPending}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          color="danger"
                          variant="flat"
                          onPress={() => handleReject(cashout.id)}
                          isLoading={rejectMutation.isPending}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Recent Processed Requests</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Processed cashouts table">
            <TableHeader>
              <TableColumn>AGENT</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>REQUEST DATE</TableColumn>
              <TableColumn>PROCESSED DATE</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody
              emptyContent="No processed requests yet"
            >
              {(cashouts?.filter((c) => c.status !== 'pending').slice(0, 10) || []).map((cashout) => (
                <TableRow key={cashout.id}>
                  <TableCell>{cashout.agent?.full_name || 'N/A'}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(cashout.amount)}
                  </TableCell>
                  <TableCell>{formatDate(cashout.request_date)}</TableCell>
                  <TableCell>
                    {cashout.approval_date ? formatDate(cashout.approval_date) : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={cashout.status === 'approved' ? 'success' : 'danger'}
                    >
                      {cashout.status}
                    </Chip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardBody>
      </Card>
    </div>
  )
}
