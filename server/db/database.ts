export type UserRole = 'admin' | 'tenant_officer' | 'tenant_admin' | 'tenant_approver' | 'tenant_legal'

export type AccountStatus = 'active' | 'inactive' | 'suspended'

export type LoanStatus = 'draft' | 'pending_approval' | 'approved' | 'active' | 'closed' | 'rejected'

export type PaymentFrequency = 'bi-monthly' | 'monthly' | 'weekly'

export type PaymentType = 'regular' | 'penalty' | 'partial'

export type PaymentStatus = 'received' | 'pending' | 'cancelled'

export type NotificationType =
  | 'past_due'
  | 'upcoming_due'
  | 'loan_approval'
  | 'loan_rejection'
  | 'cashout_approved'
  | 'cashout_rejected'
  | 'payment_received'

export type CashoutStatus = 'pending' | 'approved' | 'rejected'

export type GovernmentIdType = 'drivers_license' | 'passport' | 'state_id' | 'military_id'

export type SecondaryIdType = 'birth_certificate' | 'social_security_card' | 'utility_bill'

export type TransactionType =
  | 'create_account'
  | 'update_account'
  | 'create_loan'
  | 'save_loan_draft'
  | 'approve_loan'
  | 'reject_loan'
  | 'receive_payment'
  | 'cashout_request'
  | 'cashout_approved'
  | 'cashout_rejected'
  | 'commission_update'
  | 'create_loan_type'
  | 'update_loan_type'
  | 'delete_loan_type'

export interface Tenant {
  id: string
  name: string
  company_name: string
  contact_email: string | null
  contact_phone: string | null
  address: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string | null
}

export interface UserProfile {
  id: string
  tenant_id: string | null
  email: string
  role: UserRole
  full_name: string
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

// Extended user profile with auth metadata (for client-side use)
export interface UserProfileWithMeta extends UserProfile {
  display_name?: string | null
  tenant?: Tenant
}

export interface Account {
  id: string
  tenant_id: string
  assigned_agent_id: string
  name: string
  contact_info: string | null
  address: string | null
  id_proof_url: string | null
  status: AccountStatus
  created_at: string
  updated_at: string
  created_by: string

  // Basic Identification
  date_of_birth: string | null
  ssn_tax_id: string | null
  government_id_type: GovernmentIdType | null
  government_id_number: string | null
  secondary_id_type: SecondaryIdType | null

  // Contact Information
  phone_number: string | null
  email: string | null
  current_address: string | null
  previous_address: string | null
  proof_of_address_url: string | null

  // Employment Details
  employer_name: string | null
  employer_phone: string | null
  job_title: string | null
  employment_length_months: number | null
  employment_verification_url: string | null

  // Income and Financial Information
  annual_income: number | null
  monthly_income: number | null
  pay_stubs_url: string | null
  tax_returns_url: string | null
  bank_statements_url: string | null

  // Debt and Expenses
  monthly_expenses: number | null
  monthly_debt_obligations: number | null
  debt_to_income_ratio: number | null
  existing_loans_details: string | null
  credit_accounts_details: string | null

  // Alias for backward compatibility
  contact_number?: string
  // Optional relation
  loans?: Loan[]
}

export interface AmortizationScheduleItem {
  payment_number: number
  due_date: string
  principal_due: number
  interest_due: number
  total_due: number
  remaining_balance: number
}

export interface Loan {
  id: string
  tenant_id: string
  account_id: string
  loan_type_id: string | null
  co_borrower_id: string | null
  principal_amount: number
  interest_rate: number
  tenure_months: number
  payment_frequency: PaymentFrequency
  status: LoanStatus
  amortization_schedule: AmortizationScheduleItem[]
  current_balance: number
  total_paid: number
  total_penalties: number
  approval_date: string | null
  rejection_reason: string | null
  created_by: string
  approved_by: string | null
  start_date: string
  end_date: string
  first_payment_date: string
  created_at: string
  updated_at: string
  // Aliases for backward compatibility
  approved_at?: string | null
  agent_id?: string
}

export interface Payment {
  id: string
  loan_id: string
  amount: number
  payment_date: string
  type: PaymentType
  status: PaymentStatus
  applied_to_principal: number
  applied_to_interest: number
  applied_to_penalty: number
  received_by: string
  notes: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  loan_id: string | null
  account_id: string | null
  message: string
  type: NotificationType
  is_read: boolean
  timestamp: string
  created_at: string
}

export interface Earnings {
  id: string
  agent_id: string
  total_earnings: number
  collectible_earnings: number
  cashed_out_amount: number
  commission_percentage: number
  created_at: string
  updated_at: string
}

export interface CashoutRequest {
  id: string
  agent_id: string
  amount: number
  status: CashoutStatus
  request_date: string
  approval_date: string | null
  approved_by: string | null
  rejection_reason: string | null
  created_at: string
  updated_at: string
  // Additional properties for pages
  agent?: UserProfileWithMeta
  notes?: string
  processed_at?: string
  processed_by_user?: UserProfileWithMeta
}

// Alias for backward compatibility
export type Cashout = CashoutRequest
export interface Transaction {
  id: string
  type: TransactionType
  user_id: string
  account_id: string | null
  loan_id: string | null
  payment_id: string | null
  details: Record<string, any>
  timestamp: string
  created_at: string
  // Aliases for backward compatibility
  transaction_type?: TransactionType
  user?: UserProfile
  amount?: number
  success?: boolean
}

export interface Penalty {
  id: string
  loan_id: string
  amount: number
  reason: string
  penalty_date: string
  is_paid: boolean
  created_at: string
}

export interface LoanType {
  id: string
  tenant_id: string
  name: string
  description: string | null
  min_amount: number
  max_amount: number
  min_tenure_months: number
  max_tenure_months: number
  interest_rate: number
  payment_frequencies: PaymentFrequency[]
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: string
}

// Extended types with relations
export interface AccountWithRelations extends Account {
  assigned_agent?: UserProfileWithMeta
  loans?: Loan[]
}

export interface LoanWithRelations extends Loan {
  account?: Account
  creator?: UserProfileWithMeta
  approver?: UserProfileWithMeta
  payments?: Payment[]
  penalties?: Penalty[]
  agent?: UserProfileWithMeta
}

export interface PaymentWithRelations extends Payment {
  loan?: LoanWithRelations
  receiver?: UserProfileWithMeta
}

export interface TransactionWithRelations extends Transaction {
  user?: UserProfileWithMeta
}

export interface CashoutWithRelations extends CashoutRequest {
  agent?: UserProfileWithMeta
  processed_by_user?: UserProfileWithMeta
}