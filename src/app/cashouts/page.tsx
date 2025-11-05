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
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/utils/formatters'

export default function CashoutsPage() {
  const { data: cashouts, isLoading } = trpc.cashouts.getMy.useQuery()
  const { data: earnings } = trpc.earnings.getMy.useQuery()

  const collectibleAmount = (earnings?.total_earnings || 0) - (earnings?.cashed_out_amount || 0)
  const canRequestCashout = collectibleAmount >= 10

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Cashout Requests</h1>
        <Link href="/cashouts/create">
          <Button color="primary" isDisabled={!canRequestCashout}>
            Request Cashout
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Available Balance</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(collectibleAmount)}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Pending Requests</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-yellow-600">
              {cashouts?.filter((c) => c.status === 'pending').length || 0}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Total Cashed Out</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold">
              {formatCurrency(earnings?.cashed_out_amount || 0)}
            </p>
          </CardBody>
        </Card>
      </div>

      {!canRequestCashout && (
        <Card className="bg-yellow-50 border-2 border-yellow-200">
          <CardBody>
            <p className="font-semibold">⚠️ Minimum Cashout Amount</p>
            <p className="text-sm mt-1">
              You need at least {formatCurrency(10)} in earnings to request a cashout.
              Current balance: {formatCurrency(collectibleAmount)}
            </p>
          </CardBody>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Cashout History</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Cashouts table">
            <TableHeader>
              <TableColumn>REQUEST DATE</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>PROCESSED DATE</TableColumn>
              <TableColumn>NOTES</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              emptyContent="No cashout requests yet"
            >
              {(cashouts ?? []).map((cashout) => (
                <TableRow key={cashout.id}>
                  <TableCell>{formatDate(cashout.request_date)}</TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(cashout.amount)}
                  </TableCell>
                  <TableCell>
                    <Chip
                      color={
                        cashout.status === 'approved'
                          ? 'success'
                          : cashout.status === 'rejected'
                          ? 'danger'
                          : 'warning'
                      }
                      size="sm"
                    >
                      {cashout.status}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    {cashout.approval_date
                      ? formatDate(cashout.approval_date)
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {cashout.rejection_reason || '-'}
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
