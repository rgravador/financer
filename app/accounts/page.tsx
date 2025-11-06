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
import type { AccountStatus } from '@/server/db/database'
import type { Selection } from '@react-types/shared'

export default function AccountsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<AccountStatus | ''>('')
  const [page, setPage] = useState(0)
  const pageSize = 20

  const statusOptions = [
    { key: '', label: 'All Statuses' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
    { key: 'suspended', label: 'Suspended' },
  ] as const

  const { data, isLoading } = trpcProvider.accounts.list.useQuery({
    limit: pageSize,
    offset: page * pageSize,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  })

  const accounts = data?.accounts || []
  const total = data?.total || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Accounts</h1>
          <p className="text-default-500 mt-1">Manage customer accounts</p>
        </div>
        <Button
          color="primary"
          onPress={() => router.replace('/accounts/new')}
          startContent={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New Account
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Total Accounts</p>
                <p className="text-2xl font-bold mt-1">{total}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
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
                  {accounts.filter((a) => a.status === 'active').length}
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
                <p className="text-sm text-default-500">Inactive</p>
                <p className="text-2xl font-bold mt-1">
                  {accounts.filter((a) => a.status === 'inactive').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-default-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-default-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Suspended</p>
                <p className="text-2xl font-bold mt-1">
                  {accounts.filter((a) => a.status === 'suspended').length}
                </p>
              </div>
              <div className="w-10 h-10 bg-danger/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
              placeholder="Search by name, contact, or phone..."
              value={searchQuery}
              onValueChange={(value: string) => {
                setSearchQuery(value)
                setPage(0) // Reset to first page on search
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
                const selected = Array.from(keys)[0] as AccountStatus | undefined
                setStatusFilter(selected || '')
                setPage(0) // Reset to first page on filter
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

      {/* Accounts Table */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table
              aria-label="Accounts table"
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
                <TableColumn>NAME</TableColumn>
                <TableColumn>CONTACT</TableColumn>
                <TableColumn>PHONE</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>LOANS</TableColumn>
                <TableColumn>CREATED</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No accounts found">
                {accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {account.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{account.name}</p>
                          {account.address && (
                            <p className="text-xs text-default-400 truncate max-w-[200px]">
                              {account.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {account.contact_info || account.email || '-'}
                    </TableCell>
                    <TableCell>
                      {account.phone_number || account.contact_number || '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={
                          account.status === 'active'
                            ? 'success'
                            : account.status === 'suspended'
                            ? 'danger'
                            : 'default'
                        }
                        variant="flat"
                        size="sm"
                      >
                        {account.status.toUpperCase()}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <SimplePesoIcon className="w-4 h-4 text-default-400" />
                        <span className="text-sm">{account.loans?.length || 0}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(account.created_at).toLocaleDateString('en-US', {
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
                          onPress={() => router.replace(`/accounts/${account.id}`)}
                        >
                          View
                        </Button>
                        <Button
                          size="sm"
                          variant="light"
                          color="primary"
                          onPress={() => router.replace(`/accounts/${account.id}/edit`)}
                        >
                          Edit
                        </Button>
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
