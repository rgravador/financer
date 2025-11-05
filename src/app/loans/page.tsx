'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Select,
  SelectItem,
} from '@heroui/react'
import Link from 'next/link'
import { formatDate, formatCurrency } from '@/utils/formatters'

export default function LoansPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const { data: loans, isLoading } = trpc.loans.getAll.useQuery()

  const filteredLoans = loans?.filter((loan) => {
    const matchesStatus = !statusFilter || loan.status === statusFilter
    return matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Loans</h1>
        <Link href="/loans/create">
          <Button color="primary">Create Loan</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex gap-4 items-end">
          <Select
            label="Status"
            placeholder="Select status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="max-w-xs"
          >
            <SelectItem key="active" value="active">
              Active
            </SelectItem>
            <SelectItem key="pending_approval" value="pending_approval">
              Pending Approval
            </SelectItem>
            <SelectItem key="approved" value="approved">
              Approved
            </SelectItem>
            <SelectItem key="closed" value="closed">
              Closed
            </SelectItem>
            <SelectItem key="rejected" value="rejected">
              Rejected
            </SelectItem>
          </Select>
        </CardHeader>
        <CardBody>
          <Table aria-label="Loans table">
            <TableHeader>
              <TableColumn>PRINCIPAL</TableColumn>
              <TableColumn>INTEREST RATE</TableColumn>
              <TableColumn>TENURE</TableColumn>
              <TableColumn>FREQUENCY</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>START DATE</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              emptyContent="No loans found"
            >
              {(filteredLoans ?? []).map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell>{formatCurrency(loan.principal_amount)}</TableCell>
                  <TableCell>{loan.interest_rate}%</TableCell>
                  <TableCell>{loan.tenure_months} months</TableCell>
                  <TableCell>{loan.payment_frequency}</TableCell>
                  <TableCell>
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
                      size="sm"
                    >
                      {loan.status.replace('_', ' ')}
                    </Chip>
                  </TableCell>
                  <TableCell>{formatDate(loan.start_date)}</TableCell>
                  <TableCell>
                    <Link href={`/loans/${loan.id}`}>
                      <Button size="sm" variant="light">
                        View
                      </Button>
                    </Link>
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
