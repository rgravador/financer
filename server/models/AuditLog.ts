import mongoose from 'mongoose'

export interface IAuditLog {
  tenantId?: mongoose.Types.ObjectId | null
  userId: mongoose.Types.ObjectId
  action: string
  entity: string
  entityId: mongoose.Types.ObjectId
  metadata?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  createdAt: Date
}

const AuditLogSchema = new mongoose.Schema<IAuditLog>({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    default: null,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  entity: {
    type: String,
    required: true,
    index: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: false, // Only createdAt, no updatedAt
})

// Compound indexes for common query patterns
AuditLogSchema.index({ tenantId: 1, createdAt: -1 })
AuditLogSchema.index({ userId: 1, createdAt: -1 })
AuditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 })

export const AuditLog = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema)

export default AuditLog
