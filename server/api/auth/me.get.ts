import { connectDB } from '~/server/utils/db'
import User from '~/server/models/User'

export default defineEventHandler(async (event) => {
  try {
    // Get user from context (set by auth middleware)
    const user = event.context.user

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Not authenticated',
      })
    }

    // Connect to database
    await connectDB()

    // Fetch fresh user data
    const userData = await User.findById(user.sub).lean()

    if (!userData || !userData.isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: 'User not found or inactive',
      })
    }

    // Return user data (without password hash)
    return {
      _id: userData._id.toString(),
      tenantId: userData.tenantId ? userData.tenantId.toString() : null,
      role: userData.role,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isActive: userData.isActive,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    }
  } catch (error: any) {
    // If it's already an H3Error, rethrow it
    if (error.statusCode) {
      throw error
    }

    // Log unexpected errors
    console.error('Get user error:', error)

    // Return generic error
    throw createError({
      statusCode: 500,
      statusMessage: 'An error occurred while fetching user',
    })
  }
})
