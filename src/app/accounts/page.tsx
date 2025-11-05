'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
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

import { formatDate } from '@/utils/formatters'

export default function AccountsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('active')
  const { data: accounts, isLoading } = trpc.accounts.getAll.useQuery()

  const filteredAccounts = accounts?.filter((account) => {
    const matchesSearch =
      !search ||
      account.name?.toLowerCase().includes(search.toLowerCase()) ||
      account.contact_info?.toLowerCase().includes(search.toLowerCase()) ||
      account.address?.toLowerCase().includes(search.toLowerCase())

    const matchesStatus = !statusFilter || account.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Accounts</h1>
        <Link href="/accounts/create">
          <Button color="primary">Create Account</Button>
        </Link>
      </div>

      <Card>
        <CardHeader className="flex gap-4 items-end">
          <Input
            label="Search"
            placeholder="Search by name, contact, or address"
            value={search}
            onValueChange={setSearch}
            className="max-w-sm"
            variant="bordered"
            isClearable
          />
          <Select
            label="Status"
            placeholder="Select status"
            selectedKeys={[statusFilter]}
            onSelectionChange={(keys) => {
              const value = Array.from(keys)[0] as string
              setStatusFilter(value)
            }}
            className="max-w-xs"
            variant="bordered"
          >
            <SelectItem key="active">
              Active
            </SelectItem>
            <SelectItem key="inactive">
              Inactive
            </SelectItem>
            <SelectItem key="suspended">
              Suspended
            </SelectItem>
          </Select>
        </CardHeader>
        <CardBody>
          <Table aria-label="Accounts table">
            <TableHeader>
              <TableColumn>NAME</TableColumn>
              <TableColumn>CONTACT INFO</TableColumn>
              <TableColumn>ADDRESS</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>CREATED</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody
              isLoading={isLoading}
              emptyContent="No accounts found"
            >
              {(filteredAccounts ?? []).map((account) => (
                <TableRow key={account.id}>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>{account.contact_info || '-'}</TableCell>
                  <TableCell>{account.address || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      color={
                        account.status === 'active'
                          ? 'success'
                          : account.status === 'suspended'
                          ? 'danger'
                          : 'default'
                      }
                      size="sm"
                    >
                      {account.status}
                    </Chip>
                  </TableCell>
                  <TableCell>{formatDate(account.created_at)}</TableCell>
                  <TableCell>
                    <Link href={`/accounts/${account.id}`}>
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
