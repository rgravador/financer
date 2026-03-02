import mongoose, { Schema, Document } from 'mongoose'
import type { Types } from 'mongoose'

export type UserRole = 'system_admin' | 'tenant_admin' | 'tenant_officer' | 'tenant_approver'

export interface IUser extends Document {
  tenantId: Types.ObjectId | null
  role: UserRole
  email: string
  passwordHash: string
  firstName: string
  lastName: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null,
    validate: {
      validator: function(this: IUser, value: Types.ObjectId | null) {
        // System admins must have null tenantId
        if (this.role === 'system_admin') {
          return value === null
        }
        // All other roles must have a tenantId
        return value !== null
      },
      message: 'System admins must have null tenantId, other roles must have a tenantId',
    },
  },
  role: {
    type: String,
    required: [true, 'Role is required'],
    enum: {
      values: ['system_admin', 'tenant_admin', 'tenant_officer', 'tenant_approver'],
      message: '{VALUE} is not a valid role',
    },
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password hash is required'],
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Indexes
// Note: email already has unique index from schema definition
UserSchema.index({ tenantId: 1, role: 1 })
UserSchema.index({ tenantId: 1, isActive: 1 })

// Virtual for full name
UserSchema.virtual('fullName').get(function(this: IUser) {
  return `${this.firstName} ${this.lastName}`
})

// Ensure virtuals are included in JSON
UserSchema.set('toJSON', { virtuals: true })
UserSchema.set('toObject', { virtuals: true })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
