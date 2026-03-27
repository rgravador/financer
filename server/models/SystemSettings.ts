import mongoose, { Schema, Document, Types } from 'mongoose'

export interface ISystemSettings extends Document {
  _id: Types.ObjectId
  key: string
  value: string
  description?: string
  updatedBy?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
)

// Static method to get a setting by key
SystemSettingsSchema.statics.getSetting = async function (key: string): Promise<string | null> {
  const setting = await this.findOne({ key })
  return setting?.value || null
}

// Static method to set a setting
SystemSettingsSchema.statics.setSetting = async function (
  key: string,
  value: string,
  updatedBy?: Types.ObjectId,
  description?: string
): Promise<ISystemSettings> {
  return await this.findOneAndUpdate(
    { key },
    {
      value,
      updatedBy,
      ...(description && { description }),
    },
    { upsert: true, new: true }
  )
}

// Known setting keys
export const SETTING_KEYS = {
  DEFAULT_TENANT_ADMIN_PASSWORD: 'default_tenant_admin_password',
} as const

export default mongoose.models.SystemSettings ||
  mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema)
