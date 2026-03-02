import { connectDB } from '~/server/utils/db'
import Tenant from '~/server/models/Tenant'
import { requireSystemAdmin } from '~/server/utils/requireRole'
import { validateTenantName } from '~/server/utils/validation'
import mongoose from 'mongoose'

/**
 * PATCH /api/system/tenants/[id]
 *
 * Update tenant name or isActive status
 * Requires role: system_admin
 */
export default defineEventHandler(async (event) => {
  // Require system admin role
  requireSystemAdmin(event)

  // Get tenant ID from route params
  const tenantId = getRouterParam(event, 'id')

  if (!tenantId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tenant ID is required',
    })
  }

  // Validate ObjectId format
  if (!mongoose.Types.ObjectId.isValid(tenantId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid tenant ID format',
    })
  }

  // Parse request body
  const body = await readBody<{ name?: string; isActive?: boolean }>(event)
  const { name, isActive } = body

  // Validate at least one field is provided
  if (name === undefined && isActive === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one field (name or isActive) must be provided',
    })
  }

  // Validate name if provided
  if (name !== undefined) {
    const nameValidation = validateTenantName(name)
    if (!nameValidation.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: nameValidation.errors.join(', '),
      })
    }
  }

  // Validate isActive if provided
  if (isActive !== undefined && typeof isActive !== 'boolean') {
    throw createError({
      statusCode: 400,
      statusMessage: 'isActive must be a boolean',
    })
  }

  await connectDB()

  // Find tenant
  const tenant = await Tenant.findById(tenantId)

  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found',
    })
  }

  // Update fields
  if (name !== undefined) {
    tenant.name = name
  }
  if (isActive !== undefined) {
    tenant.isActive = isActive
  }

  await tenant.save()

  console.log(`Tenant updated: ${tenant.name} (${tenant.slug})`)

  return {
    id: tenant._id.toString(),
    name: tenant.name,
    slug: tenant.slug,
    isActive: tenant.isActive,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  }
})
