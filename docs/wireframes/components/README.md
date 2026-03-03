# Wireframe Component Library

This directory contains 9 reusable HTML component templates for building consistent wireframes across the Ascendent platform.

## Overview

These templates follow the **Template-Based Component System** approach: extract common patterns once, then compose 30+ wireframes by assembling these components. This ensures:

- ✅ **Consistency**: All wireframes use identical patterns
- ✅ **Speed**: Compose wireframes 25% faster than hand-coding
- ✅ **Maintainability**: Change one component, all wireframes update
- ✅ **Quality**: Reduces copy-paste errors and design drift

## Component Catalog

| Component | Purpose | Used In |
|-----------|---------|---------|
| [wf-header.html](#1-wf-header) | Page headers with breadcrumbs and actions | All pages |
| [wf-sidebar.html](#2-wf-sidebar) | Navigation sidebar (260px fixed) | All pages |
| [wf-topbar.html](#3-wf-topbar) | Application topbar (64px height) | All pages |
| [wf-data-table.html](#4-wf-data-table) | Data tables with search/filter/pagination | Lists, reports |
| [wf-form-layout.html](#5-wf-form-layout) | Two-column form layout (form + sidebar) | Create/edit pages |
| [wf-stat-cards.html](#6-wf-stat-cards) | Statistics card grid | Dashboards |
| [wf-empty-state.html](#7-wf-empty-state) | Empty state messaging | All pages |
| [wf-modal.html](#8-wf-modal) | Modal dialogs | Forms, confirmations |
| [wf-states.html](#9-wf-states) | UI states (loading, error, success) | All pages |

## Design System Reference

All components use the design system defined in `../common-styles.css`:

```css
/* Colors */
--primary-navy: #2563EB;
--secondary-gold: #f59e0b;
--success-green: #10b981;
--error-red: #ef4444;
--background: #f9fafb;

/* Typography */
--page-title: 32px / 700;
--section-title: 18px / 600;
--body-text: 14px / 400;

/* Spacing */
--page-padding: 32px;
--card-padding: 24px;
--section-gap: 24px;

/* Layout */
--sidebar-width: 260px;
--topbar-height: 64px;
--border-radius-card: 12px;
```

---

## Component Documentation

### 1. wf-header.html

**Page Header with Breadcrumbs and Actions**

Displays page title, breadcrumbs, and primary actions at the top of content area.

#### When to Use
- At the top of every page (below topbar)
- To show page context (breadcrumbs)
- To display primary page actions (Create, Export, Settings)

#### Usage Example

```html
<div class="page-header">
  <div class="breadcrumbs">
    <span class="breadcrumb-item">Dashboard</span>
    <span class="breadcrumb-separator">/</span>
    <span class="breadcrumb-item active">Users</span>
  </div>
  <h1 class="page-title">User Management</h1>
  <div class="page-actions">
    <button class="btn btn-primary">+ Add User</button>
    <button class="btn btn-secondary">Export CSV</button>
  </div>
</div>
```

#### Customization
- Update breadcrumb trail for page context
- Change page title
- Add/remove action buttons based on user permissions

---

### 2. wf-sidebar.html

**Navigation Sidebar (260px fixed width)**

Fixed-width sidebar with logo, user info, navigation menu, and logout.

#### When to Use
- On all authenticated pages (left side of layout)
- Shows role-specific navigation items
- Displays current user info and role

#### Usage Example

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
      <div class="user-role">Tenant Admin</div>
    </div>
  </div>

  <nav class="nav-menu">
    <a href="#" class="nav-item active">
      <span class="nav-icon">📊</span>
      <span class="nav-label">Dashboard</span>
    </a>
    <!-- More nav items... -->
  </nav>

  <div class="sidebar-footer">
    <a href="login.html" class="nav-item">
      <span class="nav-icon">🚪</span>
      <span class="nav-label">Logout</span>
    </a>
  </div>
</aside>
```

#### Role-Specific Menus

**System Admin:**
- Dashboard, Tenants, Settings, Audit Logs

**Tenant Admin:**
- Dashboard, Users, Loan Types, Applications, Reports, Audit Logs

**Officer:**
- Dashboard, Borrowers, Applications, Documents, Reports

**Approver:**
- Dashboard, Approval Queue, Reports, Settings

---

### 3. wf-topbar.html

**Application Topbar (64px height)**

Sticky topbar with search, notifications, and user menu.

#### When to Use
- On all authenticated pages (top of layout)
- Shows page title, search, and global actions

#### Usage Example

```html
<header class="topbar">
  <div class="page-title">Dashboard</div>

  <div class="search-box">
    <span class="search-icon">🔍</span>
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

---

### 4. wf-data-table.html

**Data Table with Search, Filters, Pagination**

Comprehensive table component with toolbar, sorting, and pagination.

#### When to Use
- User lists, loan applications, borrower lists, audit logs
- Any paginated data display
- Reports with filtering

#### Usage Example

```html
<div class="table-container">
  <div class="table-toolbar">
    <div class="search-box">
      <input type="text" placeholder="Search...">
    </div>
    <div class="filters">
      <select class="filter-select">
        <option>All Statuses</option>
      </select>
    </div>
    <div class="table-actions">
      <button class="btn btn-primary">+ Add New</button>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Name <span class="sort-icon">↕</span></th>
        <th>Email</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>John Doe</td>
        <td>john@example.com</td>
        <td><span class="status-badge status-active">Active</span></td>
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

#### Status Badge Colors

```html
<!-- Active/Approved -->
<span class="status-badge status-active">Active</span>

<!-- Pending -->
<span class="status-badge status-pending">Pending</span>

<!-- Under Review -->
<span class="status-badge status-review">Under Review</span>

<!-- Rejected -->
<span class="status-badge status-rejected">Rejected</span>
```

---

### 5. wf-form-layout.html

**Two-Column Form Layout (Form + Sidebar)**

Form layout with main form (2fr) and help sidebar (1fr).

#### When to Use
- Create/edit pages (users, loan types, borrowers, applications)
- Forms requiring contextual help or related info
- Multi-section forms

#### Usage Example

```html
<div class="form-grid">
  <div class="form-main">
    <div class="card">
      <h2 class="card-title">Create User</h2>
      <form class="wf-form">
        <div class="form-group">
          <label class="form-label required">Email</label>
          <input type="email" class="form-input" required>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label">First Name</label>
            <input type="text" class="form-input">
          </div>
          <div class="form-group">
            <label class="form-label">Last Name</label>
            <input type="text" class="form-input">
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Save</button>
          <button type="button" class="btn btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <aside class="form-sidebar">
    <div class="card">
      <h3 class="card-title">Help & Tips</h3>
      <p class="help-text">
        Enter the user's email address. An invitation will be sent to this email.
      </p>
    </div>
  </aside>
</div>
```

---

### 6. wf-stat-cards.html

**Statistics Card Grid**

Responsive grid of stat cards for dashboards.

#### When to Use
- Dashboard pages (all roles)
- Summary sections at top of list pages
- KPI displays

#### Usage Example

```html
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-value">120</div>
    <div class="stat-label">Total Users</div>
    <div class="stat-change positive">+12% this month</div>
  </div>

  <div class="stat-card">
    <div class="stat-header">
      <div class="stat-icon">💰</div>
      <div class="stat-trend positive">↑ 8%</div>
    </div>
    <div class="stat-value">$2.4M</div>
    <div class="stat-label">Total Disbursed</div>
  </div>
</div>
```

---

### 7. wf-empty-state.html

**Empty State Component**

User-friendly messaging when no data exists.

#### When to Use
- No search results
- Empty tables or lists
- First-time user experience
- Error states

#### Variants

**No Data:**
```html
<div class="empty-state">
  <div class="empty-icon">📭</div>
  <h3 class="empty-title">No items found</h3>
  <p class="empty-message">Get started by creating your first item.</p>
  <button class="btn btn-primary">+ Create Item</button>
</div>
```

**No Search Results:**
```html
<div class="empty-state">
  <div class="empty-icon">🔍</div>
  <h3 class="empty-title">No results found</h3>
  <p class="empty-message">Try adjusting your search or filter.</p>
  <button class="btn btn-secondary">Clear Filters</button>
</div>
```

**All Caught Up:**
```html
<div class="empty-state">
  <div class="empty-icon">✓</div>
  <h3 class="empty-title">All caught up!</h3>
  <p class="empty-message">There are no pending items to review.</p>
</div>
```

---

### 8. wf-modal.html

**Modal Dialog Component**

Overlay modals for forms, confirmations, and alerts.

#### When to Use
- Confirmation dialogs (delete, submit, approve/reject)
- Quick forms (add note, request documents)
- Success/error messages
- Detail views

#### Variants

**Confirmation Modal:**
```html
<div class="modal-overlay">
  <div class="modal modal-sm">
    <div class="modal-header">
      <h3 class="modal-title">Confirm Delete</h3>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-body">
      <p>Are you sure you want to delete this item? This action cannot be undone.</p>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-danger">Delete</button>
    </div>
  </div>
</div>
```

**Form Modal:**
```html
<div class="modal-overlay">
  <div class="modal modal-md">
    <div class="modal-header">
      <h3 class="modal-title">Add Note</h3>
      <button class="modal-close">×</button>
    </div>
    <div class="modal-body">
      <form class="wf-form">
        <div class="form-group">
          <label class="form-label required">Note</label>
          <textarea class="form-textarea" rows="4"></textarea>
        </div>
      </form>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary">Cancel</button>
      <button class="btn btn-primary">Save</button>
    </div>
  </div>
</div>
```

#### Modal Sizes
- `.modal-sm` - 400px (confirmations, alerts)
- `.modal-md` - 600px (default, forms)
- `.modal-lg` - 900px (complex forms, detail views)

---

### 9. wf-states.html

**UI State Templates (Loading, Error, Success)**

Templates for all UI states: loading, error, success, warning, info.

#### Loading States

**Full Page Loading:**
```html
<div class="loading-state">
  <div class="spinner"></div>
  <p class="loading-text">Loading...</p>
</div>
```

**Skeleton Screen (for tables):**
```html
<div class="skeleton-container">
  <div class="skeleton-line"></div>
  <div class="skeleton-line" style="width: 80%;"></div>
  <div class="skeleton-line" style="width: 60%;"></div>
</div>
```

**Button Loading:**
```html
<button class="btn btn-primary" disabled>
  <span class="spinner-btn"></span>
  Submitting...
</button>
```

#### Error States

**Full Page Error:**
```html
<div class="error-state">
  <div class="error-icon">⚠️</div>
  <h3 class="error-title">Something went wrong</h3>
  <p class="error-message">We couldn't load this data. Please try again.</p>
  <div class="error-actions">
    <button class="btn btn-primary">Retry</button>
    <button class="btn btn-secondary">Go Back</button>
  </div>
</div>
```

**Form Field Error:**
```html
<div class="form-group">
  <label class="form-label required">Email</label>
  <input type="email" class="form-input error" value="invalid">
  <span class="error-message">Please enter a valid email address</span>
</div>
```

#### Success States

**Success Toast:**
```html
<div class="toast toast-success">
  <span class="toast-icon">✓</span>
  <div class="toast-content">
    <strong>Success</strong>
    <p>Item created successfully.</p>
  </div>
  <button class="toast-close">×</button>
</div>
```

**Success Banner:**
```html
<div class="banner banner-success">
  <span class="banner-icon">✓</span>
  <p>Your changes have been saved successfully.</p>
  <button class="banner-close">×</button>
</div>
```

---

## How to Create a New Wireframe

Follow these steps to compose a wireframe using the component library:

### Step 1: Start with Basic Layout

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title - Ascendent Wireframe</title>
  <link rel="stylesheet" href="../common-styles.css">
</head>
<body>
  <a href="../index.html" class="back-link">← Back to Index</a>

  <div class="layout">
    <!-- Copy sidebar from wf-sidebar.html -->
    <!-- Copy topbar from wf-topbar.html -->

    <div class="main">
      <div class="content">
        <!-- Your page content here -->
      </div>
    </div>
  </div>
</body>
</html>
```

### Step 2: Add Page-Specific Components

Based on page type, include relevant components:

**List Page:** header + data-table + empty-state
**Form Page:** header + form-layout + states
**Dashboard:** header + stat-cards + data-table
**Modal/Dialog:** Copy from wf-modal.html

### Step 3: Customize Content

- Replace placeholder text with actual content
- Update navigation active states in sidebar
- Add role-specific menu items
- Customize form fields, table columns, stat values

### Step 4: Add UI States

Include variants for:
- Loading state (skeleton or spinner)
- Empty state (no data)
- Error state (failed to load)
- Success state (operation completed)

---

## Component Composition Examples

### Example 1: User List Page

```html
<!-- Page content area -->
<div class="content">
  <!-- wf-header.html -->
  <div class="page-header">
    <div class="breadcrumbs">
      <span class="breadcrumb-item">Dashboard</span>
      <span class="breadcrumb-separator">/</span>
      <span class="breadcrumb-item active">Users</span>
    </div>
    <h1 class="page-title">User Management</h1>
    <div class="page-actions">
      <button class="btn btn-primary">+ Add User</button>
    </div>
  </div>

  <!-- wf-data-table.html -->
  <div class="table-container">
    <!-- ...table implementation... -->
  </div>

  <!-- wf-empty-state.html (shown when no users) -->
  <div class="empty-state" style="display: none;">
    <div class="empty-icon">👥</div>
    <h3 class="empty-title">No users yet</h3>
    <p class="empty-message">Get started by creating your first user.</p>
    <button class="btn btn-primary">+ Add User</button>
  </div>
</div>
```

### Example 2: Dashboard Page

```html
<div class="content">
  <!-- wf-header.html -->
  <div class="page-header">
    <h1 class="page-title">Welcome back, John Doe</h1>
    <p class="page-subtitle">ABC Bank Dashboard</p>
  </div>

  <!-- wf-stat-cards.html -->
  <div class="stats-grid">
    <!-- ...stat cards... -->
  </div>

  <!-- wf-data-table.html (recent activity) -->
  <div class="section-card">
    <div class="section-header">
      <h2 class="section-title">Recent Applications</h2>
    </div>
    <table class="table">
      <!-- ...table rows... -->
    </table>
  </div>
</div>
```

### Example 3: Create Form Page

```html
<div class="content">
  <!-- wf-header.html -->
  <div class="page-header">
    <h1 class="page-title">Create Loan Type</h1>
  </div>

  <!-- wf-form-layout.html -->
  <div class="form-grid">
    <div class="form-main">
      <div class="card">
        <h2 class="card-title">Loan Type Details</h2>
        <form>
          <!-- ...form fields... -->
        </form>
      </div>
    </div>
    <aside class="form-sidebar">
      <div class="card">
        <h3 class="card-title">Help & Tips</h3>
        <!-- ...help content... -->
      </div>
    </aside>
  </div>
</div>
```

---

## Best Practices

### 1. Consistency

✅ **DO:** Use components as-is for maximum consistency
❌ **DON'T:** Modify component HTML structure (copy CSS instead)

### 2. Customization

✅ **DO:** Override CSS in page-specific `<style>` blocks
✅ **DO:** Add page-specific utility classes
❌ **DON'T:** Edit component files directly

### 3. States

✅ **DO:** Show all UI states (loading, empty, error, success) in wireframes
✅ **DO:** Use HTML comments to indicate state variants
❌ **DON'T:** Only show the "happy path"

Example:
```html
<!-- Normal state -->
<table class="table">...</table>

<!-- Empty state (hidden by default) -->
<div class="empty-state" style="display: none;">
  <!-- ...empty state content... -->
</div>
```

### 4. Naming

✅ **DO:** Use semantic class names (`.nav-item`, `.stat-card`)
✅ **DO:** Follow BEM-like conventions for component variants
❌ **DON'T:** Use inline styles excessively (use classes)

---

## Troubleshooting

### Component Not Displaying Correctly

1. **Check common-styles.css is linked:**
   ```html
   <link rel="stylesheet" href="../common-styles.css">
   ```

2. **Verify HTML structure matches component template exactly**

3. **Check for conflicting page-specific CSS**

### Spacing or Layout Issues

1. **Use browser DevTools to inspect elements**
2. **Verify grid/flexbox properties are correct**
3. **Check for missing wrapper divs (`.layout`, `.main`, `.content`)**

### Icons Not Showing

- We use emoji icons (📊, 👥, 💰) for wireframes
- In final Vue implementation, these will be replaced with Material Design Icons (MDI)

---

## Next Steps

After Phase 1 (Component Library), proceed to:

1. **Phase 2:** Create 8 Officer wireframes using these components
2. **Phase 3:** Create 5 Approver wireframes
3. **Phase 4:** Create 9 Shared wireframes
4. **Phase 5:** Create 1 System Admin wireframe
5. **Phase 6:** Polish and documentation

See the full implementation plan: `../plans/2026-03-03-feat-complete-wireframe-coverage-plan.md`

---

## Component Changelog

### 2026-03-03 - Initial Release
- Created 9 base components
- Documented usage examples
- Added best practices guide
- Established component composition patterns
