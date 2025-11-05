'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Select,
  SelectItem,
  Textarea,
} from '@heroui/react'

export default function RecordPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const loanId = searchParams.get('loanId')
  const [selectedLoanId, setSelectedLoanId] = useState(loanId || '')
  const [amount, setAmount] = useState('')
  const [principal, setPrincipal] = useState('')
  const [interest, setInterest] = useState('')
  const [penalty, setPenalty] = useState('')

  const { data: loans } = trpc.loans.getAll.useQuery()
  const recordPaymentMutation = trpc.payments.create.useMutation()

  useEffect(() => {
    if (loanId) {
      setSelectedLoanId(loanId)
    }
  }, [loanId])

  // Auto-calculate allocation when amount changes
  useEffect(() => {
    const totalAmount = parseFloat(amount) || 0
    const penaltyAmount = parseFloat(penalty) || 0
    const remaining = totalAmount - penaltyAmount

    if (remaining > 0) {
      // Simple allocation: 50% to interest, 50% to principal
      const interestAmount = remaining * 0.5
      const principalAmount = remaining - interestAmount

      setInterest(interestAmount.toFixed(2))
      setPrincipal(principalAmount.toFixed(2))
    } else {
      setInterest('0')
      setPrincipal('0')
    }
  }, [amount, penalty])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      await recordPaymentMutation.mutateAsync({
        loan_id: selectedLoanId,
        amount: parseFloat(amount),
        payment_date: formData.get('payment_date') as string,
        type: (formData.get('type') as 'regular' | 'penalty' | 'partial') || 'regular',
        applied_to_principal: parseFloat(principal),
        applied_to_interest: parseFloat(interest),
        applied_to_penalty: parseFloat(penalty),
        notes: formData.get('notes') as string,
      })

      router.push('/payments')
    } catch (error) {
      console.error('Failed to record payment:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="light" onPress={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Record Payment</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold">Payment Details</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Loan"
              placeholder="Select loan"
              isRequired
              selectedKeys={selectedLoanId ? [selectedLoanId] : []}
              onChange={(e) => setSelectedLoanId(e.target.value)}
            >
              {(loans ?? [])
                .filter((loan) => loan.status === 'active' || loan.status === 'approved')
                .map((loan) => (
                  <SelectItem key={loan.id} value={loan.id}>
                    Loan #{loan.principal_amount} - Balance: {loan.current_balance}
                  </SelectItem>
                ))}
            </Select>

            <Input
              label="Payment Amount"
              type="number"
              step="0.01"
              min="0"
              required
              value={amount}
              onValueChange={setAmount}
              description="Total amount being paid"
            />

            <Input
              label="Payment Date"
              name="payment_date"
              type="date"
              required
              defaultValue={new Date().toISOString().split('T')[0]}
            />

            <Select
              label="Payment Type"
              name="type"
              placeholder="Select type"
              defaultSelectedKeys={['regular']}
              isRequired
            >
              <SelectItem key="regular" value="regular">
                Regular Payment
              </SelectItem>
              <SelectItem key="partial" value="partial">
                Partial Payment
              </SelectItem>
              <SelectItem key="penalty" value="penalty">
                Penalty Payment
              </SelectItem>
            </Select>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Payment Allocation</h3>

              <Input
                label="Applied to Penalties"
                type="number"
                step="0.01"
                min="0"
                value={penalty}
                onValueChange={setPenalty}
                description="Amount applied to penalties (paid first)"
              />

              <Input
                label="Applied to Interest"
                type="number"
                step="0.01"
                min="0"
                value={interest}
                onValueChange={setInterest}
                description="Amount applied to interest"
                className="mt-3"
              />

              <Input
                label="Applied to Principal"
                type="number"
                step="0.01"
                min="0"
                value={principal}
                onValueChange={setPrincipal}
                description="Amount applied to principal"
                className="mt-3"
              />

              <p className="text-sm text-gray-600 mt-3">
                Total Allocated: {(parseFloat(penalty) + parseFloat(interest) + parseFloat(principal) || 0).toFixed(2)}
              </p>
            </div>

            <Textarea
              label="Notes (Optional)"
              name="notes"
              placeholder="Add any notes about this payment"
              rows={3}
            />

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="light" onPress={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={recordPaymentMutation.isPending}
              >
                Record Payment
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
