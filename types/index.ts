import type { Types } from 'mongoose'

// User roles
export type UserRole = 'system_admin' | 'tenant_admin' | 'tenant_officer' | 'tenant_approver'

// Tenant interface
export interface Tenant {
  _id: string
  name: string
  slug: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Gender type
export type Gender = 'male' | 'female'

// User interface
export interface User {
  _id: string
  tenantId: string | null
  role: UserRole
  email: string
  firstName: string
  lastName: string
  fullName?: string
  gender?: Gender
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// JWT payload interface
export interface JWTPayload {
  sub: string  // user ID
  tenantId: string | null
  role: UserRole
  email: string
  iat?: number
  exp?: number
}

// Auth response interface
export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: User
}

// Login request interface
export interface LoginRequest {
  email: string
  password: string
}

// Refresh token request interface
export interface RefreshTokenRequest {
  refreshToken: string
}

// Loan Type document interface
export interface RequiredDocument {
  documentName: string
  description?: string
  isRequired: boolean
}

// Loan Type interface
export interface LoanType {
  id: string
  tenantId: string
  name: string
  description?: string
  defaultInterestRate: number
  minInterestRate: number
  maxInterestRate: number
  minLoanAmount: number
  maxLoanAmount: number
  availableTerms: number[]
  requiredDocuments: RequiredDocument[]
  isDefault: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Notification type
export type NotificationType = 'new_application' | 'documents_uploaded' | 'approved' | 'rejected' | 'pending_documents'

// Notification interface
export interface Notification {
  id: string
  tenantId: string
  userId: string
  type: NotificationType
  message: string
  applicationId: string
  isRead: boolean
  createdAt: Date
}

// Employment type
export type EmploymentType = 'employed' | 'self_employed' | 'business_owner' | 'ofw' | 'other'

// Housing status type
export type HousingStatus = 'owned' | 'renting' | 'living_with_relatives' | 'company_provided' | 'other'

// Income source type
export type IncomeSource = 'salary' | 'business' | 'freelance' | 'remittance' | 'pension' | 'rental' | 'investments' | 'other'

// Government ID type
export type GovernmentIdType = 'passport' | 'drivers_license' | 'sss' | 'philhealth' | 'pagibig' | 'tin' | 'voters_id' | 'postal_id' | 'umid' | 'national_id' | 'other'

// Application status
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'pending_documents' | 'approved' | 'rejected' | 'disbursed'

// Document status
export type DocumentStatus = 'uploaded' | 'pending' | 'waived'

// Borrower reference
export interface BorrowerReference {
  name: string
  relationship: string
  contactNumber: string
  address?: string
}

// Borrower past loan
export interface BorrowerPastLoan {
  lender: string
  amount: number
  status: 'paid' | 'current' | 'defaulted' | 'restructured'
  remarks?: string
}

// Borrower interface
export interface Borrower {
  id: string
  tenantId: string

  // Basic Identity
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  fullName?: string
  email: string
  contactNumber: string
  dateOfBirth?: Date
  governmentIdType?: GovernmentIdType
  governmentIdNumber?: string

  // Stability Indicators
  address: string
  housingStatus?: HousingStatus
  previousAddress?: string
  yearsAtCurrentAddress?: number
  employmentType: EmploymentType
  employer?: string
  employmentLength?: number

  // Income & Capacity
  incomeSource?: IncomeSource
  monthlyIncome: number
  annualIncome?: number
  existingObligations?: number
  dependentsCount?: number
  monthlyRent?: number

  // Creditworthiness
  creditScore?: number
  creditHistory?: string
  pastLoans?: BorrowerPastLoan[]
  hasDefaults?: boolean
  hasLatePayments?: boolean

  // Banking & Financial Footprint
  bankName?: string
  bankAccountNumber?: string
  hasBankStatements?: boolean

  // References
  references?: BorrowerReference[]

  // Notes
  notes?: string

  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Applicant details (legacy - for backward compatibility)
export interface Applicant {
  firstName: string
  lastName: string
  email: string
  contactNumber: string
  address: string
  employmentType: EmploymentType
  employer?: string
  monthlyIncome: number
}

// Loan details
export interface LoanDetails {
  requestedAmount: number
  requestedTerm: number
  suggestedInterestRate: number
  officerNotes?: string
}

// Uploaded document
export interface UploadedDocument {
  id?: string
  documentName: string
  fileUrl: string
  filePublicId: string
  uploadedAt: Date
  status: DocumentStatus
}

// Follow-up document
export interface FollowUpDocument {
  id?: string
  documentName: string
  notes: string
  dueDate?: Date
}

// Status history entry
export interface StatusHistoryEntry {
  id?: string
  status: string
  changedBy: string
  timestamp: Date
  notes?: string
}

// Loan Application interface
export interface LoanApplication {
  id: string
  tenantId: string
  loanTypeId: string
  borrowerId: string
  coBorrowerId?: string
  assignedOfficerId: string
  assignedApproverId?: string
  loanDetails: LoanDetails
  documents: UploadedDocument[]
  followUpDocuments: FollowUpDocument[]
  status: ApplicationStatus
  statusHistory: StatusHistoryEntry[]
  finalInterestRate?: number
  createdAt: Date
  updatedAt: Date
  // Populated fields (when using .populate())
  borrower?: Borrower
  coBorrower?: Borrower
  loanType?: LoanType
  assignedOfficer?: User
  assignedApprover?: User
}

// Audit Log interface
export interface AuditLog {
  id: string
  tenantId?: string | null
  userId: string
  action: string
  entity: string
  entityId: string
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}
