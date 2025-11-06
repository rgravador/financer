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
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/modal'
import { Textarea } from '@heroui/input'
import { Checkbox } from '@heroui/checkbox'
import { trpc as trpcProvider } from '@/src/lib/trpc/Provider'
import { SimplePesoIcon } from '@/src/components/icons/peso-icon'
import { useUserProfile } from '@/src/hooks/use-user-profile'
import type { Selection } from '@react-types/shared'
import type { LoanType, PaymentFrequency } from '@/src/server/db/database'

type StatusFilter = 'all' | 'active' | 'inactive'

export default function LoanTypesPage() {
  const router = useRouter()
  const { userProfile } = useUserProfile()
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [page, setPage] = useState(0)
  const pageSize = 20

  // Modal states
  const { isOpen, onOpen, onOpenChange } = useDisclosure()
  const [isEditing, setIsEditing] = useState(false)
  const [editingId, setEditingId] = useState<string>('')

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    min_amount: 0,
    max_amount: 0,
    min_tenure_months: 1,
    max_tenure_months: 12,
    interest_rate: 0,
    payment_frequencies: [] as PaymentFrequency[],
  })

  const statusOptions = [
    { key: 'all', label: 'All Status' },
    { key: 'active', label: 'Active' },
    { key: 'inactive', label: 'Inactive' },
  ] as const

  const paymentFrequencyOptions = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'bi-monthly', label: 'Bi-Monthly' },
    { key: 'monthly', label: 'Monthly' },
  ] as const

  const { data, isLoading, refetch } = trpcProvider.loanTypes.list.useQuery({
    limit: pageSize,
    offset: page * pageSize,
    active_only: statusFilter === 'active',
  })

  const createMutation = trpcProvider.loanTypes.create.useMutation({
    onSuccess: () => {
      refetch()
      onOpenChange()
      resetForm()
    },
  })

  const updateMutation = trpcProvider.loanTypes.update.useMutation({
    onSuccess: () => {
      refetch()
      onOpenChange()
      resetForm()
    },
  })

  const deleteMutation = trpcProvider.loanTypes.delete.useMutation({
    onSuccess: () => {
      refetch()
    },
  })

  const loanTypes = data?.loanTypes || []
  const total = data?.total || 0

  // Check if user can create/edit loan types
  const canManage = userProfile?.role === 'admin' || userProfile?.role === 'tenant_admin'

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      min_amount: 0,
      max_amount: 0,
      min_tenure_months: 1,
      max_tenure_months: 12,
      interest_rate: 0,
      payment_frequencies: [],
    })
    setIsEditing(false)
    setEditingId('')
  }

  const handleCreate = () => {
    setIsEditing(false)
    resetForm()
    onOpen()
  }

  const handleEdit = (loanType: LoanType) => {
    setIsEditing(true)
    setEditingId(loanType.id)
    setFormData({
      name: loanType.name,
      description: loanType.description || '',
      min_amount: loanType.min_amount,
      max_amount: loanType.max_amount,
      min_tenure_months: loanType.min_tenure_months,
      max_tenure_months: loanType.max_tenure_months,
      interest_rate: loanType.interest_rate,
      payment_frequencies: loanType.payment_frequencies,
    })
    onOpen()
  }

  const handleSubmit = () => {
    if (isEditing) {
      updateMutation.mutate({
        id: editingId,
        ...formData,
      })
    } else {
      createMutation.mutate(formData)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this loan type? This action cannot be undone.')) {
      deleteMutation.mutate({ id })
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const handleFrequencyChange = (frequency: PaymentFrequency, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        payment_frequencies: [...prev.payment_frequencies, frequency]
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        payment_frequencies: prev.payment_frequencies.filter(f => f !== frequency)
      }))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Loan Types</h1>
          <p className="text-default-500 mt-1">Manage loan type templates with default values that can be overridden when creating loans</p>
        </div>
        {canManage && (
          <Button
            color="primary"
            onPress={handleCreate}
            startContent={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            New Loan Type
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Total Types</p>
                <p className="text-2xl font-bold mt-1">{total}</p>
              </div>
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
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
                  {loanTypes.filter((lt: any) => lt.is_active).length}
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
                  {loanTypes.filter((lt: any) => !lt.is_active).length}
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
      </div>

      {/* Filters */}
      <Card>
        <CardBody className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* @ts-ignore - HeroUI Select type definition issue */}
            <Select
              placeholder="Filter by status"
              selectedKeys={statusFilter ? [statusFilter] : []}
              onSelectionChange={(keys: Selection) => {
                const selected = Array.from(keys)[0] as StatusFilter | undefined
                setStatusFilter(selected || 'active')
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

      {/* Loan Types Table */}
      <Card>
        <CardBody className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner size="lg" />
            </div>
          ) : (
            <Table
              aria-label="Loan types table"
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
                <TableColumn>AMOUNT RANGE</TableColumn>
                <TableColumn>TENURE RANGE</TableColumn>
                <TableColumn>INTEREST RATE</TableColumn>
                <TableColumn>PAYMENT FREQUENCIES</TableColumn>
                <TableColumn>STATUS</TableColumn>
                <TableColumn>ACTIONS</TableColumn>
              </TableHeader>
              <TableBody emptyContent="No loan types found">
                {loanTypes.map((loanType: LoanType) => (
                  <TableRow key={loanType.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{loanType.name}</p>
                        {loanType.description && (
                          <p className="text-xs text-default-400 truncate max-w-[200px]">
                            {loanType.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <SimplePesoIcon className="w-4 h-4 text-default-400" />
                        <span className="text-sm">
                          {formatCurrency(loanType.min_amount)} - {formatCurrency(loanType.max_amount)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {loanType.min_tenure_months} - {loanType.max_tenure_months} months
                      </span>
                    </TableCell>
                    <TableCell>
                      <span>{loanType.interest_rate}%</span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {loanType.payment_frequencies.map((freq: string) => (
                          <Chip
                            key={freq}
                            size="sm"
                            variant="flat"
                            color="primary"
                          >
                            {freq.replace('-', ' ')}
                          </Chip>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Chip
                        color={loanType.is_active ? 'success' : 'default'}
                        variant="flat"
                        size="sm"
                      >
                        {loanType.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </Chip>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {canManage && (
                          <>
                            <Button
                              size="sm"
                              variant="light"
                              color="primary"
                              onPress={() => handleEdit(loanType)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="light"
                              color="danger"
                              onPress={() => handleDelete(loanType.id)}
                            >
                              Delete
                            </Button>
                          </>
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

      {/* Create/Edit Modal */}
      <Modal 
        isOpen={isOpen} 
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                {isEditing ? 'Edit Loan Type' : 'Create New Loan Type'}
              </ModalHeader>
              <ModalBody>
                <div className="space-y-4">
                  <Input
                    label="Name"
                    labelPlacement="outside-top"
                    placeholder="Enter loan type name"
                    value={formData.name}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, name: value }))}
                    size="lg"
                    isRequired
                  />

                  <Textarea
                    label="Description"
                    labelPlacement="outside-top"
                    placeholder="Enter loan type description (optional)"
                    value={formData.description}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, description: value }))}
                    size="lg"
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Suggested Min Amount"
                      labelPlacement="outside-top"
                      type="number"
                      placeholder="0"
                      value={formData.min_amount.toString()}
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, min_amount: Number(value) || 0 }))}
                      size="lg"
                      startContent={<SimplePesoIcon className="w-4 h-4 text-default-400" />}
                      isRequired
                    />

                    <Input
                      label="Suggested Max Amount"
                      labelPlacement="outside-top"
                      type="number"
                      placeholder="0"
                      value={formData.max_amount.toString()}
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, max_amount: Number(value) || 0 }))}
                      size="lg"
                      startContent={<SimplePesoIcon className="w-4 h-4 text-default-400" />}
                      isRequired
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Suggested Min Tenure (months)"
                      labelPlacement="outside-top"
                      type="number"
                      placeholder="1"
                      value={formData.min_tenure_months.toString()}
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, min_tenure_months: Number(value) || 1 }))}
                      size="lg"
                      isRequired
                    />

                    <Input
                      label="Suggested Max Tenure (months)"
                      labelPlacement="outside-top"
                      type="number"
                      placeholder="12"
                      value={formData.max_tenure_months.toString()}
                      onValueChange={(value: string) => setFormData(prev => ({ ...prev, max_tenure_months: Number(value) || 12 }))}
                      size="lg"
                      isRequired
                    />
                  </div>

                  <Input
                    label="Default Interest Rate (%)"
                    labelPlacement="outside-top"
                    type="number"
                    placeholder="0"
                    value={formData.interest_rate.toString()}
                    onValueChange={(value: string) => setFormData(prev => ({ ...prev, interest_rate: Number(value) || 0 }))}
                    size="lg"
                    isRequired
                  />

                  <div className="mt-6">
                    <p className="text-sm font-medium mb-4">Suggested Payment Frequencies</p>
                    <div className="space-y-3">
                      {paymentFrequencyOptions.map((option: { key: string, label: string }) => (
                        <Checkbox
                        className="ml-2"
                          key={option.key}
                          isSelected={formData.payment_frequencies.includes(option.key as PaymentFrequency)}
                          onValueChange={(checked: boolean) => handleFrequencyChange(option.key as PaymentFrequency, checked)}
                        >
                          {option.label}
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Cancel
                </Button>
                <Button 
                  color="primary" 
                  onPress={handleSubmit}
                  isLoading={createMutation.isPending || updateMutation.isPending}
                  isDisabled={
                    !formData.name || 
                    formData.min_amount >= formData.max_amount ||
                    formData.min_tenure_months >= formData.max_tenure_months ||
                    formData.payment_frequencies.length === 0
                  }
                >
                  {isEditing ? 'Update' : 'Create'}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}