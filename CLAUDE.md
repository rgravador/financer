# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Ascendent** is a multi-tenant lending platform built with Nuxt 3 (SPA mode), TypeScript, Vuetify 3, MongoDB Atlas, and Tauri for desktop packaging. It provides role-based access control for managing loan applications across multiple financial institutions.

**Current Status:** Steps 1-5, 10-11 complete (see `docs/plans/ascendent-compound-engineering-plan.md`)

### Tech Stack
- **Frontend:** Nuxt 3 (SPA mode, `ssr: false`) + Vue 3 + TypeScript
- **UI:** Vuetify 3 (heavily customized theme, no Material Design defaults)
- **State:** Pinia stores
- **Backend:** Nuxt server/api routes
- **Database:** MongoDB Atlas with Mongoose
- **Auth:** JWT (access + refresh tokens)
- **Cache:** Redis (rate limiting, sessions)
- **Storage:** Cloudinary (file uploads)
- **Desktop:** Tauri (cross-platform native apps)

### User Roles
1. **System Admin** (`system_admin`) - Platform-wide management, null tenantId
2. **Tenant Admin** (`tenant_admin`) - Organization management
3. **Tenant Officer** (`tenant_officer`) - Create loan applications
4. **Tenant Approver** (`tenant_approver`) - Review and approve loans

## Common Commands

### Development
```bash
# Start development server (http://localhost:3000)
npm run dev

# Development with Tauri desktop app
npm run dev:desktop

# Database seeding (creates test users and tenants)
npm run seed
```

**Default Seed Users:**
- System Admin: `admin@ascendent.com` / `Admin@123`
- Demo Tenant Admin: `demo.admin@ascendent.com` / `Demo@123`

### Building
```bash
# Build web SPA
npm run build

# Build production server
npm run build:server

# Generate static SPA
npm run generate

# Build desktop app (Tauri)
npm run build:desktop

# Preview production build
npm run preview

# Start production server
npm start
```

### Testing
```bash
# No test suite currently configured
# Playwright is installed but tests not yet implemented
```

## Architecture Patterns

### 1. Multi-Tenancy Model

**Tenant Isolation:**
- System admins have `tenantId: null` (enforced at model validation)
- All other roles MUST have a `tenantId` reference
- API routes enforce tenant scoping via role guards

**Role Guards (server/utils/requireRole.ts):**
```typescript
// Require specific role(s)
requireRole(event, 'tenant_admin')
requireRole(event, ['tenant_admin', 'system_admin'])

// Convenience helpers
requireSystemAdmin(event)
requireTenantAdmin(event)
requireAnyAdmin(event)
requireTenantAccess(event)
```

### 2. Authentication Flow

**JWT Implementation:**
- Access tokens: 15 minutes (default)
- Refresh tokens: 7 days (default)
- Token verification in `server/middleware/auth.ts`
- Public routes whitelist: `/api/auth/login`, `/api/auth/refresh`

**Auth Middleware:**
- Runs on ALL `/api/**` routes except whitelisted public routes
- Extracts Bearer token from Authorization header
- Attaches decoded user to `event.context.user`
- Throws 401 for missing/invalid tokens

**Security Features:**
- CSRF protection (server/middleware/csrf.ts)
- Rate limiting (server/middleware/rate-limit.ts)
- Password strength validation (zxcvbn)
- Session management with refresh token rotation
- File upload validation
- Security headers (CSP, HSTS, X-Frame-Options)

### 3. API Structure

**Route Organization:**
```
/server/api/
  auth/              # Authentication endpoints
    login.post.ts
    refresh.post.ts
    me.get.ts
    logout.post.ts
    sessions.get.ts
  system/            # System admin only
    tenants/
      index.get.ts   # List tenants
      index.post.ts  # Create tenant
      [id].get.ts
      [id].patch.ts
    audit-logs.get.ts
    stats.get.ts
  tenant/            # Tenant-scoped (admin/officer/approver)
    users/
      index.get.ts
      index.post.ts
      [id].patch.ts
      [id].delete.ts
    loan-types/
    audit-logs.get.ts
    stats.get.ts
  borrowers/         # Borrower management
  loans/             # Loan applications
  approver/          # Approver-specific
    queue.get.ts
    stats.get.ts
  officer/
    stats.get.ts
  notifications/
```

**API Conventions:**
- Use `requireRole()` at the start of protected endpoints
- Return typed responses matching model interfaces
- Use proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
- Tenant-scoped queries filter by `tenantId` from `event.context.user`

### 4. Database Models

**Location:** `server/models/`

**Model Patterns:**
- Use Mongoose with TypeScript interfaces
- Enable timestamps: `{ timestamps: true }`
- Export both interface and model
- Use virtuals for computed fields (e.g., `fullName`)
- Create indexes for frequently queried fields
- Validate tenant relationships at schema level

**Key Models:**
- `Tenant` - Organizations
- `User` - Platform users with roles
- `RefreshToken` - JWT refresh token tracking
- `PasswordResetToken` - Password reset flows
- `LoanType` - Tenant-specific loan products
- `LoanApplication` - Loan requests
- `Borrower` - Loan applicants
- `Notification` - In-app notifications
- `AuditLog` - System audit trail

### 5. State Management (Pinia)

**Store Location:** `stores/`

**Available Stores:**
- `auth.ts` - Authentication, current user, session
- `users.ts` - User management (tenant-scoped)
- `system.ts` - System admin operations
- `loanTypes.ts` - Loan type CRUD
- `loans.ts` - Loan application management
- `borrowers.ts` - Borrower management
- `notifications.ts` - Notification handling

**Store Pattern:**
- Use Composition API style (`defineStore` with setup function)
- Export typed composables (e.g., `useAuthStore()`)
- Call API routes via `$fetch`
- Store JWT in localStorage (access token)
- Handle token refresh automatically

### 6. Vuetify Customization

**Theme Files:** `styles/vuetify/`
- `_variables.scss` - Color palette, typography
- `_components.scss` - Component overrides
- `index.scss` - Main theme entry

**Design System:**
- **Primary:** `#2563EB` (modern blue)
- **Success:** `#10B981` (emerald)
- **Warning:** `#F59E0B` (amber)
- **Error:** `#EF4444` (red)
- **Typography:** Inter font family (not Roboto)
- **Buttons:** No uppercase, 12px border radius, flat by default
- **Cards:** Elevation 1 (subtle shadows), 12px border radius

**IMPORTANT:** Ascendent theme is heavily customized AWAY from Material Design defaults. See `docs/VUETIFY_CUSTOMIZATION.md` for detailed guidelines.

**Component Defaults:**
```typescript
// nuxt.config.ts vuetify configuration
{
  VBtn: { style: 'text-transform: none;', elevation: 0 },
  VCard: { elevation: 1, rounded: 'lg' },
  VTextField: { variant: 'outlined', color: 'primary' },
}
```

### 7. Server Utilities

**Key Utilities (server/utils/):**
- `db.ts` - MongoDB singleton connection
- `jwt.ts` - JWT token generation/verification
- `requireRole.ts` - Role-based access control guards
- `password.ts` - Password hashing (bcrypt) and validation (zxcvbn)
- `csrf.ts` - CSRF token generation/validation
- `rateLimiter.ts` - Redis-based rate limiting
- `validation.ts` - Input validation helpers
- `audit.ts` - Audit log creation
- `cloudinary.ts` - File upload to Cloudinary
- `fileValidation.ts` - File type and malware validation

## Code Conventions

### TypeScript
- **Strict mode enabled** in `tsconfig.json`
- **Type checking disabled** in nuxt.config.ts (legacy Ant Design migration pending)
- Always define interfaces for API responses and model data
- Use `Types.ObjectId` from mongoose for ObjectId references

### API Response Format
```typescript
// Standard success response
return {
  success: true,
  data: { /* result */ }
}

// Standard error (use createError)
throw createError({
  statusCode: 400,
  statusMessage: 'Validation failed'
})
```

### Role-Based Route Protection
```typescript
// server/api/tenant/users/index.get.ts
export default defineEventHandler(async (event) => {
  // Require tenant admin role
  const user = requireTenantAdmin(event)

  // Scope query to user's tenant
  const users = await User.find({ tenantId: user.tenantId })

  return { success: true, data: users }
})
```

### Mongoose Model Export Pattern
```typescript
// server/models/User.ts
export interface IUser extends Document {
  tenantId: Types.ObjectId | null
  role: UserRole
  email: string
  // ... fields
}

const UserSchema = new Schema<IUser>({ /* ... */ })

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
```

### Environment Variables
```bash
# Required .env variables
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
REDIS_URL=redis://...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASSWORD=...
```

## File Organization Rules

- **API routes:** `server/api/` (file-based routing)
- **Server middleware:** `server/middleware/` (runs on all requests)
- **Mongoose models:** `server/models/` (PascalCase filenames)
- **Server utilities:** `server/utils/` (camelCase filenames)
- **Pinia stores:** `stores/` (camelCase filenames)
- **Pages:** `pages/` (Nuxt file-based routing, currently minimal)
- **Type definitions:** `types/` (shared TypeScript interfaces)
- **Documentation:** `docs/` (plans, brainstorms, guides)
- **Scripts:** `scripts/` (utility scripts like seed.ts)

**Note:** Most UI is currently rendered through the root `app.vue` with programmatic routing rather than pages/ directory.

## Development Workflow

1. **Check current branch:** Feature branches use `feature/*` naming
2. **Read the plan:** `docs/plans/ascendent-compound-engineering-plan.md` tracks implementation steps
3. **Follow Vuetify theme:** `docs/VUETIFY_CUSTOMIZATION.md` for UI consistency
4. **Run seeder after model changes:** `npm run seed` to populate test data
5. **Test with different roles:** Use seeded accounts to verify role-based access
6. **Check both light/dark themes:** Vuetify theme supports both modes

## Key Design Decisions

### SPA Mode (Not SSR)
- Nuxt configured with `ssr: false` for SPA-only rendering
- Enables Tauri desktop packaging
- Server API routes are separate from client rendering

### No File-Based Pages
- Most routing is programmatic via Vue Router
- Main UI in `app.vue` with conditional rendering
- Minimal use of `pages/` directory

### Tenant Scoping Strategy
- **System admins** operate platform-wide (tenantId: null)
- **Tenant users** scoped to single organization (required tenantId)
- API middleware enforces tenant isolation automatically
- No cross-tenant data leakage (queries filtered by user.tenantId)

### Audit Logging
- All state-changing operations logged to `AuditLog` model
- Includes action type, user, tenant, IP, changes
- System admins can view all logs, tenant admins see tenant-scoped logs

### Authentication Strategy
- Short-lived access tokens (15m) for API calls
- Long-lived refresh tokens (7d) for session persistence
- Refresh token rotation on use
- Session management API (`/api/auth/sessions`) to view/revoke active sessions

## Important Notes

- **No tests configured yet:** Playwright installed but test suite not implemented
- **TypeScript checking disabled:** Legacy Ant Design components need migration to Vuetify
- **Wireframes exist:** HTML wireframes were created in early planning but not currently in repo
- **Desktop app:** Tauri configured but not yet fully tested/deployed
- **Deployment planned:** Vercel (web) + Railway (API server) - not yet configured
