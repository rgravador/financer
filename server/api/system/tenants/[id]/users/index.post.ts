import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import Tenant from '~/server/models/Tenant'
import SystemSettings, { SETTING_KEYS } from '~/server/models/SystemSettings'
import { requireSystemAdmin } from '~/server/utils/requireRole'
import { validateEmail } from '~/server/utils/validation'
import { hashPassword, generateTemporaryPassword } from '~/server/utils/password'
import { logAction } from '~/server/utils/audit'
import mongoose from 'mongoose'

/**
 * POST /api/system/tenants/[id]/users
 *
 * Create a new tenant administrator for a specific tenant
 * Generates a temporary password that must be changed on first login
 * Requires role: system_admin
 */
export default defineEventHandler(async (event) => {
  // Require system admin role
  const currentUser = requireSystemAdmin(event)

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
  const body = await readBody<{
    email: string
    firstName: string
    lastName: string
  }>(event)

  const { email, firstName, lastName } = body

  // Validate required fields
  if (!email || !firstName || !lastName) {
    throw createError({
      statusCode: 400,
      statusMessage: 'All fields are required: email, firstName, lastName',
    })
  }

  // Validate email format
  if (!validateEmail(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email address',
    })
  }

  // Validate name length
  if (firstName.trim().length < 2 || firstName.trim().length > 50) {
    throw createError({
      statusCode: 400,
      statusMessage: 'First name must be between 2 and 50 characters',
    })
  }

  if (lastName.trim().length < 2 || lastName.trim().length > 50) {
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

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() })
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'A user with this email already exists',
    })
  }

  // Check for default password setting
  const defaultPasswordSetting = await SystemSettings.findOne({
    key: SETTING_KEYS.DEFAULT_TENANT_ADMIN_PASSWORD,
  })

  // Use default password if configured, otherwise generate a random one
  const tempPassword = defaultPasswordSetting?.value || generateTemporaryPassword()
  const passwordHash = await hashPassword(tempPassword)
  const isUsingDefaultPassword = !!defaultPasswordSetting?.value

  // Create tenant admin
  const user = await User.create({
    email: email.toLowerCase(),
    firstName: firstName.trim(),
    lastName: lastName.trim(),
    role: 'tenant_admin',
    passwordHash,
    tenantId,
    isActive: true,
    mustChangePassword: true,
  })

  // Log the action
  await logAction(event, {
    action: 'create',
    entity: 'user',
    entityId: user._id,
    tenantId,
    metadata: {
      email: user.email,
      role: 'tenant_admin',
      createdBy: currentUser.sub,
      usedDefaultPassword: isUsingDefaultPassword,
    },
  })

  console.log(`Tenant admin created: ${user.email} for tenant ${tenant.name}`)

  // Return user with temporary password (only shown once)
  return {
    user: {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
      mustChangePassword: user.mustChangePassword,
      tenantId: user.tenantId.toString(),
      createdAt: user.createdAt,
    },
    temporaryPassword: tempPassword,
    usedDefaultPassword: isUsingDefaultPassword,
    message: isUsingDefaultPassword
      ? 'Tenant admin created successfully using the configured default password.'
      : 'Tenant admin created successfully. Please provide the temporary password to the user securely.',
  }
})
