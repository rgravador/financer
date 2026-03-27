import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import Tenant from '~/server/models/Tenant'
import { requireSystemAdmin } from '~/server/utils/requireRole'
import { validateEmail } from '~/server/utils/validation'
import { logAction } from '~/server/utils/audit'
import mongoose from 'mongoose'

/**
 * PATCH /api/system/tenants/[id]/users/[userId]
 *
 * Update a tenant administrator's profile
 * Requires role: system_admin
 */
export default defineEventHandler(async (event) => {
  // Require system admin role
  const currentUser = requireSystemAdmin(event)

  // Get tenant ID and user ID from route params
  const tenantId = getRouterParam(event, 'id')
  const userId = getRouterParam(event, 'userId')

  if (!tenantId || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tenant ID and User ID are required',
    })
  }

  // Validate ObjectId formats
  if (!mongoose.Types.ObjectId.isValid(tenantId) || !mongoose.Types.ObjectId.isValid(userId)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid ID format',
    })
  }

  // Parse request body
  const body = await readBody<{
    firstName?: string
    lastName?: string
    email?: string
    isActive?: boolean
  }>(event)

  const { firstName, lastName, email, isActive } = body

  // Validate at least one field is provided
  if (firstName === undefined && lastName === undefined && email === undefined && isActive === undefined) {
    throw createError({
      statusCode: 400,
      statusMessage: 'At least one field must be provided: firstName, lastName, email, or isActive',
    })
  }

  // Validate email if provided
  if (email !== undefined && !validateEmail(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email address',
    })
  }

  // Validate name lengths if provided
  if (firstName !== undefined && (firstName.trim().length < 2 || firstName.trim().length > 50)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'First name must be between 2 and 50 characters',
    })
  }

  if (lastName !== undefined && (lastName.trim().length < 2 || lastName.trim().length > 50)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Last name must be between 2 and 50 characters',
    })
  }

  await connectDB()

  // Verify tenant exists
  const tenant = await Tenant.findById(tenantId)
  if (!tenant) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant not found',
    })
  }

  // Find the user
  const user = await User.findOne({
    _id: userId,
    tenantId,
    role: 'tenant_admin',
    deletedAt: null,
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Tenant admin not found',
    })
  }

  // If email is being changed, check for duplicates
  if (email !== undefined && email.toLowerCase() !== user.email) {
    const existingUser = await User.findOne({
      email: email.toLowerCase(),
      _id: { $ne: userId },
    })
    if (existingUser) {
      throw createError({
        statusCode: 409,
        statusMessage: 'A user with this email already exists',
      })
    }
  }

  // Track changes for audit log
  const changes: Record<string, { from: any; to: any }> = {}

  // Apply updates
  if (firstName !== undefined) {
    changes.firstName = { from: user.firstName, to: firstName.trim() }
    user.firstName = firstName.trim()
  }

  if (lastName !== undefined) {
    changes.lastName = { from: user.lastName, to: lastName.trim() }
    user.lastName = lastName.trim()
  }

  if (email !== undefined) {
    changes.email = { from: user.email, to: email.toLowerCase() }
    user.email = email.toLowerCase()
  }

  if (isActive !== undefined) {
    changes.isActive = { from: user.isActive, to: isActive }
    user.isActive = isActive
  }

  await user.save()

  // Log the action
  await logAction(event, {
    action: 'update',
    entity: 'user',
    entityId: user._id,
    tenantId,
    metadata: {
      changes,
      updatedBy: currentUser.sub,
    },
  })

  console.log(`Tenant admin updated: ${user.email}`)

  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    mustChangePassword: user.mustChangePassword,
    tenantId: user.tenantId.toString(),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
})
