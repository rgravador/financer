import mongoose, { Document, Schema } from 'mongoose'

export interface IBorrower extends Document {
  tenantId: mongoose.Types.ObjectId
  firstName: string
  lastName: string
  email: string
  contactNumber: string
  address: string
  employmentType: 'employed' | 'self_employed' | 'business_owner' | 'ofw' | 'other'
  employer?: string
  monthlyIncome: number
  dateOfBirth?: Date
  notes?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const BorrowerSchema = new Schema<IBorrower>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
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
    address: {
      type: String,
      required: true,
      trim: true,
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
    monthlyIncome: {
      type: Number,
      required: true,
      min: 0,
    },
    dateOfBirth: {
      type: Date,
    },
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
  return `${this.firstName} ${this.lastName}`
})

// Ensure virtuals are included in JSON
BorrowerSchema.set('toJSON', { virtuals: true })
BorrowerSchema.set('toObject', { virtuals: true })

const Borrower = mongoose.model<IBorrower>('Borrower', BorrowerSchema)

export default Borrower
