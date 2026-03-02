// Simple in-memory rate limiter
// For production, consider using Redis for distributed rate limiting

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

// Clean up expired entries every minute
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now) {
      rateLimitStore.delete(key)
    }
  }
}, 60000)

export default defineEventHandler((event) => {
  const path = event.path

  // Skip rate limiting for health check and non-API routes
  if (!path.startsWith('/api') || path === '/api/health') {
    return
  }

  // Get client IP
  const headers = getHeaders(event)
  const ip = headers['x-forwarded-for'] || headers['x-real-ip'] || event.node.req.socket.remoteAddress || 'unknown'
  const clientIP = typeof ip === 'string' ? ip.split(',')[0].trim() : Array.isArray(ip) ? ip[0] : 'unknown'

  // Determine rate limit based on endpoint
  let limit = 100 // Default: 100 requests per minute
  let windowMs = 60000 // 1 minute

  // Stricter limit for auth endpoints
  if (path === '/api/auth/login' || path === '/api/auth/register') {
    limit = 10 // 10 requests per minute
  }

  // Create rate limit key
  const key = `${clientIP}:${path}`
  const now = Date.now()

  // Get or create rate limit entry
  let entry = rateLimitStore.get(key)

  if (!entry || entry.resetAt < now) {
    // Create new entry or reset expired entry
    entry = {
      count: 1,
      resetAt: now + windowMs,
    }
    rateLimitStore.set(key, entry)
  } else {
    // Increment count
    entry.count++
  }

  // Set rate limit headers
  setHeader(event, 'X-RateLimit-Limit', limit.toString())
  setHeader(event, 'X-RateLimit-Remaining', Math.max(0, limit - entry.count).toString())
  setHeader(event, 'X-RateLimit-Reset', entry.resetAt.toString())

  // Check if limit exceeded
  if (entry.count > limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    setHeader(event, 'Retry-After', retryAfter.toString())

    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: `Rate limit exceeded. Please try again in ${retryAfter} seconds.`,
    })
  }
})
