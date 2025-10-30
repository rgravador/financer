import type { GovernmentIdType, SecondaryIdType } from '~/types'

interface AccountCreationForm {
  // Basic Identification
  name: string
  date_of_birth: string
  ssn_tax_id: string
  government_id_type: GovernmentIdType | null
  government_id_number: string
  secondary_id_type: SecondaryIdType | null
  id_proof_file: File | null

  // Contact Information
  phone_number: string
  email: string
  current_address: string
  previous_address: string
  proof_of_address_file: File | null

  // Employment Details
  employer_name: string
  employer_phone: string
  job_title: string
  employment_length_months: string
  employment_verification_file: File | null

  // Income & Financial Information
  annual_income: string
  monthly_income: string
  pay_stubs_file: File | null
  tax_returns_file: File | null
  bank_statements_file: File | null

  // Debt & Expenses
  monthly_expenses: string
  monthly_debt_obligations: string
  existing_loans_details: string
  credit_accounts_details: string
}

type StepKey = 'basic' | 'contact' | 'employment' | 'income' | 'debt'

const formData = ref<AccountCreationForm>({
  // Basic Identification
  name: '',
  date_of_birth: '',
  ssn_tax_id: '',
  government_id_type: null,
  government_id_number: '',
  secondary_id_type: null,
  id_proof_file: null,

  // Contact Information
  phone_number: '',
  email: '',
  current_address: '',
  previous_address: '',
  proof_of_address_file: null,

  // Employment Details
  employer_name: '',
  employer_phone: '',
  job_title: '',
  employment_length_months: '',
  employment_verification_file: null,

  // Income & Financial Information
  annual_income: '',
  monthly_income: '',
  pay_stubs_file: null,
  tax_returns_file: null,
  bank_statements_file: null,

  // Debt & Expenses
  monthly_expenses: '',
  monthly_debt_obligations: '',
  existing_loans_details: '',
  credit_accounts_details: ''
})

const accountId = ref<string | null>(null)

const sectionFields = {
  basic: ['name', 'date_of_birth', 'ssn_tax_id', 'government_id_type', 'government_id_number', 'secondary_id_type'],
  contact: ['phone_number', 'email', 'current_address', 'previous_address'],
  employment: ['employer_name', 'employer_phone', 'job_title', 'employment_length_months'],
  income: ['annual_income', 'monthly_income'],
  debt: ['monthly_expenses', 'monthly_debt_obligations', 'existing_loans_details', 'credit_accounts_details']
}

const requiredFields = {
  basic: ['name'],
  contact: ['phone_number', 'email', 'current_address'],
  employment: ['employer_name', 'job_title', 'employment_length_months'],
  income: ['monthly_income'],
  debt: ['monthly_expenses']
}

export const useAccountCreation = () => {
  const accountsStore = useAccounts()
  const uiStore = useUI()

  const getCompletedFieldsCount = (section: StepKey) => {
    return sectionFields[section].filter((field) => {
      const value = formData.value[field as keyof AccountCreationForm]
      return value !== null && value !== undefined && value !== ''
    }).length
  }

  const getTotalFieldsCount = (section: StepKey) => {
    return sectionFields[section].length
  }

  const isSectionComplete = (section: StepKey) => {
    return requiredFields[section].every((field) => {
      const value = formData.value[field as keyof AccountCreationForm]
      return value !== null && value !== undefined && value !== ''
    })
  }

  const completionPercentage = computed(() => {
    const totalFields = Object.values(sectionFields).flat().length
    const completedFields = Object.values(sectionFields).flat().filter((field) => {
      const value = formData.value[field as keyof AccountCreationForm]
      return value !== null && value !== undefined && value !== ''
    }).length

    return Math.round((completedFields / totalFields) * 100)
  })

  const calculatedDTI = computed(() => {
    const monthlyIncome = parseFloat(formData.value.monthly_income) || parseFloat(formData.value.annual_income) / 12
    const monthlyDebt = parseFloat(formData.value.monthly_debt_obligations)

    if (monthlyIncome && monthlyDebt) {
      return Math.round((monthlyDebt / monthlyIncome) * 100)
    }
    return null
  })

  const saveBasicInfo = async () => {
    try {
      const accountData = {
        name: formData.value.name,
        date_of_birth: formData.value.date_of_birth || null,
        ssn_tax_id: formData.value.ssn_tax_id || null,
        government_id_type: formData.value.government_id_type,
        government_id_number: formData.value.government_id_number || null,
        secondary_id_type: formData.value.secondary_id_type,
        id_proof_file: formData.value.id_proof_file
      }

      const result = await accountsStore.createAccountMultiStep(accountData)

      if (result.success && result.data) {
        accountId.value = (result.data as any).id
        uiStore.showSuccess('Basic information saved')
        return { success: true }
      } else {
        throw new Error(result.error || 'Failed to save basic information')
      }
    } catch (err: any) {
      uiStore.showError(err.message || 'Failed to save basic information')
      return { success: false, error: err.message }
    }
  }

  const saveContactInfo = async () => {
    if (!accountId.value) {
      return { success: false, error: 'No account ID found. Please complete basic information first.' }
    }

    try {
      const contactData = {
        phone_number: formData.value.phone_number || null,
        email: formData.value.email || null,
        current_address: formData.value.current_address || null,
        previous_address: formData.value.previous_address || null
      }

      await accountsStore.updateAccount(accountId.value, contactData)

      // Handle file upload
      if (formData.value.proof_of_address_file) {
        const result = await accountsStore.uploadAccountDocument(
          accountId.value,
          formData.value.proof_of_address_file,
          'proof-of-address'
        )
        if (result.success) {
          await accountsStore.updateAccount(accountId.value, {
            proof_of_address_url: result.url
          })
        }
      }

      uiStore.showSuccess('Contact information saved')
      return { success: true }
    } catch (err: any) {
      uiStore.showError(err.message || 'Failed to save contact information')
      return { success: false, error: err.message }
    }
  }

  const saveEmploymentInfo = async () => {
    if (!accountId.value) {
      return { success: false, error: 'No account ID found. Please complete basic information first.' }
    }

    try {
      const employmentData = {
        employer_name: formData.value.employer_name || null,
        employer_phone: formData.value.employer_phone || null,
        job_title: formData.value.job_title || null,
        employment_length_months: formData.value.employment_length_months
          ? parseInt(formData.value.employment_length_months)
          : null
      }

      await accountsStore.updateAccount(accountId.value, employmentData)

      // Handle file upload
      if (formData.value.employment_verification_file) {
        const result = await accountsStore.uploadAccountDocument(
          accountId.value,
          formData.value.employment_verification_file,
          'employment-verification'
        )
        if (result.success) {
          await accountsStore.updateAccount(accountId.value, {
            employment_verification_url: result.url
          })
        }
      }

      uiStore.showSuccess('Employment information saved')
      return { success: true }
    } catch (err: any) {
      uiStore.showError(err.message || 'Failed to save employment information')
      return { success: false, error: err.message }
    }
  }

  const saveIncomeInfo = async () => {
    if (!accountId.value) {
      return { success: false, error: 'No account ID found. Please complete basic information first.' }
    }

    try {
      const incomeData = {
        annual_income: formData.value.annual_income ? parseFloat(formData.value.annual_income) : null,
        monthly_income: formData.value.monthly_income ? parseFloat(formData.value.monthly_income) : null
      }

      await accountsStore.updateAccount(accountId.value, incomeData)

      // Handle file uploads
      const fileUploads = [
        { file: formData.value.pay_stubs_file, type: 'pay-stubs', field: 'pay_stubs_url' },
        { file: formData.value.tax_returns_file, type: 'tax-returns', field: 'tax_returns_url' },
        { file: formData.value.bank_statements_file, type: 'bank-statements', field: 'bank_statements_url' }
      ]

      for (const upload of fileUploads) {
        if (upload.file) {
          const result = await accountsStore.uploadAccountDocument(
            accountId.value,
            upload.file,
            upload.type
          )
          if (result.success) {
            await accountsStore.updateAccount(accountId.value, {
              [upload.field]: result.url
            })
          }
        }
      }

      uiStore.showSuccess('Income information saved')
      return { success: true }
    } catch (err: any) {
      uiStore.showError(err.message || 'Failed to save income information')
      return { success: false, error: err.message }
    }
  }

  const saveDebtInfo = async () => {
    if (!accountId.value) {
      return { success: false, error: 'No account ID found. Please complete basic information first.' }
    }

    try {
      const debtData = {
        monthly_expenses: formData.value.monthly_expenses ? parseFloat(formData.value.monthly_expenses) : null,
        monthly_debt_obligations: formData.value.monthly_debt_obligations
          ? parseFloat(formData.value.monthly_debt_obligations)
          : null,
        debt_to_income_ratio: calculatedDTI.value,
        existing_loans_details: formData.value.existing_loans_details || null,
        credit_accounts_details: formData.value.credit_accounts_details || null
      }

      await accountsStore.updateAccount(accountId.value, debtData)
      uiStore.showSuccess('Debt & expenses information saved')
      return { success: true }
    } catch (err: any) {
      uiStore.showError(err.message || 'Failed to save debt information')
      return { success: false, error: err.message }
    }
  }

  const resetForm = () => {
    formData.value = {
      name: '',
      date_of_birth: '',
      ssn_tax_id: '',
      government_id_type: null,
      government_id_number: '',
      secondary_id_type: null,
      id_proof_file: null,
      phone_number: '',
      email: '',
      current_address: '',
      previous_address: '',
      proof_of_address_file: null,
      employer_name: '',
      employer_phone: '',
      job_title: '',
      employment_length_months: '',
      employment_verification_file: null,
      annual_income: '',
      monthly_income: '',
      pay_stubs_file: null,
      tax_returns_file: null,
      bank_statements_file: null,
      monthly_expenses: '',
      monthly_debt_obligations: '',
      existing_loans_details: '',
      credit_accounts_details: ''
    }
    accountId.value = null
  }

  return {
    formData,
    accountId,
    completionPercentage,
    calculatedDTI,
    getCompletedFieldsCount,
    getTotalFieldsCount,
    isSectionComplete,
    saveBasicInfo,
    saveContactInfo,
    saveEmploymentInfo,
    saveIncomeInfo,
    saveDebtInfo,
    resetForm
  }
}
