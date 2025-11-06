'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import { Spinner } from '@heroui/spinner'
import { trpc } from '@/lib/trpc/Provider'

export default function NewTenantUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const { data: tenant, isLoading } = trpc.tenants.getById.useQuery({ id })
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'tenant_officer' as 'tenant_admin' | 'tenant_officer' | 'tenant_legal' | 'tenant_approver',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createUserMutation = trpc.tenants.createUser.useMutation({
    onSuccess: () => {
      router.push(`/admin/tenants/${id}`)
      router.refresh()
    },
    onError: (error) => {
      setErrors({ submit: error.message })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // Basic validation
    const newErrors: Record<string, string> = {}
    if (!formData.email) newErrors.email = 'Email is required'
    if (!formData.email.includes('@')) newErrors.email = 'Invalid email format'
    if (!formData.password) newErrors.password = 'Password is required'
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    if (!formData.full_name) newErrors.full_name = 'Full name is required'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    createUserMutation.mutate({
      email: formData.email,
      password: formData.password,
      full_name: formData.full_name,
      role: formData.role,
      tenant_id: id,
    })
  }

  if (isLoading) {
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
          onPress={() => router.push('/admin/tenants')}
        >
          Back to Tenants
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          isIconOnly
          variant="light"
          onPress={() => router.back()}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New User</h1>
          <p className="text-default-500 mt-1">{tenant.company_name}</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-xl font-semibold">User Information</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {errors.submit && (
              <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg px-4 py-3 text-sm">
                {errors.submit}
              </div>
            )}

            <Input
              label="Full Name"
              labelPlacement="outside"
              placeholder="Enter full name"
              value={formData.full_name}
              onValueChange={(value) => setFormData({ ...formData, full_name: value })}
              isRequired
              errorMessage={errors.full_name}
              isInvalid={!!errors.full_name}
              variant="bordered"
              size="lg"
            />

            <Input
              type="email"
              label="Email"
              labelPlacement="outside"
              placeholder="user@company.com"
              value={formData.email}
              onValueChange={(value) => setFormData({ ...formData, email: value })}
              isRequired
              errorMessage={errors.email}
              isInvalid={!!errors.email}
              variant="bordered"
              size="lg"
            />

            {/* @ts-ignore - HeroUI Select type definition issue */}
            <Select
              label="Role"
              labelPlacement="outside"
              placeholder="Select user role"
              selectedKeys={[formData.role]}
              onSelectionChange={(keys) => {
                const role = Array.from(keys)[0] as typeof formData.role
                setFormData({ ...formData, role })
              }}
              isRequired
              variant="bordered"
              size="lg"
            >
              <SelectItem key="tenant_admin" value="tenant_admin">
                Tenant Admin
              </SelectItem>
              <SelectItem key="tenant_officer" value="tenant_officer">
                Tenant Officer
              </SelectItem>
              <SelectItem key="tenant_approver" value="tenant_approver">
                Tenant Approver
              </SelectItem>
              <SelectItem key="tenant_legal" value="tenant_legal">
                Tenant Legal Officer
              </SelectItem>
            </Select>

            <Input
              type="password"
              label="Password"
              labelPlacement="outside"
              placeholder="Enter password (min 8 characters)"
              value={formData.password}
              onValueChange={(value) => setFormData({ ...formData, password: value })}
              isRequired
              errorMessage={errors.password}
              isInvalid={!!errors.password}
              variant="bordered"
              size="lg"
            />

            <Input
              type="password"
              label="Confirm Password"
              labelPlacement="outside"
              placeholder="Re-enter password"
              value={formData.confirmPassword}
              onValueChange={(value) => setFormData({ ...formData, confirmPassword: value })}
              isRequired
              errorMessage={errors.confirmPassword}
              isInvalid={!!errors.confirmPassword}
              variant="bordered"
              size="lg"
            />

            <div className="bg-default-100 rounded-lg px-4 py-3 text-sm">
              <p className="font-medium mb-1">Role Permissions:</p>
              <ul className="list-disc list-inside space-y-1 text-default-600">
                <li><strong>Tenant Admin:</strong> Full access to tenant data and users</li>
                <li><strong>Tenant Officer:</strong> Can manage accounts and loans</li>
                <li><strong>Tenant Approver:</strong> Can approve/reject loans</li>
                <li><strong>Tenant Legal Officer:</strong> Can access legal documents and compliance</li>
              </ul>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button
                variant="light"
                onPress={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={createUserMutation.isPending}
              >
                Create User
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  )
}
