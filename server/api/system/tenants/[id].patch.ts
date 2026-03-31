import { connectDB } from '~/server/utils/db'
import Tenant, { type ITenantAddress, type ITenantContact } from '~/server/models/Tenant'
import { requireSystemAdmin } from '~/server/utils/requireRole'
import { validateTenantName, validateEmail, validateURL } from '~/server/utils/validation'
import { logAction } from '~/server/utils/audit'
import mongoose from 'mongoose'

interface UpdateTenantBody {
  name?: string
  slug?: string
  logo?: string
  address?: ITenantAddress
  contact?: ITenantContact
  isActive?: boolean
}

/**
 * PATCH /api/system/tenants/[id]
 *
 * Update tenant details including name, slug, logo, address, contact, and isActive status
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
  const body = await readBody<UpdateTenantBody>(event)
  const { name, slug, logo, address, contact, isActive } = body

  // Validate at least one field is provided
  const hasUpdates = [name, slug, logo, address, contact, isActive].some(v => v !== undefined)
  if (!hasUpdates) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one field must be provided for update',
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

  // Validate slug if provided
  if (slug !== undefined) {
    if (!/^[a-z0-9-]+$/.test(slug)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug must contain only lowercase letters, numbers, and hyphens',
      })
    }
    if (slug.length < 2 || slug.length > 50) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Slug must be between 2 and 50 characters',
      })
    }
  }

  // Validate contact email if provided
  if (contact?.email && !validateEmail(contact.email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid contact email address',
    })
  }

  // Validate contact website if provided
  if (contact?.website && !validateURL(contact.website)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid website URL',
    })
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

  // Check slug uniqueness if changing
  if (slug !== undefined && slug !== tenant.slug) {
    const existingTenant = await Tenant.findOne({ slug, _id: { $ne: tenantId } })
    if (existingTenant) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A tenant with this slug already exists',
      })
    }
  }

  // Update fields
  if (name !== undefined) {
    tenant.name = name
  }
  if (slug !== undefined) {
    tenant.slug = slug
  }
  if (logo !== undefined) {
    tenant.logo = logo
  }
  if (address !== undefined) {
    tenant.address = { ...tenant.address, ...address }
  }
  if (contact !== undefined) {
    tenant.contact = { ...tenant.contact, ...contact }
  }
  if (isActive !== undefined) {
    tenant.isActive = isActive
  }

  await tenant.save()

  // Log audit action
  await logAction(event, {
    action: 'tenant.update',
    entity: 'Tenant',
    entityId: tenant._id,
    metadata: {
      name: tenant.name,
      slug: tenant.slug,
      fieldsUpdated: Object.keys(body).filter(k => body[k as keyof UpdateTenantBody] !== undefined),
    },
  })

  return {
    id: tenant._id.toString(),
    name: tenant.name,
    slug: tenant.slug,
    logo: tenant.logo,
    address: tenant.address,
    contact: tenant.contact,
    isActive: tenant.isActive,
    createdAt: tenant.createdAt,
    updatedAt: tenant.updatedAt,
  }
})
