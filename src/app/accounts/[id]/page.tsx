'use client'

import { use } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, Button, Chip, Divider } from '@heroui/react'
import { formatDate, formatCurrency } from '@/utils/formatters'
import Link from 'next/link'

export default function AccountDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data: account, isLoading } = trpc.accounts.getById.useQuery({ id })

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!account) {
    return <div>Account not found</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="light" onPress={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">{account.name}</h1>
        <Chip
          color={
            account.status === 'active'
              ? 'success'
              : account.status === 'suspended'
              ? 'danger'
              : 'default'
          }
        >
          {account.status}
        </Chip>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Personal Information</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Full Name</p>
              <p className="font-medium">{account.name}</p>
            </div>
            {account.date_of_birth && (
              <div>
                <p className="text-sm text-gray-600">Date of Birth</p>
                <p className="font-medium">{formatDate(account.date_of_birth)}</p>
              </div>
            )}
            {account.contact_info && (
              <div>
                <p className="text-sm text-gray-600">Contact Info</p>
                <p className="font-medium">{account.contact_info}</p>
              </div>
            )}
            {account.address && (
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-medium">{account.address}</p>
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Identification</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {account.government_id_type && (
              <div>
                <p className="text-sm text-gray-600">Government ID Type</p>
                <p className="font-medium">{account.government_id_type}</p>
              </div>
            )}
            {account.government_id_number && (
              <div>
                <p className="text-sm text-gray-600">Government ID Number</p>
                <p className="font-medium">{account.government_id_number}</p>
              </div>
            )}
            {account.ssn_tax_id && (
              <div>
                <p className="text-sm text-gray-600">SSN / Tax ID</p>
                <p className="font-medium">{account.ssn_tax_id}</p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Loans</h2>
          <Link href={`/loans/create?accountId=${account.id}`}>
            <Button color="primary" size="sm">
              Create Loan
            </Button>
          </Link>
        </CardHeader>
        <Divider />
        <CardBody>
          {account.loans && account.loans.length > 0 ? (
            <div className="space-y-3">
              {account.loans.map((loan) => (
                <Link key={loan.id} href={`/loans/${loan.id}`}>
                  <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">
                          {formatCurrency(loan.principal_amount)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {loan.tenure_months} months @ {loan.interest_rate}%
                        </p>
                      </div>
                      <Chip
                        size="sm"
                        color={
                          loan.status === 'active'
                            ? 'success'
                            : loan.status === 'pending_approval'
                            ? 'warning'
                            : 'default'
                        }
                      >
                        {loan.status.replace('_', ' ')}
                      </Chip>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No loans yet</p>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
