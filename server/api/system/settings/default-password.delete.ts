import { connectDB } from '~/server/utils/db'
import SystemSettings, { SETTING_KEYS } from '~/server/models/SystemSettings'
import { requireSystemAdmin } from '~/server/utils/requireRole'
import { logAction } from '~/server/utils/audit'

/**
 * DELETE /api/system/settings/default-password
 *
 * Remove the default password setting
 * After removal, new tenant admin accounts will receive randomly generated passwords
 * Requires role: system_admin
 */
export default defineEventHandler(async (event) => {
  // Require system admin role
  const currentUser = requireSystemAdmin(event)

  await connectDB()

  const setting = await SystemSettings.findOneAndDelete({
    key: SETTING_KEYS.DEFAULT_TENANT_ADMIN_PASSWORD,
  })

  if (!setting) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Default password is not configured',
    })
  }

  // Log the action
  await logAction(event, {
    action: 'delete',
    entity: 'system_settings',
    entityId: setting._id,
    metadata: {
      key: SETTING_KEYS.DEFAULT_TENANT_ADMIN_PASSWORD,
      action: 'remove_default_password',
      removedBy: currentUser.sub,
    },
  })

  console.log(`Default tenant admin password removed by ${currentUser.email}`)

  return {
    success: true,
    message: 'Default password has been removed. New tenant admin accounts will receive randomly generated passwords.',
  }
})
