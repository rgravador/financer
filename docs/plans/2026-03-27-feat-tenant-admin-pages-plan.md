---
title: "feat: Tenant Admin Pages and Functionalities"
type: feat
date: 2026-03-27
---

# feat: Tenant Admin Pages and Functionalities

## Overview

Build a complete Tenant Admin section with 5 pages: Dashboard, User Management, Loan Types, Settings, and Audit Logs. This mirrors the existing System Admin structure but is scoped to single-tenant operations with a loan-focused dashboard. Includes E2E tests for all user stories.

**Approach:** Mirror System Admin Pattern for consistency, speed, and maintainability.

## Problem Statement

Tenant admins currently have no dedicated UI pages. They cannot:
- View their organization's loan metrics and KPIs
- Manage their team (officers, approvers)
- Configure loan products
- Customize tenant settings
- View audit trails for compliance

All API endpoints exist but lack frontend pages.

## Proposed Solution

Create `/pages/tenant/` directory mirroring system admin structure:

```
/pages/tenant/
├── dashboard.vue          # Loan-focused KPIs and activity
├── users/
│   └── index.vue          # User management (officers, approvers)
├── loan-types/
│   └── index.vue          # Loan product configuration
├── settings.vue           # Tenant settings and preferences
└── audit-logs.vue         # Tenant-scoped audit trail
```

Update `AppSidebar.vue` with tenant admin navigation items.

## Technical Approach

### Architecture

**Design Pattern:** Follow existing system admin pages exactly:
- Page-level role enforcement via `definePageMeta({ middleware: ['role'], allowedRoles: ['tenant_admin'] })`
- Pinia stores for API calls and state management
- Vuetify components with theme customization
- Modal dialogs for create/edit operations

**Key Files to Reference:**
| Pattern | Reference File |
|---------|----------------|
| Dashboard layout | `/pages/system/dashboard.vue` |
| User management | `/pages/system/tenants/[id]/users.vue` |
| Detail pages | `/pages/system/tenants/[id]/index.vue` |
| Navigation | `/components/shared/AppSidebar.vue` |
| User store | `/stores/users.ts` |
| Loan types store | `/stores/loanTypes.ts` |

**API Endpoints (Existing):**
- `GET /api/tenant/stats` - Dashboard statistics
- `GET/POST /api/tenant/users` - User CRUD
- `GET/PATCH/DELETE /api/tenant/users/[id]` - User operations
- `GET/POST /api/tenant/loan-types` - Loan type CRUD
- `GET/PATCH/DELETE /api/tenant/loan-types/[id]` - Loan type operations
- `GET /api/tenant/audit-logs` - Audit trail

**API Endpoints (Need Creation):**
- `POST /api/tenant/users/[id]/reset-password` - Password reset for tenant users
- `GET /api/tenant/settings` - Tenant settings retrieval
- `PATCH /api/tenant/settings` - Tenant settings update

### Implementation Phases

#### Phase 1: Foundation & Navigation

**Tasks:**
- [ ] Update `AppSidebar.vue` with tenant admin menu items
- [ ] Create `/pages/tenant/` directory structure
- [ ] Create base layout for tenant admin pages
- [ ] Verify role middleware works for tenant_admin role

**Files:**
- `components/shared/AppSidebar.vue` - Add tenant admin menu items
- `pages/tenant/dashboard.vue` - Placeholder

**Success Criteria:**
- Tenant admin can navigate to `/tenant/dashboard`
- System admin cannot access tenant admin pages
- Sidebar shows correct menu based on role

---

#### Phase 2: Dashboard

**Tasks:**
- [ ] Create dashboard page with loan-focused KPIs
- [ ] Implement stat cards: Active Loans, Pending Approvals, Total Disbursed, Approval Rate
- [ ] Add manual refresh button
- [ ] Handle loading, error, and empty states
- [ ] Handle first-time tenant experience (no data)

**UI Components:**
```
┌─────────────────────────────────────────────────────────────┐
│  Dashboard                                    [Refresh]     │
├─────────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Active   │ │ Pending  │ │ Total    │ │ Approval │       │
│  │ Loans    │ │ Approvals│ │ Disbursed│ │ Rate     │       │
│  │   24     │ │    7     │ │ $1.2M    │ │  85%     │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
│                                                             │
│  Recent Activity                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Loan #1234 approved by John Doe        2 hours ago  │   │
│  │ New borrower Maria Santos registered   3 hours ago  │   │
│  │ Loan #1233 submitted for review        5 hours ago  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Files:**
- `pages/tenant/dashboard.vue`

**API Enhancement Needed:**
- Verify `/api/tenant/stats` returns: activeLoans, pendingApprovals, totalDisbursed, approvalRate, recentActivity[]

**Success Criteria:**
- Dashboard displays 4 loan-focused KPIs
- Manual refresh works
- Empty state shown for new tenants
- Loading state during data fetch

---

#### Phase 3: User Management

**Tasks:**
- [ ] Create users list page with search and filters
- [ ] Implement create user dialog (email, firstName, lastName, role)
- [ ] Implement edit user dialog
- [ ] Implement password reset functionality
- [ ] Implement deactivate/reactivate user
- [ ] Handle edge cases (last admin, self-deactivation)

**UI Components:**
```
┌─────────────────────────────────────────────────────────────┐
│  Users                                       [+ Add User]   │
├─────────────────────────────────────────────────────────────┤
│  Search: [___________]  Role: [All ▼]  Status: [Active ▼]  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Name           │ Email          │ Role    │ Status  │ ⋮ │
│  ├─────────────────────────────────────────────────────┤   │
│  │ John Doe       │ john@acme.com  │ Officer │ Active  │ ⋮ │
│  │ Jane Smith     │ jane@acme.com  │ Approver│ Active  │ ⋮ │
│  │ Bob Wilson     │ bob@acme.com   │ Officer │ Inactive│ ⋮ │
│  └─────────────────────────────────────────────────────┘   │
│                                          Showing 1-10 of 25 │
└─────────────────────────────────────────────────────────────┘

Action Menu (⋮):
- Edit User
- Reset Password
- Deactivate/Reactivate
```

**Roles Tenant Admin Can Manage:**
- `tenant_officer` - Can create loan applications
- `tenant_approver` - Can approve/reject loans
- `tenant_admin` - Can manage tenant (if allowed - needs confirmation)

**Edge Cases:**
- Cannot deactivate self
- Cannot deactivate last active admin
- Show warning when deactivating user with pending loans

**Files:**
- `pages/tenant/users/index.vue`
- `server/api/tenant/users/[id]/reset-password.post.ts` (new)

**Success Criteria:**
- List users with search, role filter, status filter
- Create new user (officer or approver)
- Edit user details
- Reset password (shows temporary password or sends email)
- Deactivate/reactivate users
- Proper validation and error messages

---

#### Phase 4: Loan Types Configuration

**Tasks:**
- [ ] Create loan types list page
- [ ] Implement create from template dialog (4 templates)
- [ ] Implement edit loan type dialog
- [ ] Implement archive/delete loan type
- [ ] Show active loan count per type

**UI Components:**
```
┌─────────────────────────────────────────────────────────────┐
│  Loan Types                             [+ Create from Template]│
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Personal Loan                              Active   │   │
│  │ $1,000 - $50,000 | 12-60 months | 8.5% - 15%       │   │
│  │ 12 active loans                            [Edit ▼]│   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Business Loan                              Active   │   │
│  │ $5,000 - $500,000 | 12-84 months | 6% - 12%        │   │
│  │ 8 active loans                             [Edit ▼]│   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Auto Loan                                  Draft    │   │
│  │ $2,000 - $100,000 | 12-72 months | 5% - 10%        │   │
│  │ 0 active loans                             [Edit ▼]│   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

**Templates Available:**
1. Personal Loan - General purpose consumer lending
2. Business Loan - SME and commercial lending
3. Auto Loan - Vehicle financing
4. Mortgage - Home financing

**Configurable Fields:**
- Name (customize from template)
- Min/Max amount
- Min/Max term (months)
- Interest rate range
- Required documents list
- Status (active/inactive)

**Files:**
- `pages/tenant/loan-types/index.vue`
- Update `stores/loanTypes.ts` if needed

**Success Criteria:**
- List all loan types with key details
- Create from 4 templates
- Edit loan type settings
- Archive loan type (if no active loans)
- Show active loan count

---

#### Phase 5: Settings

**Tasks:**
- [ ] Create settings page with sections
- [ ] Implement branding settings (logo upload, organization name)
- [ ] Implement notification toggles
- [ ] Implement approval rules (amount thresholds, multi-level)
- [ ] Add save/cancel with unsaved changes warning

**UI Components:**
```
┌─────────────────────────────────────────────────────────────┐
│  Settings                                                   │
├─────────────────────────────────────────────────────────────┤
│  Branding                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Logo: [📷 Upload] current-logo.png                  │   │
│  │ Organization Name: [ACME Financial_______]          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Notifications                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ ☑ Loan submitted notification                       │   │
│  │ ☑ Loan approved notification                        │   │
│  │ ☑ Loan rejected notification                        │   │
│  │ ☐ Daily summary email                               │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Approval Rules                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Loans under $10,000: Single approver                │   │
│  │ Loans $10,000-$50,000: Two approvers required       │   │
│  │ Loans over $50,000: Manager + Two approvers         │   │
│  │ [+ Add Rule]                                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                               [Cancel] [Save Changes]       │
└─────────────────────────────────────────────────────────────┘
```

**Files:**
- `pages/tenant/settings.vue`
- `server/api/tenant/settings.get.ts` (new)
- `server/api/tenant/settings.patch.ts` (new)
- `stores/tenant.ts` (new - for tenant settings)

**Success Criteria:**
- Upload/change organization logo
- Update organization name
- Toggle notification preferences
- Configure approval rules by amount threshold
- Unsaved changes warning on navigation

---

#### Phase 6: Audit Logs

**Tasks:**
- [x] Create audit logs page with filters
- [x] Implement date range filter
- [x] Implement user filter
- [x] Implement action type filter
- [x] Implement search
- [x] Add pagination

**UI Components:**
```
┌─────────────────────────────────────────────────────────────┐
│  Audit Logs                                                 │
├─────────────────────────────────────────────────────────────┤
│  Date: [Last 7 days ▼]  User: [All ▼]  Action: [All ▼]     │
│  Search: [___________________]                              │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Timestamp        │ User       │ Action     │ Details│   │
│  ├─────────────────────────────────────────────────────┤   │
│  │ Mar 27, 10:30 AM │ John Doe   │ User Created│ jane@ │   │
│  │ Mar 27, 09:15 AM │ Jane Smith │ Loan Approved│ #1234│   │
│  │ Mar 26, 04:45 PM │ John Doe   │ Settings Changed│ ..│   │
│  │ Mar 26, 02:30 PM │ System     │ Login      │ john@ │   │
│  └─────────────────────────────────────────────────────┘   │
│                                     < 1 2 3 ... 10 >        │
└─────────────────────────────────────────────────────────────┘
```

**Files:**
- `pages/tenant/audit-logs.vue`
- Verify `/api/tenant/audit-logs` supports query params

**Success Criteria:**
- List audit logs with pagination
- Filter by date range
- Filter by user
- Filter by action type
- Search within logs
- Expandable details for each log entry

---

#### Phase 7: E2E Tests

**Tasks:**
- [x] Dashboard E2E tests
- [x] User management E2E tests
- [x] Loan types E2E tests
- [x] Settings E2E tests
- [x] Audit logs E2E tests
- [x] Navigation and role access tests

**Test Files:**
- `tests/e2e/tenant-admin-dashboard.spec.ts`
- `tests/e2e/tenant-admin-users.spec.ts`
- `tests/e2e/tenant-admin-loan-types.spec.ts`
- `tests/e2e/tenant-admin-settings.spec.ts`
- `tests/e2e/tenant-admin-audit-logs.spec.ts`

**Test Scenarios:**

**Dashboard:**
```typescript
- should display loan-focused KPIs
- should refresh data on button click
- should show empty state for new tenant
- should handle API errors gracefully
```

**User Management:**
```typescript
- should list all tenant users
- should create new user (officer)
- should create new user (approver)
- should edit user details
- should reset user password
- should deactivate user
- should reactivate user
- should prevent self-deactivation
- should prevent deactivating last admin
- should filter by role
- should filter by status
- should search users
```

**Loan Types:**
```typescript
- should list all loan types
- should create loan type from Personal template
- should create loan type from Business template
- should edit loan type settings
- should archive inactive loan type
- should prevent archiving loan type with active loans
```

**Settings:**
```typescript
- should display current settings
- should upload organization logo
- should update organization name
- should toggle notifications
- should add approval rule
- should edit approval rule
- should delete approval rule
- should warn on unsaved changes
- should save all settings
```

**Audit Logs:**
```typescript
- should list audit logs
- should filter by date range
- should filter by user
- should filter by action type
- should search logs
- should paginate results
- should expand log details
```

**Success Criteria:**
- All E2E tests pass
- Tests run in CI pipeline
- Tests cover happy path and key error scenarios

## Acceptance Criteria

### Functional Requirements

- [ ] Tenant admin can access all 5 pages via sidebar navigation
- [ ] Dashboard displays 4 loan-focused KPIs with manual refresh
- [ ] User management supports full CRUD + password reset
- [ ] Loan types can be created from 4 templates and customized
- [ ] Settings page allows branding, notifications, and approval rules
- [ ] Audit logs show all tenant activity with filters and search
- [ ] All pages have proper loading, error, and empty states

### Non-Functional Requirements

- [ ] Pages load within 2 seconds on 4G connection
- [ ] All forms have proper validation with helpful error messages
- [ ] UI is accessible (keyboard navigation, ARIA labels, 4.5:1 contrast)
- [ ] Design matches system admin pages (Vuetify theme, typography)
- [ ] All user actions are logged to audit trail

### Quality Gates

- [ ] All E2E tests pass (Playwright)
- [ ] No TypeScript errors
- [ ] ESLint passes
- [ ] Manual QA sign-off

## Success Metrics

- Tenant admin can complete all user stories without assistance
- All E2E tests pass in CI
- No critical bugs in first week of release
- Page load times < 2s (measured via DevTools)

## Dependencies & Prerequisites

**Prerequisites:**
- System admin pages complete (✅ done)
- API endpoints exist (✅ mostly done, 3 new needed)
- Pinia stores exist (✅ users.ts, loanTypes.ts)
- Role middleware working (✅ done)

**New API Endpoints Required:**
1. `POST /api/tenant/users/[id]/reset-password`
2. `GET /api/tenant/settings`
3. `PATCH /api/tenant/settings`

**Dependencies:**
- Vuetify 3
- Pinia
- Playwright (E2E tests)

## Risk Analysis & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| API endpoints missing/incomplete | High | Verify each API before building page |
| Role escalation vulnerability | High | Test tenant admin cannot create system admins |
| Cross-tenant data leak | Critical | Verify all queries filter by tenantId |
| Inconsistent UI with system admin | Medium | Use same components and patterns |
| E2E tests flaky | Medium | Use proper waits, avoid hardcoded delays |

## File Checklist

### New Files
- [x] `pages/tenant/dashboard.vue`
- [x] `pages/tenant/users/index.vue`
- [x] `pages/tenant/loan-types/index.vue`
- [x] `pages/tenant/settings.vue`
- [x] `pages/tenant/audit-logs.vue`
- [x] `server/models/TenantSettings.ts` (tenant settings model)
- [x] `server/api/tenant/users/[id]/reset-password.post.ts`
- [x] `server/api/tenant/settings/index.get.ts`
- [x] `server/api/tenant/settings/index.patch.ts`
- [x] `tests/e2e/tenant-admin-pages.spec.ts` (combined all E2E tests)

### Modified Files
- [x] `components/shared/AppSidebar.vue` - Add tenant admin menu items
- [x] `stores/users.ts` - Add password reset action

## References & Research

### Internal References
- System admin dashboard: `pages/system/dashboard.vue`
- System admin users: `pages/system/tenants/[id]/users.vue`
- User store: `stores/users.ts`
- Loan types store: `stores/loanTypes.ts`
- Role guards: `server/utils/requireRole.ts`
- Middleware: `middleware/role.ts`

### Brainstorm Document
- `docs/brainstorms/2026-03-27-tenant-admin-pages-brainstorm.md`

### Design System
- Vuetify customization: `docs/VUETIFY_CUSTOMIZATION.md`
- Primary: `#1e3a8a` (Navy Blue)
- Secondary: `#f59e0b` (Amber Gold)
- Fonts: Sora (headings), Plus Jakarta Sans (body)
