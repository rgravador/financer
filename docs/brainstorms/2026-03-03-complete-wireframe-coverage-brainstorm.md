---
title: Complete Wireframe Coverage for All User Roles
date: 2026-03-03
status: brainstorm
approach: Template-Based Component System
scope: ~30 high-fidelity HTML wireframes
timeline: 3-4 days focused work
---

# Complete Wireframe Coverage for All User Roles

## What We're Building

A comprehensive wireframe library covering all backend features across 4 user roles (system_admin, tenant_admin, tenant_officer, tenant_approver). This will create **~30 high-fidelity HTML wireframes** that match the existing design system and include all UI states (success, error, empty, loading).

### Current State

- ✅ **11 wireframes exist** covering basic admin and tenant admin flows
- ❌ **Pages directory is empty** - all UI components were deleted
- ✅ **Full backend API implemented** with 4 user roles and complete business logic
- ✅ **Design system established** (Navy Blue #1e3a8a, Gold #f59e0b, common-styles.css)

### Target State

- ✅ **~30 wireframes** covering 100% of backend features
- ✅ **All UI states documented** (success, error, empty, loading)
- ✅ **Reusable component library** for consistent wireframe creation
- ✅ **Ready for Vue/Vuetify implementation** with minimal interpretation needed

### Coverage Gap Analysis

**Current Coverage: 35%**
- 11 wireframes exist vs ~30 needed for full coverage
- Major gaps: borrower management, loan workflows, approval queue, officer/approver dashboards

## Why This Approach

### Chosen Approach: Template-Based Component System

**Decision:** Build reusable HTML component templates, then compose 30 wireframes by assembling these components.

**Rationale:**
1. **Consistency** - All 30 wireframes will use identical patterns (headers, sidebars, tables, forms)
2. **Maintainability** - Change one component, all wireframes update
3. **Speed** - ~3 days vs 4-5 days for hand-coding each wireframe
4. **Quality** - Reduces copy-paste errors and design drift
5. **Mirrors Implementation** - Matches how Vuetify components work, smoother transition to code

**Trade-offs Accepted:**
- Upfront investment in component library (~6 hours)
- Less flexibility for truly unique layouts (acceptable - most pages follow patterns)
- Requires some HTML templating knowledge

**Alternatives Considered:**
- **Clone-and-Modify** - Faster to start but inconsistency risk, harder to maintain
- **Specification-Driven** - Great documentation but AI output needs validation
- **Hybrid** - Considered but adds complexity; pure template approach is cleaner

## Key Decisions

### 1. Scope and Fidelity

**Decision:** Create all ~30 wireframes in one deliverable with high-fidelity detail.

**Details:**
- Desktop-only (1920x1080 viewport)
- All UI states: success, error, empty, loading
- Real data examples and edge cases
- Form validation feedback
- Ready for direct implementation (no interpretation needed)

**Rejected:** Phased approach - prefer complete library for consistency

### 2. Format and Technology

**Decision:** HTML + CSS matching existing wireframes exactly.

**Details:**
- Use existing `common-styles.css` for design tokens
- Static HTML files viewable in browser
- No JavaScript required (except optional interactivity for demos)
- Maintain same structure as existing 11 wireframes

**Rejected:** Figma/Vue components/Markdown - HTML wireframes are working well

### 3. Organization Structure

**Decision:** Group wireframes by user role + shared resources.

**Directory Structure:**
```
docs/wireframes/
├── common-styles.css         # Design system (existing)
├── components/               # NEW: Reusable component library
│   ├── wf-header.html
│   ├── wf-sidebar.html
│   ├── wf-topbar.html
│   ├── wf-data-table.html
│   ├── wf-form-layout.html
│   ├── wf-stat-cards.html
│   ├── wf-empty-state.html
│   ├── wf-modal.html
│   └── wf-states.html
├── index.html               # Gallery (existing)
├── login.html               # Auth (existing)
├── system-admin/            # System Admin wireframes
│   ├── dashboard.html       (existing as system-admin-dashboard.html)
│   ├── tenants-list.html    (existing)
│   ├── tenant-details.html  (existing)
│   └── audit-logs.html      NEW
├── tenant-admin/            # Tenant Admin wireframes
│   ├── dashboard.html       (existing as tenant-admin-dashboard.html)
│   ├── users-management.html (existing)
│   ├── loan-types-list.html (existing as loan-types.html)
│   ├── loan-type-form.html  (existing)
│   ├── loan-applications.html (existing)
│   └── audit-logs.html      (existing)
├── officer/                 # NEW: Officer wireframes
│   ├── dashboard.html       NEW
│   ├── borrowers-list.html  NEW
│   ├── borrower-create.html NEW
│   ├── borrower-edit.html   NEW
│   ├── borrower-profile.html NEW
│   ├── loan-application-create.html NEW (multi-step wizard)
│   ├── loan-application-detail.html NEW
│   └── document-upload.html NEW
├── approver/                # NEW: Approver wireframes
│   ├── dashboard.html       NEW
│   ├── approval-queue.html  NEW
│   ├── application-review.html NEW
│   ├── approve-reject-form.html NEW
│   └── request-documents-modal.html NEW
└── shared/                  # NEW: Shared/common wireframes
    ├── notifications-panel.html NEW
    ├── notifications-page.html NEW
    ├── account-security.html NEW
    ├── change-password.html NEW
    ├── active-sessions.html NEW
    ├── user-profile.html NEW
    ├── forgot-password.html NEW
    ├── reset-password.html NEW
    └── unauthorized.html NEW
```

### 4. Component Library Specifications

**Decision:** Extract 9 core components from existing wireframes for reuse.

**Component Breakdown:**

#### 1. `wf-header.html` - Page Header Component
```html
<!-- Reusable page header with title, breadcrumbs, actions -->
<div class="page-header">
  <div class="breadcrumbs"><!-- Breadcrumb navigation --></div>
  <h1 class="page-title"><!-- Page title --></h1>
  <div class="page-actions"><!-- Action buttons --></div>
</div>
```

#### 2. `wf-sidebar.html` - Navigation Sidebar
```html
<!-- Role-based navigation sidebar (260px fixed) -->
<aside class="sidebar">
  <div class="sidebar-header"><!-- Logo + tenant info --></div>
  <nav class="sidebar-nav">
    <!-- Role-based menu items -->
  </nav>
</aside>
```

#### 3. `wf-topbar.html` - Application Topbar
```html
<!-- Top navigation with notifications, search, user menu -->
<header class="topbar">
  <button class="menu-toggle"><!-- Mobile menu toggle --></button>
  <div class="search-box"><!-- Global search --></div>
  <div class="topbar-actions">
    <button class="notifications"><!-- Notification bell with count --></button>
    <div class="user-menu"><!-- User avatar + dropdown --></div>
  </div>
</header>
```

#### 4. `wf-data-table.html` - Data Table Component
```html
<!-- Responsive data table with search, filters, pagination -->
<div class="table-container">
  <div class="table-toolbar">
    <input class="search-box" placeholder="Search...">
    <div class="filters"><!-- Filter dropdowns --></div>
  </div>
  <table class="data-table">
    <thead><!-- Column headers with sort icons --></thead>
    <tbody><!-- Data rows with hover states --></tbody>
  </table>
  <div class="pagination"><!-- Page controls --></div>
</div>
```

#### 5. `wf-form-layout.html` - Form Layout Component
```html
<!-- Two-column form layout (form + sidebar) -->
<div class="form-layout">
  <div class="form-main">
    <form class="wf-form">
      <div class="form-group">
        <label><!-- Field label with required indicator --></label>
        <input><!-- Input with validation state --></input>
        <span class="error-message"><!-- Validation error --></span>
      </div>
    </form>
  </div>
  <aside class="form-sidebar">
    <!-- Contextual help, info cards -->
  </aside>
</div>
```

#### 6. `wf-stat-cards.html` - Statistics Card Grid
```html
<!-- Responsive grid of stat cards (auto-fit) -->
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-value"><!-- Large number (36px) --></div>
    <div class="stat-label"><!-- Description (14px) --></div>
    <div class="stat-change"><!-- % change indicator --></div>
  </div>
</div>
```

#### 7. `wf-empty-state.html` - Empty State Component
```html
<!-- Empty state with icon, message, action -->
<div class="empty-state">
  <div class="empty-icon"><!-- Large icon (96px) --></div>
  <h3 class="empty-title"><!-- Title --></h3>
  <p class="empty-message"><!-- Description --></p>
  <button class="primary-btn"><!-- Primary action --></button>
</div>
```

#### 8. `wf-modal.html` - Modal Dialog Component
```html
<!-- Centered modal with overlay -->
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h3 class="modal-title"><!-- Title --></h3>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-body"><!-- Modal content --></div>
    <div class="modal-footer">
      <button class="secondary-btn">Cancel</button>
      <button class="primary-btn">Confirm</button>
    </div>
  </div>
</div>
```

#### 9. `wf-states.html` - UI State Templates
```html
<!-- Loading, error, success state variants -->
<div class="loading-state">
  <div class="spinner"></div>
  <p>Loading...</p>
</div>

<div class="error-state">
  <div class="error-icon">⚠️</div>
  <h3>Error Title</h3>
  <p>Error message</p>
  <button>Retry</button>
</div>

<div class="success-state">
  <div class="success-icon">✓</div>
  <h3>Success!</h3>
  <p>Action completed</p>
</div>
```

## Complete Wireframe Inventory

### Phase 1: Component Library (Day 1)
**Status:** Not started
**Estimated Time:** 6-8 hours

- [ ] Extract and create `wf-header.html`
- [ ] Extract and create `wf-sidebar.html`
- [ ] Extract and create `wf-topbar.html`
- [ ] Extract and create `wf-data-table.html`
- [ ] Extract and create `wf-form-layout.html`
- [ ] Extract and create `wf-stat-cards.html`
- [ ] Extract and create `wf-empty-state.html`
- [ ] Extract and create `wf-modal.html`
- [ ] Extract and create `wf-states.html`
- [ ] Document component usage in `components/README.md`

### Phase 2: Officer Role Wireframes (Day 2)
**Status:** Not started
**Estimated Time:** 8-10 hours
**Priority:** High - Core business workflow

#### Officer Dashboard
- [ ] `officer/dashboard.html` - Overview with stats, recent activity
  - Stat cards: Active loans, pending applications, total borrowers
  - Recent applications table
  - Quick action cards (new application, new borrower)
  - States: normal, empty (no applications yet)

#### Borrower Management
- [ ] `officer/borrowers-list.html` - List all borrowers
  - Data table: name, email, phone, total loans, status, actions
  - Search by name/email
  - Filter by status (active, inactive)
  - Pagination
  - States: normal, empty (no borrowers), loading, error

- [ ] `officer/borrower-create.html` - Create new borrower form
  - Form fields: personal info, contact info, employment info
  - Form validation indicators
  - Two-column layout (form + help sidebar)
  - States: normal, submitting, success, error (validation)

- [ ] `officer/borrower-edit.html` - Edit existing borrower
  - Same form as create but pre-populated
  - States: loading data, normal, submitting, success, error

- [ ] `officer/borrower-profile.html` - View borrower details
  - Personal information card
  - Employment history card
  - Loan history table
  - Document list
  - Action buttons (edit, archive)
  - States: loading, normal, error (not found)

#### Loan Application Workflow
- [ ] `officer/loan-application-create.html` - Multi-step loan wizard
  - Step 1: Select borrower
  - Step 2: Select loan type
  - Step 3: Loan details (amount, term, purpose)
  - Step 4: Upload documents
  - Step 5: Review and submit
  - Progress indicator
  - States: each step has validation, overall loading/submitting

- [ ] `officer/loan-application-detail.html` - View application
  - Application summary card
  - Borrower info card
  - Loan details card
  - Document list with upload
  - Status timeline
  - Action buttons (edit draft, submit, withdraw)
  - States: loading, normal, submitting, success, error

- [ ] `officer/document-upload.html` - Document management
  - Drag-and-drop upload area
  - Document list with preview icons
  - File type validation
  - Upload progress indicators
  - States: normal, uploading, success, error (invalid file type, size limit)

### Phase 3: Approver Role Wireframes (Day 2-3)
**Status:** Not started
**Estimated Time:** 6-8 hours
**Priority:** High - Core approval workflow

#### Approver Dashboard
- [ ] `approver/dashboard.html` - Approval overview
  - Stat cards: pending reviews, approved today, rejected today, avg approval time
  - Pending queue preview (top 5)
  - Recent decisions table
  - Quick filters (high priority, over 30 days, flagged)
  - States: normal, empty (no pending)

#### Approval Queue
- [ ] `approver/approval-queue.html` - List pending applications
  - Tabbed view: Pending, Approved (by me), Rejected (by me), All
  - Data table: app ID, borrower, loan type, amount, submitted date, days pending, priority
  - Filter by loan type, amount range, days pending
  - Sort by priority, date, amount
  - Batch actions (assign to me, flag for review)
  - States: normal, empty, loading, error

- [ ] `approver/application-review.html` - Detailed review page
  - Two-column layout (application details + decision panel)
  - Application summary (borrower, loan details, credit score, debt ratio)
  - Document viewer/checklist
  - Risk assessment card (auto-calculated scores)
  - Decision panel: Approve / Reject / Request More Info
  - Comment/notes field
  - Approval history timeline
  - States: loading, normal, submitting decision, success, error

- [ ] `approver/approve-reject-form.html` - Decision form modal
  - Radio buttons: Approve / Reject
  - If approve: final rate, terms, conditions
  - If reject: rejection reason (dropdown + notes)
  - Comment field (required for reject)
  - Confirmation checkboxes
  - States: normal, submitting, success, error

- [ ] `approver/request-documents-modal.html` - Request additional docs
  - Checklist of document types
  - Custom document request field
  - Deadline selector
  - Email notification toggle
  - States: normal, submitting, success

### Phase 4: Shared Wireframes (Day 3)
**Status:** Not started
**Estimated Time:** 6-8 hours
**Priority:** Medium - Supporting features

#### Notifications
- [ ] `shared/notifications-panel.html` - Topbar dropdown
  - Notification list (last 10)
  - Unread indicator badges
  - Mark as read action
  - "View all" link
  - States: loading, normal, empty

- [ ] `shared/notifications-page.html` - Full notifications page
  - All notifications list
  - Filter by type (system, application, approval, document)
  - Mark all as read button
  - Pagination
  - States: loading, normal, empty

#### Account & Security
- [ ] `shared/account-security.html` - Security settings page
  - Change password form
  - Active sessions list with device/IP info
  - Two-factor authentication toggle
  - Security log table
  - States: normal, loading, success (password changed), error

- [ ] `shared/change-password.html` - Change password form
  - Current password field
  - New password field (with strength meter)
  - Confirm new password field
  - Validation rules display
  - States: normal, submitting, success, error (wrong current password)

- [ ] `shared/active-sessions.html` - Session management
  - Table: device, browser, IP, location, last active, current session indicator
  - Revoke session action (per row)
  - Logout all other devices button
  - States: loading, normal, revoking session, success

- [ ] `shared/user-profile.html` - User profile settings
  - Profile photo upload
  - Personal info form (name, email, phone)
  - Notification preferences
  - Display preferences (timezone, date format)
  - States: loading, normal, saving, success, error

#### Auth Flow
- [ ] `shared/forgot-password.html` - Request password reset
  - Email input field
  - Submit button
  - Back to login link
  - States: normal, submitting, success (check email), error (email not found)

- [ ] `shared/reset-password.html` - Reset password form
  - New password field (with strength meter)
  - Confirm password field
  - Token validation indicator
  - States: validating token, normal, submitting, success, error (expired token)

- [ ] `shared/unauthorized.html` - 403 error page
  - Large icon
  - Error message: "You don't have permission to access this page"
  - Reason explanation
  - Back to dashboard button
  - Contact support link

### Phase 5: System Admin Additions (Day 3-4)
**Status:** Not started
**Estimated Time:** 2-4 hours
**Priority:** Low - Admin tools

- [ ] `system-admin/audit-logs.html` - System-wide audit log
  - Same structure as tenant audit-logs.html but system-wide scope
  - Filter by tenant, user, action type, date range
  - Expandable rows with metadata
  - Export to CSV button
  - States: loading, normal, empty, error

### Phase 6: Polish & Documentation (Day 4)
**Status:** Not started
**Estimated Time:** 4-6 hours

- [ ] Update `index.html` gallery with all new wireframes organized by role
- [ ] Create `components/README.md` documenting component usage
- [ ] Add JSDoc-style comments to all component HTML files
- [ ] Verify all wireframes render correctly in browser
- [ ] Cross-reference with backend API routes to ensure 100% coverage
- [ ] Update `WIREFRAME_COMPARISON.md` with new wireframe inventory

## Open Questions

### Technical Questions

1. **HTML Templating Approach**
   - **Question:** Should we use HTML includes, JavaScript templates, or manual copy-paste for component reuse?
   - **Options:**
     - Server-side includes (SSI) - requires local server
     - JavaScript template injection - add minimal JS to load components
     - Manual composition - copy-paste component HTML (simple but more work)
   - **Recommendation:** JavaScript template injection for browser compatibility

2. **Interactive Wireframes**
   - **Question:** Should wireframes include basic interactivity (dropdown menus, modals, tabs) or remain static?
   - **Impact:** Interactive wireframes better demonstrate UX but add complexity
   - **Recommendation:** Add minimal JS for critical interactions (modals, dropdowns)

3. **Component Versioning**
   - **Question:** How do we handle component updates that affect existing wireframes?
   - **Options:**
     - Version components (wf-table-v1.html, wf-table-v2.html)
     - Update in place and regenerate all wireframes
     - Lock component versions per wireframe
   - **Recommendation:** Update in place, it's just HTML wireframes

### Design Questions

4. **Multi-Step Wizard Pattern**
   - **Question:** Should loan application creation use a wizard (multi-page) or long single-page form?
   - **Impact:** Wizard is better UX for long forms but more complex
   - **Recommendation:** Multi-step wizard (5 steps) - already indicated in wireframe list

5. **Data Table Patterns**
   - **Question:** Standardize table column widths, sort indicators, action button placement?
   - **Impact:** Consistency across all data tables
   - **Decision Needed:** Review existing tables and document standard

6. **Mobile Drawer Behavior**
   - **Question:** How should sidebar collapse on smaller desktop viewports (1366px)?
   - **Impact:** Desktop responsiveness even though not creating mobile wireframes
   - **Recommendation:** Sidebar collapses to icons-only at < 1440px

### Process Questions

7. **Review and Feedback**
   - **Question:** Should wireframes be reviewed in batches (by role) or all at end?
   - **Recommendation:** Review after Phase 2 (Officer) and Phase 3 (Approver) for course correction

8. **Implementation Readiness**
   - **Question:** Can development start before all wireframes are complete?
   - **Impact:** Parallel development could speed up overall timeline
   - **Recommendation:** Yes - start implementing after Phase 2 (Officer wireframes) is complete

## Success Criteria

### Completion Criteria
- [ ] All 30 wireframes created and viewable in browser
- [ ] Component library documented and functional
- [ ] 100% backend API route coverage (every endpoint has corresponding wireframe)
- [ ] All UI states represented (success, error, empty, loading) for each wireframe
- [ ] Consistent design system applied across all wireframes
- [ ] Index gallery updated with role-based organization
- [ ] No broken links or missing assets

### Quality Criteria
- [ ] Each wireframe follows common-styles.css exactly (Navy Blue, Gold colors)
- [ ] Typography hierarchy consistent (32px titles, 18px sections, 14px body)
- [ ] Spacing consistent (32px page padding, 24px card padding, 24px section gaps)
- [ ] All forms show validation states (error messages, success indicators)
- [ ] Empty states include helpful messaging and next actions
- [ ] Error states include recovery actions (retry, contact support)
- [ ] Loading states show appropriate skeleton screens or spinners

### Documentation Criteria
- [ ] Component README explains usage with code examples
- [ ] Each wireframe has HTML comments describing its purpose and states
- [ ] Index gallery provides clear navigation and descriptions
- [ ] Relationship to backend API routes documented
- [ ] Design system tokens documented (colors, spacing, typography)

## Next Steps

### Immediate Actions
1. **Run `/workflows:plan`** - Convert this brainstorm into detailed implementation plan
2. **Set up component library structure** - Create `/docs/wireframes/components/` directory
3. **Extract first component** - Start with `wf-header.html` from existing wireframes
4. **Define templating approach** - Choose JavaScript injection or SSI

### After Planning
5. **Day 1: Build component library** (6-8 hours)
   - Extract 9 components from existing wireframes
   - Add templating system for reuse
   - Document component usage

6. **Day 2: Officer wireframes** (8-10 hours)
   - Dashboard, borrowers (list/create/edit/profile)
   - Loan application (create/detail/documents)
   - All states for each wireframe

7. **Day 3: Approver + Shared wireframes** (12-16 hours)
   - Approver dashboard, queue, review
   - Notifications, account security, auth flow
   - All states for each wireframe

8. **Day 4: Polish and documentation** (4-6 hours)
   - System admin audit logs
   - Update index gallery
   - Verify all links and rendering
   - Final review and adjustments

### Long-term Considerations
- **Implementation**: After wireframes complete, start Vue/Vuetify implementation
- **Testing**: Use wireframes as visual regression test baselines
- **Maintenance**: Update wireframes if design system changes
- **Expansion**: Mobile variants (375px) if field officer tablets/phones become priority

## Risks and Mitigations

### Risk 1: Component Templating Complexity
**Risk:** HTML templating approach may be too complex or browser-incompatible
**Likelihood:** Medium
**Impact:** Medium - could slow down wireframe creation
**Mitigation:** Start with simplest approach (manual composition), add templating if needed

### Risk 2: Scope Creep
**Risk:** Discovering new pages/features during wireframe creation
**Likelihood:** High
**Impact:** Medium - could extend timeline
**Mitigation:** Strict adherence to backend API route coverage; new features go to backlog

### Risk 3: Design Inconsistencies
**Risk:** New wireframes diverge from existing design system
**Likelihood:** Medium
**Impact:** High - breaks consistency
**Mitigation:** Component library enforces consistency; review after each phase

### Risk 4: Stakeholder Availability
**Risk:** Delayed feedback on wireframe batches
**Likelihood:** Low
**Impact:** Medium - blocks implementation start
**Mitigation:** Async review process; can continue with next phase while waiting

### Risk 5: Implementation Reality Check
**Risk:** Wireframes may not be fully implementable in Vuetify
**Likelihood:** Low
**Impact:** High - rework required
**Mitigation:** Reference Vuetify component docs during wireframe creation

## Dependencies

### Prerequisites
- ✅ Existing 11 wireframes as templates
- ✅ common-styles.css design system
- ✅ Backend API documentation (routes, models, business logic)
- ✅ User role definitions and permissions
- ⏳ Wireframe component library (to be created in Phase 1)

### External Dependencies
- None - fully self-contained in HTML/CSS

### Blocking Items
- None - can start immediately after planning phase

---

**Document Status:** Ready for planning
**Next Action:** Run `/workflows:plan` to create detailed implementation plan
**Estimated Total Effort:** 28-30 hours over 3-4 focused days
**Owner:** TBD
**Reviewers:** TBD
