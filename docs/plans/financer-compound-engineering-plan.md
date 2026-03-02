# Financer — Compound Engineering Plan

**Multi-Tenant Lender Application**
Version 1.1 | February 2026 (Updated with Security Hardening)

-----

## Overview

This document outlines the Compound Engineering build plan for **Financer**, a multi-tenant lending platform built with Nuxt 3 (SPA), TypeScript, Pinia, MongoDB Atlas, JWT authentication, and Tauri for desktop packaging. Each step is a self-contained compound prompt designed to be executed sequentially in Claude Code, where each module builds cleanly on the last.

**Version 1.1 Update:** Added comprehensive security hardening (Step 3) covering account protection, CSRF, input validation, file upload security, session management, and password reset flows to ensure production-ready security posture.

### Tech Stack Summary

|Layer           |Technology                             |
|----------------|---------------------------------------|
|Frontend        |Nuxt 3 (SPA, `ssr: false`) + TypeScript|
|State Management|Pinia                                  |
|Backend API     |Nuxt server/api                        |
|Database        |MongoDB Atlas (Mongoose)               |
|Authentication  |JWT (access + refresh tokens)          |
|Caching/Sessions|Redis (rate limiting, session storage) |
|Email Service   |SMTP (password reset, notifications)  |
|File Storage    |Cloudinary                             |
|Desktop Shell   |Tauri                                  |
|Web Hosting     |Vercel (frontend) + Railway (API)      |

### Role Hierarchy

|Role           |Scope        |Key Capabilities                          |
|---------------|-------------|------------------------------------------|
|System Admin   |Platform-wide|Manage tenants, suspend/activate orgs     |
|Tenant Admin   |Organization |Manage users, loan types, view pipeline   |
|Tenant Officer |Tenant-scoped|Create applications, upload documents     |
|Tenant Approver|Tenant-scoped|Review, approve, reject, request documents|

-----

## Step 1 — Project Scaffold

**Goal:** Initialize the full project structure, configure Nuxt 3 SPA mode, connect MongoDB Atlas, and set up Tauri for desktop support.

**Compound Prompt:**

```
Scaffold a Nuxt 3 SPA (ssr: false) TypeScript project named "Financer" for a multi-tenant lending application.

Requirements:
- Set ssr: false in nuxt.config.ts
- Install and configure Pinia for state management (@pinia/nuxt)
- Install Mongoose and create a MongoDB Atlas connection utility at /server/utils/db.ts
  - The connection should be a singleton (cached) to prevent multiple connections
  - Load MONGODB_URI from .env
- Create the following folder structure:
  /server/api/         (API routes)
  /server/middleware/  (server-side auth middleware)
  /server/utils/       (db.ts, jwt.ts)
  /stores/             (Pinia stores)
  /composables/        (reusable composables)
  /middleware/         (Nuxt client-side route guards)
  /types/              (TypeScript interfaces)

- Create a .env.example with:
  MONGODB_URI=
  JWT_SECRET=
  JWT_REFRESH_SECRET=
  JWT_EXPIRES_IN=15m
  JWT_REFRESH_EXPIRES_IN=7d
  CLOUDINARY_CLOUD_NAME=
  CLOUDINARY_API_KEY=
  CLOUDINARY_API_SECRET=

- Create the following Mongoose models in /server/models/:

Tenant model (tenants collection):
  - name: string (required)
  - slug: string (required, unique)
  - isActive: boolean (default: true)
  - createdAt, updatedAt (timestamps)

User model (users collection):
  - tenantId: ObjectId (ref: Tenant, nullable for system_admin)
  - role: enum ['system_admin', 'tenant_admin', 'tenant_officer', 'tenant_approver']
  - email: string (required, unique)
  - passwordHash: string (required)
  - firstName: string
  - lastName: string
  - isActive: boolean (default: true)
  - createdAt, updatedAt (timestamps)

- Create TypeScript interfaces in /types/index.ts mirroring the models
- Install Tauri CLI as a dev dependency and initialize Tauri pointing to the Nuxt SPA build output (dist/)
- Add these scripts to package.json:
  "build:web": "nuxt build"
  "build:desktop": "tauri build"
  "dev:desktop": "tauri dev"

- Create a README.md with setup instructions
```

**Expected Output:**

- Working Nuxt 3 SPA project
- MongoDB Atlas connection with singleton pattern
- Tenant and User mongoose models
- Tauri initialized
- TypeScript types defined
- .env.example ready

-----

## Step 2 — Authentication Module

**Goal:** Implement full JWT authentication with login, refresh tokens, role-based route guards, and Pinia auth store.

**Compound Prompt:**

```
Build the complete authentication module for the Financer multi-tenant app.

Server-side:

1. Create /server/utils/jwt.ts with:
   - signAccessToken(payload) → signs JWT with JWT_SECRET, expires in JWT_EXPIRES_IN
   - signRefreshToken(payload) → signs with JWT_REFRESH_SECRET, expires in JWT_REFRESH_EXPIRES_IN
   - verifyAccessToken(token) → returns decoded payload or throws
   - verifyRefreshToken(token) → returns decoded payload or throws
   - JWT payload shape: { sub: userId, tenantId, role, email }
   - System admins have tenantId: null

2. Create /server/utils/password.ts with:
   - hashPassword(plain: string): Promise<string> using bcrypt (salt rounds: 12)
   - comparePassword(plain: string, hash: string): Promise<boolean>

3. Create /server/api/auth/login.post.ts:
   - Accepts { email, password }
   - Finds user by email, verifies password
   - Returns { accessToken, refreshToken, user: { id, email, role, tenantId, firstName, lastName } }
   - Returns 401 if invalid credentials
   - Returns 403 if user or tenant is inactive

4. Create /server/api/auth/refresh.post.ts:
   - Accepts { refreshToken }
   - Verifies refresh token, issues new access token
   - Returns { accessToken }

5. Create /server/api/auth/me.get.ts:
   - Protected route — returns current user profile from token

6. Create /server/middleware/auth.ts (server middleware):
   - Runs on all /api/** routes EXCEPT /api/auth/login and /api/auth/refresh
   - Reads Authorization: Bearer <token> header
   - Verifies access token, attaches decoded user to event context (event.context.user)
   - Returns 401 if missing or invalid token

7. Create a database seeder script at /scripts/seed.ts:
   - Creates one system_admin user: admin@Financer.com / Admin@123
   - Logs credentials on completion

Client-side:

8. Create /stores/auth.ts (Pinia store) with:
   - State: { user, accessToken, refreshToken, isAuthenticated }
   - Actions: login(email, password), logout(), refreshToken(), fetchMe()
   - Persist accessToken and refreshToken in localStorage
   - Auto-refresh access token if expired (using refreshToken)

9. Create /middleware/auth.global.ts (Nuxt global middleware):
   - Redirects unauthenticated users to /login
   - Whitelists /login route

10. Create /middleware/role.ts (Nuxt named middleware):
    - Accepts allowed roles as route meta
    - Redirects unauthorized roles to /unauthorized

11. Create /pages/auth/login.vue:
    - Email + password form
    - Calls auth store login action
    - Redirects based on role after login:
      system_admin → /system/tenants
      tenant_admin → /admin/dashboard
      tenant_officer → /loans/applications
      tenant_approver → /approver/queue
    - Shows error on invalid credentials

12. Create /pages/unauthorized.vue with a simple access denied message

13. Create /composables/useAuth.ts:
    - Exposes: { user, isAuthenticated, role, tenantId, login, logout }
    - Helper: hasRole(roles[]) → boolean
```

**Expected Output:**

- Fully working login/logout flow
- JWT access + refresh token handling
- Server middleware protecting all API routes
- Role-based client-side page guards
- Seed script for first system admin

-----

## Step 3 — Security Hardening

**Goal:** Implement critical security controls including account protection, input validation, CSRF protection, and secure file handling to prevent common vulnerabilities.

**Compound Prompt:**

```
Implement comprehensive security hardening for Financer to protect against common vulnerabilities.

Server-side security utilities in /server/utils/:

1. Create /server/utils/validation.ts with input validation and sanitization:
   - sanitizeInput(input: string): string — removes HTML tags, SQL injection patterns
   - validateEmail(email: string): boolean — RFC 5322 compliant validation
   - validatePassword(password: string): { valid: boolean, errors: string[] }
     Password requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
   - sanitizeFilename(filename: string): string — removes path traversal patterns
   - Use validator.js or joi/zod for schema validation

2. Create /server/utils/rateLimiter.ts with account lockout:
   - Track failed login attempts per email in Redis (or in-memory Map if Redis not available)
   - lockAccount(email: string, duration: number) — lock for 30 minutes after 5 failed attempts
   - isAccountLocked(email: string): Promise<boolean>
   - resetLoginAttempts(email: string) — call on successful login
   - Integrate into /server/api/auth/login.post.ts

3. Create /server/utils/csrf.ts for CSRF protection:
   - generateCSRFToken(): string — generates cryptographically secure token
   - verifyCSRFToken(token: string, sessionToken: string): boolean
   - Store CSRF tokens in user session (httpOnly cookie or Redis)
   - Create server middleware /server/middleware/csrf.ts:
     - Runs on all POST/PUT/PATCH/DELETE requests
     - Reads X-CSRF-Token header, validates against session
     - Returns 403 if invalid or missing
     - Exclude /api/auth/login from CSRF (uses credentials instead)

4. Update /server/utils/password.ts with:
   - validatePasswordStrength(password: string): { score: number, feedback: string[] }
   - Use zxcvbn library for strength estimation
   - Prevent common passwords (top 10k list)

5. Create /server/models/PasswordResetToken.ts:
   - userId: ObjectId (ref: User)
   - token: string (hashed, 32-byte random token)
   - expiresAt: Date (valid for 1 hour)
   - used: boolean (default: false)
   - createdAt (timestamp)

6. Create password reset API routes:

   POST /server/api/auth/forgot-password.post.ts
   - Body: { email }
   - Finds user, creates PasswordResetToken
   - Sends email with reset link (token in URL)
   - Returns success message even if email not found (prevent enumeration)
   - Rate limit: 3 requests per hour per IP

   POST /server/api/auth/reset-password.post.ts
   - Body: { token, newPassword }
   - Validates token (not expired, not used)
   - Validates new password strength
   - Hashes password, updates user, marks token as used
   - Logs audit action: 'user.password_reset'

   POST /server/api/auth/change-password.post.ts (authenticated)
   - Body: { currentPassword, newPassword }
   - Requires valid access token
   - Verifies current password, validates new password
   - Updates password, invalidates all refresh tokens
   - Logs audit action: 'user.password_changed'

7. Create session revocation system:

   Create /server/models/RefreshToken.ts:
   - userId: ObjectId (ref: User)
   - token: string (hashed)
   - isRevoked: boolean (default: false)
   - expiresAt: Date
   - device: string (user agent)
   - ipAddress: string
   - createdAt (timestamp)

   Update /server/api/auth/login.post.ts:
   - Store refresh token in RefreshToken collection

   Update /server/api/auth/refresh.post.ts:
   - Check if refresh token is in database and not revoked
   - Return 401 if revoked or missing

   POST /server/api/auth/logout.post.ts (authenticated):
   - Marks current refresh token as revoked
   - Returns success

   POST /server/api/auth/logout-all.post.ts (authenticated):
   - Revokes all refresh tokens for current user
   - Useful for "logout all devices" feature

8. Secure file upload in /server/utils/fileValidation.ts:
   - validateFileType(mimeType: string, allowedTypes: string[]): boolean
   - validateFileSize(sizeInBytes: number, maxSizeInMB: number): boolean
   - scanFileForMalware(buffer: Buffer): Promise<{ safe: boolean, threat?: string }>
     - Use ClamAV integration or cloudinary's virus scanning
     - Or use a service like VirusTotal API
   - sanitizeFileName(filename: string): string — remove special chars, max 255 chars

   Update /server/api/loans/[id]/documents.post.ts:
   - Validate MIME type server-side (don't trust client)
   - Check magic numbers (file signature) not just extension
   - Scan for malware before uploading to Cloudinary
   - Enforce 10MB limit per file, 50MB total per application
   - Log document uploads in audit log

9. Add security headers middleware /server/middleware/securityHeaders.ts:
   - Runs on all responses
   - Sets headers:
     Content-Security-Policy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;"
     X-Content-Type-Options: "nosniff"
     X-Frame-Options: "DENY"
     X-XSS-Protection: "1; mode=block"
     Strict-Transport-Security: "max-age=31536000; includeSubDomains"
     Referrer-Policy: "strict-origin-when-cross-origin"
     Permissions-Policy: "geolocation=(), microphone=(), camera=()"

10. Add request validation middleware /server/middleware/validateRequest.ts:
    - Limits request body size to 15MB (10MB file + metadata)
    - Validates Content-Type header
    - Sanitizes all string inputs in req.body
    - Use Zod schemas per endpoint for type-safe validation

11. Update /server/api/auth/login.post.ts with security enhancements:
    - Check if account is locked (call isAccountLocked)
    - Increment failed login attempts on wrong password
    - Reset attempts on successful login
    - Log all login attempts (success and failure) in audit log
    - Add delay (100ms) on failed login to prevent timing attacks

Client-side security:

12. Create /composables/useCSRF.ts:
    - Fetches CSRF token from /api/auth/csrf endpoint on app mount
    - Stores token in memory (not localStorage)
    - Provides getCSRFToken() function
    - Auto-includes X-CSRF-Token header in all state-changing API calls

13. Update /stores/auth.ts with session management:
    - Actions: logout(), logoutAllDevices()
    - Clears all tokens on logout
    - Shows "Session expired" message on 401 errors

14. Create /pages/auth/forgot-password.vue:
    - Email input form
    - Calls /api/auth/forgot-password
    - Shows "Check your email" message (don't reveal if email exists)

15. Create /pages/auth/reset-password.vue:
    - Takes token from query param
    - New password + confirm password fields
    - Shows password strength indicator
    - Calls /api/auth/reset-password
    - Redirects to /login on success

16. Create /pages/account/security.vue (authenticated):
    - Change password form (current + new password)
    - Active sessions list (device, location, last active)
    - "Logout all devices" button
    - Password strength requirements display

Environment variables to add to .env.example:
  REDIS_URL=redis://localhost:6379 (for rate limiting and session storage)
  SMTP_HOST=
  SMTP_PORT=
  SMTP_USER=
  SMTP_PASSWORD=
  SMTP_FROM=noreply@Financer.com
  APP_URL=http://localhost:3000 (for password reset links)
  CLAMAV_HOST= (optional, for virus scanning)
  CLAMAV_PORT=

Install dependencies:
  npm install validator zxcvbn ioredis nodemailer @hapi/joi
  npm install -D @types/validator @types/nodemailer

Testing checklist:
  - Test account lockout after 5 failed logins
  - Test CSRF protection on all state-changing endpoints
  - Test password reset flow end-to-end
  - Test session revocation (logout, logout all)
  - Test file upload with malicious files
  - Test XSS attempts in all text inputs
  - Test SQL injection attempts in search/filter fields
```

**Expected Output:**

- Account lockout after 5 failed login attempts (30-minute cooldown)
- Password reset flow with secure token expiration
- CSRF protection on all state-changing operations
- Session revocation (single device and all devices)
- Secure file upload with MIME type validation and malware scanning
- Security headers preventing XSS, clickjacking, MIME sniffing
- Input sanitization and validation across all endpoints
- Audit logging for all security-relevant events
- Password strength requirements enforced
- Active session management UI

-----

## Step 4 — System Admin Module

**Goal:** Allow the system admin to create, view, and manage tenant organizations.

**Compound Prompt:**

```
Build the System Admin module for Financer. Only users with role 'system_admin' can access these routes.

Server-side API routes in /server/api/system/:

1. GET /server/api/system/tenants/index.get.ts
   - Returns all tenants with: id, name, slug, isActive, createdAt
   - Include counts: userCount, activeLoansCount (from users and loan_applications collections)
   - Requires role: system_admin (check event.context.user.role)

2. POST /server/api/system/tenants/index.post.ts
   - Creates a new tenant
   - Body: { name, slug }
   - Validates slug is unique and URL-safe (lowercase, hyphens only)
   - Returns created tenant

3. GET /server/api/system/tenants/[id].get.ts
   - Returns single tenant detail with user list

4. PATCH /server/api/system/tenants/[id].patch.ts
   - Updates tenant name or isActive status
   - Body: { name?, isActive? }

Create a role guard utility /server/utils/requireRole.ts:
   - requireRole(event, roles[]) → throws 403 if user's role is not in allowed list
   - Use this at the top of every protected route handler

Client-side pages (all require definePageMeta with role: ['system_admin']):

5. /pages/system/tenants/index.vue
   - Table of all tenants: name, slug, user count, active loans, status badge, created date
   - Stat cards at top: Total Tenants, Active, Suspended, Total Platform Users
   - "Add Tenant" button opens a modal/drawer

6. /pages/system/tenants/[id].vue
   - Tenant detail page
   - Shows tenant info, user list, and active/suspend toggle

7. Create /components/system/TenantFormModal.vue:
   - Form to create a new tenant (name, slug)
   - Auto-generates slug from name (lowercase, hyphens)
   - Emits 'created' event on success

8. Create /stores/system.ts (Pinia store):
   - State: { tenants, selectedTenant, loading }
   - Actions: fetchTenants(), createTenant(), updateTenant()
```

**Expected Output:**

- System admin can view all tenants with stats
- Create new tenant organizations
- Suspend/activate tenants
- All routes protected to system_admin role only

-----

## Step 5 — User Management Module

**Goal:** Allow tenant admins to invite and manage officers and approvers within their organization.

**Compound Prompt:**

```
Build the User Management module for Financer tenant admins.

Server-side API routes in /server/api/tenant/users/:

1. GET /server/api/tenant/users/index.get.ts
   - Returns all users in the calling user's tenantId
   - Requires role: tenant_admin
   - Never returns system_admin users

2. POST /server/api/tenant/users/index.post.ts
   - Creates a new user within the caller's tenantId
   - Body: { email, firstName, lastName, role, password }
   - role must be one of: tenant_officer, tenant_approver (tenant_admin can also create other admins)
   - Hashes password before saving
   - Returns created user (no passwordHash)

3. PATCH /server/api/tenant/users/[id].patch.ts
   - Updates user: firstName, lastName, role, isActive
   - Ensures user belongs to same tenantId as caller
   - Cannot modify system_admin users

4. DELETE /server/api/tenant/users/[id].delete.ts
   - Soft-deletes (sets isActive: false)
   - Ensures user belongs to same tenantId

Client-side:

5. /pages/admin/users/index.vue
   - Table: name, email, role badge, applications count, status, actions
   - "Invite User" button opens TenantUserFormModal
   - Requires role: ['tenant_admin']

6. /components/admin/TenantUserFormModal.vue
   - Form: firstName, lastName, email, role (dropdown: Officer / Approver), password
   - Role dropdown excludes system_admin

7. /stores/users.ts (Pinia store):
   - State: { users, loading }
   - Actions: fetchUsers(), createUser(), updateUser(), deactivateUser()

8. Create a reusable /components/shared/RoleBadge.vue component:
   - Accepts role prop
   - Renders color-coded badge per role:
     system_admin → dark navy
     tenant_admin → purple
     tenant_officer → blue
     tenant_approver → amber
```

**Expected Output:**

- Tenant admin can create officers and approvers
- All users strictly scoped to their tenantId
- Cannot view or modify users from other tenants
- Soft-delete (deactivate) users

-----

## Step 6 — Loan Types Module

**Goal:** Allow tenant admins to create and configure loan products with required documents and interest rate ranges.

**Compound Prompt:**

```
Build the Loan Types module for Financer.

Create Mongoose model /server/models/LoanType.ts:
  - tenantId: ObjectId (required, ref: Tenant)
  - name: string (required) e.g. "Business Loan", "Salary Loan", "OFW Loan"
  - description: string
  - defaultInterestRate: number (percentage, e.g. 12 for 12%)
  - minInterestRate: number (lower bound for officer suggestions)
  - maxInterestRate: number (upper bound for officer suggestions)
  - minLoanAmount: number
  - maxLoanAmount: number
  - availableTerms: number[] (months, e.g. [6, 12, 24, 36])
  - requiredDocuments: array of:
      { documentName: string, description: string, isRequired: boolean }
  - isActive: boolean (default: true)
  - createdAt, updatedAt (timestamps)

Add LoanType TypeScript interface to /types/index.ts

Server-side API routes /server/api/tenant/loan-types/:

1. GET index.get.ts — returns all loan types for caller's tenantId
2. POST index.post.ts — creates new loan type, scoped to caller's tenantId
   - Requires role: tenant_admin
3. GET [id].get.ts — returns single loan type (must belong to caller's tenantId)
4. PATCH [id].patch.ts — updates loan type fields
   - Requires role: tenant_admin
5. DELETE [id].delete.ts — soft-deletes (isActive: false)
   - Requires role: tenant_admin

Create a seeder function in /scripts/seed.ts that after creating the system admin,
also creates default loan types for any demo tenant with these defaults:

| Name           | Default Rate | Min Rate | Max Rate | Min Amount  | Max Amount   |
|----------------|-------------|---------|---------|------------|-------------|
| Business Loan  | 12%          | 10%      | 18%      | 50,000      | 5,000,000    |
| Salary Loan    | 10%          | 8%       | 15%      | 10,000      | 500,000      |
| OFW Loan       | 9%           | 7%       | 12%      | 20,000      | 1,000,000    |
| Personal Loan  | 14%          | 12%      | 20%      | 5,000       | 200,000      |
| Auto Loan      | 8%           | 6%       | 12%      | 100,000     | 3,000,000    |
| Housing Loan   | 7%           | 5%       | 10%      | 500,000     | 10,000,000   |

Include default requiredDocuments for each loan type (e.g. Business Loan: Government ID, Business Permit, Financial Statements, Collateral Documents).

Client-side:

6. /pages/admin/loan-types/index.vue
   - Cards showing: name, default rate, rate range, number of required docs, status badge
   - "New Loan Type" button
   - Requires role: ['tenant_admin']

7. /pages/admin/loan-types/[id].vue
   - Full edit form for loan type details and document requirements
   - Dynamic list of required documents — add/remove/toggle isRequired

8. /components/admin/LoanTypeForm.vue (reusable for create + edit):
   - Fields: name, description, defaultInterestRate, minInterestRate, maxInterestRate
   - Fields: minLoanAmount, maxLoanAmount, availableTerms (multi-select checkboxes)
   - Dynamic required documents section with add/remove buttons
   - Each document row: documentName, description, isRequired toggle

9. /stores/loanTypes.ts (Pinia store):
   - State: { loanTypes, loading }
   - Actions: fetchLoanTypes(), createLoanType(), updateLoanType(), deleteLoanType()
```

**Expected Output:**

- Tenant admin can create custom loan types
- Default seeded loan types for demo
- Document requirements per loan type with required/optional flag
- Interest rate ranges enforced at model level

-----

## Step 7 — Loan Application Module (Officer)

**Goal:** Allow loan officers to create loan applications, fill applicant details, suggest interest rates, upload required documents, and forward for approval.

**Compound Prompt:**

```
Build the Loan Application creation module for Financer loan officers.

Create Mongoose model /server/models/Notification.ts (used for notifying approvers):
  - tenantId: ObjectId (ref: Tenant)
  - userId: ObjectId (ref: User, recipient)
  - type: enum ['new_application', 'documents_uploaded', 'approved', 'rejected', 'pending_documents']
  - message: string
  - applicationId: ObjectId (ref: LoanApplication)
  - isRead: boolean (default: false)
  - createdAt (timestamps)

Add to /types/index.ts

Create Mongoose model /server/models/LoanApplication.ts:
  - tenantId: ObjectId (required, ref: Tenant)
  - loanTypeId: ObjectId (required, ref: LoanType)
  - assignedOfficerId: ObjectId (ref: User)
  - assignedApproverId: ObjectId (ref: User, nullable)

  - applicant: {
      firstName, lastName, email, contactNumber,
      address, employmentType (enum: employed/self_employed/business_owner/ofw/other),
      employer, monthlyIncome
    }

  - loanDetails: {
      requestedAmount: number,
      requestedTerm: number (months),
      suggestedInterestRate: number (officer's suggestion),
      officerNotes: string
    }

  - documents: array of {
      documentName: string,
      fileUrl: string,
      filePublicId: string (Cloudinary public ID),
      uploadedAt: Date,
      status: enum ['uploaded', 'pending', 'waived']
    }

  - followUpDocuments: array of {
      documentName: string,
      notes: string (explanation of why not yet provided),
      dueDate: Date
    }

  - status: enum [
      'draft', 'submitted', 'under_review',
      'pending_documents', 'approved', 'rejected', 'disbursed'
    ]

  - statusHistory: array of {
      status, changedBy (ObjectId ref: User), timestamp, notes
    }

  - finalInterestRate: number (set on approval)
  - createdAt, updatedAt (timestamps)

Add to /types/index.ts

Create Cloudinary upload utility /server/utils/cloudinary.ts:
  - uploadFile(base64: string, folder: string): Promise<{ url, publicId }>
  - deleteFile(publicId: string): Promise<void>
  - Use cloudinary v2 SDK, credentials from .env

Server-side API routes /server/api/loans/:

1. GET index.get.ts
   - Returns applications for officer's tenantId, filtered by assignedOfficerId if role is tenant_officer
   - Tenant admin sees all applications in their tenant
   - Supports query params: status, loanTypeId, page, limit

2. POST index.post.ts
   - Creates new application with status: 'draft'
   - Requires role: tenant_officer
   - Sets assignedOfficerId from token

3. GET [id].get.ts
   - Returns full application detail including populated loanType and user references
   - Validates tenantId match

4. PATCH [id].patch.ts
   - Updates draft application fields
   - Only allowed when status is 'draft'

5. POST /server/api/loans/[id]/documents.post.ts
   - Uploads a document to Cloudinary
   - Body: { documentName, fileBase64, mimeType }
   - Appends to application.documents array
   - Validates file type (pdf, jpg, png only) and size (max 10MB)

6. DELETE /server/api/loans/[id]/documents/[docId].delete.ts
   - Removes document from application and deletes from Cloudinary
   - Only allowed when status is 'draft' or 'pending_documents'

7. POST /server/api/loans/[id]/submit.post.ts
   - Changes status from 'draft' → 'submitted'
   - Validates: all isRequired documents from the loan type are uploaded
   - Returns 400 with list of missing required documents if validation fails
   - Appends to statusHistory
   - Triggers in-app notification to all tenant_approvers (create Notification records)

Client-side:

8. /pages/loans/applications/index.vue (Officer dashboard)
   - Table: Application ID, Applicant Name, Loan Type, Amount, Status badge, Submitted date, Actions
   - Pill tabs to filter by status
   - "New Application" button
   - Requires role: ['tenant_officer', 'tenant_admin']

9. /pages/loans/applications/new.vue (multi-step form wizard, 5 steps):
   Step 1: Select Loan Type (card grid of available loan types showing rate + docs count)
   Step 2: Applicant Information (personal + employment details)
   Step 3: Loan Details (amount, term, suggestedInterestRate with range validation, officer notes)
   Step 4: Upload Documents (checklist of required docs, upload per item, add follow-up notes for missing optional docs)
   Step 5: Review & Submit (summary of all data, submit button with validation check)

10. /pages/loans/applications/[id].vue (Officer view of existing application)
    - Shows all details, allows editing if status is 'draft'
    - Shows status history timeline
    - Document upload/remove if status is 'draft' or 'pending_documents'
    - "Submit for Approval" button (validates minimum docs)

11. /components/loans/DocumentUploader.vue:
    - Accepts documentName, isRequired props
    - File picker (pdf, jpg, png)
    - Shows upload progress
    - Preview link after upload
    - Emits 'uploaded' and 'removed' events

12. /components/loans/StatusTimeline.vue:
    - Renders statusHistory as a vertical timeline
    - Color-coded dots per status

13. /stores/loans.ts (Pinia store):
    - State: { applications, currentApplication, loading }
    - Actions: fetchApplications(), createApplication(), updateApplication(),
               uploadDocument(), removeDocument(), submitApplication()
```

**Expected Output:**

- Full multi-step application creation wizard
- Document upload to Cloudinary with validation
- Cannot submit without required documents
- Supports follow-up document notes for optional docs
- Status history tracked from first creation

-----

## Step 8 — Loan Approval Module (Approver)

**Goal:** Allow approvers to review applications, accept or override interest rate suggestions, request additional documents, and approve or reject loans.

**Compound Prompt:**

```
Build the Loan Approval module for Financer approvers.

Note: The Notification model was created in Step 7.

Server-side API routes:

1. GET /server/api/approver/queue.get.ts
   - Returns applications with status: 'submitted', 'under_review', 'pending_documents'
   - Scoped to caller's tenantId
   - Requires role: tenant_approver or tenant_admin
   - Include: applicant name, loan type name, requestedAmount, suggestedInterestRate,
     defaultInterestRate, documents count, submitted date, status

2. PATCH /server/api/loans/[id]/review.patch.ts
   - Changes status from 'submitted' → 'under_review'
   - Sets assignedApproverId to caller
   - Appends to statusHistory
   - Requires role: tenant_approver

3. POST /server/api/loans/[id]/approve.post.ts
   - Requires role: tenant_approver
   - Body: { finalInterestRate, notes }
   - Validates finalInterestRate is within loan type's min/max range
   - Changes status → 'approved'
   - Sets finalInterestRate on application
   - Appends to statusHistory with notes
   - Creates Notification records for the assigned officer and tenant admin

4. POST /server/api/loans/[id]/reject.post.ts
   - Requires role: tenant_approver
   - Body: { notes } (required — must provide rejection reason)
   - Changes status → 'rejected'
   - Appends to statusHistory with notes
   - Creates Notification for officer

5. POST /server/api/loans/[id]/request-documents.post.ts
   - Requires role: tenant_approver
   - Body: { requestedDocuments: [{ documentName, notes }], generalNotes }
   - Changes status → 'pending_documents'
   - Appends to followUpDocuments array
   - Appends to statusHistory
   - Creates Notification for officer

6. GET /server/api/notifications/index.get.ts
   - Returns unread notifications for current user (scoped by userId)
   
7. PATCH /server/api/notifications/[id]/read.patch.ts
   - Marks notification as read

Client-side:

8. /pages/approver/queue/index.vue
   - Pill tabs: All, Under Review, Pending Docs, New
   - Table: App ID, Applicant, Loan Type, Amount, Suggested Rate vs Default Rate, Docs status, Submitted date, Status, Action
   - Color highlight when suggested rate differs from default
   - "Review" button opens application detail
   - Requires role: ['tenant_approver', 'tenant_admin']

9. /pages/approver/queue/[id].vue (Full approval detail view):
   - Left panel:
     a. Applicant details summary
     b. Loan details with rate comparison box (default vs suggested, min/max range)
     c. Final Rate input field (pre-filled with suggested rate, editable within range)
     d. Document checklist (each doc: name, required/optional, uploaded/pending status, view link)
     e. Approver decision notes textarea
     f. Action buttons: "Request Documents", "Reject", "Approve"
   - Right panel:
     a. Status history timeline
     b. Loan summary (principal, rate, term, estimated monthly payment calculation)

10. /components/approver/RateDecisionBox.vue:
    - Shows: Default Rate, Suggested Rate, Allowable Range
    - Input for final approved rate
    - Validates input is within min/max range
    - Visual indicator when suggested rate is below default (potential savings for applicant)

11. /components/approver/RequestDocumentsModal.vue:
    - Add rows of { documentName, notes }
    - General notes field
    - Submit sends request-documents API call

12. /components/shared/NotificationBell.vue:
    - Bell icon with unread count badge
    - Dropdown listing recent notifications
    - Click marks as read and navigates to the application
    - Polls for new notifications every 60 seconds

13. Update /stores/loans.ts with approver actions:
    - Actions: fetchQueue(), startReview(), approveApplication(),
               rejectApplication(), requestDocuments()

14. Create /stores/notifications.ts (Pinia store):
    - State: { notifications, unreadCount }
    - Actions: fetchNotifications(), markAsRead(), markAllRead()
```

**Expected Output:**

- Approvers have a clear review queue with priority indicators
- Interest rate decision flow with validation
- Can request additional documents with specific notes
- Notifications delivered to officers and admins on every decision
- Status history fully tracked

-----

## Step 9 — Audit Log Module

**Goal:** Log every significant action across the platform with full context for compliance and traceability.

**Compound Prompt:**

```
Build the Audit Log module for Financer.

Create Mongoose model /server/models/AuditLog.ts:
  - tenantId: ObjectId (nullable, ref: Tenant — null for system-level actions)
  - userId: ObjectId (ref: User — who performed the action)
  - action: string (e.g. 'loan.submitted', 'loan.approved', 'user.created', 'tenant.suspended')
  - entity: string (e.g. 'LoanApplication', 'User', 'Tenant')
  - entityId: ObjectId
  - metadata: Mixed (any additional context — old values, new values, notes)
  - ipAddress: string
  - userAgent: string
  - createdAt (timestamp only, no updatedAt)

Create /server/utils/audit.ts:
  - logAction(event, { action, entity, entityId, metadata }) — utility function
  - Reads userId and tenantId from event.context.user
  - Reads IP from request headers
  - Creates AuditLog record
  - Fails silently (catch all errors, never break the main flow)

Integrate logAction into all existing route handlers:
  - user.created, user.updated, user.deactivated
  - tenant.created, tenant.updated, tenant.suspended
  - loanType.created, loanType.updated
  - loan.created, loan.submitted, loan.approved, loan.rejected,
    loan.pending_documents, loan.disbursed
  - document.uploaded, document.removed
  - auth.login, auth.logout

Server-side API routes:

1. GET /server/api/system/audit-logs.get.ts
   - Returns paginated audit logs for system admins (all tenants)
   - Query params: tenantId, action, entity, userId, dateFrom, dateTo, page, limit
   - Requires role: system_admin

2. GET /server/api/tenant/audit-logs.get.ts
   - Returns paginated audit logs scoped to caller's tenantId
   - Query params: action, entity, userId, dateFrom, dateTo, page, limit
   - Requires role: tenant_admin

Client-side:

3. /pages/system/audit-logs/index.vue (System Admin view)
   - Table: Timestamp, User, Tenant, Action, Entity, Details expand row
   - Filters: tenant dropdown, action, date range
   - Requires role: ['system_admin']

4. /pages/admin/audit-logs/index.vue (Tenant Admin view)
   - Same table scoped to their tenant
   - Filters: action, user, date range
   - Requires role: ['tenant_admin']
```

**Expected Output:**

- Every significant action logged immutably
- System admin can view platform-wide audit trail
- Tenant admin can view their organization’s audit trail
- Filterable and paginated

-----

## Step 10 — Dashboards Module

**Goal:** Build role-specific dashboards with relevant metrics and quick access to key workflows.

**Compound Prompt:**

```
Build role-specific dashboards for Financer.

Server-side API routes:

1. GET /server/api/system/stats.get.ts (System Admin dashboard data)
   - Returns: totalTenants, activeTenants, suspendedTenants, totalUsers, totalApplications,
     applicationsByStatus (grouped), recentTenants (last 5)

2. GET /server/api/tenant/stats.get.ts (Tenant Admin dashboard data)
   - Returns (scoped to tenantId): totalApplications, applicationsByStatus,
     totalOfficers, totalApprovers, pendingApprovalCount, approvedThisMonth,
     rejectedThisMonth, totalDisbursedAmount, recentApplications (last 5)

3. GET /server/api/approver/stats.get.ts (Approver dashboard data)
   - Returns: queueCount, reviewedToday, approvedTotal, rejectedTotal,
     avgProcessingTime (hours), pendingDocumentsCount

4. GET /server/api/officer/stats.get.ts (Officer dashboard data)
   - Returns: myApplications total, myApplicationsByStatus,
     draftCount, submittedCount, approvedCount

Client-side dashboard pages:

5. /pages/system/dashboard.vue (System Admin)
   - Stat cards: Total Tenants, Active Tenants, Total Users, Active Applications
   - Table: Recent tenants with status and loan counts

6. /pages/admin/dashboard.vue (Tenant Admin)
   - Stat cards: Total Applications, Pending Approval, Approved This Month, Team Members
   - Application status breakdown (visual list with counts)
   - Recent applications table
   - Quick links: Manage Users, Manage Loan Types

7. /pages/approver/dashboard.vue (Approver)
   - Stat cards: In Queue, Reviewed Today, Total Approved, Pending Documents
   - Queue preview table (first 5 applications)
   - "Go to Queue" button

8. /pages/officer/dashboard.vue (Officer — redirect to /loans/applications)
   - Stat cards: My Applications, Drafts, Submitted, Approved
   - Recent applications table
   - "New Application" prominent button

Create /components/shared/StatCard.vue:
  - Props: label, value, subtext, trend (up/down/neutral), color
  - Renders a clean stat card with optional trend indicator

Update the role-based redirect in /pages/auth/login.vue:
  - system_admin → /system/dashboard
  - tenant_admin → /admin/dashboard
  - tenant_officer → /officer/dashboard
  - tenant_approver → /approver/dashboard
```

**Expected Output:**

- Tailored dashboards per role with relevant KPIs
- No cross-tenant data leakage
- Role-appropriate quick actions

-----

## Step 11 — UI Polish & Shared Components

**Goal:** Build a consistent design system with shared components, loading states, and error handling throughout the app.

**Compound Prompt:**

```
Build the shared UI component library and apply consistent styling across Financer.

Install and configure:
- @nuxtjs/tailwindcss (if not already present)
- Configure tailwind.config.ts with the Financer color palette:
  navy: '#1A1A2E', accent: '#2D5BE3', success: '#1A8A5A',
  warning: '#C47A1A', danger: '#C42A2A'

Create the following shared components in /components/shared/:

1. AppLayout.vue — base layout wrapper with sidebar + topbar
   - Sidebar with role-appropriate navigation links
   - Top bar with page title, notification bell, user avatar + name + logout
   - Responsive (collapsible sidebar on mobile)

2. AppSidebar.vue — navigation sidebar
   - Dynamic links based on user role (computed from useAuth)
   - Active state highlighting
   - Logo at top

3. AppTopbar.vue — top navigation bar
   - Page title slot
   - Right slot: NotificationBell + UserMenu

4. UserMenu.vue — avatar dropdown
   - Shows: name, role badge, email
   - Links: Profile, Sign Out

5. DataTable.vue — reusable table component
   - Props: columns (label, key, width), rows, loading, emptyText
   - Loading skeleton rows
   - Empty state with icon and message

6. PageHeader.vue — page title + breadcrumb + action slot
   - Props: title, subtitle, breadcrumb array
   - Right slot for action buttons

7. ConfirmModal.vue — reusable confirmation dialog
   - Props: title, message, confirmLabel, confirmVariant (danger/primary)
   - Emits: confirmed, cancelled

8. FormDrawer.vue — slide-in drawer for forms
   - Props: title, open (v-model)
   - Slot for form content
   - Footer slot for action buttons

9. LoadingSpinner.vue — centered spinner with optional message

10. EmptyState.vue — empty state with icon, title, description, optional action button

11. StatusBadge.vue — renders loan application status as color-coded badge:
    draft → gray, submitted → blue, under_review → indigo,
    pending_documents → amber, approved → green, rejected → red, disbursed → teal

Apply AppLayout.vue as the default layout in /layouts/default.vue.
Apply a minimal /layouts/auth.vue for login page (no sidebar).

Add global error handling in /plugins/error-handler.ts:
  - Intercepts 401 → clears auth store → redirects to /login
  - Intercepts 403 → redirects to /unauthorized
  - Intercepts 500 → shows toast notification "Something went wrong"

Create /composables/useToast.ts:
  - show(message, type: 'success'|'error'|'warning'|'info', duration = 3000)
  - Renders toasts in a fixed position overlay
```

**Expected Output:**

- Consistent design system across all pages
- Role-aware sidebar navigation
- Global error and loading state handling
- Toast notifications

-----

## Step 12 — Web Deployment

**Goal:** Deploy the Nuxt server API to Railway and the SPA frontend to Vercel.

**Compound Prompt:**

```
Prepare Financer for production web deployment.

1. Create /server/api/health.get.ts — health check endpoint returning { status: 'ok', timestamp }

2. Update nuxt.config.ts for production:
   - Set runtimeConfig with public.apiBase (read from env NUXT_PUBLIC_API_BASE)
   - Ensure all $fetch calls use useRuntimeConfig().public.apiBase as base URL

3. Create railway.json at project root:
   {
     "build": { "builder": "NIXPACKS" },
     "deploy": { "startCommand": "node .output/server/index.mjs", "healthcheckPath": "/api/health" }
   }

4. Create .env.production.example with all required production environment variables

5. Create vercel.json at project root for SPA hosting:
   - Route all requests to index.html (SPA fallback)
   - Set output directory to dist/

6. Update package.json scripts:
   "build:server": "nuxt build" (outputs to .output/)
   "build:client": "nuxt generate" (outputs to dist/ for Vercel)
   "start": "node .output/server/index.mjs"

7. Create /docs/DEPLOYMENT.md with step-by-step instructions:
   a. Railway setup: connect GitHub repo, set env vars, deploy
   b. Vercel setup: connect GitHub repo, set NUXT_PUBLIC_API_BASE to Railway URL, deploy
   c. MongoDB Atlas: configure IP allowlist for Railway static IPs
   d. Cloudinary: confirm credentials in Railway env vars

8. Add CORS configuration in /server/middleware/cors.ts:
   - Allows requests from Vercel frontend domain and localhost in development
   - Sets appropriate headers

9. Add rate limiting in /server/middleware/rate-limit.ts:
   - 100 requests per minute per IP on API routes
   - 10 requests per minute on /api/auth/login
```

**Expected Output:**

- Production-ready Nuxt server deployable to Railway
- SPA frontend deployable to Vercel
- CORS and rate limiting configured
- Deployment documentation

-----

## Step 13 — Desktop Packaging (Tauri)

**Goal:** Package the web SPA into native desktop installers for Windows, Mac, and Linux using Tauri.

**Compound Prompt:**

```
Finalize Tauri desktop packaging for Financer.

1. Update /src-tauri/tauri.conf.json:
   - Set productName: "Financer"
   - Set version from package.json
   - Set identifier: "com.Financer.app"
   - Point distDir to "../dist"
   - Set window title: "Financer — Lending Platform"
   - Set default window size: 1280x800, minWidth: 1024, minHeight: 768
   - Set window decorations: true, resizable: true

2. Configure auto-updater in tauri.conf.json:
   - Enable updater
   - Set endpoint to a GitHub Releases URL pattern
   - Set pubkey (generate with tauri signer generate)

3. Create /src-tauri/icons/ — add Financer app icons in all required sizes:
   - Use a placeholder script that generates icons from a base SVG
   - Sizes: 32x32, 128x128, 256x256, 512x512, icon.icns (Mac), icon.ico (Windows)

4. Update .env for desktop build — add:
   TAURI_PRIVATE_KEY=
   TAURI_KEY_PASSWORD=

5. Update package.json scripts:
   "build:desktop:win": "tauri build --target x86_64-pc-windows-msvc"
   "build:desktop:mac": "tauri build --target x86_64-apple-darwin"
   "build:desktop:linux": "tauri build --target x86_64-unknown-linux-gnu"

6. Create /docs/DESKTOP_BUILD.md with instructions:
   a. Prerequisites (Rust, system build tools per OS)
   b. How to build for each platform
   c. Where to find output installers (.exe, .dmg, .AppImage)
   d. How to set up GitHub Actions for automated desktop builds
   e. Auto-updater setup guide

7. Create /.github/workflows/desktop-build.yml:
   - Triggers on git tag push (v*.*.*)
   - Matrix: Windows (windows-latest), Mac (macos-latest), Linux (ubuntu-latest)
   - Steps: checkout, setup Node, setup Rust, install deps, build Nuxt dist, tauri build
   - Uploads installers as GitHub Release assets

8. Create /src-tauri/src/main.rs — ensure it:
   - Opens the app window pointing to the Vercel-hosted frontend URL in production
   - Falls back to localhost in development
   - Sets the API base URL via environment variable injected at build time

Note: The desktop app is a shell around the same web frontend. All data still flows through the Railway-deployed API. The desktop app provides a native window experience with OS-level notifications support.
```

**Expected Output:**

- Tauri configured with app metadata and icons
- Auto-updater configured for GitHub Releases
- GitHub Actions CI/CD for cross-platform desktop builds
- Documentation for desktop build and distribution

-----

## Module Dependency Map

```
Step 1 (Scaffold)
    └── Step 2 (Auth)
            └── Step 3 (Security Hardening)
                    ├── Step 4 (System Admin)
                    ├── Step 5 (User Management)
                    │       └── Step 6 (Loan Types)
                    │               └── Step 7 (Loan Application — Officer)
                    │                       └── Step 8 (Loan Approval — Approver)
                    │                               └── Step 9 (Audit Logs)
                    │                                       └── Step 10 (Dashboards)
                    │                                               └── Step 11 (UI Polish)
                    │                                                       ├── Step 12 (Web Deploy)
                    │                                                       └── Step 13 (Desktop Build)
```

-----

## MongoDB Collections Summary

|Collection       |Scope   |Key Fields                                                       |
|-----------------|--------|-----------------------------------------------------------------|
|tenants          |Platform|name, slug, isActive                                             |
|users            |Platform|tenantId, role, email, passwordHash                              |
|loan_types       |Tenant  |tenantId, name, rates, requiredDocuments                         |
|loan_applications|Tenant  |tenantId, loanTypeId, applicant, status, documents, statusHistory|
|notifications    |Tenant  |tenantId, userId, type, applicationId, isRead                    |
|audit_logs       |Platform|tenantId, userId, action, entity, entityId, metadata             |

-----

## JWT Payload Reference

```json
{
  "sub": "<userId>",
  "tenantId": "<tenantId or null for system_admin>",
  "role": "system_admin | tenant_admin | tenant_officer | tenant_approver",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

-----

## Loan Application State Machine

```
DRAFT
  ↓  officer submits (all required docs present)
SUBMITTED
  ↓  approver opens for review
UNDER_REVIEW
  ↓  approver requests more documents
PENDING_DOCUMENTS
  ↓  officer uploads requested documents → re-submits
UNDER_REVIEW
  ↓  approver decides
APPROVED ──────── or ──────── REJECTED
  ↓
DISBURSED
```

-----

## Interest Rate Workflow

```
Tenant Admin sets:
  defaultInterestRate  (e.g. 12%)
  minInterestRate      (e.g. 10%)
  maxInterestRate      (e.g. 18%)
        ↓
Loan Officer suggests rate during application creation
  (must be within min–max range)
        ↓
Approver sees: Default Rate | Suggested Rate | Allowable Range
Approver enters Final Rate (editable, validated against min–max)
        ↓
Final Rate locked on application upon approval
```

-----

## Environment Variables Reference

|Variable              |Used By        |Description                    |
|----------------------|---------------|-------------------------------|
|MONGODB_URI           |Server         |MongoDB Atlas connection string|
|JWT_SECRET            |Server         |Access token signing secret    |
|JWT_REFRESH_SECRET    |Server         |Refresh token signing secret   |
|JWT_EXPIRES_IN        |Server         |Access token expiry (e.g. 15m) |
|JWT_REFRESH_EXPIRES_IN|Server         |Refresh token expiry (e.g. 7d) |
|REDIS_URL             |Server         |Redis connection for rate limiting and sessions|
|SMTP_HOST             |Server         |SMTP server for password reset emails|
|SMTP_PORT             |Server         |SMTP server port (typically 587)|
|SMTP_USER             |Server         |SMTP authentication username   |
|SMTP_PASSWORD         |Server         |SMTP authentication password   |
|SMTP_FROM             |Server         |From email address for system emails|
|APP_URL               |Server         |Application base URL for password reset links|
|CLAMAV_HOST           |Server         |ClamAV host for virus scanning (optional)|
|CLAMAV_PORT           |Server         |ClamAV port for virus scanning (optional)|
|CLOUDINARY_CLOUD_NAME |Server         |Cloudinary account             |
|CLOUDINARY_API_KEY    |Server         |Cloudinary API key             |
|CLOUDINARY_API_SECRET |Server         |Cloudinary API secret          |
|NUXT_PUBLIC_API_BASE  |Client + Server|Base URL of the deployed API   |
|TAURI_PRIVATE_KEY     |Desktop build  |Tauri auto-updater signing key |
|TAURI_KEY_PASSWORD    |Desktop build  |Tauri signing key password     |

-----

*Financer Compound Engineering Plan — v1.0*
*Generated for use with Claude Code*