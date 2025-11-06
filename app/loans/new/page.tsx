'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import { Textarea } from '@heroui/input'
import { Divider } from '@heroui/divider'
import { Spinner } from '@heroui/spinner'
import { trpc as trpcProvider } from '@/lib/trpc/Provider'
import { PESO_SYMBOL } from '@/lib/utils/currency'
import { formatCurrency } from '@/lib/utils/currency'
import type { Selection } from '@react-types/shared'

export default function NewLoanPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const accountId = searchParams?.get('account_id')
  const isAccountPreSelected = !!accountId // Check if account is pre-selected from URL
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selectedAccountId, setSelectedAccountId] = useState(accountId || '')
  const [selectedLoanTypeId, setSelectedLoanTypeId] = useState('')
  const [principalAmount, setPrincipalAmount] = useState('')
  const [interestRate, setInterestRate] = useState('')
  const [tenureMonths, setTenureMonths] = useState('')
  const [paymentFrequency, setPaymentFrequency] = useState<string>('')
  const [firstPaymentDate, setFirstPaymentDate] = useState(() => {
    const defaultDate = new Date()
    defaultDate.setDate(defaultDate.getDate() + 30) // Default to 30 days from today
    return defaultDate.toISOString().split('T')[0]
  })
  const [selectedCoBorrowerId, setSelectedCoBorrowerId] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [previewSchedule, setPreviewSchedule] = useState<any[]>([])
  const [showReview, setShowReview] = useState(false)

  const utils = trpcProvider.useUtils()

  // Get accounts for dropdown
  const { data: accountsData } = trpcProvider.accounts.list.useQuery(
    { limit: 100, status: 'active' },
    { staleTime: 30 * 1000 }
  )

  // Get loan types for dropdown
  const { data: loanTypesData } = trpcProvider.loanTypes.list.useQuery(
    { limit: 100, active_only: true },
    { staleTime: 30 * 1000 }
  )

  // Get selected account details
  const { data: selectedAccount } = trpcProvider.accounts.getById.useQuery(
    { id: selectedAccountId },
    { 
      enabled: !!selectedAccountId,
      staleTime: 30 * 1000 
    }
  )

  // Get selected co-borrower details
  const { data: selectedCoBorrower } = trpcProvider.accounts.getById.useQuery(
    { id: selectedCoBorrowerId },
    { 
      enabled: !!selectedCoBorrowerId,
      staleTime: 30 * 1000 
    }
  )

  // Get loan type defaults when a loan type is selected
  const { data: loanTypeDefaults } = trpcProvider.loans.getLoanTypeDefaults.useQuery(
    { loan_type_id: selectedLoanTypeId },
    { 
      enabled: !!selectedLoanTypeId,
      staleTime: 30 * 1000 
    }
  )

  // Load default values when loan type is selected
  useEffect(() => {
    if (loanTypeDefaults) {
      // Set suggested defaults (user can still override)
      setPrincipalAmount(loanTypeDefaults.suggested_min_amount.toString())
      setInterestRate(loanTypeDefaults.suggested_interest_rate.toString())
      setTenureMonths(loanTypeDefaults.suggested_min_tenure.toString())
      
      // Set payment frequency to first available option if current selection is not available
      if (loanTypeDefaults.available_payment_frequencies.length > 0) {
        const currentFreqAvailable = loanTypeDefaults.available_payment_frequencies.includes(paymentFrequency as any)
        if (!currentFreqAvailable) {
          setPaymentFrequency(loanTypeDefaults.available_payment_frequencies[0])
        }
      }
    }
  }, [loanTypeDefaults])

  const createMutation = trpcProvider.loans.create.useMutation({
    onSuccess: (createdLoan) => {
      // Update cache with fresh data before redirect (optimistic update)
      utils.loans.getById.setData({ id: createdLoan.id }, createdLoan)
      router.replace(`/loans/${createdLoan.id}`)
    },
    onError: (error) => {
      setErrors({ general: error.message })
    },
  })

  const saveDraftMutation = trpcProvider.loans.create.useMutation({
    onSuccess: (draftLoan) => {
      // Update cache with fresh data before redirect (optimistic update)
      utils.loans.getById.setData({ id: draftLoan.id }, draftLoan)
      router.replace(`/loans/${draftLoan.id}`)
    },
    onError: (error) => {
      setErrors({ general: error.message })
    },
  })

  // Dynamic payment frequency options based on loan type selection
  const getPaymentFrequencyOptions = () => {
    const baseOptions = [{ key: '', label: 'Select Payment Frequency' }]
    
    if (loanTypeDefaults?.available_payment_frequencies) {
      const availableOptions = loanTypeDefaults.available_payment_frequencies.map(freq => {
        switch (freq) {
          case 'weekly':
            return { key: 'weekly', label: 'Weekly' }
          case 'bi-monthly':
            return { key: 'bi-monthly', label: 'Bi-Monthly (Every 2 weeks)' }
          case 'monthly':
            return { key: 'monthly', label: 'Monthly' }
          default:
            return { key: freq, label: freq }
        }
      })
      return [...baseOptions, ...availableOptions]
    }
    
    // Default options when no loan type is selected
    return [
      ...baseOptions,
      { key: 'weekly', label: 'Weekly' },
      { key: 'bi-monthly', label: 'Bi-Monthly (Every 2 weeks)' },
      { key: 'monthly', label: 'Monthly' },
    ]
  }

  const paymentFrequencyOptions = getPaymentFrequencyOptions()

  // Helper functions for bi-monthly calculation (client-side)
  const getBiMonthlyPaymentDates = (startDate: Date) => {
    const startDay = startDate.getDate()
    
    if (startDay <= 7) {
      return [5, 20] // 5th and 20th pattern
    } else if (startDay <= 17) {
      return [15, 30] // 15th and 30th pattern (most common)
    } else {
      return [10, 25] // 10th and 25th pattern
    }
  }

  const getNextBiMonthlyDate = (currentDate: Date, paymentDates: number[], isFirst: boolean = false) => {
    const [firstDate, secondDate] = paymentDates
    const currentDay = currentDate.getDate()
    
    let targetDate = new Date(currentDate)
    
    if (isFirst) {
      // For the first payment, find the next payment date
      if (currentDay < firstDate) {
        targetDate.setDate(firstDate)
      } else if (currentDay < secondDate) {
        targetDate.setDate(secondDate)
      } else {
        // Move to next month's first date
        targetDate.setMonth(targetDate.getMonth() + 1)
        targetDate.setDate(firstDate)
      }
    } else {
      // For subsequent payments, alternate between the two dates
      if (currentDay <= firstDate) {
        targetDate.setDate(secondDate)
      } else {
        // Move to next month's first date
        targetDate.setMonth(targetDate.getMonth() + 1)
        targetDate.setDate(firstDate)
      }
    }
    
    // Handle month-end edge cases (e.g., setting 30th in February)
    const lastDayOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate()
    if (targetDate.getDate() > lastDayOfMonth) {
      targetDate.setDate(lastDayOfMonth)
    }
    
    return targetDate
  }

  const calculatePreview = () => {
    if (!principalAmount || !interestRate || !tenureMonths || !paymentFrequency || !firstPaymentDate) {
      setErrors({ preview: 'Please fill all required fields to preview' })
      return
    }

    const principal = parseFloat(principalAmount)
    const rate = parseFloat(interestRate)
    const tenure = parseInt(tenureMonths)

    if (principal <= 0 || rate < 0 || tenure <= 0) {
      setErrors({ preview: 'Please enter valid positive numbers' })
      return
    }

    // Generate preview schedule with proper date calculation
    // MEMORY: Monthly payments should always occur on the same day of the month as the start date
    // MEMORY: Bi-monthly payments should follow common payroll schedules (15th & 30th, 10th & 25th, 5th & 20th)
    const schedule = []
    const annualRate = rate / 100
    let paymentsPerYear: number

    switch (paymentFrequency) {
      case 'weekly':
        paymentsPerYear = 52
        break
      case 'bi-monthly':
        paymentsPerYear = 24
        break
      case 'monthly':
      default:
        paymentsPerYear = 12
        break
    }

    const periodicRate = annualRate / paymentsPerYear
    const totalPayments = Math.ceil((tenure / 12) * paymentsPerYear)
    const payment = principal * (periodicRate * Math.pow(1 + periodicRate, totalPayments)) /
                    (Math.pow(1 + periodicRate, totalPayments) - 1)

    let remainingBalance = principal
    const firstPayment = new Date(firstPaymentDate)
    
    // For bi-monthly, determine the payment pattern based on first payment date
    const biMonthlyDates = paymentFrequency === 'bi-monthly' ? getBiMonthlyPaymentDates(firstPayment) : null
    let currentDate = new Date(firstPayment)

    // Show first 5 payments as preview
    for (let i = 1; i <= Math.min(5, totalPayments); i++) {
      const interestDue = remainingBalance * periodicRate
      const principalDue = payment - interestDue
      remainingBalance = Math.max(0, remainingBalance - principalDue)

      let dueDate: Date

      if (i === 1) {
        // First payment uses the exact date provided
        dueDate = new Date(firstPayment)
      } else {
        // Calculate subsequent payment dates based on frequency
        if (paymentFrequency === 'monthly') {
          // For monthly payments: Add one month to previous payment, keeping same day
          dueDate = new Date(currentDate)
          dueDate.setMonth(dueDate.getMonth() + 1)
          
          // Handle month-end edge cases (e.g., Jan 31 -> Feb 28/29)
          const originalDay = firstPayment.getDate()
          const lastDayOfMonth = new Date(dueDate.getFullYear(), dueDate.getMonth() + 1, 0).getDate()
          dueDate.setDate(Math.min(originalDay, lastDayOfMonth))
        } else if (paymentFrequency === 'bi-monthly') {
          // For bi-monthly: Follow payroll schedule patterns, alternating between two dates
          dueDate = getNextBiMonthlyDate(currentDate, biMonthlyDates!, false)
        } else {
          // For weekly: Add 7 days to previous payment
          dueDate = new Date(currentDate)
          dueDate.setDate(dueDate.getDate() + 7)
        }
      }

      // Update current date for next iteration
      currentDate = new Date(dueDate)

      schedule.push({
        payment_number: i,
        due_date: dueDate.toLocaleDateString(),
        principal_due: Math.round(principalDue * 100) / 100,
        interest_due: Math.round(interestDue * 100) / 100,
        total_due: Math.round(payment * 100) / 100,
        remaining_balance: Math.round(remainingBalance * 100) / 100,
      })
    }

    setPreviewSchedule(schedule)
    setShowPreview(true)
    setErrors({})
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!selectedAccountId) {
      newErrors.account = 'Please select an account'
    }

    if (!principalAmount || !interestRate || !tenureMonths || !paymentFrequency) {
      newErrors.general = 'Please fill all required fields'
    }

    const principal = parseFloat(principalAmount)
    const rate = parseFloat(interestRate)
    const tenure = parseInt(tenureMonths)

    if (principalAmount && (isNaN(principal) || principal <= 0)) {
      newErrors.principalAmount = 'Principal amount must be greater than 0'
    }

    if (interestRate && (isNaN(rate) || rate < 0 || rate > 100)) {
      newErrors.interestRate = 'Interest rate must be between 0 and 100'
    }

    if (tenureMonths && (isNaN(tenure) || tenure <= 0 || tenure > 360)) {
      newErrors.tenureMonths = 'Tenure must be between 1 and 360 months'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleReviewApplication = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      setShowReview(true)
    }
  }

  const handleSubmitLoan = async () => {
    setErrors({})

    const principal = parseFloat(principalAmount)
    const rate = parseFloat(interestRate)
    const tenure = parseInt(tenureMonths)

    try {
      await createMutation.mutateAsync({
        account_id: selectedAccountId,
        loan_type_id: selectedLoanTypeId || undefined,
        principal_amount: principal,
        interest_rate: rate,
        tenure_months: tenure,
        payment_frequency: paymentFrequency as 'weekly' | 'bi-monthly' | 'monthly',
        first_payment_date: firstPaymentDate,
        co_borrower_id: selectedCoBorrowerId || undefined,
        is_draft: false,
      })
    } catch (error) {
      // Error handled by onError
    }
  }

  const handleBackToForm = () => {
    setShowReview(false)
  }

  const handleSaveAsDraft = async () => {
    setErrors({})

    const principal = parseFloat(principalAmount)
    const rate = parseFloat(interestRate)
    const tenure = parseInt(tenureMonths)

    try {
      await saveDraftMutation.mutateAsync({
        account_id: selectedAccountId,
        loan_type_id: selectedLoanTypeId || undefined,
        principal_amount: principal,
        interest_rate: rate,
        tenure_months: tenure,
        payment_frequency: paymentFrequency as 'weekly' | 'bi-monthly' | 'monthly',
        first_payment_date: firstPaymentDate,
        co_borrower_id: selectedCoBorrowerId || undefined,
        is_draft: true,
      })
    } catch (error) {
      // Error handled by onError
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Create New Loan</h1>
            <p className="text-default-500 mt-1">Create a new loan application</p>
          </div>
        </div>
      </div>

      {/* Conditional Rendering: Form or Review */}
      {!showReview ? (
        /* Application Form */
        <form onSubmit={handleReviewApplication}>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Loan Details</h2>
          </CardHeader>
          <Divider />
          <CardBody className="p-6 space-y-6">
            {errors.general && (
              <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg px-4 py-3 text-sm">
                {errors.general}
              </div>
            )}

            {/* Account Selection */}
            <div className="space-y-4">
              {/* Only show account select if not pre-selected */}
              {!isAccountPreSelected && (
                <>
                  {/* @ts-ignore - HeroUI Select type definition issue */}
                  <Select
                    label="Account"
                    placeholder="Select an account"
                    selectedKeys={selectedAccountId ? [selectedAccountId] : []}
                    onSelectionChange={(keys: Selection) => setSelectedAccountId(Array.from(keys)[0] as string || '')}
                    variant="bordered"
                    size="lg"
                    labelPlacement="outside"
                    isRequired
                    isInvalid={!!errors.account}
                    errorMessage={errors.account}
                    items={accountsData?.accounts || []}
                    className="w-full"
                  >
                    {(account: any) => (
                      <SelectItem key={account.id} textValue={account.name}>
                        <div className="flex flex-row py-1 gap-3">
                          <span className="font-medium text-default-900">{account.name}</span>
                          <div className="flex flex-col sm:flex-row sm:gap-4 text-xs text-default-500">
                            {account.phone_number && (
                              <span className="flex items-center gap-1">
                                📞 {account.phone_number}
                              </span>
                            )}
                            {account.email && (
                              <span className="flex items-center gap-1">
                                ✉️ {account.email}
                              </span>
                            )}
                          </div>
                        </div>
                      </SelectItem>
                    )}
                  </Select>
                </>
              )}

              {/* Account Information Block - Show when account is selected */}
              {selectedAccountId && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-default-700 mb-2">
                    {isAccountPreSelected ? "Customer Information" : "Account Information"}
                  </label>
                  {selectedAccount ? (
                    <div className="bg-default-50 rounded-lg p-4 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p><span className="font-medium text-default-600">Name:</span></p>
                          <p className="text-default-900">{selectedAccount.name}</p>
                        </div>
                        <div>
                          <p><span className="font-medium text-default-600">Email:</span></p>
                          <p className="text-default-900">{selectedAccount.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p><span className="font-medium text-default-600">Monthly Income:</span></p>
                          <p className="text-default-900">{formatCurrency(selectedAccount.monthly_income)}</p>
                        </div>
                        <div>
                          <p><span className="font-medium text-default-600">Status:</span></p>
                          <p className="text-default-900">{selectedAccount.status.toUpperCase()}</p>
                        </div>
                      </div>
                      {selectedAccount.phone_number && (
                        <div className="mt-3 pt-3 border-t border-default-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p><span className="font-medium text-default-600">Phone:</span></p>
                              <p className="text-default-900">{selectedAccount.phone_number}</p>
                            </div>
                            {selectedAccount.current_address && (
                              <div>
                                <p><span className="font-medium text-default-600">Address:</span></p>
                                <p className="text-default-900 text-sm">{selectedAccount.current_address}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-default-50 rounded-lg p-4 text-sm text-default-500 text-center">
                      <Spinner size="sm" className="mr-2" />
                      Loading customer details...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Loan Type Selection */}
            <div className="space-y-4">
              {/* @ts-ignore - HeroUI Select type definition issue */}
              <Select
                label="Loan Type (Optional)"
                placeholder="Select a loan type template"
                selectedKeys={selectedLoanTypeId ? [selectedLoanTypeId] : []}
                onSelectionChange={(keys: Selection) => setSelectedLoanTypeId(Array.from(keys)[0] as string || '')}
                variant="bordered"
                size="lg"
                labelPlacement="outside"
                items={loanTypesData?.loanTypes?.map(loanType => ({
                  key: loanType.id,
                  label: loanType.name
                })) || []}
                className="w-full"
                description="Choose a loan type to auto-fill default values. You can override any values as needed."
              >
                {(item: any) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>

              {/* Loan Type Information */}
              {loanTypeDefaults && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm">
                  <h4 className="font-medium text-primary-800 mb-2">
                    {loanTypeDefaults.loan_type_name} - Default Values Loaded
                  </h4>
                  {loanTypeDefaults.loan_type_description && (
                    <p className="text-primary-700 mb-3">{loanTypeDefaults.loan_type_description}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-primary-700">
                    <div>
                      <span className="font-medium">Amount Range:</span>
                      <p>{formatCurrency(loanTypeDefaults.suggested_min_amount)} - {formatCurrency(loanTypeDefaults.suggested_max_amount)}</p>
                    </div>
                    <div>
                      <span className="font-medium">Tenure Range:</span>
                      <p>{loanTypeDefaults.suggested_min_tenure} - {loanTypeDefaults.suggested_max_tenure} months</p>
                    </div>
                    <div>
                      <span className="font-medium">Interest Rate:</span>
                      <p>{loanTypeDefaults.suggested_interest_rate}%</p>
                    </div>
                    <div>
                      <span className="font-medium">Payment Options:</span>
                      <p>{loanTypeDefaults.available_payment_frequencies.join(', ')}</p>
                    </div>
                  </div>
                  <p className="text-xs text-primary-600 mt-3">
                    💡 Default values have been applied to the form below. You can modify any values as needed.
                  </p>
                </div>
              )}
            </div>

            {/* Loan Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                type="number"
                label="Principal Amount"
                placeholder="Enter loan amount"
                value={principalAmount}
                onValueChange={setPrincipalAmount}
                isRequired
                variant="bordered"
                size="lg"
                labelPlacement="outside"
                min="0"
                step="0.01"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">{PESO_SYMBOL}</span>
                  </div>
                }
                isInvalid={!!errors.principalAmount}
                errorMessage={errors.principalAmount}
              />

              <Input
                type="number"
                label="Interest Rate (%)"
                placeholder="Enter annual interest rate"
                value={interestRate}
                onValueChange={setInterestRate}
                isRequired
                variant="bordered"
                size="lg"
                labelPlacement="outside"
                min="0"
                max="100"
                step="0.01"
                endContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">%</span>
                  </div>
                }
                isInvalid={!!errors.interestRate}
                errorMessage={errors.interestRate}
              />

              <Input
                type="number"
                label="Tenure (Months)"
                placeholder="Enter loan tenure in months"
                value={tenureMonths}
                onValueChange={setTenureMonths}
                isRequired
                variant="bordered"
                size="lg"
                labelPlacement="outside"
                min="1"
                max="360"
                isInvalid={!!errors.tenureMonths}
                errorMessage={errors.tenureMonths}
              />

              {/* @ts-ignore - HeroUI Select type definition issue */}
              <Select
                label="Payment Frequency"
                placeholder="Select payment frequency"
                selectedKeys={paymentFrequency ? [paymentFrequency] : []}
                onSelectionChange={(keys: Selection) => setPaymentFrequency(Array.from(keys)[0] as string || '')}
                variant="bordered"
                size="lg"
                labelPlacement="outside"
                isRequired
                items={paymentFrequencyOptions}
              >
                {(item: typeof paymentFrequencyOptions[number]) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>

              <Input
                type="date"
                label="First Payment Date"
                value={firstPaymentDate}
                onValueChange={setFirstPaymentDate}
                variant="bordered"
                size="lg"
                labelPlacement="outside"
                isRequired
                description="The date when the first payment is due"
              />
            </div>

            {/* Co-Borrower Selection */}
            <div className="space-y-4">
              {/* @ts-ignore - HeroUI Select type definition issue */}
              <Select
                label="Co-Borrower (Optional)"
                placeholder="Select a co-borrower"
                selectedKeys={selectedCoBorrowerId ? [selectedCoBorrowerId] : []}
                onSelectionChange={(keys: Selection) => setSelectedCoBorrowerId(Array.from(keys)[0] as string || '')}
                variant="bordered"
                size="lg"
                isClearable={true}
                labelPlacement="outside"
                items={accountsData?.accounts?.filter(account => account.id !== selectedAccountId) || []}
                className="w-full"
                description="Optional: Select a co-borrower to strengthen the loan application"
              >
                {(account: any) => (
                  <SelectItem key={account.id} textValue={account.name}>
                    <div className="flex flex-row py-1 gap-3">
                      <span className="font-medium text-default-900">{account.name}</span>
                      <div className="flex flex-col sm:flex-row sm:gap-4 text-xs text-default-500">
                        {account.phone_number && (
                          <span className="flex items-center gap-1">
                            📞 {account.phone_number}
                          </span>
                        )}
                        {account.email && (
                          <span className="flex items-center gap-1">
                            ✉️ {account.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                )}
              </Select>

              {/* Co-Borrower Information Block */}
              {selectedCoBorrowerId && (
                <div className="flex flex-col">
                  <label className="text-sm font-medium text-default-700 mb-2">
                    Co-Borrower Information
                  </label>
                  {selectedCoBorrower ? (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p><span className="font-medium text-primary-600">Name:</span></p>
                          <p className="text-primary-900">{selectedCoBorrower.name}</p>
                        </div>
                        <div>
                          <p><span className="font-medium text-primary-600">Email:</span></p>
                          <p className="text-primary-900">{selectedCoBorrower.email || 'N/A'}</p>
                        </div>
                        <div>
                          <p><span className="font-medium text-primary-600">Monthly Income:</span></p>
                          <p className="text-primary-900">{formatCurrency(selectedCoBorrower.monthly_income)}</p>
                        </div>
                        <div>
                          <p><span className="font-medium text-primary-600">Status:</span></p>
                          <p className="text-primary-900">{selectedCoBorrower.status.toUpperCase()}</p>
                        </div>
                      </div>
                      {selectedCoBorrower.phone_number && (
                        <div className="mt-3 pt-3 border-t border-primary-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <p><span className="font-medium text-primary-600">Phone:</span></p>
                              <p className="text-primary-900">{selectedCoBorrower.phone_number}</p>
                            </div>
                            {selectedCoBorrower.current_address && (
                              <div>
                                <p><span className="font-medium text-primary-600">Address:</span></p>
                                <p className="text-primary-900 text-sm">{selectedCoBorrower.current_address}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 text-sm text-primary-500 text-center">
                      <Spinner size="sm" className="mr-2" />
                      Loading co-borrower details...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preview Button */}
            <div className="flex justify-center">
              <Button
                variant="bordered"
                onPress={calculatePreview}
                className="min-w-[200px]"
              >
                Preview Payment Schedule
              </Button>
            </div>

            {/* Preview Schedule */}
            {showPreview && previewSchedule.length > 0 && (
              <Card className="bg-default-50">
                <CardHeader>
                  <h3 className="text-lg font-semibold">Payment Schedule Preview (First 5 Payments)</h3>
                </CardHeader>
                <Divider />
                <CardBody className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-default-200">
                          <th className="text-left p-2">#</th>
                          <th className="text-left p-2">Due Date</th>
                          <th className="text-right p-2">Principal</th>
                          <th className="text-right p-2">Interest</th>
                          <th className="text-right p-2">Total Payment</th>
                          <th className="text-right p-2">Remaining Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewSchedule.map((payment) => (
                          <tr key={payment.payment_number} className="border-b border-default-100">
                            <td className="p-2">{payment.payment_number}</td>
                            <td className="p-2">{payment.due_date}</td>
                            <td className="p-2 text-right">{formatCurrency(payment.principal_due)}</td>
                            <td className="p-2 text-right">{formatCurrency(payment.interest_due)}</td>
                            <td className="p-2 text-right font-medium">{formatCurrency(payment.total_due)}</td>
                            <td className="p-2 text-right">{formatCurrency(payment.remaining_balance)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4 text-xs text-default-500">
                    * This is a preview of the first 5 payments. The complete schedule will be generated upon loan creation.
                  </div>
                </CardBody>
              </Card>
            )}

            {errors.preview && (
              <div className="bg-warning-50 text-warning border border-warning-200 rounded-lg px-4 py-3 text-sm">
                {errors.preview}
              </div>
            )}

            <Divider />

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button
                variant="light"
                onPress={() => router.replace('/loans')}
                isDisabled={createMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                className="min-w-[160px]"
              >
                Review Application
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
      ) : (
        /* Review Page */
        <div className="space-y-6">
          {/* Review Header */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between w-full">
                <h2 className="text-xl font-semibold">Review Loan Application</h2>
                <Button
                  variant="light"
                  size="sm"
                  onPress={handleBackToForm}
                  isDisabled={createMutation.isPending || saveDraftMutation.isPending}
                >
                  ← Back to Edit
                </Button>
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="p-6">
              <p className="text-default-600">
                Please review all the details below before submitting your loan application.
              </p>
            </CardBody>
          </Card>

          {/* Requirements Checklist */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Application Requirements</h3>
            </CardHeader>
            <Divider />
            <CardBody className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-default-600 mb-4">
                  Please ensure all requirements are met before submitting your application:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information Requirements */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-default-800">📄 Personal Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          selectedAccount?.name ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'
                        }`}>
                          {selectedAccount?.name ? '✓' : '✗'}
                        </span>
                        <span className={selectedAccount?.name ? 'text-default-700' : 'text-danger-600'}>
                          Full Name
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          selectedAccount?.email ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'
                        }`}>
                          {selectedAccount?.email ? '✓' : '!'}
                        </span>
                        <span className={selectedAccount?.email ? 'text-default-700' : 'text-warning-600'}>
                          Email Address
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          selectedAccount?.phone_number ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'
                        }`}>
                          {selectedAccount?.phone_number ? '✓' : '!'}
                        </span>
                        <span className={selectedAccount?.phone_number ? 'text-default-700' : 'text-warning-600'}>
                          Phone Number
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          selectedAccount?.current_address ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'
                        }`}>
                          {selectedAccount?.current_address ? '✓' : '!'}
                        </span>
                        <span className={selectedAccount?.current_address ? 'text-default-700' : 'text-warning-600'}>
                          Current Address
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          selectedAccount?.date_of_birth ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'
                        }`}>
                          {selectedAccount?.date_of_birth ? '✓' : '!'}
                        </span>
                        <span className={selectedAccount?.date_of_birth ? 'text-default-700' : 'text-warning-600'}>
                          Date of Birth
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Information Requirements */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-default-800">💰 Financial Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          selectedAccount?.monthly_income && selectedAccount.monthly_income > 0 ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'
                        }`}>
                          {selectedAccount?.monthly_income && selectedAccount.monthly_income > 0 ? '✓' : '✗'}
                        </span>
                        <span className={selectedAccount?.monthly_income && selectedAccount.monthly_income > 0 ? 'text-default-700' : 'text-danger-600'}>
                          Monthly Income
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          selectedAccount?.employer_name ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'
                        }`}>
                          {selectedAccount?.employer_name ? '✓' : '!'}
                        </span>
                        <span className={selectedAccount?.employer_name ? 'text-default-700' : 'text-warning-600'}>
                          Employment Details
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          selectedAccount?.bank_account_number ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'
                        }`}>
                          {selectedAccount?.bank_account_number ? '✓' : '!'}
                        </span>
                        <span className={selectedAccount?.bank_account_number ? 'text-default-700' : 'text-warning-600'}>
                          Bank Account Details
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          selectedCoBorrowerId ? 'bg-success-100 text-success-600' : 'bg-warning-100 text-warning-600'
                        }`}>
                          {selectedCoBorrowerId ? '✓' : '!'}
                        </span>
                        <span className={selectedCoBorrowerId ? 'text-default-700' : 'text-warning-600'}>
                          Co-Borrower (Optional)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Documentation Requirements */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-default-800">📋 Documentation</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-warning-100 text-warning-600 flex items-center justify-center text-xs">!</span>
                        <span className="text-warning-600">Valid Government ID</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-warning-100 text-warning-600 flex items-center justify-center text-xs">!</span>
                        <span className="text-warning-600">Proof of Income</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-warning-100 text-warning-600 flex items-center justify-center text-xs">!</span>
                        <span className="text-warning-600">Bank Statements (3 months)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-4 h-4 rounded-full bg-warning-100 text-warning-600 flex items-center justify-center text-xs">!</span>
                        <span className="text-warning-600">Employment Certificate</span>
                      </div>
                    </div>
                  </div>

                  {/* Loan Parameters Requirements */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-default-800">💳 Loan Parameters</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          principalAmount && parseFloat(principalAmount) > 0 ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'
                        }`}>
                          {principalAmount && parseFloat(principalAmount) > 0 ? '✓' : '✗'}
                        </span>
                        <span className={principalAmount && parseFloat(principalAmount) > 0 ? 'text-default-700' : 'text-danger-600'}>
                          Principal Amount
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          interestRate && parseFloat(interestRate) >= 0 ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'
                        }`}>
                          {interestRate && parseFloat(interestRate) >= 0 ? '✓' : '✗'}
                        </span>
                        <span className={interestRate && parseFloat(interestRate) >= 0 ? 'text-default-700' : 'text-danger-600'}>
                          Interest Rate
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          tenureMonths && parseInt(tenureMonths) > 0 ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'
                        }`}>
                          {tenureMonths && parseInt(tenureMonths) > 0 ? '✓' : '✗'}
                        </span>
                        <span className={tenureMonths && parseInt(tenureMonths) > 0 ? 'text-default-700' : 'text-danger-600'}>
                          Loan Tenure
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                          paymentFrequency ? 'bg-success-100 text-success-600' : 'bg-danger-100 text-danger-600'
                        }`}>
                          {paymentFrequency ? '✓' : '✗'}
                        </span>
                        <span className={paymentFrequency ? 'text-default-700' : 'text-danger-600'}>
                          Payment Frequency
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-default-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-warning-500 mt-0.5">⚠️</span>
                    <div className="text-sm">
                      <p className="font-medium text-default-800 mb-1">Important Notes:</p>
                      <ul className="text-default-600 space-y-1">
                        <li>• Required fields marked with ✗ must be completed before submission</li>
                        <li>• Optional fields marked with ! are recommended but not mandatory</li>
                        <li>• Physical documents must be submitted separately after loan approval</li>
                        <li>• All information will be verified during the approval process</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Customer Information</h3>
            </CardHeader>
            <Divider />
            <CardBody className="p-6">
              {selectedAccount ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="text-sm font-medium text-default-600">Customer Name</label>
                    <p className="text-lg font-medium">{selectedAccount.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-600">Email Address</label>
                    <p className="text-lg">{selectedAccount.email || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-600">Phone Number</label>
                    <p className="text-lg">{selectedAccount.phone_number || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-600">Monthly Income</label>
                    <p className="text-lg font-medium text-success">{formatCurrency(selectedAccount.monthly_income)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-default-600">Account Status</label>
                    <p className="text-lg">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedAccount.status === 'active' ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
                      }`}>
                        {selectedAccount.status.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  {selectedAccount.current_address && (
                    <div className="md:col-span-2 lg:col-span-3">
                      <label className="text-sm font-medium text-default-600">Current Address</label>
                      <p className="text-lg">{selectedAccount.current_address}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Spinner size="sm" className="mr-2" />
                  Loading customer details...
                </div>
              )}
            </CardBody>
          </Card>

          {/* Loan Details */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Loan Details</h3>
            </CardHeader>
            <Divider />
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {selectedLoanTypeId && loanTypeDefaults && (
                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="text-sm font-medium text-default-600">Loan Type</label>
                    <p className="text-lg font-medium">{loanTypeDefaults.loan_type_name}</p>
                    {loanTypeDefaults.loan_type_description && (
                      <p className="text-sm text-default-500 mt-1">{loanTypeDefaults.loan_type_description}</p>
                    )}
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-default-600">Principal Amount</label>
                  <p className="text-lg font-bold text-primary">{formatCurrency(parseFloat(principalAmount))}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-default-600">Interest Rate</label>
                  <p className="text-lg font-medium">{interestRate}% annually</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-default-600">Loan Tenure</label>
                  <p className="text-lg font-medium">{tenureMonths} months</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-default-600">Payment Frequency</label>
                  <p className="text-lg font-medium">
                    {paymentFrequencyOptions.find(opt => opt.key === paymentFrequency)?.label || paymentFrequency}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-default-600">First Payment Date</label>
                  <p className="text-lg font-medium">{new Date(firstPaymentDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-default-600">Estimated Monthly Payment</label>
                  <p className="text-lg font-bold text-warning">
                    {previewSchedule.length > 0 ? formatCurrency(previewSchedule[0].total_due) : 'Calculate preview to see'}
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Co-Borrower Information */}
          {selectedCoBorrowerId && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Co-Borrower Information</h3>
              </CardHeader>
              <Divider />
              <CardBody className="p-6">
                {selectedCoBorrower ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div>
                      <label className="text-sm font-medium text-default-600">Co-Borrower Name</label>
                      <p className="text-lg font-medium">{selectedCoBorrower.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-default-600">Email Address</label>
                      <p className="text-lg">{selectedCoBorrower.email || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-default-600">Phone Number</label>
                      <p className="text-lg">{selectedCoBorrower.phone_number || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-default-600">Monthly Income</label>
                      <p className="text-lg font-medium text-success">{formatCurrency(selectedCoBorrower.monthly_income)}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-default-600">Account Status</label>
                      <p className="text-lg">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedCoBorrower.status === 'active' ? 'bg-success-100 text-success-800' : 'bg-warning-100 text-warning-800'
                        }`}>
                          {selectedCoBorrower.status.toUpperCase()}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-default-600">Combined Monthly Income</label>
                      <p className="text-lg font-bold text-primary">
                        {formatCurrency((selectedAccount?.monthly_income || 0) + (selectedCoBorrower.monthly_income || 0))}
                      </p>
                    </div>
                    {selectedCoBorrower.current_address && (
                      <div className="md:col-span-2 lg:col-span-3">
                        <label className="text-sm font-medium text-default-600">Co-Borrower Address</label>
                        <p className="text-lg">{selectedCoBorrower.current_address}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Spinner size="sm" className="mr-2" />
                    Loading co-borrower details...
                  </div>
                )}
                
                <div className="mt-6 p-4 bg-success-50 border border-success-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-success-600 mt-0.5">✓</span>
                    <div className="text-sm">
                      <p className="font-medium text-success-800 mb-1">Co-Borrower Benefits:</p>
                      <ul className="text-success-700 space-y-1">
                        <li>• Strengthens loan application with additional income source</li>
                        <li>• May qualify for higher loan amounts or better terms</li>
                        <li>• Shared responsibility increases approval chances</li>
                        <li>• Combined income: {selectedAccount && selectedCoBorrower ? formatCurrency((selectedAccount.monthly_income || 0) + (selectedCoBorrower.monthly_income || 0)) : 'Calculating...'}</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Payment Schedule Preview */}
          {previewSchedule.length > 0 && (
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">Payment Schedule Preview</h3>
              </CardHeader>
              <Divider />
              <CardBody className="p-6">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-default-200">
                        <th className="text-left p-3">#</th>
                        <th className="text-left p-3">Due Date</th>
                        <th className="text-right p-3">Principal</th>
                        <th className="text-right p-3">Interest</th>
                        <th className="text-right p-3">Total Payment</th>
                        <th className="text-right p-3">Remaining Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewSchedule.map((payment) => (
                        <tr key={payment.payment_number} className="border-b border-default-100 hover:bg-default-50">
                          <td className="p-3 font-medium">{payment.payment_number}</td>
                          <td className="p-3">{payment.due_date}</td>
                          <td className="p-3 text-right">{formatCurrency(payment.principal_due)}</td>
                          <td className="p-3 text-right">{formatCurrency(payment.interest_due)}</td>
                          <td className="p-3 text-right font-bold">{formatCurrency(payment.total_due)}</td>
                          <td className="p-3 text-right">{formatCurrency(payment.remaining_balance)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 text-sm text-default-500 bg-default-50 rounded-lg p-3">
                  <p className="font-medium mb-1">📅 Schedule Information:</p>
                  <p>• This preview shows the first {previewSchedule.length} payments out of {Math.ceil((parseInt(tenureMonths) / 12) * (paymentFrequency === 'weekly' ? 52 : paymentFrequency === 'bi-monthly' ? 24 : 12))} total payments</p>
                  <p>• The complete amortization schedule will be generated upon loan approval</p>
                  <p>• Payment dates follow {paymentFrequency === 'monthly' ? 'the same day each month' : paymentFrequency === 'bi-monthly' ? 'common payroll schedule patterns' : 'weekly intervals'}</p>
                </div>
              </CardBody>
            </Card>
          )}

          {/* Application Summary & Actions */}
          <Card>
            <CardHeader>
              <h3 className="text-lg font-semibold">Application Summary</h3>
            </CardHeader>
            <Divider />
            <CardBody className="p-6">
              {errors.general && (
                <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg px-4 py-3 text-sm mb-4">
                  {errors.general}
                </div>
              )}
              
              <div className="bg-warning-50 border border-warning-200 rounded-lg p-4 mb-6">
                <h4 className="font-medium text-warning-800 mb-2">⚠️ Important Notice</h4>
                <ul className="text-sm text-warning-700 space-y-1">
                  <li>• This loan application will be submitted for approval</li>
                  <li>• Once submitted, the application cannot be modified</li>
                  <li>• A tenant approver will review and either approve or reject this application</li>
                  <li>• You will receive a notification once the decision is made</li>
                </ul>
              </div>

              <div className="flex justify-between items-center">
                <Button
                  variant="light"
                  onPress={handleBackToForm}
                  isDisabled={createMutation.isPending || saveDraftMutation.isPending}
                  size="lg"
                >
                  ← Back to Edit
                </Button>
                
                <div className="flex gap-3">
                  <Button
                    variant="bordered"
                    onPress={() => router.replace('/loans')}
                    isDisabled={createMutation.isPending || saveDraftMutation.isPending}
                    size="lg"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="bordered"
                    color="warning"
                    onPress={handleSaveAsDraft}
                    isLoading={saveDraftMutation.isPending}
                    isDisabled={createMutation.isPending}
                    size="lg"
                    className="min-w-[140px]"
                  >
                    {saveDraftMutation.isPending ? 'Saving Draft...' : 'Save as Draft'}
                  </Button>
                  <Button
                    color="primary"
                    onPress={handleSubmitLoan}
                    isLoading={createMutation.isPending}
                    isDisabled={saveDraftMutation.isPending}
                    size="lg"
                    className="min-w-[180px]"
                  >
                    {createMutation.isPending ? 'Submitting Application...' : 'Submit Loan Application'}
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  )
}