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

export default function PaymentsPage() {
  const { data: payments, isLoading } = trpc.payments.getAll.useQuery()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments</h1>
        <Link href="/payments/create">
          <Button color="primary">Record Payment</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">Payment History</h2>
        </CardHeader>
        <CardBody>
          <Table aria-label="Payments table">
            <TableHeader>
              <TableColumn>DATE</TableColumn>
              <TableColumn>LOAN</TableColumn>
              <TableColumn>AMOUNT</TableColumn>
              <TableColumn>PRINCIPAL</TableColumn>
              <TableColumn>INTEREST</TableColumn>
              <TableColumn>PENALTY</TableColumn>
              <TableColumn>TYPE</TableColumn>
              <TableColumn>STATUS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              emptyContent="No payments recorded yet"
            >
              {(payments ?? []).map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{formatDate(payment.payment_date)}</TableCell>
                  <TableCell>
                    {(payment as any).loan?.account?.name || 'N/A'}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(payment.amount)}
                  </TableCell>
                  <TableCell>{formatCurrency(payment.applied_to_principal)}</TableCell>
                  <TableCell>{formatCurrency(payment.applied_to_interest)}</TableCell>
                  <TableCell>{formatCurrency(payment.applied_to_penalty)}</TableCell>
                  <TableCell>
                    <Chip size="sm" variant="flat">
                      {payment.type}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="sm"
                      color={payment.status === 'received' ? 'success' : 'default'}
                    >
                      {payment.status}
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
