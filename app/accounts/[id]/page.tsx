'use client'

import { use } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Spinner } from '@heroui/spinner'
import { Chip } from '@heroui/chip'
import { Divider } from '@heroui/divider'
import { Tabs, Tab } from '@heroui/tabs'
import { trpc as trpcProvider } from '@/lib/trpc/Provider'
import { formatCurrency } from '@/lib/utils/currency'
import { PesoIcon, SimplePesoIcon } from '@/components/icons/peso-icon'

interface AccountDetailPageProps {
  params: Promise<{ id: string }>
}

export default function AccountDetailPage({ params }: AccountDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  
  const { data: account, isLoading, error } = trpcProvider.accounts.getById.useQuery(
    { id },
    {
      staleTime: 30 * 1000, // Consider data fresh for 30 seconds
      refetchOnMount: true, // Refetch when component mounts to get latest data
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      retry: 1, // Only retry once if query fails
    }
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-default-500">Loading account details...</p>
        </div>
      </div>
    )
  }

  if (error || !account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardBody className="text-center p-8">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2">Account Not Found</h1>
            <p className="text-default-500 mb-6">
              The account you're looking for doesn't exist or you don't have permission to view it.
            </p>
          </CardBody>
        </Card>
      </div>
    )
  }


  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">{account.name}</h1>
            <p className="text-default-500 mt-1">Account Details</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Chip
            color={
              account.status === 'active'
                ? 'success'
                : account.status === 'suspended'
                ? 'danger'
                : 'default'
            }
            variant="flat"
          >
            {account.status.toUpperCase()}
          </Chip>
          <Button
            color="primary"
            variant="bordered"
            onPress={() => router.replace(`/accounts/${id}/edit`)}
            startContent={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
          >
            Edit Account
          </Button>
        </div>
      </div>

      {/* Account Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-default-500">Total Loans</p>
                <p className="text-2xl font-bold mt-1">{account.loans?.length || 0}</p>
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
                <p className="text-sm text-default-500">Active Loans</p>
                <p className="text-2xl font-bold mt-1">
                  {account.loans?.filter((loan: any) => loan.status === 'active').length || 0}
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
                <p className="text-sm text-default-500">Monthly Income</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(account.monthly_income)}</p>
              </div>
              <div className="w-10 h-10 bg-warning/10 rounded-lg flex items-center justify-center">
                <SimplePesoIcon className="w-5 h-5 text-warning" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Detailed Information */}
      <Card>
        <CardBody className="p-6">
          <Tabs>
            <Tab key="basic" title="Basic Information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-default-500">Email</label>
                        <p className="font-medium">{account.email || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Phone</label>
                        <p className="font-medium">{account.phone_number || account.contact_number || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Contact Info</label>
                        <p className="font-medium">{account.contact_info || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Address</label>
                        <p className="font-medium">{account.address || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-default-500">Date of Birth</label>
                        <p className="font-medium">{formatDate(account.date_of_birth)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">SSN/Tax ID</label>
                        <p className="font-medium">{account.ssn_tax_id ? '***-**-' + account.ssn_tax_id.slice(-4) : '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Government ID Type</label>
                        <p className="font-medium">{account.government_id_type?.replace('_', ' ').toUpperCase() || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Government ID Number</label>
                        <p className="font-medium">{account.government_id_number ? '****' + account.government_id_number.slice(-4) : '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab>

            <Tab key="employment" title="Employment">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Employment Details</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-default-500">Employer Name</label>
                        <p className="font-medium">{account.employer_name || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Job Title</label>
                        <p className="font-medium">{account.job_title || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Employer Phone</label>
                        <p className="font-medium">{account.employer_phone || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Employment Length</label>
                        <p className="font-medium">
                          {account.employment_length_months ? `${account.employment_length_months} months` : '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Income Information</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-sm text-default-500">Annual Income</label>
                        <p className="font-medium">{formatCurrency(account.annual_income)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Monthly Income</label>
                        <p className="font-medium">{formatCurrency(account.monthly_income)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Monthly Expenses</label>
                        <p className="font-medium">{formatCurrency(account.monthly_expenses)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-default-500">Monthly Debt Obligations</label>
                        <p className="font-medium">{formatCurrency(account.monthly_debt_obligations)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Tab>

            <Tab key="financial" title="Financial">
              <div className="space-y-6 mt-4">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Financial Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border border-default-200">
                      <CardBody className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-default-500">Debt-to-Income Ratio</p>
                          <p className="text-2xl font-bold mt-1">
                            {account.debt_to_income_ratio ? `${(account.debt_to_income_ratio * 100).toFixed(1)}%` : '-'}
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                    <Card className="border border-default-200">
                      <CardBody className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-default-500">Annual Income</p>
                          <p className="text-2xl font-bold mt-1">{formatCurrency(account.annual_income)}</p>
                        </div>
                      </CardBody>
                    </Card>
                    <Card className="border border-default-200">
                      <CardBody className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-default-500">Total Loans</p>
                          <p className="text-2xl font-bold mt-1">{account.loans?.length || 0}</p>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                </div>

                {(account.existing_loans_details || account.credit_accounts_details) && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Additional Financial Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {account.existing_loans_details && (
                        <div>
                          <label className="text-sm text-default-500">Existing Loans Details</label>
                          <Card className="mt-2">
                            <CardBody className="p-4">
                              <p className="text-sm">{account.existing_loans_details}</p>
                            </CardBody>
                          </Card>
                        </div>
                      )}
                      {account.credit_accounts_details && (
                        <div>
                          <label className="text-sm text-default-500">Credit Accounts Details</label>
                          <Card className="mt-2">
                            <CardBody className="p-4">
                              <p className="text-sm">{account.credit_accounts_details}</p>
                            </CardBody>
                          </Card>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Tab>

            <Tab key="loans" title="Loans">
              <div className="mt-4">
                {account.loans && account.loans.length > 0 ? (
                  <div className="space-y-4">
                    {account.loans.map((loan: any) => (
                      <Card key={loan.id} className="border border-default-200">
                        <CardBody className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                <SimplePesoIcon className="w-5 h-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold">Loan #{loan.id.slice(0, 8)}</p>
                                <p className="text-sm text-default-500">
                                  Created {formatDate(loan.created_at)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-semibold">{formatCurrency(loan.amount)}</p>
                                <p className="text-sm text-default-500">{loan.term} months</p>
                              </div>
                              <Chip
                                color={
                                  loan.status === 'active'
                                    ? 'success'
                                    : loan.status === 'approved'
                                    ? 'primary'
                                    : loan.status === 'pending_approval'
                                    ? 'warning'
                                    : 'danger'
                                }
                                variant="flat"
                                size="sm"
                              >
                                {loan.status.replace('_', ' ').toUpperCase()}
                              </Chip>
                              <Button
                                size="sm"
                                variant="light"
                                onPress={() => router.replace(`/loans/${loan.id}`)}
                              >
                                View
                              </Button>
                            </div>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-default-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <SimplePesoIcon className="w-8 h-8 text-default-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Loans Yet</h3>
                    <p className="text-default-500 mb-4">This account doesn't have any loans yet.</p>
                    <Button
                      color="primary"
                      onPress={() => router.replace(`/loans/new?account_id=${account.id}`)}
                    >
                      Create First Loan
                    </Button>
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </CardBody>
      </Card>

      {/* Account Metadata */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Account Metadata</h3>
        </CardHeader>
        <Divider />
        <CardBody className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm text-default-500">Created</label>
              <p className="font-medium">{formatDate(account.created_at)}</p>
            </div>
            <div>
              <label className="text-sm text-default-500">Last Updated</label>
              <p className="font-medium">{formatDate(account.updated_at)}</p>
            </div>
            <div>
              <label className="text-sm text-default-500">Account ID</label>
              <p className="font-medium font-mono text-sm">{account.id}</p>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}