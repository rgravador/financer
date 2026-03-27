# Brainstorm: Tenant Admin User Management

**Date:** 2026-03-27
**Status:** Ready for Planning
**Author:** Brainstorming Session

---

## What We're Building

A dedicated user management page for system admins to manage tenant administrators within each tenant organization.

### Core Functionality

**User Management Actions (Full CRUD):**
- **Create** - Add new tenant admin to a tenant
- **Read** - View list of tenant admins with essential info
- **Update** - Edit tenant admin profile, change status
- **Delete** - Remove tenant admin (with confirmation)
- **Reset Password** - Trigger password reset for tenant admin
- **Activate/Deactivate** - Toggle user active status

**User Data Displayed:**
- Full name
- Email address
- Status (active/inactive)
- Created date
- Last login timestamp

### Access Control

| Role | Capabilities |
|------|-------------|
| System Admin | Full CRUD on tenant admins only |
| Tenant Admin | Manages officers/approvers (not in this scope) |

**Hierarchy:** System Admin → Tenant Admin → Officers/Approvers

---

## Why This Approach

### Chosen: Dedicated Users Page (`/system/tenants/[id]/users`)

**Decision Rationale:**
1. **Consistent patterns** - Follows existing `/system/tenants/[id]` routing structure
2. **Room to grow** - Full page provides space for search, filters, pagination
3. **Clean separation** - Tenant info and user management are distinct concerns
4. **Maintainability** - Easier to extend and debug separate pages

### Alternatives Considered

| Approach | Why Not |
|----------|---------|
| Tabs on tenant detail | Page complexity increases, harder to deep-link |
| Slide-out panel | Limited space for data table, cramped on mobile |

---

## Key Decisions

### 1. UI Location
**Decision:** Separate page at `/system/tenants/[id]/users`
**Rationale:** Provides dedicated space while maintaining tenant context via breadcrumbs

### 2. Scope of Management
**Decision:** System admins manage tenant admins ONLY
**Rationale:** Enforces proper hierarchy; tenant admins manage their own users

### 3. User Information
**Decision:** Essential info only (name, email, status, dates)
**Rationale:** YAGNI - extended profiles can be added later if needed

### 4. Delete Behavior
**Decision:** Allow hard delete with confirmation
**Rationale:** Full CRUD requested; consider soft delete in future for audit trail

---

## Technical Context

### Existing Infrastructure

**Models:**
- `User` model with `tenantId` foreign key
- `role` field supports: `system_admin`, `tenant_admin`, `tenant_officer`, `tenant_approver`

**API Endpoints (exist but may need refinement):**
- `GET /api/system/tenants/[id]` - Returns tenant with users list
- Tenant-scoped user endpoints exist at `/api/tenant/users/`

**Store:**
- `stores/system.ts` - Has `selectedTenant` with users array
- May need new actions for tenant-admin-specific CRUD

**Patterns:**
- Role guards via `requireSystemAdmin()`
- Consistent response format: `{ success: true, data: {...} }`

### New Components Needed

1. **Page:** `pages/system/tenants/[id]/users.vue`
2. **API Endpoints:**
   - `POST /api/system/tenants/[id]/users` (create tenant admin)
   - `PATCH /api/system/tenants/[id]/users/[userId]` (update)
   - `DELETE /api/system/tenants/[id]/users/[userId]` (delete)
   - `POST /api/system/tenants/[id]/users/[userId]/reset-password` (reset)
3. **Store Actions:** CRUD actions for tenant admins in system store

---

## Open Questions

1. **Password Reset Flow** - Email-based reset or generate temporary password?
2. **Audit Logging** - Should tenant admin changes be logged? (Recommended: yes)
3. **Invitation Flow** - Create with password vs send invite email?
4. **Bulk Operations** - Need to create/deactivate multiple admins at once?

---

## Success Criteria

- [ ] System admin can navigate to tenant users page from tenant detail
- [ ] System admin can view list of all tenant admins for a tenant
- [ ] System admin can create new tenant admin with validation
- [ ] System admin can edit tenant admin profile
- [ ] System admin can activate/deactivate tenant admin
- [ ] System admin can delete tenant admin (with confirmation)
- [ ] System admin can trigger password reset
- [ ] Proper error handling and loading states
- [ ] Follows existing Vuetify theme and component patterns

---

## Next Steps

Run `/workflows:plan` to generate detailed implementation plan including:
- API endpoint specifications
- Component breakdown
- Store action definitions
- Testing strategy
