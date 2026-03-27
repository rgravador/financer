import { connectDB } from '~/server/utils/db'
import TenantSettings from '~/server/models/TenantSettings'
import { requireTenantAdmin } from '~/server/utils/requireRole'
import { logAction } from '~/server/utils/audit'

interface UpdateSettingsBody {
  branding?: {
    primaryColor?: string
    secondaryColor?: string
    logoUrl?: string
    companyName?: string
    tagline?: string
  }
  notifications?: {
    emailOnNewApplication?: boolean
    emailOnStatusChange?: boolean
    emailOnDocumentUpload?: boolean
    emailOnApprovalRequired?: boolean
  }
  approvalRules?: Array<{
    minAmount: number
    maxAmount: number
    requiredApprovals: number
    approverRoles: string[]
  }>
  defaultLoanOfficerId?: string | null
  requireDocumentsBeforeApproval?: boolean
  allowPartialApprovals?: boolean
  maxConcurrentApplicationsPerBorrower?: number
}

/**
 * PATCH /api/tenant/settings
 *
 * Update tenant settings
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

  // Parse request body
  const body = await readBody<UpdateSettingsBody>(event)

  await connectDB()

  // Find or create settings
  let settings = await TenantSettings.findOne({ tenantId: user.tenantId })

  if (!settings) {
    settings = new TenantSettings({ tenantId: user.tenantId })
  }

  // Track changes for audit log
  const changes: Record<string, any> = {}

  // Update branding
  if (body.branding) {
    const brandingChanges: Record<string, any> = {}
    if (body.branding.primaryColor !== undefined) {
      brandingChanges.primaryColor = body.branding.primaryColor
      settings.branding.primaryColor = body.branding.primaryColor
    }
    if (body.branding.secondaryColor !== undefined) {
      brandingChanges.secondaryColor = body.branding.secondaryColor
      settings.branding.secondaryColor = body.branding.secondaryColor
    }
    if (body.branding.logoUrl !== undefined) {
      brandingChanges.logoUrl = body.branding.logoUrl
      settings.branding.logoUrl = body.branding.logoUrl
    }
    if (body.branding.companyName !== undefined) {
      brandingChanges.companyName = body.branding.companyName
      settings.branding.companyName = body.branding.companyName
    }
    if (body.branding.tagline !== undefined) {
      brandingChanges.tagline = body.branding.tagline
      settings.branding.tagline = body.branding.tagline
    }
    if (Object.keys(brandingChanges).length > 0) {
      changes.branding = brandingChanges
    }
  }

  // Update notifications
  if (body.notifications) {
    const notifChanges: Record<string, any> = {}
    if (body.notifications.emailOnNewApplication !== undefined) {
      notifChanges.emailOnNewApplication = body.notifications.emailOnNewApplication
      settings.notifications.emailOnNewApplication = body.notifications.emailOnNewApplication
    }
    if (body.notifications.emailOnStatusChange !== undefined) {
      notifChanges.emailOnStatusChange = body.notifications.emailOnStatusChange
      settings.notifications.emailOnStatusChange = body.notifications.emailOnStatusChange
    }
    if (body.notifications.emailOnDocumentUpload !== undefined) {
      notifChanges.emailOnDocumentUpload = body.notifications.emailOnDocumentUpload
      settings.notifications.emailOnDocumentUpload = body.notifications.emailOnDocumentUpload
    }
    if (body.notifications.emailOnApprovalRequired !== undefined) {
      notifChanges.emailOnApprovalRequired = body.notifications.emailOnApprovalRequired
      settings.notifications.emailOnApprovalRequired = body.notifications.emailOnApprovalRequired
    }
    if (Object.keys(notifChanges).length > 0) {
      changes.notifications = notifChanges
    }
  }

  // Update approval rules
  if (body.approvalRules !== undefined) {
    // Validate approval rules
    for (const rule of body.approvalRules) {
      if (rule.minAmount < 0 || rule.maxAmount < 0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Approval rule amounts must be non-negative',
        })
      }
      if (rule.minAmount >= rule.maxAmount) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Approval rule minAmount must be less than maxAmount',
        })
      }
      if (rule.requiredApprovals < 1 || rule.requiredApprovals > 5) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Required approvals must be between 1 and 5',
        })
      }
      const validRoles = ['tenant_approver', 'tenant_admin']
      if (!rule.approverRoles.every(r => validRoles.includes(r))) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid approver roles',
        })
      }
    }
    settings.approvalRules = body.approvalRules
    changes.approvalRules = body.approvalRules
  }

  // Update other settings
  if (body.defaultLoanOfficerId !== undefined) {
    settings.defaultLoanOfficerId = body.defaultLoanOfficerId || undefined
    changes.defaultLoanOfficerId = body.defaultLoanOfficerId
  }
  if (body.requireDocumentsBeforeApproval !== undefined) {
    settings.requireDocumentsBeforeApproval = body.requireDocumentsBeforeApproval
    changes.requireDocumentsBeforeApproval = body.requireDocumentsBeforeApproval
  }
  if (body.allowPartialApprovals !== undefined) {
    settings.allowPartialApprovals = body.allowPartialApprovals
    changes.allowPartialApprovals = body.allowPartialApprovals
  }
  if (body.maxConcurrentApplicationsPerBorrower !== undefined) {
    if (body.maxConcurrentApplicationsPerBorrower < 1 || body.maxConcurrentApplicationsPerBorrower > 10) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Max concurrent applications must be between 1 and 10',
      })
    }
    settings.maxConcurrentApplicationsPerBorrower = body.maxConcurrentApplicationsPerBorrower
    changes.maxConcurrentApplicationsPerBorrower = body.maxConcurrentApplicationsPerBorrower
  }

  await settings.save()

  // Log the action
  await logAction(event, {
    action: 'update',
    entity: 'tenant-settings',
    entityId: settings._id,
    tenantId: user.tenantId,
    metadata: { changes },
  })

  console.log(`Tenant settings updated for tenant: ${user.tenantId}`)

  return {
    id: settings._id.toString(),
    tenantId: settings.tenantId.toString(),
    branding: settings.branding,
    notifications: settings.notifications,
    approvalRules: settings.approvalRules,
    defaultLoanOfficerId: settings.defaultLoanOfficerId?.toString() || null,
    requireDocumentsBeforeApproval: settings.requireDocumentsBeforeApproval,
    allowPartialApprovals: settings.allowPartialApprovals,
    maxConcurrentApplicationsPerBorrower: settings.maxConcurrentApplicationsPerBorrower,
    createdAt: settings.createdAt,
    updatedAt: settings.updatedAt,
  }
})
