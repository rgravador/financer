# Brainstorm: Tenant Admin Pages and Functionalities

**Date:** 2026-03-27
**Status:** Reviewed and refined

## What We're Building

A complete Tenant Admin section with pages for dashboard, user management, loan configuration, settings, and audit logs. This mirrors the existing System Admin structure but is scoped to single-tenant operations with a loan-focused dashboard.

### Scope

| Area | Included | Details |
|------|----------|---------|
| Dashboard | ✅ | Loan-focused KPIs: active loans, pending approvals, total disbursed, approval rate |
| User Management | ✅ | Full CRUD + password reset for officers/approvers |
| Loan Configuration | ✅ | Template-based loan types with customizable settings |
| Settings | ✅ | Comprehensive: branding, notifications, approval rules, document requirements |
| Audit Logs | ✅ | Full audit trail for all tenant actions |

### Page Structure

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

## Why This Approach

**Approach Chosen:** Mirror System Admin Pattern

### Rationale

1. **Consistency:** Same UX patterns between system admin and tenant admin reduces learning curve
2. **Speed:** APIs already exist, just need UI pages
3. **Maintainability:** Single component library, shared design patterns
4. **Proven Design:** System admin pages already work well

### Alternatives Considered

| Approach | Why Not Chosen |
|----------|----------------|
| Fresh Design | More dev time, introduces design inconsistency |
| Phased Rollout | User wants complete section at once |

## Key Decisions

1. **Page structure:** Nested routes under `/pages/tenant/` (consistent with system admin pattern)
2. **Dashboard focus:** Loan-centric metrics rather than balanced user/loan mix
3. **User management:** Full CRUD with password reset capability
4. **Loan configuration:** Template-based with 4 standard types (Personal, Business, Auto, Mortgage)
5. **Settings:** Comprehensive options including branding, notification toggles, moderate approval rules (multi-level, role-based)
6. **Audit logs:** Full trail included (not simplified or excluded)

## Implementation Notes

### Existing Infrastructure (No Backend Work Needed)

**API Routes Ready:**
- `/api/tenant/stats` - Dashboard statistics
- `/api/tenant/users/*` - Full user CRUD
- `/api/tenant/loan-types/*` - Loan type CRUD
- `/api/tenant/audit-logs` - Audit trail

**Pinia Stores Available:**
- `stores/users.ts` - User management
- `stores/loanTypes.ts` - Loan type operations

**Role Guards:**
- `requireTenantAdmin(event)` - Protects tenant admin routes
- `requireTenantAccess(event)` - Allows tenant admin or higher

### Navigation Update Required

Add tenant admin menu items to `AppSidebar.vue`:
- Dashboard → `/tenant/dashboard`
- Users → `/tenant/users`
- Loan Types → `/tenant/loan-types`
- Settings → `/tenant/settings`
- Audit Logs → `/tenant/audit-logs`

### Design System Reference

Follow system admin patterns:
- Stat cards with icons and trends
- Data tables with search, filter, pagination
- Modal dialogs for create/edit forms
- Action menus for row operations
- Vuetify theme: Sora headings, Plus Jakarta Sans body

## Resolved Questions

| Question | Decision |
|----------|----------|
| **Loan templates** | Standard set: Personal, Business, Auto, Mortgage |
| **Approval workflows** | Moderate complexity: Multiple approval levels, role-based routing |
| **Notification templates** | Enable/disable only - standard templates, no customization |
| **Dashboard refresh** | Manual only - user clicks refresh button when needed |

## Success Criteria

- [ ] Tenant admin can view loan-focused dashboard with key metrics
- [ ] Tenant admin can manage users (create, edit, deactivate, reset password)
- [ ] Tenant admin can configure loan types from templates
- [ ] Tenant admin can customize tenant settings (branding, notifications, rules)
- [ ] Tenant admin can view full audit trail for their organization
- [ ] Navigation updates to show tenant admin menu items
- [ ] Consistent design with system admin pages
- [ ] E2E tests for all user stories (dashboard, user management, loan types, settings, audit logs)
