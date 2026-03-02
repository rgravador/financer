---
title: Complete Wireframe Coverage for All User Roles
type: feat
date: 2026-03-03
brainstorm: docs/brainstorms/2026-03-03-complete-wireframe-coverage-brainstorm.md
approach: Template-Based Component System
scope: ~30 high-fidelity HTML wireframes
timeline: 28-30 hours (3-4 focused days)
---

# Complete Wireframe Coverage for All User Roles

## Overview

Create a comprehensive wireframe library covering 100% of backend features across 4 user roles (system_admin, tenant_admin, tenant_officer, tenant_approver). This will produce **~30 high-fidelity HTML wireframes** using a template-based component system for maximum consistency and maintainability.

**Current State:**
- ✅ 11 wireframes exist covering basic admin and tenant admin flows
- ❌ Pages directory is empty - UI components were deleted
- ✅ Full backend API implemented with comprehensive test coverage
- ✅ Design system established (`common-styles.css` with Navy Blue #1e3a8a, Gold #f59e0b)

**Target State:**
- ✅ ~30 wireframes covering 100% of backend API routes
- ✅ 9 reusable HTML component templates for consistency
- ✅ All UI states documented (success, error, empty, loading)
- ✅ Ready for Vue/Vuetify implementation with minimal interpretation

**Coverage:**
- Current: 35% (11 of ~30 wireframes)
- Target: 100% (30 wireframes covering all features)
- Major gaps: borrower management, loan workflows, approval queue, officer/approver dashboards

## Problem Statement

The backend API is fully implemented with 4 user roles and comprehensive business logic, but only 11 wireframes exist covering ~35% of features. Without complete wireframe coverage:

- **Development Blocked**: Cannot implement Vue pages without design specifications
- **Inconsistency Risk**: Hand-coding each wireframe leads to design drift
- **Time Waste**: Developers waste time making design decisions during implementation
- **User Experience Gap**: Missing critical workflows (borrower management, approval queue)

This plan addresses the gap by creating **~19 new wireframes** using a template-based component system, organized by user role, and including all UI states.

## Proposed Solution

### Approach: Template-Based Component System

**Extract 9 reusable HTML component templates**, then **compose 30 wireframes** by assembling these components.

**Why This Approach:**
1. **Consistency** - All 30 wireframes use identical patterns (headers, sidebars, tables, forms)
2. **Speed** - ~3 days vs 4-5 days for hand-coding each wireframe
3. **Maintainability** - Change one component template, all wireframes update
4. **Quality** - Reduces copy-paste errors and design drift
5. **Mirrors Implementation** - Matches how Vuetify components work, smoother code transition

**Key Design Decisions (from brainstorm):**
- Desktop-only (1920x1080 viewport)
- HTML + CSS matching existing wireframe style
- All UI states: success, error, empty, loading
- Role-based directory organization
- Single deliverable for complete consistency

### Alternative Approaches Considered

1. **Clone-and-Modify Pattern**
   - Pro: Faster to start (no template setup)
   - Con: Inconsistency risk, harder to maintain
   - Rejected: At 30 wireframes, template approach is more efficient

2. **Specification-Driven Generation**
   - Pro: Markdown specs + AI generation
   - Con: AI output needs validation, specs might diverge from wireframes
   - Rejected: Adds complexity, templates are cleaner

## Technical Approach

### Architecture

**Wireframe Directory Structure:**
```
docs/wireframes/
├── common-styles.css              # Existing design system (keep)
├── components/                    # NEW: 9 reusable component templates
│   ├── wf-header.html
│   ├── wf-sidebar.html
│   ├── wf-topbar.html
│   ├── wf-data-table.html
│   ├── wf-form-layout.html
│   ├── wf-stat-cards.html
│   ├── wf-empty-state.html
│   ├── wf-modal.html
│   ├── wf-states.html
│   └── README.md                  # Component usage documentation
├── index.html                     # Gallery (update with new wireframes)
├── login.html                     # Existing auth
├── system-admin/
│   ├── dashboard.html             # Existing (renamed from system-admin-dashboard.html)
│   ├── tenants-list.html          # Existing
│   ├── tenant-details.html        # Existing
│   └── audit-logs.html            # NEW
├── tenant-admin/
│   ├── dashboard.html             # Existing (renamed from tenant-admin-dashboard.html)
│   ├── users-management.html      # Existing
│   ├── loan-types-list.html       # Existing (renamed from loan-types.html)
│   ├── loan-type-form.html        # Existing
│   ├── loan-applications.html     # Existing
│   └── audit-logs.html            # Existing
├── officer/                       # NEW ROLE
│   ├── dashboard.html             # NEW
│   ├── borrowers-list.html        # NEW
│   ├── borrower-create.html       # NEW
│   ├── borrower-edit.html         # NEW
│   ├── borrower-profile.html      # NEW
│   ├── loan-application-create.html  # NEW (multi-step wizard)
│   ├── loan-application-detail.html  # NEW
│   └── document-upload.html       # NEW
├── approver/                      # NEW ROLE
│   ├── dashboard.html             # NEW
│   ├── approval-queue.html        # NEW
│   ├── application-review.html    # NEW
│   ├── approve-reject-form.html   # NEW (modal)
│   └── request-documents-modal.html  # NEW (modal)
└── shared/                        # NEW CATEGORY
    ├── notifications-panel.html   # NEW (topbar dropdown)
    ├── notifications-page.html    # NEW
    ├── account-security.html      # NEW
    ├── change-password.html       # NEW
    ├── active-sessions.html       # NEW
    ├── user-profile.html          # NEW
    ├── forgot-password.html       # NEW
    ├── reset-password.html        # NEW
    └── unauthorized.html          # NEW
```

### Component Library Specifications

Each component is a self-contained HTML snippet that can be included/adapted into wireframes.

#### 1. wf-header.html - Page Header Component
```html
<!-- Reusable page header with title, breadcrumbs, actions -->
<div class="page-header">
  <div class="breadcrumbs">
    <span class="breadcrumb-item">Dashboard</span>
    <span class="breadcrumb-separator">/</span>
    <span class="breadcrumb-item active">Page Name</span>
  </div>
  <h1 class="page-title">Page Title</h1>
  <div class="page-actions">
    <button class="btn btn-primary">Primary Action</button>
    <button class="btn btn-secondary">Secondary Action</button>
  </div>
</div>
```

#### 2. wf-sidebar.html - Navigation Sidebar (260px fixed)
```html
<aside class="sidebar">
  <div class="sidebar-header">
    <div class="logo">
      <div class="logo-icon">A</div>
      <div class="logo-text">ASCENDENT</div>
    </div>
  </div>

  <div class="user-info">
    <div class="user-avatar">JD</div>
    <div>
      <div class="user-name">John Doe</div>
      <div class="user-role">Role Name</div>
    </div>
  </div>

  <nav class="nav-menu">
    <a href="#" class="nav-item active">
      <span class="nav-icon">📊</span>
      <span class="nav-label">Dashboard</span>
    </a>
    <!-- Role-specific menu items -->
  </nav>
</aside>
```

#### 3. wf-topbar.html - Application Topbar (64px height)
```html
<header class="topbar">
  <button class="menu-toggle">☰</button>
  <div class="search-box">
    <input type="text" placeholder="Search...">
  </div>
  <div class="topbar-actions">
    <button class="icon-btn">
      🔔
      <span class="badge">3</span>
    </button>
    <div class="user-menu">
      <div class="user-avatar">JD</div>
    </div>
  </div>
</header>
```

#### 4. wf-data-table.html - Data Table with Search/Filter/Pagination
```html
<div class="table-container">
  <div class="table-toolbar">
    <input class="search-box" type="text" placeholder="Search...">
    <div class="filters">
      <select class="filter-select">
        <option>All Statuses</option>
        <option>Active</option>
        <option>Inactive</option>
      </select>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Column 1 <span class="sort-icon">↕</span></th>
        <th>Column 2 <span class="sort-icon">↕</span></th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>
          <button class="btn-icon">✏️</button>
          <button class="btn-icon">🗑️</button>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="pagination">
    <button class="pagination-btn">← Previous</button>
    <span class="pagination-info">Page 1 of 10</span>
    <button class="pagination-btn">Next →</button>
  </div>
</div>
```

#### 5. wf-form-layout.html - Two-Column Form Layout
```html
<div class="form-layout">
  <div class="form-main">
    <form class="wf-form">
      <div class="form-group">
        <label class="form-label required">Field Name</label>
        <input type="text" class="form-input" placeholder="Enter value">
        <span class="error-message" style="display:none;">Validation error</span>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn btn-primary">Submit</button>
        <button type="button" class="btn btn-secondary">Cancel</button>
      </div>
    </form>
  </div>

  <aside class="form-sidebar">
    <div class="card">
      <h3 class="card-title">Help & Tips</h3>
      <p class="card-text">Contextual help content here.</p>
    </div>
  </aside>
</div>
```

#### 6. wf-stat-cards.html - Statistics Card Grid
```html
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-value">120</div>
    <div class="stat-label">Total Users</div>
    <div class="stat-change positive">+12% this month</div>
  </div>
  <!-- Repeat for other stats -->
</div>
```

#### 7. wf-empty-state.html - Empty State Component
```html
<div class="empty-state">
  <div class="empty-icon">📭</div>
  <h3 class="empty-title">No items found</h3>
  <p class="empty-message">Get started by creating your first item.</p>
  <button class="btn btn-primary">Create Item</button>
</div>
```

#### 8. wf-modal.html - Modal Dialog Component
```html
<div class="modal-overlay">
  <div class="modal">
    <div class="modal-header">
      <h3 class="modal-title">Modal Title</h3>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-body">
      Modal content here.
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Confirm</button>
    </div>
  </div>
</div>
```

#### 9. wf-states.html - UI State Templates
```html
<!-- Loading State -->
<div class="loading-state">
  <div class="spinner"></div>
  <p>Loading...</p>
</div>

<!-- Error State -->
<div class="error-state">
  <div class="error-icon">⚠️</div>
  <h3>Error Title</h3>
  <p>Error message description.</p>
  <button class="btn btn-primary">Retry</button>
</div>

<!-- Success State -->
<div class="success-state">
  <div class="success-icon">✓</div>
  <h3>Success!</h3>
  <p>Action completed successfully.</p>
</div>
```

### Implementation Phases

#### Phase 1: Component Library (Day 1, 6-8 hours)

**Goal:** Extract and create 9 reusable HTML component templates

**Tasks:**
- [ ] Create `docs/wireframes/components/` directory structure
- [ ] Extract `wf-header.html` from existing wireframes (e.g., tenant-admin-dashboard.html)
- [ ] Extract `wf-sidebar.html` with role-based navigation pattern
- [ ] Extract `wf-topbar.html` from existing wireframes
- [ ] Extract `wf-data-table.html` from users-management.html or loan-applications.html
- [ ] Extract `wf-form-layout.html` from loan-type-form.html (two-column pattern)
- [ ] Extract `wf-stat-cards.html` from dashboard wireframes
- [ ] Create `wf-empty-state.html` template
- [ ] Create `wf-modal.html` template
- [ ] Create `wf-states.html` with loading, error, success variants
- [ ] Write `components/README.md` documenting usage with code examples

**Success Criteria:**
- All 9 component HTML files created and tested
- Each component renders correctly in browser standalone
- README documents how to include/compose components
- Components match common-styles.css design system exactly

#### Phase 2: Officer Role Wireframes (Day 2, 8-10 hours)

**Goal:** Create 8 wireframes for officer role (borrower management + loan workflow)

**Priority:** HIGH - Core business workflow

##### officer/dashboard.html
- [ ] Stat cards: Active loans, pending applications, total borrowers
- [ ] Recent applications table (top 5-10)
- [ ] Quick action cards (new application, new borrower)
- [ ] States: normal, empty (no applications yet)

##### officer/borrowers-list.html
- [ ] Data table: name, email, phone, total loans, status, actions
- [ ] Search by name/email
- [ ] Filter by status (active, inactive)
- [ ] Pagination
- [ ] States: normal, empty (no borrowers), loading, error

##### officer/borrower-create.html
- [ ] Form fields: personal info (name, email, phone), contact info (address), employment info (employer, income)
- [ ] Form validation indicators (required fields, field errors)
- [ ] Two-column layout (form + help sidebar)
- [ ] States: normal, submitting, success (redirect message), error (validation errors)

##### officer/borrower-edit.html
- [ ] Same form as create but pre-populated with existing data
- [ ] States: loading data, normal, submitting, success, error

##### officer/borrower-profile.html
- [ ] Personal information card
- [ ] Employment history card
- [ ] Loan history table (past and active loans)
- [ ] Document list (uploaded docs)
- [ ] Action buttons (edit, archive)
- [ ] States: loading, normal, error (not found)

##### officer/loan-application-create.html (Multi-Step Wizard)
- [ ] Step 1: Select borrower (search or create new)
- [ ] Step 2: Select loan type (from active loan types)
- [ ] Step 3: Loan details (amount, term, purpose)
- [ ] Step 4: Upload documents (drag-and-drop or file picker)
- [ ] Step 5: Review and submit (summary of all entered data)
- [ ] Progress indicator (1/5, 2/5, etc.)
- [ ] Navigation: Next, Previous, Cancel buttons
- [ ] States: each step has validation, overall loading/submitting

##### officer/loan-application-detail.html
- [ ] Application summary card (app ID, status, submitted date)
- [ ] Borrower info card (name, email, phone)
- [ ] Loan details card (type, amount, term, purpose, rate)
- [ ] Document list with upload interface
- [ ] Status timeline (submitted → under review → approved/rejected)
- [ ] Action buttons (edit draft, submit, withdraw)
- [ ] States: loading, normal, submitting, success, error

##### officer/document-upload.html
- [ ] Drag-and-drop upload area
- [ ] Document list with preview icons (PDF, DOC, etc.)
- [ ] File type validation (PDF, DOC, JPG, PNG)
- [ ] File size limit indicator (max 10MB)
- [ ] Upload progress indicators (progress bars)
- [ ] States: normal, uploading (progress), success (uploaded), error (invalid file type, size limit exceeded)

**Success Criteria:**
- All 8 officer wireframes created
- Each wireframe includes all specified UI states
- Wireframes use component templates from Phase 1
- Visual consistency with existing wireframes
- All wireframes render correctly in browser

#### Phase 3: Approver Role Wireframes (Day 2-3, 6-8 hours)

**Goal:** Create 5 wireframes for approver role (approval queue + review workflow)

**Priority:** HIGH - Core approval workflow

##### approver/dashboard.html
- [x] Stat cards: pending reviews, approved today, rejected today, avg approval time
- [x] Pending queue preview (top 5)
- [x] Recent decisions table (last 10 approvals/rejections)
- [x] Quick filters (high priority, over 30 days, flagged)
- [x] States: normal, empty (no pending reviews)

##### approver/approval-queue.html
- [x] Tabbed view: Pending | Approved (by me) | Rejected (by me) | All
- [x] Data table: app ID, borrower name, loan type, amount, submitted date, days pending, priority flag
- [x] Filter by loan type, amount range, days pending
- [x] Sort by priority, date, amount
- [x] Batch actions (assign to me, flag for review)
- [x] Pagination
- [x] States: normal, empty, loading, error

##### approver/application-review.html
- [x] Two-column layout (application details + decision panel)
- [x] Left column:
  - Application summary (borrower, loan details, requested amount/rate)
  - Credit score card (if available)
  - Debt-to-income ratio card
  - Document viewer/checklist (with document status: uploaded, missing, pending)
  - Risk assessment card (auto-calculated risk scores)
- [x] Right column (decision panel):
  - Decision radio buttons: Approve / Reject / Request More Info
  - Comment/notes field (required for reject)
  - Approval conditions (if approve: final rate, terms)
  - Submit decision button
- [x] Approval history timeline (previous decisions, who approved, when)
- [x] States: loading, normal, submitting decision, success (decision saved), error (submission failed)

##### approver/approve-reject-form.html (Modal)
- [x] Modal header: "Review Decision"
- [x] Radio buttons: Approve / Reject
- [x] If approve:
  - Final interest rate field (with min/max from loan type)
  - Terms and conditions textarea
  - Conditions checkboxes
- [x] If reject:
  - Rejection reason dropdown (insufficient documentation, credit score, debt ratio, other)
  - Additional notes textarea (required)
- [x] Comment field (optional for approve, required for reject)
- [x] Confirmation checkboxes ("I have reviewed all documents")
- [x] Modal footer: Cancel, Confirm buttons
- [x] States: normal, submitting, success (modal closes, redirects to queue), error (validation)

##### approver/request-documents-modal.html
- [x] Modal header: "Request Additional Documents"
- [x] Checklist of standard document types (proof of income, bank statements, credit report, etc.)
- [x] Custom document request field (free text for non-standard docs)
- [x] Deadline date selector (calendar picker)
- [x] Email notification toggle (send notification to borrower)
- [x] Comment field for request context
- [x] Modal footer: Cancel, Request Documents buttons
- [x] States: normal, submitting, success (modal closes, notification sent)

**Success Criteria:**
- All 5 approver wireframes created
- Multi-column layouts properly structured
- Modals use wf-modal.html template
- All decision workflows covered
- States documented for each wireframe

#### Phase 4: Shared Wireframes (Day 3, 6-8 hours)

**Goal:** Create 9 shared wireframes (notifications, account, auth)

**Priority:** MEDIUM - Supporting features

##### shared/notifications-panel.html (Topbar Dropdown)
- [x] Notification list (last 10 notifications)
- [x] Unread indicator badges (blue dot or count)
- [x] Notification types: system, application status change, approval decision, document request
- [x] Mark as read action (per notification)
- [x] "View all" link at bottom
- [x] States: loading, normal (with notifications), empty (no notifications)

##### shared/notifications-page.html
- [x] All notifications list (paginated)
- [x] Filter by type (system, application, approval, document)
- [x] Filter by read/unread status
- [x] Mark all as read button
- [x] Individual mark as read/delete actions
- [x] Pagination
- [x] States: loading, normal, empty

##### shared/account-security.html
- [x] Page header: "Account Security"
- [x] Change password card (link to change-password.html or inline form)
- [x] Active sessions list (table with device, browser, IP, location, last active)
- [x] Two-factor authentication toggle (on/off switch)
- [x] Security log table (recent security events: password changed, login from new device, etc.)
- [x] States: normal, loading, success (password changed), error

##### shared/change-password.html
- [x] Current password field (with show/hide toggle)
- [x] New password field (with strength meter: weak, medium, strong)
- [x] Confirm new password field
- [x] Password requirements display (8+ chars, uppercase, lowercase, number, special char)
- [x] Validation rules (real-time as user types)
- [x] Submit button
- [x] States: normal, submitting, success (password changed, redirect to dashboard), error (wrong current password, passwords don't match)

##### shared/active-sessions.html
- [x] Table columns: device, browser, IP address, location (city/country), last active, current session indicator
- [x] Revoke session action (per row)
- [x] Current session highlighted (cannot revoke)
- [x] "Logout all other devices" button
- [x] Confirmation modal before revoking sessions
- [x] States: loading, normal, revoking session, success (session revoked)

##### shared/user-profile.html
- [x] Profile photo upload (with crop/resize preview)
- [x] Personal info form: first name, last name, email (read-only), phone
- [x] Notification preferences: email notifications (on/off), in-app notifications (on/off), notification types (application updates, system alerts, etc.)
- [x] Display preferences: timezone selector, date format (MM/DD/YYYY vs DD/MM/YYYY)
- [x] Save/Cancel buttons
- [x] States: loading, normal, saving, success (saved), error

##### shared/forgot-password.html
- [x] Email input field
- [x] Submit button
- [x] Back to login link
- [x] States: normal, submitting, success (check email message with instructions), error (email not found)

##### shared/reset-password.html
- [x] New password field (with strength meter)
- [x] Confirm password field
- [x] Token validation indicator (valid token vs expired token)
- [x] Submit button
- [x] States: validating token, normal, submitting, success (password reset, redirect to login), error (expired token, passwords don't match)

##### shared/unauthorized.html (403 Error Page)
- [x] Large icon (lock or shield)
- [x] Error message: "You don't have permission to access this page"
- [x] Reason explanation (based on role): "This page requires [system_admin] role"
- [x] Back to dashboard button
- [x] Contact support link

**Success Criteria:**
- All 9 shared wireframes created
- Auth flow is complete (login → forgot password → reset password)
- Account management features documented
- Notification system visualized (panel + page)
- States cover all user journeys

#### Phase 5: System Admin Additions (Day 3-4, 2-4 hours)

**Goal:** Create 1 additional system admin wireframe

**Priority:** LOW - Admin tools

##### system-admin/audit-logs.html
- [x] Same structure as tenant-admin/audit-logs.html but system-wide scope
- [x] Filter by tenant (dropdown with all tenants)
- [x] Filter by user (search/select)
- [x] Filter by action type (user created, loan approved, settings changed, etc.)
- [x] Filter by date range (calendar date pickers)
- [x] Expandable rows with JSON metadata
- [x] Export to CSV button
- [x] Pagination
- [x] States: loading, normal, empty (no logs), error

**Success Criteria:**
- System admin audit log wireframe created
- Multi-tenant filtering visualized
- Consistent with tenant-level audit logs

#### Phase 6: Polish & Documentation (Day 4, 4-6 hours)

**Goal:** Finalize, document, and verify all wireframes

**Tasks:**
- [x] Reorganize existing wireframes into role-based directories
  - Moved `system-admin-dashboard.html` → `system-admin/dashboard.html`
  - Moved `tenant-admin-dashboard.html` → `tenant-admin/dashboard.html`
  - Moved `tenants-list.html` → `system-admin/tenants-list.html`
  - Moved `tenant-details.html` → `system-admin/tenant-details.html`
  - Moved `users-management.html` → `tenant-admin/users-management.html`
  - Moved `loan-types.html` → `tenant-admin/loan-types-list.html`
  - Moved `loan-type-form.html` → `tenant-admin/loan-type-form.html`
  - Moved `loan-applications.html` → `tenant-admin/loan-applications.html`
  - Moved `audit-logs.html` → `tenant-admin/audit-logs.html`
- [x] Update `index.html` gallery with all 32 wireframes organized by role:
  - System Admin section (4 wireframes)
  - Tenant Admin section (6 wireframes)
  - Officer section (8 wireframes)
  - Approver section (5 wireframes)
  - Shared/Common section (9 wireframes)
- [x] Add JSDoc-style HTML comments to all new wireframes describing purpose and states
- [x] Verify all wireframes render correctly in browser (test in Chrome, Safari, Firefox)
- [x] Cross-reference with backend API routes to ensure 100% coverage:
  - `/api/borrowers/*` → officer wireframes ✓
  - `/api/loans/*` → officer wireframes ✓
  - `/api/approver/*` → approver wireframes ✓
  - `/api/notifications/*` → shared wireframes ✓
  - `/api/auth/*` → shared auth wireframes ✓
- [x] Update `WIREFRAME_COMPARISON.md` with new wireframe inventory
- [x] Create `docs/wireframes/WIREFRAME_GUIDE.md` with:
  - How to use component templates
  - How to create new wireframes
  - Design system reference (colors, spacing, typography)
  - File naming conventions
  - State variant patterns

**Success Criteria:**
- All wireframes organized by role in subdirectories
- Index gallery provides clear navigation
- No broken links or missing assets
- 100% API route coverage verified
- Documentation complete

## Acceptance Criteria

### Functional Requirements

- [ ] **Component Library Created**
  - 9 reusable HTML component templates exist in `docs/wireframes/components/`
  - Components are documented with usage examples in `components/README.md`
  - Each component matches `common-styles.css` design system exactly

- [ ] **All 30 Wireframes Created**
  - System Admin: 4 wireframes (dashboard, tenants-list, tenant-details, audit-logs)
  - Tenant Admin: 7 wireframes (dashboard, users, loan-types list + form, applications, audit-logs)
  - Officer: 8 wireframes (dashboard, borrowers list/create/edit/profile, loan application create/detail, document-upload)
  - Approver: 5 wireframes (dashboard, approval-queue, application-review, approve-reject-form, request-documents-modal)
  - Shared: 9 wireframes (notifications panel/page, account-security, change-password, active-sessions, user-profile, forgot-password, reset-password, unauthorized)

- [ ] **All UI States Documented**
  - Each wireframe shows multiple states (normal, loading, empty, error, success)
  - State variants use CSS classes or inline comments to indicate different states
  - Loading states show skeleton screens or spinners
  - Empty states include helpful messaging and next actions
  - Error states include recovery actions (retry, contact support)

- [ ] **100% Backend API Coverage**
  - Every backend API endpoint has a corresponding wireframe
  - Cross-reference checklist completed between API routes and wireframes
  - No missing workflows or user journeys

### Non-Functional Requirements

- [ ] **Design System Consistency**
  - All wireframes reference `common-styles.css` (no duplicate styles)
  - Navy Blue (#1e3a8a) and Gold (#f59e0b) colors used throughout
  - Typography hierarchy consistent (32px titles, 18px sections, 14px body)
  - Spacing consistent (32px page padding, 24px card padding, 24px section gaps)
  - Sidebar: 260px fixed width
  - Topbar: 64px fixed height

- [ ] **Browser Compatibility**
  - All wireframes render correctly in Chrome, Safari, Firefox
  - No broken CSS or layout issues
  - Images and icons display properly

- [ ] **Documentation Quality**
  - Component README explains usage with code examples
  - Each wireframe has HTML comments describing its purpose and states
  - Index gallery provides clear navigation and role-based organization
  - Relationship to backend API routes documented
  - WIREFRAME_GUIDE.md created with best practices

### Quality Gates

- [ ] **Visual Review**: All wireframes reviewed for consistency with design system
- [ ] **Link Check**: No broken links in index gallery or back-links
- [ ] **Asset Check**: All images, icons, and CSS files load correctly
- [ ] **State Coverage**: Each wireframe includes all relevant UI states
- [ ] **API Coverage**: 100% verified against backend routes

## Success Metrics

### Completion Metrics
- **Wireframe Count**: 30 wireframes created (19 new + 11 existing reorganized)
- **Component Reuse**: 9 components used across all 30 wireframes
- **API Coverage**: 100% (every API endpoint has wireframe)
- **Documentation**: 3 guides created (component README, wireframe guide, updated comparison doc)

### Quality Metrics
- **Design Consistency**: >95% match to common-styles.css tokens
- **State Coverage**: 100% of wireframes include all relevant states
- **Browser Compatibility**: 100% wireframes render correctly in Chrome, Safari, Firefox
- **Zero Defects**: No broken links, missing assets, or visual bugs

### Timeline Metrics
- **Phase 1 (Component Library)**: 6-8 hours
- **Phase 2 (Officer)**: 8-10 hours
- **Phase 3 (Approver)**: 6-8 hours
- **Phase 4 (Shared)**: 6-8 hours
- **Phase 5 (System Admin)**: 2-4 hours
- **Phase 6 (Polish)**: 4-6 hours
- **Total**: 28-30 hours (3-4 focused days)

## Dependencies & Prerequisites

### Prerequisites
- ✅ Existing 11 wireframes as reference templates
- ✅ `common-styles.css` design system fully defined
- ✅ Backend API fully implemented with documented routes
- ✅ User role definitions and permissions documented
- ✅ Brainstorm document with detailed specifications

### External Dependencies
- None - fully self-contained HTML/CSS wireframes

### Blocking Items
- None - can start immediately

## Risk Analysis & Mitigation

### Risk 1: Component Templating Complexity
**Risk:** HTML component reuse approach may be too complex or browser-incompatible
**Likelihood:** Medium
**Impact:** Medium - could slow wireframe creation
**Mitigation:**
- Start with simplest approach (manual copy-paste from component templates)
- Add JavaScript templating only if needed for efficiency
- Test component composition early in Phase 1

### Risk 2: Scope Creep
**Risk:** Discovering new pages/features during wireframe creation
**Likelihood:** High
**Impact:** Medium - could extend timeline
**Mitigation:**
- Strict adherence to backend API route coverage (no extras)
- New features discovered go to backlog, not current scope
- Phase 6 includes final cross-reference check to prevent last-minute additions

### Risk 3: Design Inconsistencies
**Risk:** New wireframes diverge from existing design system
**Likelihood:** Medium
**Impact:** High - breaks consistency, requires rework
**Mitigation:**
- Component library in Phase 1 enforces patterns
- Review after each phase (Phase 2, 3, 4) for consistency
- Use existing wireframes as visual reference during creation

### Risk 4: Multi-Step Wizard Complexity
**Risk:** Loan application creation wizard is more complex than estimated
**Likelihood:** Medium
**Impact:** Medium - could add 2-4 hours to Phase 2
**Mitigation:**
- Allocate extra time in Phase 2 for wizard (already budgeted 8-10 hours)
- Use simple step indicator pattern from existing wireframes
- Focus on structure, not interaction (it's a static wireframe)

### Risk 5: Stakeholder Availability for Review
**Risk:** Delayed feedback on wireframe batches
**Likelihood:** Low
**Impact:** Medium - blocks Vue implementation start
**Mitigation:**
- Async review process (share wireframes via gallery)
- Can start Vue implementation before all feedback addressed
- Prioritize critical flows (officer, approver) for early review

## Future Considerations

### Implementation Phase
- After wireframes complete, start Vue/Vuetify implementation
- Use wireframes as visual regression test baselines (screenshot comparison)
- Implement officer role first (highest business priority)
- Parallel development: one developer on wireframes, another on implementation

### Mobile Variants
- If field officers need tablet/mobile access, create responsive variants
- Target breakpoints: 768px (tablet), 375px (mobile)
- Estimate: +50% time (15 additional wireframe variants)

### Design System Evolution
- Update `common-styles.css` if design tokens change
- Regenerate wireframes using component templates (quick update)
- Version components if needed (wf-table-v1.html, wf-table-v2.html)

### Internationalization
- Wireframes currently English-only
- If i18n needed, add translated wireframe variants
- Use placeholder text patterns (e.g., {{t.dashboard.title}})

## References & Research

### Internal References

**Existing Wireframes** (Reference Patterns):
- `docs/wireframes/tenant-admin-dashboard.html` - Dashboard layout, stat cards, recent activity table
- `docs/wireframes/loan-applications.html` - Data table with search, filters, pagination
- `docs/wireframes/loan-type-form.html` - Two-column form layout (form + sidebar)
- `docs/wireframes/users-management.html` - Role badges, status badges, action buttons
- `docs/wireframes/audit-logs.html` - Expandable rows, JSON metadata display

**Design System**:
- `docs/wireframes/common-styles.css` - All color tokens, typography, spacing, components

**Documentation**:
- `docs/wireframes/application-wireframe.md` - Complete ASCII wireframe specifications
- `docs/WIREFRAME_COMPARISON.md` - Implementation quality report (92% compliance)
- `docs/brainstorms/2026-03-03-complete-wireframe-coverage-brainstorm.md` - Detailed specifications

**Backend API Routes** (Coverage Reference):
- `server/api/borrowers/` - Borrower management endpoints
- `server/api/loans/` - Loan application workflow endpoints
- `server/api/approver/` - Approval queue endpoints
- `server/api/notifications/` - Notification system endpoints
- `server/api/auth/` - Authentication endpoints

### External References

*Note: No external research conducted - strong local context and established patterns available*

### Related Work

- Previous UI rebuild documented in `docs/plans/2026-03-02-feat-ui-rebuild-wireframe-match-plan.md`
- Component library brainstorm in `docs/brainstorms/2026-03-02-component-library-brainstorm.md`
- UI rebuild brainstorm in `docs/brainstorms/2026-03-02-ui-rebuild-brainstorm.md`

---

## Implementation Checklist

Use this checklist to track progress during implementation:

### Phase 1: Component Library
- [x] Create `docs/wireframes/components/` directory
- [x] Create wf-header.html
- [x] Create wf-sidebar.html
- [x] Create wf-topbar.html
- [x] Create wf-data-table.html
- [x] Create wf-form-layout.html
- [x] Create wf-stat-cards.html
- [x] Create wf-empty-state.html
- [x] Create wf-modal.html
- [x] Create wf-states.html
- [x] Write components/README.md

### Phase 2: Officer Role (8 wireframes)
- [x] officer/dashboard.html
- [x] officer/borrowers-list.html
- [x] officer/borrower-create.html
- [x] officer/borrower-edit.html
- [x] officer/borrower-profile.html
- [x] officer/loan-application-create.html (wizard)
- [x] officer/loan-application-detail.html
- [x] officer/document-upload.html

### Phase 3: Approver Role (5 wireframes)
- [x] approver/dashboard.html
- [x] approver/approval-queue.html
- [x] approver/application-review.html
- [x] approver/approve-reject-form.html
- [x] approver/request-documents-modal.html

### Phase 4: Shared (9 wireframes)
- [x] shared/notifications-panel.html
- [x] shared/notifications-page.html
- [x] shared/account-security.html
- [x] shared/change-password.html
- [x] shared/active-sessions.html
- [x] shared/user-profile.html
- [x] shared/forgot-password.html
- [x] shared/reset-password.html
- [x] shared/unauthorized.html

### Phase 5: System Admin (1 wireframe)
- [x] system-admin/audit-logs.html

### Phase 6: Polish & Documentation
- [x] Reorganize existing 11 wireframes into role directories
- [x] Update index.html gallery
- [x] Add HTML comments to all wireframes
- [x] Browser compatibility testing
- [x] API coverage verification
- [x] Update WIREFRAME_COMPARISON.md
- [x] Create WIREFRAME_GUIDE.md

---

**Ready for Implementation**: Yes ✅
**Next Step**: Start Phase 1 (Component Library)
**Estimated Completion**: 3-4 focused days
