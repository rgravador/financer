import mongoose, { Document, Schema } from 'mongoose'

export type EmploymentType = 'employed' | 'self_employed' | 'business_owner' | 'ofw' | 'other'
export type HousingStatus = 'owned' | 'renting' | 'living_with_relatives' | 'company_provided' | 'other'
export type IncomeSource = 'salary' | 'business' | 'freelance' | 'remittance' | 'pension' | 'rental' | 'investments' | 'other'
export type GovernmentIdType = 'passport' | 'drivers_license' | 'sss' | 'philhealth' | 'pagibig' | 'tin' | 'voters_id' | 'postal_id' | 'umid' | 'national_id' | 'other'

export interface IBorrowerReference {
  name: string
  relationship: string
  contactNumber: string
  address?: string
}

export interface IBorrowerPastLoan {
  lender: string
  amount: number
  status: 'paid' | 'current' | 'defaulted' | 'restructured'
  remarks?: string
}

export interface IBorrower extends Document {
  tenantId: mongoose.Types.ObjectId

  // 1. Basic Identity
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  email: string
  contactNumber: string
  dateOfBirth?: Date
  governmentIdType?: GovernmentIdType
  governmentIdNumber?: string

  // 2. Stability Indicators
  address: string
  housingStatus?: HousingStatus
  previousAddress?: string
  yearsAtCurrentAddress?: number
  employmentType: EmploymentType
  employer?: string
  employmentLength?: number // in months

  // 3. Income & Capacity
  incomeSource?: IncomeSource
  monthlyIncome: number
  annualIncome?: number
  existingObligations?: number // total monthly obligations
  dependentsCount?: number
  monthlyRent?: number

  // 4. Creditworthiness
  creditScore?: number
  creditHistory?: string
  pastLoans?: IBorrowerPastLoan[]
  hasDefaults?: boolean
  hasLatePayments?: boolean

  // 5. Banking & Financial Footprint
  bankName?: string
  bankAccountNumber?: string
  hasBankStatements?: boolean

  // 6. References & Reputation
  references?: IBorrowerReference[]

  // 7. Notes
  notes?: string

  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BorrowerReferenceSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    contactNumber: { type: String, required: true, trim: true },
    address: { type: String, trim: true },
  },
  { _id: false }
)

const BorrowerPastLoanSchema = new Schema(
  {
    lender: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['paid', 'current', 'defaulted', 'restructured'],
      required: true,
    },
    remarks: { type: String, trim: true },
  },
  { _id: false }
)

const BorrowerSchema = new Schema<IBorrower>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },

    // 1. Basic Identity
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    middleName: {
      type: String,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    suffix: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    contactNumber: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    governmentIdType: {
      type: String,
      enum: ['passport', 'drivers_license', 'sss', 'philhealth', 'pagibig', 'tin', 'voters_id', 'postal_id', 'umid', 'national_id', 'other'],
    },
    governmentIdNumber: {
      type: String,
      trim: true,
    },

    // 2. Stability Indicators
    address: {
      type: String,
      required: true,
      trim: true,
    },
    housingStatus: {
      type: String,
      enum: ['owned', 'renting', 'living_with_relatives', 'company_provided', 'other'],
    },
    previousAddress: {
      type: String,
      trim: true,
    },
    yearsAtCurrentAddress: {
      type: Number,
      min: 0,
    },
    employmentType: {
      type: String,
      enum: ['employed', 'self_employed', 'business_owner', 'ofw', 'other'],
      required: true,
    },
    employer: {
      type: String,
      trim: true,
    },
    employmentLength: {
      type: Number,
      min: 0,
    },

    // 3. Income & Capacity
    incomeSource: {
      type: String,
      enum: ['salary', 'business', 'freelance', 'remittance', 'pension', 'rental', 'investments', 'other'],
    },
    monthlyIncome: {
      type: Number,
      required: true,
      min: 0,
    },
    annualIncome: {
      type: Number,
      min: 0,
    },
    existingObligations: {
      type: Number,
      min: 0,
    },
    dependentsCount: {
      type: Number,
      min: 0,
    },
    monthlyRent: {
      type: Number,
      min: 0,
    },

    // 4. Creditworthiness
    creditScore: {
      type: Number,
      min: 0,
    },
    creditHistory: {
      type: String,
      trim: true,
    },
    pastLoans: {
      type: [BorrowerPastLoanSchema],
      default: [],
    },
    hasDefaults: {
      type: Boolean,
    },
    hasLatePayments: {
      type: Boolean,
    },

    // 5. Banking & Financial Footprint
    bankName: {
      type: String,
      trim: true,
    },
    bankAccountNumber: {
      type: String,
      trim: true,
    },
    hasBankStatements: {
      type: Boolean,
    },

    // 6. References
    references: {
      type: [BorrowerReferenceSchema],
      default: [],
    },

    // 7. Notes
    notes: {
      type: String,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for efficient tenant-scoped queries
BorrowerSchema.index({ tenantId: 1, email: 1 })
BorrowerSchema.index({ tenantId: 1, lastName: 1, firstName: 1 })

// Virtual for full name
BorrowerSchema.virtual('fullName').get(function () {
  const parts = [this.firstName, this.middleName, this.lastName, this.suffix].filter(Boolean)
  return parts.join(' ')
})

// Ensure virtuals are included in JSON
BorrowerSchema.set('toJSON', { virtuals: true })
BorrowerSchema.set('toObject', { virtuals: true })

const Borrower = mongoose.model<IBorrower>('Borrower', BorrowerSchema)

export default Borrower
