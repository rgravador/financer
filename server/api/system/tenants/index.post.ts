import { connectDB } from '~/server/utils/db'
import Tenant from '~/server/models/Tenant'
import { requireSystemAdmin } from '~/server/utils/requireRole'
import { validateTenantName, validateTenantSlug } from '~/server/utils/validation'
import { logAction } from '~/server/utils/audit'

/**
 * POST /api/system/tenants
 *
 * Create a new tenant organization
 * Requires role: system_admin
 */
export default defineEventHandler(async (event) => {
  // Require system admin role
  requireSystemAdmin(event)

  // Parse request body
  const body = await readBody<{ name: string; slug: string }>(event)
  const { name, slug } = body

  // Validate input
  if (!name || !slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tenant name and slug are required',
    })
  }

  // Validate tenant name
  const nameValidation = validateTenantName(name)
  if (!nameValidation.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: nameValidation.errors.join(', '),
    })
  }

  // Validate slug format
  const slugValidation = validateTenantSlug(slug)
  if (!slugValidation.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: slugValidation.errors.join(', '),
    })
  }

  await connectDB()

  // Check if slug already exists
  const existingTenant = await Tenant.findOne({ slug })
  if (existingTenant) {
    throw createError({
      statusCode: 409,
      statusMessage: 'A tenant with this slug already exists',
    })
  }

  // Create new tenant
  const tenant = await Tenant.create({
    name,
    slug,
    isActive: true,
  })

  // Log audit action
  await logAction(event, {
    action: 'tenant.create',
    entity: 'Tenant',
    entityId: tenant._id,
    metadata: {
      name: tenant.name,
      slug: tenant.slug,
    },
  })

  return {
    id: tenant._id.toString(),
    name: tenant.name,
    slug: tenant.slug,
    isActive: tenant.isActive,
    createdAt: tenant.createdAt,
  }
})
