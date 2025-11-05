export * from './database'
export * from './supabase'

// Form types
export interface LoginForm {
  email: string
  password: string
}

export interface SignupForm {
  email: string
  password: string
  full_name: string
  display_name?: string
  role: 'admin' | 'agent' | 'internal_admin'
}

export interface AccountForm {
  name: string
  contact_info: string
  address: string
  id_proof_file?: File | null
}

export interface LoanForm {
  account_id: string
  principal_amount: number
  interest_rate: number
  tenure_months: number
  payment_frequency: 'bi-monthly' | 'monthly' | 'weekly'
  start_date?: string
}

export interface PaymentForm {
  loan_id: string
  amount: number
  payment_date: string
  notes?: string
}

export interface CashoutRequestForm {
  amount: number
}

export interface CompanyForm {
  name: string
  description?: string
  address?: string
  contact_email?: string
  contact_phone?: string
  registration_number?: string
  tax_id?: string
  logo_file?: File | null
}

// Dashboard stats
export interface AgentDashboardStats {
  total_accounts: number
  active_loans: number
  collectible_earnings: number
  upcoming_payments: number
}

export interface AdminDashboardStats {
  total_loans: number
  total_outstanding: number
  total_agents: number
  pending_approvals: number
  pending_cashouts: number
  // Additional properties expected by pages
  totalUsers?: number
  activeAgents?: number
  totalAccounts?: number
  totalLoans?: number
  activeLoans?: number
  totalDisbursed?: number
  totalCollected?: number
  outstandingBalance?: number
  totalPenalties?: number
  totalCommissions?: number
  pendingLoans?: number
  overdueLoans?: number
}

export interface AgentPerformance {
  agent_id: string
  agent_name: string
  total_accounts: number
  total_loans: number
  total_collections: number
  total_earnings: number
  // Additional properties expected by pages
  id?: string
  full_name?: string
  email?: string
  activeLoans?: number
  totalCollected?: number
  totalCommissions?: number
  performance?: number
}
