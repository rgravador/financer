'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
} from '@heroui/react'
import { formatCurrency } from '@/utils/formatters'

export default function CreateCashoutPage() {
  const router = useRouter()
  const [amount, setAmount] = useState('')
  const { data: earnings } = trpc.earnings.getMy.useQuery()
  const createCashoutMutation = trpc.cashouts.create.useMutation()

  const collectibleAmount = (earnings?.total_earnings || 0) - (earnings?.cashed_out_amount || 0)
  const minAmount = 10

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const requestAmount = parseFloat(amount)

    if (requestAmount < minAmount) {
      alert(`Minimum cashout amount is ${formatCurrency(minAmount)}`)
      return
    }

    if (requestAmount > collectibleAmount) {
      alert(`Amount exceeds available balance of ${formatCurrency(collectibleAmount)}`)
      return
    }

    try {
      await createCashoutMutation.mutateAsync({
        amount: requestAmount,
      })

      router.push('/cashouts')
    } catch (error) {
      console.error('Failed to create cashout request:', error)
      alert('Failed to create cashout request. Please try again.')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="light" onPress={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Request Cashout</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 max-w-2xl">
        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Available Balance</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(collectibleAmount)}
            </p>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <p className="text-sm text-gray-600">Minimum Amount</p>
          </CardHeader>
          <CardBody>
            <p className="text-3xl font-bold">
              {formatCurrency(minAmount)}
            </p>
          </CardBody>
        </Card>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold">Cashout Details</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Cashout Amount"
              type="number"
              step="0.01"
              min={minAmount}
              max={collectibleAmount}
              required
              value={amount}
              onValueChange={setAmount}
              description={`Enter amount between ${formatCurrency(minAmount)} and ${formatCurrency(collectibleAmount)}`}
              variant="bordered"
              labelPlacement="outside"
              startContent={
                <div className="pointer-events-none flex items-center">
                  <span className="text-default-400 text-small">₱</span>
                </div>
              }
            />

            <Card className="bg-blue-50">
              <CardBody>
                <h3 className="font-semibold mb-2">📋 Important Notes</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
                  <li>Cashout requests are reviewed by administrators</li>
                  <li>Processing typically takes 1-3 business days</li>
                  <li>You'll be notified once your request is processed</li>
                  <li>Approved amounts will be transferred to your registered account</li>
                  <li>You cannot request a new cashout while one is pending</li>
                </ul>
              </CardBody>
            </Card>

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="light" onPress={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={createCashoutMutation.isPending}
                isDisabled={!amount || parseFloat(amount) < minAmount || parseFloat(amount) > collectibleAmount}
              >
                Submit Request
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
