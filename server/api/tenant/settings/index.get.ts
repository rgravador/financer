import { connectDB } from '~/server/utils/db'
import TenantSettings from '~/server/models/TenantSettings'
import Tenant from '~/server/models/Tenant'
import { requireTenantAdmin } from '~/server/utils/requireRole'

/**
 * GET /api/tenant/settings
 *
 * Get tenant settings
 * Creates default settings if they don't exist
 * Requires role: tenant_admin
 */
export default defineEventHandler(async (event) => {
  // Require tenant admin role
  const user = requireTenantAdmin(event)

  // Ensure user has a tenantId
  if (!user.tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User is not associated with a tenant',
    })
  }

  await connectDB()

  // Get tenant info for branding defaults
  const tenant = await Tenant.findById(user.tenantId).lean()
  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found',
    })
  }

  // Find or create settings
  let settings = await TenantSettings.findOne({ tenantId: user.tenantId }).lean()

  if (!settings) {
    // Create default settings
    settings = await TenantSettings.create({
      tenantId: user.tenantId,
      branding: {
        companyName: tenant.name,
        logoUrl: tenant.logo,
      },
    })
    settings = settings.toObject()
  }

  return {
    id: settings._id.toString(),
    tenantId: settings.tenantId.toString(),
    branding: settings.branding || {},
    notifications: settings.notifications || {
      emailOnNewApplication: true,
      emailOnStatusChange: true,
      emailOnDocumentUpload: true,
      emailOnApprovalRequired: true,
    },
    approvalRules: settings.approvalRules || [],
    defaultLoanOfficerId: settings.defaultLoanOfficerId?.toString() || null,
    requireDocumentsBeforeApproval: settings.requireDocumentsBeforeApproval ?? true,
    allowPartialApprovals: settings.allowPartialApprovals ?? false,
    maxConcurrentApplicationsPerBorrower: settings.maxConcurrentApplicationsPerBorrower ?? 3,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  }
})
