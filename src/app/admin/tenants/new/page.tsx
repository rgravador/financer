'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Textarea } from '@heroui/input'
import { trpc as trpcProvider } from '@/src/lib/trpc/Provider'

export default function NewTenantPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const createMutation = trpcProvider.tenants.create.useMutation({
    onSuccess: () => {
      router.replace('/admin/tenants')
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
    if (!formData.name) newErrors.name = 'Contact name is required'
    if (!formData.company_name) newErrors.company_name = 'Company name is required'
    if (formData.contact_email && !formData.contact_email.includes('@')) {
      newErrors.contact_email = 'Invalid email format'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    createMutation.mutate({
      name: formData.name,
      company_name: formData.company_name,
      contact_email: formData.contact_email || null,
      contact_phone: formData.contact_phone || null,
      address: formData.address || null,
    })
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
          <h1 className="text-3xl font-bold">Create New Tenant</h1>
          <p className="text-default-500 mt-1">Add a new tenant organization to the system</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-xl font-semibold">Tenant Information</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            {errors.submit && (
              <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg px-4 py-3 text-sm">
                {errors.submit}
              </div>
            )}

            <Input
              label="Company Name"
              labelPlacement="outside"
              placeholder="Enter company name"
              value={formData.company_name}
              onValueChange={(value: string) => setFormData({ ...formData, company_name: value })}
              isRequired
              errorMessage={errors.company_name}
              isInvalid={!!errors.company_name}
              variant="bordered"
              size="lg"
            />

            <Input
              label="Contact Name"
              labelPlacement="outside"
              placeholder="Enter primary contact name"
              value={formData.name}
              onValueChange={(value: string) => setFormData({ ...formData, name: value })}
              isRequired
              errorMessage={errors.name}
              isInvalid={!!errors.name}
              variant="bordered"
              size="lg"
            />

            <Input
              type="email"
              label="Contact Email"
              labelPlacement="outside"
              placeholder="contact@company.com"
              value={formData.contact_email}
              onValueChange={(value: string) => setFormData({ ...formData, contact_email: value })}
              errorMessage={errors.contact_email}
              isInvalid={!!errors.contact_email}
              variant="bordered"
              size="lg"
            />

            <Input
              type="tel"
              label="Contact Phone"
              labelPlacement="outside"
              placeholder="+1 (555) 000-0000"
              value={formData.contact_phone}
              onValueChange={(value: string) => setFormData({ ...formData, contact_phone: value })}
              variant="bordered"
              size="lg"
            />

            <Textarea
              label="Address"
              labelPlacement="outside"
              placeholder="Enter company address"
              value={formData.address}
              onValueChange={(value: string) => setFormData({ ...formData, address: value })}
              variant="bordered"
              size="lg"
              minRows={3}
            />

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
                isLoading={createMutation.isPending}
              >
                Create Tenant
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  )
}
