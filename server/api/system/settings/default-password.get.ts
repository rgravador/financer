import { connectDB } from '~/server/utils/db'
import SystemSettings, { SETTING_KEYS } from '~/server/models/SystemSettings'
import { requireSystemAdmin } from '~/server/utils/requireRole'

/**
 * GET /api/system/settings/default-password
 *
 * Check if a default password is configured for tenant admins
 * Returns whether default password is set and the actual password value
 * Requires role: system_admin
 */
export default defineEventHandler(async (event) => {
  // Require system admin role
  requireSystemAdmin(event)

  await connectDB()

  const setting = await SystemSettings.findOne({
    key: SETTING_KEYS.DEFAULT_TENANT_ADMIN_PASSWORD,
  })

  return {
    isSet: !!setting?.value,
    currentPassword: setting?.value || null,
    updatedAt: setting?.updatedAt || null,
    description: 'When set, this password will be used for all new tenant admin accounts instead of generating random passwords.',
  }
})
