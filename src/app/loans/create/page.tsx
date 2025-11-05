'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card, CardBody, CardHeader, Input, Button, Select, SelectItem } from '@heroui/react'

export default function CreateLoanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accountId = searchParams.get('accountId')
  const [selectedAccountId, setSelectedAccountId] = useState(accountId || '')

  const { data: accounts } = trpc.accounts.getAll.useQuery()
  const createLoanMutation = trpc.loans.create.useMutation()

  useEffect(() => {
    if (accountId) {
      setSelectedAccountId(accountId)
    }
  }, [accountId])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      await createLoanMutation.mutateAsync({
        account_id: selectedAccountId,
        principal_amount: parseFloat(formData.get('principal_amount') as string),
        interest_rate: parseFloat(formData.get('interest_rate') as string),
        tenure_months: parseInt(formData.get('tenure_months') as string),
        payment_frequency: formData.get('payment_frequency') as 'bi-monthly' | 'monthly' | 'weekly',
        start_date: formData.get('start_date') as string,
      })

      router.push('/loans')
    } catch (error) {
      console.error('Failed to create loan:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="light" onPress={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Create Loan</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold">Loan Details</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Account"
              placeholder="Select account"
              isRequired
              selectedKeys={selectedAccountId ? [selectedAccountId] : []}
              onChange={(e) => setSelectedAccountId(e.target.value)}
            >
              {(accounts ?? []).map((account) => (
                <SelectItem key={account.id} value={account.id}>
                  {account.name}
                </SelectItem>
              ))}
            </Select>

            <Input
              label="Principal Amount"
              name="principal_amount"
              type="number"
              step="0.01"
              min="0"
              required
            />

            <Input
              label="Interest Rate (%)"
              name="interest_rate"
              type="number"
              step="0.01"
              min="0"
              max="100"
              required
            />

            <Input
              label="Tenure (months)"
              name="tenure_months"
              type="number"
              min="1"
              required
            />

            <Select
              label="Payment Frequency"
              name="payment_frequency"
              placeholder="Select frequency"
              isRequired
            >
              <SelectItem key="bi-monthly" value="bi-monthly">
                Bi-Monthly (Every 15 days)
              </SelectItem>
              <SelectItem key="monthly" value="monthly">
                Monthly
              </SelectItem>
              <SelectItem key="weekly" value="weekly">
                Weekly
              </SelectItem>
            </Select>

            <Input
              label="Start Date"
              name="start_date"
              type="date"
              required
            />

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="light" onPress={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={createLoanMutation.isPending}
              >
                Create Loan
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
