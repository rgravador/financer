import mongoose, { Schema, type Document } from 'mongoose'

export interface ILoanType extends Document {
  tenantId: mongoose.Types.ObjectId
  name: string
  description?: string
  defaultInterestRate: number
  minInterestRate: number
  maxInterestRate: number
  minLoanAmount: number
  maxLoanAmount: number
  availableTerms: number[]
  requiredDocuments: {
    documentName: string
    description?: string
    isRequired: boolean
  }[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const LoanTypeSchema = new Schema<ILoanType>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    defaultInterestRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    minInterestRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    maxInterestRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    minLoanAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    maxLoanAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    availableTerms: {
      type: [Number],
      required: true,
      validate: {
        validator: (terms: number[]) => terms.length > 0,
        message: 'At least one term must be specified',
      },
    },
    requiredDocuments: {
      type: [
        {
          documentName: {
            type: String,
            required: true,
            trim: true,
          },
          description: {
            type: String,
            trim: true,
          },
          isRequired: {
            type: Boolean,
            default: false,
          },
        },
      ],
      default: [],
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

// Compound index for tenant and name uniqueness
LoanTypeSchema.index({ tenantId: 1, name: 1 }, { unique: true })

// Validation: maxInterestRate must be >= minInterestRate
LoanTypeSchema.pre('save', function (next) {
  if (this.maxInterestRate < this.minInterestRate) {
    return next(new Error('Maximum interest rate must be greater than or equal to minimum interest rate'))
  }
  if (this.defaultInterestRate < this.minInterestRate || this.defaultInterestRate > this.maxInterestRate) {
    return next(new Error('Default interest rate must be between minimum and maximum interest rates'))
  }
  if (this.maxLoanAmount < this.minLoanAmount) {
    return next(new Error('Maximum loan amount must be greater than or equal to minimum loan amount'))
  }
  next()
})

export const LoanType = mongoose.models.LoanType || mongoose.model<ILoanType>('LoanType', LoanTypeSchema)
