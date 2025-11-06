'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody } from '@heroui/card'
import { Button } from '@heroui/button'
import { Spinner } from '@heroui/spinner'
import { Input } from '@heroui/input'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/table'
import { Chip } from '@heroui/chip'
import { trpc as trpcProvider } from '@/src/lib/trpc/Provider'

export default function TenantsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')

  const { data: tenants, isLoading } = trpcProvider.tenants.getAll.useQuery()

  const filteredTenants = tenants?.filter(
    (tenant) =>
      tenant.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tenant.contact_email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tenants</h1>
          <p className="text-default-500 mt-1">Manage all tenant organizations</p>
        </div>
        <Button
          color="primary"
          onPress={() => router.replace('/admin/tenants/new')}
          startContent={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Create Tenant
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardBody className="p-4">
          <Input
            placeholder="Search tenants by name, company, or email..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            startContent={
              <svg className="w-5 h-5 text-default-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            classNames={{
              inputWrapper: 'border-0',
            }}
          />
        </CardBody>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardBody className="p-0">
          <Table
            aria-label="Tenants table"
            classNames={{
              wrapper: 'shadow-none',
            }}
          >
            <TableHeader>
              <TableColumn>COMPANY NAME</TableColumn>
              <TableColumn>CONTACT NAME</TableColumn>
              <TableColumn>EMAIL</TableColumn>
              <TableColumn>PHONE</TableColumn>
              <TableColumn>STATUS</TableColumn>
              <TableColumn>ACTIONS</TableColumn>
            </TableHeader>
            <TableBody emptyContent="No tenants found">
              {(filteredTenants || []).map((tenant: any) => (
                <TableRow key={tenant.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{tenant.company_name}</p>
                      <p className="text-xs text-default-400">{tenant.address || 'No address'}</p>
                    </div>
                  </TableCell>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell>{tenant.contact_email || '-'}</TableCell>
                  <TableCell>{tenant.contact_phone || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      color={tenant.is_active ? 'success' : 'danger'}
                      variant="flat"
                      size="sm"
                    >
                      {tenant.is_active ? 'Active' : 'Inactive'}
                    </Chip>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="light"
                        onPress={() => router.replace(`/admin/tenants/${tenant.id}`)}
                      >
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="light"
                        color="primary"
                        onPress={() => router.replace(`/admin/tenants/${tenant.id}/edit`)}
                      >
                        Edit
                      </Button>
                    </div>
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
