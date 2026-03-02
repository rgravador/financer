import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'
import { requireTenantAdmin } from '~/server/utils/requireRole'
import { validateEmail, validatePassword } from '~/server/utils/validation'
import { hashPassword } from '~/server/utils/password'

/**
 * POST /api/tenant/users
 *
 * Create a new user within the tenant admin's organization
 * Requires role: tenant_admin
 */
export default defineEventHandler(async (event) => {
  // Require tenant admin role
  const currentUser = requireTenantAdmin(event)

  // Ensure user has a tenantId
  if (!currentUser.tenantId) {
    throw createError({
      statusCode: 403,
      statusMessage: 'User is not associated with a tenant',
    })
  }

  // Parse request body
  const body = await readBody<{
    email: string
    firstName: string
    lastName: string
    role: string
    password: string
  }>(event)

  const { email, firstName, lastName, role, password } = body

  // Validate required fields
  if (!email || !firstName || !lastName || !role || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'All fields are required: email, firstName, lastName, role, password',
    })
  }

  // Validate email
  if (!validateEmail(email)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid email address',
    })
  }

  // Validate password
  const passwordValidation = validatePassword(password)
  if (!passwordValidation.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: passwordValidation.errors.join(', '),
    })
  }

  // Validate role
  const allowedRoles = ['tenant_officer', 'tenant_approver', 'tenant_admin']
  if (!allowedRoles.includes(role)) {
    throw createError({
      statusCode: 400,
      statusMessage: `Role must be one of: ${allowedRoles.join(', ')}`,
    })
  }

  await connectDB()

  // Check if email already exists
  const existingUser = await User.findOne({ email })
  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: 'A user with this email already exists',
    })
  }

  // Hash password
  const passwordHash = await hashPassword(password)

  // Create user
  const user = await User.create({
    email,
    firstName,
    lastName,
    role,
    passwordHash,
    tenantId: currentUser.tenantId,
    isActive: true,
  })

  console.log(`User created: ${user.email} (${user.role}) in tenant ${currentUser.tenantId}`)

  // Return user without password hash
  return {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    isActive: user.isActive,
    tenantId: user.tenantId.toString(),
    createdAt: user.createdAt,
  }
})
