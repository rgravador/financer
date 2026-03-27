import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IApprovalRule {
  minAmount: number
  maxAmount: number
  requiredApprovals: number
  approverRoles: string[]
}

export interface INotificationSettings {
  emailOnNewApplication: boolean
  emailOnStatusChange: boolean
  emailOnDocumentUpload: boolean
  emailOnApprovalRequired: boolean
}

export interface IBrandingSettings {
  primaryColor?: string
  secondaryColor?: string
  logoUrl?: string
  companyName?: string
  tagline?: string
}

export interface ITenantSettings extends Document {
  tenantId: Types.ObjectId
  branding: IBrandingSettings
  notifications: INotificationSettings
  approvalRules: IApprovalRule[]
  defaultLoanOfficerId?: Types.ObjectId
  requireDocumentsBeforeApproval: boolean
  allowPartialApprovals: boolean
  maxConcurrentApplicationsPerBorrower: number
  createdAt: Date
  updatedAt: Date
}

const ApprovalRuleSchema = new Schema({
  minAmount: { type: Number, required: true, min: 0 },
  maxAmount: { type: Number, required: true, min: 0 },
  requiredApprovals: { type: Number, required: true, min: 1, max: 5 },
  approverRoles: [{ type: String, enum: ['tenant_approver', 'tenant_admin'] }],
}, { _id: false })

const NotificationSettingsSchema = new Schema({
  emailOnNewApplication: { type: Boolean, default: true },
  emailOnStatusChange: { type: Boolean, default: true },
  emailOnDocumentUpload: { type: Boolean, default: true },
  emailOnApprovalRequired: { type: Boolean, default: true },
}, { _id: false })

const BrandingSettingsSchema = new Schema({
  primaryColor: { type: String, trim: true },
  secondaryColor: { type: String, trim: true },
  logoUrl: { type: String, trim: true },
  companyName: { type: String, trim: true },
  tagline: { type: String, trim: true },
}, { _id: false })

const TenantSettingsSchema = new Schema<ITenantSettings>({
  tenantId: {
    type: Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true,
    unique: true,
  },
  branding: {
    type: BrandingSettingsSchema,
    default: {},
  },
  notifications: {
    type: NotificationSettingsSchema,
    default: {
      emailOnNewApplication: true,
      emailOnStatusChange: true,
      emailOnDocumentUpload: true,
      emailOnApprovalRequired: true,
    },
  },
  approvalRules: {
    type: [ApprovalRuleSchema],
    default: [
      // Default approval rules based on loan amount
      { minAmount: 0, maxAmount: 100000, requiredApprovals: 1, approverRoles: ['tenant_approver', 'tenant_admin'] },
      { minAmount: 100001, maxAmount: 500000, requiredApprovals: 2, approverRoles: ['tenant_approver', 'tenant_admin'] },
      { minAmount: 500001, maxAmount: Infinity, requiredApprovals: 3, approverRoles: ['tenant_admin'] },
    ],
  },
  defaultLoanOfficerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  requireDocumentsBeforeApproval: {
    type: Boolean,
    default: true,
  },
  allowPartialApprovals: {
    type: Boolean,
    default: false,
  },
  maxConcurrentApplicationsPerBorrower: {
    type: Number,
    default: 3,
    min: 1,
    max: 10,
  },
}, {
  timestamps: true,
})

// Indexes
TenantSettingsSchema.index({ tenantId: 1 }, { unique: true })

export default mongoose.models.TenantSettings || mongoose.model<ITenantSettings>('TenantSettings', TenantSettingsSchema)
