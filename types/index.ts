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

// User interface
export interface User {
  _id: string
  tenantId: string | null
  role: UserRole
  email: string
  firstName: string
  lastName: string
  fullName?: string
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

// Application status
export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'pending_documents' | 'approved' | 'rejected' | 'disbursed'

// Document status
export type DocumentStatus = 'uploaded' | 'pending' | 'waived'

// Borrower interface
export interface Borrower {
  id: string
  tenantId: string
  firstName: string
  lastName: string
  fullName?: string
  email: string
  contactNumber: string
  address: string
  employmentType: EmploymentType
  employer?: string
  monthlyIncome: number
  dateOfBirth?: Date
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
