import mongoose, { Document, Schema } from 'mongoose'

export interface INotification extends Document {
  tenantId: mongoose.Types.ObjectId
  userId: mongoose.Types.ObjectId
  type: 'new_application' | 'documents_uploaded' | 'approved' | 'rejected' | 'pending_documents'
  message: string
  applicationId: mongoose.Types.ObjectId
  isRead: boolean
  createdAt: Date
}

const NotificationSchema = new Schema<INotification>(
  {
    tenantId: {
      type: Schema.Types.ObjectId,
      ref: 'Tenant',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['new_application', 'documents_uploaded', 'approved', 'rejected', 'pending_documents'],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    applicationId: {
      type: Schema.Types.ObjectId,
      ref: 'LoanApplication',
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
)

// Compound index for efficient user notification queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 })

const Notification = mongoose.model<INotification>('Notification', NotificationSchema)

export default Notification
