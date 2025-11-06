'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Button } from '@heroui/button'
import { Input } from '@heroui/input'
import { Textarea } from '@heroui/input'
import { Select, SelectItem } from '@heroui/select'
import { Divider } from '@heroui/divider'
import { trpc as trpcProvider } from '@/lib/trpc/Provider'
import { PESO_SYMBOL } from '@/lib/utils/currency'
import type { Selection } from '@react-types/shared'

export default function NewAccountPage() {
  const router = useRouter()
  const [errors, setErrors] = useState<Record<string, string>>({})

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
  const [currentAddress, setCurrentAddress] = useState('')
  const [previousAddress, setPreviousAddress] = useState('')

  // ID type options
  const governmentIdTypes = [
    { key: 'drivers_license', label: "Driver's License" },
    { key: 'passport', label: 'Passport' },
    { key: 'state_id', label: 'State ID' },
    { key: 'military_id', label: 'Military ID' },
  ] as const

  const secondaryIdTypes = [
    { key: 'birth_certificate', label: 'Birth Certificate' },
    { key: 'social_security_card', label: 'Social Security Card' },
    { key: 'utility_bill', label: 'Utility Bill' },
  ] as const

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

  const createMutation = trpcProvider.accounts.create.useMutation({
    onSuccess: (data) => {
      router.replace(`/accounts/${data.id}`)
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
    if (!name) newErrors.name = 'Name is required'
    if (!contactInfo) newErrors.contactInfo = 'Contact information is required'
    if (!address) newErrors.address = 'Address is required'
    if (email && !email.includes('@')) newErrors.email = 'Invalid email format'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    createMutation.mutate({
      name,
      contact_info: contactInfo,
      address,
      phone_number: phoneNumber || undefined,
      email: email || undefined,
      date_of_birth: dateOfBirth || undefined,
      ssn_tax_id: ssnTaxId || undefined,
      government_id_type: governmentIdType as any || undefined,
      government_id_number: governmentIdNumber || undefined,
      secondary_id_type: secondaryIdType as any || undefined,
      current_address: currentAddress || undefined,
      previous_address: previousAddress || undefined,
      employer_name: employerName || undefined,
      employer_phone: employerPhone || undefined,
      job_title: jobTitle || undefined,
      employment_length_months: employmentLengthMonths ? parseInt(employmentLengthMonths) : undefined,
      annual_income: annualIncome ? parseFloat(annualIncome) : undefined,
      monthly_income: monthlyIncome ? parseFloat(monthlyIncome) : undefined,
      monthly_expenses: monthlyExpenses ? parseFloat(monthlyExpenses) : undefined,
      monthly_debt_obligations: monthlyDebtObligations ? parseFloat(monthlyDebtObligations) : undefined,
      existing_loans_details: existingLoansDetails || undefined,
      credit_accounts_details: creditAccountsDetails || undefined,
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
          <h1 className="text-3xl font-bold">Create New Account</h1>
          <p className="text-default-500 mt-1">Add a new customer account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {errors.submit && (
          <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg px-4 py-3 text-sm">
            {errors.submit}
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-xl font-semibold">Basic Information</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                labelPlacement="outside"
                placeholder="John Doe"
                value={name}
                onValueChange={setName}
                isRequired
                errorMessage={errors.name}
                isInvalid={!!errors.name}
                variant="bordered"
                size="lg"
              />

              <Input
                label="Contact Information"
                labelPlacement="outside"
                placeholder="Email or phone"
                value={contactInfo}
                onValueChange={setContactInfo}
                isRequired
                errorMessage={errors.contactInfo}
                isInvalid={!!errors.contactInfo}
                variant="bordered"
                size="lg"
                description="Primary contact method"
              />

              <Input
                type="tel"
                label="Phone Number"
                labelPlacement="outside"
                placeholder="+1 (555) 000-0000"
                value={phoneNumber}
                onValueChange={setPhoneNumber}
                variant="bordered"
                size="lg"
              />

              <Input
                type="email"
                label="Email Address"
                labelPlacement="outside"
                placeholder="john.doe@example.com"
                value={email}
                onValueChange={setEmail}
                errorMessage={errors.email}
                isInvalid={!!errors.email}
                variant="bordered"
                size="lg"
              />
            </div>

            <Textarea
              label="Address"
              labelPlacement="outside"
              placeholder="123 Main Street, City, State, ZIP"
              value={address}
              onValueChange={setAddress}
              isRequired
              errorMessage={errors.address}
              isInvalid={!!errors.address}
              variant="bordered"
              size="lg"
              minRows={2}
            />
          </CardBody>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-xl font-semibold">Personal Information (KYC)</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="date"
                label="Date of Birth"
                labelPlacement="outside"
                value={dateOfBirth}
                onValueChange={setDateOfBirth}
                variant="bordered"
                size="lg"
              />

              <Input
                label="SSN / Tax ID"
                labelPlacement="outside"
                placeholder="XXX-XX-XXXX"
                value={ssnTaxId}
                onValueChange={setSsnTaxId}
                variant="bordered"
                size="lg"
                description="For verification purposes only"
              />

              {/* @ts-ignore - HeroUI Select type definition issue */}
              <Select
                label="Government ID Type"
                labelPlacement="outside"
                placeholder="Select ID type"
                selectedKeys={governmentIdType ? [governmentIdType] : []}
                onSelectionChange={(keys: Selection) => setGovernmentIdType(Array.from(keys)[0] as string)}
                items={governmentIdTypes}
                size="lg"
              >
                {(item: typeof governmentIdTypes[number]) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>

              <Input
                label="Government ID Number"
                labelPlacement="outside"
                placeholder="ID number"
                value={governmentIdNumber}
                onValueChange={setGovernmentIdNumber}
                variant="bordered"
                size="lg"
              />

              {/* @ts-ignore - HeroUI Select type definition issue */}
              <Select
                label="Secondary ID Type"
                labelPlacement="outside"
                placeholder="Select secondary ID"
                selectedKeys={secondaryIdType ? [secondaryIdType] : []}
                onSelectionChange={(keys: Selection) => setSecondaryIdType(Array.from(keys)[0] as string)}
                items={secondaryIdTypes}
                size="lg"
              >
                {(item: typeof secondaryIdTypes[number]) => <SelectItem key={item.key}>{item.label}</SelectItem>}
              </Select>
            </div>

            <Divider className="my-2" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="Current Address"
                labelPlacement="outside"
                placeholder="Current residential address"
                value={currentAddress}
                onValueChange={setCurrentAddress}
                variant="bordered"
                size="lg"
                minRows={2}
              />

              <Textarea
                label="Previous Address"
                labelPlacement="outside"
                placeholder="Previous residential address"
                value={previousAddress}
                onValueChange={setPreviousAddress}
                variant="bordered"
                size="lg"
                minRows={2}
              />
            </div>
          </CardBody>
        </Card>

        {/* Employment Information */}
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-xl font-semibold">Employment Information</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Employer Name"
                labelPlacement="outside"
                placeholder="Company name"
                value={employerName}
                onValueChange={setEmployerName}
                variant="bordered"
                size="lg"
              />

              <Input
                type="tel"
                label="Employer Phone"
                labelPlacement="outside"
                placeholder="Company phone number"
                value={employerPhone}
                onValueChange={setEmployerPhone}
                variant="bordered"
                size="lg"
              />

              <Input
                label="Job Title"
                labelPlacement="outside"
                placeholder="Your position"
                value={jobTitle}
                onValueChange={setJobTitle}
                variant="bordered"
                size="lg"
              />

              <Input
                type="number"
                label="Employment Length (Months)"
                labelPlacement="outside"
                placeholder="24"
                value={employmentLengthMonths}
                onValueChange={setEmploymentLengthMonths}
                variant="bordered"
                size="lg"
              />
            </div>
          </CardBody>
        </Card>

        {/* Financial Information */}
        <Card>
          <CardHeader className="pb-3">
            <h2 className="text-xl font-semibold">Financial Information</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="number"
                label="Annual Income"
                labelPlacement="outside"
                placeholder="50000"
                value={annualIncome}
                onValueChange={setAnnualIncome}
                variant="bordered"
                size="lg"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">{PESO_SYMBOL}</span>
                  </div>
                }
              />

              <Input
                type="number"
                label="Monthly Income"
                labelPlacement="outside"
                placeholder="4166"
                value={monthlyIncome}
                onValueChange={setMonthlyIncome}
                variant="bordered"
                size="lg"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">{PESO_SYMBOL}</span>
                  </div>
                }
              />

              <Input
                type="number"
                label="Monthly Expenses"
                labelPlacement="outside"
                placeholder="2000"
                value={monthlyExpenses}
                onValueChange={setMonthlyExpenses}
                variant="bordered"
                size="lg"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">{PESO_SYMBOL}</span>
                  </div>
                }
              />

              <Input
                type="number"
                label="Monthly Debt Obligations"
                labelPlacement="outside"
                placeholder="500"
                value={monthlyDebtObligations}
                onValueChange={setMonthlyDebtObligations}
                variant="bordered"
                size="lg"
                startContent={
                  <div className="pointer-events-none flex items-center">
                    <span className="text-default-400 text-small">{PESO_SYMBOL}</span>
                  </div>
                }
              />
            </div>

            <Divider className="my-2" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea
                label="Existing Loans Details"
                labelPlacement="outside"
                placeholder="Describe any existing loans"
                value={existingLoansDetails}
                onValueChange={setExistingLoansDetails}
                variant="bordered"
                size="lg"
                minRows={3}
              />

              <Textarea
                label="Credit Accounts Details"
                labelPlacement="outside"
                placeholder="Describe credit cards and accounts"
                value={creditAccountsDetails}
                onValueChange={setCreditAccountsDetails}
                variant="bordered"
                size="lg"
                minRows={3}
              />
            </div>
          </CardBody>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
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
            Create Account
          </Button>
        </div>
      </form>
    </div>
  )
}
