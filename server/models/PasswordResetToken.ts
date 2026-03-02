import mongoose, { Schema, Document } from 'mongoose'
import type { Types } from 'mongoose'

export interface IPasswordResetToken extends Document {
  userId: Types.ObjectId
  token: string
  expiresAt: Date
  used: boolean
  createdAt: Date
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  token: {
    type: String,
    required: [true, 'Token is required'],
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
    default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
  },
  used: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
})

// Index for faster lookups
// Note: token index created by unique: true in schema
PasswordResetTokenSchema.index({ userId: 1, used: 1 })

// Automatically delete expired tokens after 24 hours
// TTL index on expiresAt
PasswordResetTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 24 * 60 * 60 }
)

export default mongoose.models.PasswordResetToken ||
  mongoose.model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema)
