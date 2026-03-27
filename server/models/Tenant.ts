import mongoose, { Schema, Document } from 'mongoose'

export interface ITenantAddress {
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface ITenantContact {
  email?: string
  phone?: string
  website?: string
}

export interface ITenant extends Document {
  name: string
  slug: string
  logo?: string
  address?: ITenantAddress
  contact?: ITenantContact
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const AddressSchema = new Schema({
  street: { type: String, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  postalCode: { type: String, trim: true },
  country: { type: String, trim: true },
}, { _id: false })

const ContactSchema = new Schema({
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String, trim: true },
  website: { type: String, trim: true },
}, { _id: false })

const TenantSchema = new Schema<ITenant>({
  name: {
    type: String,
    required: [true, 'Tenant name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: [true, 'Tenant slug is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'],
  },
  logo: {
    type: String,
    trim: true,
  },
  address: {
    type: AddressSchema,
    default: {},
  },
  contact: {
    type: ContactSchema,
    default: {},
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
})

// Indexes
// Note: slug already has unique index from schema definition
TenantSchema.index({ isActive: 1 })

export default mongoose.models.Tenant || mongoose.model<ITenant>('Tenant', TenantSchema)
