'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { Spinner } from '@heroui/spinner'
import { Input } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/table'
import { Chip } from '@heroui/chip'
import { trpc as trpcProvider } from '@/lib/trpc/Provider'
import { SimplePesoIcon } from '@/components/icons/peso-icon'
import type { Selection } from '@react-types/shared'

type LoanStatus = 'pending_approval' | 'approved' | 'active' | 'closed' | 'rejected'

export default function LoansPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<LoanStatus | ''>('active') // Default to active
  const [page, setPage] = useState(0)
  const pageSize = 20

  const statusOptions = [
    { key: '', label: 'All Statuses' },
    { key: 'pending_approval', label: 'Pending Approval' },
    { key: 'approved', label: 'Approved' },
    { key: 'active', label: 'Active' },
    { key: 'closed', label: 'Closed' },
    { key: 'rejected', label: 'Rejected' },
  ] as const

  const { data, isLoading } = trpcProvider.loans.list.useQuery({
    limit: pageSize,
    offset: page * pageSize,
    status: statusFilter || undefined,
  })

  const loans = data?.loans || []
  const total = data?.total || 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success'
      case 'approved':
        return 'primary'
      case 'pending_approval':
        return 'warning'
      case 'closed':
        return 'default'
      case 'rejected':
        return 'danger'
      default:
        return 'default'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loans</h1>
          <p className="text-default-500 mt-1">Manage loan applications and accounts</p>
        </div>
        <Button
          color="primary"
          onPress={() => router.replace('/loans/new')}
          startContent={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New Loan
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Total Loans</p>
                <p className="text-2xl font-bold mt-1">{total}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <SimplePesoIcon className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Active</p>
                <p className="text-2xl font-bold mt-1">
                  {loans.filter((l) => l.status === 'active').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-success/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Pending</p>
                <p className="text-2xl font-bold mt-1">
                  {loans.filter((l) => l.status === 'pending_approval').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Closed</p>
                <p className="text-2xl font-bold mt-1">
                  {loans.filter((l) => l.status === 'closed').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-default-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-default-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Rejected</p>
                <p className="text-2xl font-bold mt-1">
                  {loans.filter((l) => l.status === 'rejected').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Search by account name or loan ID..."
              value={searchQuery}
              size="lg"
              onValueChange={(value: string) => {
                setSearchQuery(value)
                setPage(0)
              }}
              className="flex-1"
              startContent={
                <svg className="w-5 h-5 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              isClearable
              onClear={() => setSearchQuery('')}
            />

            {/* @ts-ignore - HeroUI Select type definition issue */}
            <Select
              placeholder="Filter by status"
              selectedKeys={statusFilter ? [statusFilter] : []}
              onSelectionChange={(keys: Selection) => {
                const selected = Array.from(keys)[0] as LoanStatus | undefined
                setStatusFilter(selected || '')
                setPage(0)
              }}
              className="w-full md:w-48"
              items={statusOptions}
              size="lg"
            >
              {(item: typeof statusOptions[number]) => <SelectItem key={item.key}>{item.label}</SelectItem>}
            </Select>
          </div>
        </CardBody>
      </Card>

      {/* Loans Table */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table
              aria-label="Loans table"
              classNames={{
                wrapper: 'shadow-none',
              }}
              bottomContent={
                total > pageSize && (
                  <div className="flex w-full justify-center p-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => setPage(Math.max(0, page - 1))}
                        isDisabled={page === 0}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center px-4">
                        Page {page + 1} of {Math.ceil(total / pageSize)}
                      </div>
                      <Button
                        size="sm"
                        variant="flat"
                        onPress={() => setPage(page + 1)}
                        isDisabled={(page + 1) * pageSize >= total}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )
              }
            >
              <TableHeader>
                <TableColumn>ACCOUNT</TableColumn>
                <TableColumn>PRINCIPAL</TableColumn>
                <TableColumn>CURRENT BALANCE</TableColumn>
                <TableColumn>INTEREST RATE</TableColumn>
                <TableColumn>PAYMENT FREQUENCY</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>START DATE</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No loans found">
                {loans.map((loan: any) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {loan.account?.name?.charAt(0).toUpperCase() || 'L'}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{loan.account?.name || 'Unknown Account'}</p>
                          <p className="text-xs text-default-400">
                            ID: {loan.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <SimplePesoIcon className="w-4 h-4 text-default-400" />
                        <span className="font-medium">{formatCurrency(loan.principal_amount)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <SimplePesoIcon className="w-4 h-4 text-default-400" />
                        <span>{formatCurrency(loan.current_balance)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span>{loan.interest_rate}%</span>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{loan.payment_frequency.replace('-', ' ')}</span>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={getStatusColor(loan.status)}
                        variant="flat"
                        size="sm"
                      >
                        {loan.status.replace('_', ' ').toUpperCase()}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      {new Date(loan.start_date).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="light"
                          onPress={() => router.replace(`/loans/${loan.id}`)}
                        >
                          View
                        </Button>
                        {loan.status === 'pending_approval' && (
                          <Button
                            size="sm"
                            variant="light"
                            color="primary"
                            onPress={() => router.replace(`/loans/${loan.id}/approve`)}
                          >
                            Review
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
