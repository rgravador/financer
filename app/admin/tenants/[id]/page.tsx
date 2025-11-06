'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Spinner } from '@heroui/spinner'
import { Chip } from '@heroui/chip'
import { Divider } from '@heroui/divider'
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from '@heroui/table'
import { trpc as trpcProvider } from '@/lib/trpc/Provider'

export default function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const { data: tenant, isLoading: tenantLoading } = trpcProvider.tenants.getById.useQuery({ id })
  const { data: users, isLoading: usersLoading } = trpcProvider.tenants.getUsers.useQuery({ tenantId: id })

  if (tenantLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!tenant) {
    return (
      <div className="text-center py-12">
        <p className="text-default-500">Tenant not found</p>
        <Button
          className="mt-4"
          onPress={() => router.replace('/admin/tenants')}
        >
          Back to Tenants
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            isIconOnly
            variant="light"
            onPress={() => router.replace('/admin/tenants')}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{tenant.company_name}</h1>
            <p className="text-default-500 mt-1">Tenant Details</p>
          </div>
        </div>
        <Button
          color="primary"
          onPress={() => router.replace(`/admin/tenants/${id}/edit`)}
        >
          Edit Tenant
        </Button>
      </div>

      {/* Tenant Information */}
      <Card>
        <CardHeader className="pb-3">
          <h2 className="text-xl font-semibold">Tenant Information</h2>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-default-500">Company Name</p>
              <p className="font-medium">{tenant.company_name}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Contact Name</p>
              <p className="font-medium">{tenant.name}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Contact Email</p>
              <p className="font-medium">{tenant.contact_email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Contact Phone</p>
              <p className="font-medium">{tenant.contact_phone || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-default-500">Address</p>
              <p className="font-medium">{tenant.address || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-default-500">Status</p>
              <Chip
                color={tenant.is_active ? 'success' : 'danger'}
                variant="flat"
                size="sm"
                className="mt-1"
              >
                {tenant.is_active ? 'Active' : 'Inactive'}
              </Chip>
            </div>
            <div>
              <p className="text-sm text-default-500">Created At</p>
              <p className="font-medium">
                {new Date(tenant.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Tenant Users */}
      <Card>
        <CardHeader className="flex items-center justify-between pb-3">
          <h2 className="text-xl font-semibold">Tenant Users</h2>
          <Button
            size="sm"
            color="primary"
            onPress={() => router.replace(`/admin/tenants/${id}/users/new`)}
          >
            Add User
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <Table
              aria-label="Tenant users table"
              classNames={{
                wrapper: 'shadow-none',
              }}
            >
              <TableHeader>
                <TableColumn>NAME</TableColumn>
                <TableColumn>EMAIL</TableColumn>
                <TableColumn>ROLE</TableColumn>
                <TableColumn>STATUS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No users found for this tenant">
                {(users || []).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.full_name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip variant="flat" size="sm">
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={user.is_active ? 'success' : 'danger'}
                        variant="flat"
                        size="sm"
                      >
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Chip>
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
