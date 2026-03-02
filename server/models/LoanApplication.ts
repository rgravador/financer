import mongoose, { Document, Schema } from 'mongoose'

export interface ILoanApplication extends Document {
  tenantId: mongoose.Types.ObjectId
  loanTypeId: mongoose.Types.ObjectId
  borrowerId: mongoose.Types.ObjectId
  coBorrowerId?: mongoose.Types.ObjectId
  assignedOfficerId: mongoose.Types.ObjectId
  assignedApproverId?: mongoose.Types.ObjectId

  loanDetails: {
    requestedAmount: number
    requestedTerm: number
    suggestedInterestRate: number
    officerNotes?: string
  }

  documents: Array<{
    _id?: mongoose.Types.ObjectId
    documentName: string
    fileUrl: string
    filePublicId: string
    uploadedAt: Date
    status: 'uploaded' | 'pending' | 'waived'
  }>

  followUpDocuments: Array<{
    _id?: mongoose.Types.ObjectId
    documentName: string
    notes: string
    dueDate?: Date
  }>

  status: 'draft' | 'submitted' | 'under_review' | 'pending_documents' | 'approved' | 'rejected' | 'disbursed'

  statusHistory: Array<{
    _id?: mongoose.Types.ObjectId
    status: string
    changedBy: mongoose.Types.ObjectId
    timestamp: Date
    notes?: string
  }>

  finalInterestRate?: number
  createdAt: Date
  updatedAt: Date
}

const LoanApplicationSchema = new Schema<ILoanApplication>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    loanTypeId: {
      type: Schema.Types.ObjectId,
      ref: 'LoanType',
      required: true,
    },
    borrowerId: {
      type: Schema.Types.ObjectId,
      ref: 'Borrower',
      required: true,
      index: true,
    },
    coBorrowerId: {
      type: Schema.Types.ObjectId,
      ref: 'Borrower',
    },
    assignedOfficerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedApproverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },

    loanDetails: {
      requestedAmount: { type: Number, required: true, min: 0 },
      requestedTerm: { type: Number, required: true, min: 1 },
      suggestedInterestRate: { type: Number, required: true, min: 0, max: 100 },
      officerNotes: String,
    },

    documents: [
      {
        documentName: { type: String, required: true },
        fileUrl: { type: String, required: true },
        filePublicId: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now },
        status: {
          type: String,
          enum: ['uploaded', 'pending', 'waived'],
          default: 'uploaded',
        },
      },
    ],

    followUpDocuments: [
      {
        documentName: { type: String, required: true },
        notes: { type: String, required: true },
        dueDate: Date,
      },
    ],

    status: {
      type: String,
      enum: ['draft', 'submitted', 'under_review', 'pending_documents', 'approved', 'rejected', 'disbursed'],
      default: 'draft',
      required: true,
      index: true,
    },

    statusHistory: [
      {
        status: { type: String, required: true },
        changedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        timestamp: { type: Date, default: Date.now },
        notes: String,
      },
    ],

    finalInterestRate: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
)

// Compound indexes for efficient queries
LoanApplicationSchema.index({ tenantId: 1, status: 1, createdAt: -1 })
LoanApplicationSchema.index({ assignedOfficerId: 1, status: 1 })
LoanApplicationSchema.index({ assignedApproverId: 1, status: 1 })
LoanApplicationSchema.index({ borrowerId: 1, createdAt: -1 })

const LoanApplication = mongoose.model<ILoanApplication>('LoanApplication', LoanApplicationSchema)

export default LoanApplication
