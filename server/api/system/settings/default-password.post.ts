import { connectDB } from '~/server/utils/db'
import SystemSettings, { SETTING_KEYS } from '~/server/models/SystemSettings'
import { requireSystemAdmin } from '~/server/utils/requireRole'
import { validatePasswordStrength } from '~/server/utils/password'
import { logAction } from '~/server/utils/audit'
import mongoose from 'mongoose'

/**
 * POST /api/system/settings/default-password
 *
 * Set the default password for new tenant admin accounts
 * The password is stored in plain text (not hashed) since it needs to be used for new accounts
 * Requires role: system_admin
 */
export default defineEventHandler(async (event) => {
  // Require system admin role
  const currentUser = requireSystemAdmin(event)

  // Parse request body
  const body = await readBody<{
    password: string
  }>(event)

  const { password } = body

  if (!password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password is required',
    })
  }

  // Validate password length
  if (password.length < 8) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must be at least 8 characters',
    })
  }

  if (password.length > 128) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Password must not exceed 128 characters',
    })
  }

  // Validate password strength
  const strength = validatePasswordStrength(password)
  if (!strength.isAcceptable) {
    throw createError({
      statusCode: 400,
      statusMessage: strength.feedback[0] || 'Password is too weak',
    })
  }

  await connectDB()

  // Store the default password
  const setting = await SystemSettings.findOneAndUpdate(
    { key: SETTING_KEYS.DEFAULT_TENANT_ADMIN_PASSWORD },
    {
      value: password,
      description: 'Default password for new tenant admin accounts',
      updatedBy: new mongoose.Types.ObjectId(currentUser.sub),
    },
    { upsert: true, new: true }
  )

  // Log the action (DO NOT log the actual password)
  await logAction(event, {
    action: 'update',
    entity: 'system_settings',
    entityId: setting._id,
    metadata: {
      key: SETTING_KEYS.DEFAULT_TENANT_ADMIN_PASSWORD,
      action: 'set_default_password',
      updatedBy: currentUser.sub,
    },
  })

  console.log(`Default tenant admin password updated by ${currentUser.email}`)

  return {
    success: true,
    message: 'Default password has been set. All new tenant admin accounts will use this password.',
    updatedAt: setting.updatedAt,
  }
})
