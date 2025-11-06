'use client'

import { use, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Textarea } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import { Divider } from '@heroui/divider'
import { Spinner } from '@heroui/spinner'
import { Tabs, Tab } from '@heroui/tabs'
import { trpc as trpcProvider } from '@/lib/trpc/Provider'
import { PESO_SYMBOL } from '@/lib/utils/currency'
import type { Selection } from '@react-types/shared'

interface EditAccountPageProps {
  params: Promise<{ id: string }>
}

export default function EditAccountPage({ params }: EditAccountPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get existing account data
  const { data: account, isLoading } = trpcProvider.accounts.getById.useQuery(
    { id },
    {
      staleTime: 10 * 1000, // Consider data fresh for 10 seconds
      refetchOnMount: false, // Don't refetch when component mounts if data exists
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
    }
  )
  const utils = trpcProvider.useUtils()

  // Basic Information
  const [name, setName] = useState('')
  const [contactInfo, setContactInfo] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')

  // Personal Information
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [ssnTaxId, setSsnTaxId] = useState('')
  const [governmentIdType, setGovernmentIdType] = useState('')
  const [governmentIdNumber, setGovernmentIdNumber] = useState('')
  const [secondaryIdType, setSecondaryIdType] = useState('')

  // Address Information
  const [currentAddress, setCurrentAddress] = useState('')
  const [previousAddress, setPreviousAddress] = useState('')

  // Employment Information
  const [employerName, setEmployerName] = useState('')
  const [employerPhone, setEmployerPhone] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [employmentLengthMonths, setEmploymentLengthMonths] = useState('')

  // Financial Information
  const [annualIncome, setAnnualIncome] = useState('')
  const [monthlyIncome, setMonthlyIncome] = useState('')
  const [monthlyExpenses, setMonthlyExpenses] = useState('')
  const [monthlyDebtObligations, setMonthlyDebtObligations] = useState('')
  const [existingLoansDetails, setExistingLoansDetails] = useState('')
  const [creditAccountsDetails, setCreditAccountsDetails] = useState('')

  // Populate form with existing data when account loads
  useEffect(() => {
    if (account) {
      // Basic Information
      setName(account.name || '')
      setContactInfo(account.contact_info || '')
      setPhoneNumber(account.phone_number || '')
      setEmail(account.email || '')
      setAddress(account.address || '')

      // Personal Information
      setDateOfBirth(account.date_of_birth || '')
      setSsnTaxId(account.ssn_tax_id || '')
      setGovernmentIdType(account.government_id_type || '')
      setGovernmentIdNumber(account.government_id_number || '')
      setSecondaryIdType(account.secondary_id_type || '')

      // Address Information
      setCurrentAddress(account.current_address || '')
      setPreviousAddress(account.previous_address || '')

      // Employment Information
      setEmployerName(account.employer_name || '')
      setEmployerPhone(account.employer_phone || '')
      setJobTitle(account.job_title || '')
      setEmploymentLengthMonths(account.employment_length_months?.toString() || '')

      // Financial Information
      setAnnualIncome(account.annual_income?.toString() || '')
      setMonthlyIncome(account.monthly_income?.toString() || '')
      setMonthlyExpenses(account.monthly_expenses?.toString() || '')
      setMonthlyDebtObligations(account.monthly_debt_obligations?.toString() || '')
      setExistingLoansDetails(account.existing_loans_details || '')
      setCreditAccountsDetails(account.credit_accounts_details || '')
    }
  }, [account])

  const updateMutation = trpcProvider.accounts.update.useMutation({
    onSuccess: () => {
      // Redirect without cache invalidation to prevent loading issues
      router.replace(`/accounts/${id}`)
    },
    onError: (error) => {
      setErrors({ general: error.message })
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!name.trim()) {
      setErrors({ name: 'Name is required' })
      return
    }

    try {
      await updateMutation.mutateAsync({
        id,
        name: name.trim(),
        contact_info: contactInfo.trim() || undefined,
        phone_number: phoneNumber.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        date_of_birth: dateOfBirth || undefined,
        ssn_tax_id: ssnTaxId.trim() || undefined,
        government_id_type: (governmentIdType || undefined) as "drivers_license" | "passport" | "state_id" | "military_id" | undefined,
        government_id_number: governmentIdNumber.trim() || undefined,
        secondary_id_type: (secondaryIdType || undefined) as "birth_certificate" | "social_security_card" | "utility_bill" | undefined,
        current_address: currentAddress.trim() || undefined,
        previous_address: previousAddress.trim() || undefined,
        employer_name: employerName.trim() || undefined,
        employer_phone: employerPhone.trim() || undefined,
        job_title: jobTitle.trim() || undefined,
        employment_length_months: employmentLengthMonths ? parseInt(employmentLengthMonths) : undefined,
        annual_income: annualIncome ? parseFloat(annualIncome) : undefined,
        monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
        monthly_expenses: monthlyExpenses ? parseFloat(monthlyExpenses) : undefined,
        monthly_debt_obligations: monthlyDebtObligations ? parseFloat(monthlyDebtObligations) : undefined,
        existing_loans_details: existingLoansDetails.trim() || undefined,
        credit_accounts_details: creditAccountsDetails.trim() || undefined,
      })
    } catch (error) {
      // Error handled by onError
    }
  }

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

  if (!account) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardBody className="text-center p-8">
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold mb-2">Account Not Found</h1>
            <p className="text-default-500 mb-6">
              The account you're trying to edit doesn't exist or you don't have permission to edit it.
            </p>
            <Button 
              color="primary" 
              onPress={() => router.replace('/accounts')}
              className="w-full"
            >
              Back to Accounts
            </Button>
          </CardBody>
        </Card>
      </div>
    )
  }

  const governmentIdOptions = [
    { key: '', label: 'Select ID Type' },
    { key: 'drivers_license', label: "Driver's License" },
    { key: 'passport', label: 'Passport' },
    { key: 'state_id', label: 'State ID' },
    { key: 'military_id', label: 'Military ID' },
  ] as const

  const secondaryIdOptions = [
    { key: '', label: 'Select Secondary ID' },
    { key: 'birth_certificate', label: 'Birth Certificate' },
    { key: 'social_security_card', label: 'Social Security Card' },
    { key: 'utility_bill', label: 'Utility Bill' },
  ] as const

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="light"
            onPress={() => router.replace(`/accounts/${id}`)}
            startContent={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Back to Account
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Account</h1>
            <p className="text-default-500 mt-1">Update {account.name}'s information</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Account Information</h2>
          </CardHeader>
          <Divider />
          <CardBody className="p-6">
            <Tabs>
              <Tab key="basic" title="Basic Information">
                <div className="space-y-6 mt-4">
                  {errors.general && (
                    <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg px-4 py-3 text-sm">
                      {errors.general}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="text"
                      label="Full Name"
                      placeholder="Enter full name"
                      value={name}
                      onValueChange={setName}
                      isRequired
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                      isInvalid={!!errors.name}
                      errorMessage={errors.name}
                    />

                    <Input
                      type="email"
                      label="Email Address"
                      placeholder="Enter email address"
                      value={email}
                      onValueChange={setEmail}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                    />

                    <Input
                      type="tel"
                      label="Phone Number"
                      placeholder="Enter phone number"
                      value={phoneNumber}
                      onValueChange={setPhoneNumber}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                    />

                    <Input
                      type="text"
                      label="Contact Information"
                      placeholder="Additional contact info"
                      value={contactInfo}
                      onValueChange={setContactInfo}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                    />
                  </div>

                  <Textarea
                    label="Address"
                    placeholder="Enter complete address"
                    value={address}
                    onValueChange={setAddress}
                    variant="bordered"
                    size="lg"
                    labelPlacement="outside"
                    minRows={3}
                  />
                </div>
              </Tab>

              <Tab key="personal" title="Personal Information">
                <div className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="date"
                      label="Date of Birth"
                      value={dateOfBirth}
                      onValueChange={setDateOfBirth}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                    />

                    <Input
                      type="text"
                      label="SSN/Tax ID"
                      placeholder="Enter SSN or Tax ID"
                      value={ssnTaxId}
                      onValueChange={setSsnTaxId}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                    />

                    {/* @ts-ignore - HeroUI Select type definition issue */}
                    <Select
                      label="Government ID Type"
                      placeholder="Select government ID type"
                      selectedKeys={governmentIdType ? [governmentIdType] : []}
                      onSelectionChange={(keys: Selection) => setGovernmentIdType(Array.from(keys)[0] as string || '')}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                      items={governmentIdOptions}
                    >
                      {(item: typeof governmentIdOptions[number]) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                    </Select>

                    <Input
                      type="text"
                      label="Government ID Number"
                      placeholder="Enter ID number"
                      value={governmentIdNumber}
                      onValueChange={setGovernmentIdNumber}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                    />

                    {/* @ts-ignore - HeroUI Select type definition issue */}
                    <Select
                      label="Secondary ID Type"
                      placeholder="Select secondary ID type"
                      selectedKeys={secondaryIdType ? [secondaryIdType] : []}
                      onSelectionChange={(keys: Selection) => setSecondaryIdType(Array.from(keys)[0] as string || '')}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                      items={secondaryIdOptions}
                    >
                      {(item: typeof secondaryIdOptions[number]) => <SelectItem key={item.key}>{item.label}</SelectItem>}
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Textarea
                      label="Current Address"
                      placeholder="Enter current address"
                      value={currentAddress}
                      onValueChange={setCurrentAddress}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                      minRows={3}
                    />

                    <Textarea
                      label="Previous Address"
                      placeholder="Enter previous address"
                      value={previousAddress}
                      onValueChange={setPreviousAddress}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                      minRows={3}
                    />
                  </div>
                </div>
              </Tab>

              <Tab key="employment" title="Employment">
                <div className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="text"
                      label="Employer Name"
                      placeholder="Enter employer name"
                      value={employerName}
                      onValueChange={setEmployerName}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                    />

                    <Input
                      type="text"
                      label="Job Title"
                      placeholder="Enter job title"
                      value={jobTitle}
                      onValueChange={setJobTitle}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                    />

                    <Input
                      type="tel"
                      label="Employer Phone"
                      placeholder="Enter employer phone"
                      value={employerPhone}
                      onValueChange={setEmployerPhone}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                    />

                    <Input
                      type="number"
                      label="Employment Length (Months)"
                      placeholder="Enter months employed"
                      value={employmentLengthMonths}
                      onValueChange={setEmploymentLengthMonths}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                      min="0"
                    />
                  </div>
                </div>
              </Tab>

              <Tab key="financial" title="Financial Information">
                <div className="space-y-6 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      type="number"
                      label="Annual Income"
                      placeholder="Enter annual income"
                      value={annualIncome}
                      onValueChange={setAnnualIncome}
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
                    />

                    <Input
                      type="number"
                      label="Monthly Income"
                      placeholder="Enter monthly income"
                      value={monthlyIncome}
                      onValueChange={setMonthlyIncome}
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
                    />

                    <Input
                      type="number"
                      label="Monthly Expenses"
                      placeholder="Enter monthly expenses"
                      value={monthlyExpenses}
                      onValueChange={setMonthlyExpenses}
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
                    />

                    <Input
                      type="number"
                      label="Monthly Debt Obligations"
                      placeholder="Enter monthly debt payments"
                      value={monthlyDebtObligations}
                      onValueChange={setMonthlyDebtObligations}
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
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Textarea
                      label="Existing Loans Details"
                      placeholder="Describe existing loans and obligations"
                      value={existingLoansDetails}
                      onValueChange={setExistingLoansDetails}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                      minRows={4}
                    />

                    <Textarea
                      label="Credit Accounts Details"
                      placeholder="Describe credit cards and credit accounts"
                      value={creditAccountsDetails}
                      onValueChange={setCreditAccountsDetails}
                      variant="bordered"
                      size="lg"
                      labelPlacement="outside"
                      minRows={4}
                    />
                  </div>
                </div>
              </Tab>
            </Tabs>

            <Divider className="my-6" />

            {/* Form Actions */}
            <div className="flex justify-end gap-4">
              <Button
                variant="light"
                onPress={() => router.replace(`/accounts/${id}`)}
                isDisabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={updateMutation.isPending}
                className="min-w-[120px]"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Account'}
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </div>
  )
}