import mongoose, { Schema, Document } from 'mongoose'
import type { Types } from 'mongoose'
import crypto from 'crypto'

export interface IRefreshToken extends Document {
  userId: Types.ObjectId
  token: string
  tokenHash: string
  isRevoked: boolean
  expiresAt: Date
  device: string
  ipAddress: string
  createdAt: Date
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  tokenHash: {
    type: String,
    required: [true, 'Token hash is required'],
    unique: true,
  },
  isRevoked: {
    type: Boolean,
    default: false,
  },
  expiresAt: {
    type: Date,
    required: [true, 'Expiration date is required'],
  },
  device: {
    type: String,
    default: 'Unknown',
  },
  ipAddress: {
    type: String,
    default: 'Unknown',
  },
}, {
  timestamps: true,
})

// Indexes for faster lookups
// Note: tokenHash index created by unique: true in schema
RefreshTokenSchema.index({ userId: 1, isRevoked: 1 })

// Automatically delete expired tokens after 7 days
// TTL index on expiresAt
RefreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60 }
)

// Method to hash refresh token
RefreshTokenSchema.statics.hashToken = function(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

// Method to verify refresh token
RefreshTokenSchema.methods.verifyToken = function(token: string): boolean {
  const hash = crypto.createHash('sha256').update(token).digest('hex')
  return this.tokenHash === hash
}

export default mongoose.models.RefreshToken ||
  mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema)
