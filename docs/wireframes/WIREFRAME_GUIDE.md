# Wireframe Development Guide

This guide explains how to create and maintain wireframes for the Ascendent loan management system.

## Table of Contents
- [Design System Reference](#design-system-reference)
- [Using Component Templates](#using-component-templates)
- [Creating New Wireframes](#creating-new-wireframes)
- [File Naming Conventions](#file-naming-conventions)
- [State Variant Patterns](#state-variant-patterns)
- [Browser Compatibility](#browser-compatibility)

## Design System Reference

### Color Palette (Navy Blue & Gold)

```css
/* Primary Colors */
--primary: #2563EB;      /* Navy Blue - headers, buttons, active states */
--secondary: #f59e0b;    /* Gold - accents, highlights, secondary actions */
--accent: #eab308;       /* Light Gold - hover states, badges */

/* Semantic Colors */
--success: #10B981;      /* Green - success states, approvals */
--error: #EF4444;        /* Red - errors, rejections, warnings */
--info: #3B82F6;         /* Blue - informational messages */
--warning: #F59E0B;      /* Orange - warning states */

/* Neutral Colors */
--background: #F8FAFC;   /* Light gray - page background */
--surface: #FFFFFF;      /* White - card backgrounds */
--border: #E5E7EB;       /* Light gray - borders, dividers */
--text-primary: #1E293B; /* Dark gray - primary text */
--text-secondary: #64748B; /* Medium gray - secondary text */
--text-disabled: #94A3B8; /* Light gray - disabled text */
```

### Typography Scale

```css
/* Headings */
h1: 32px, font-weight: 700, color: #2563EB
h2: 24px, font-weight: 600, color: #1E293B
h3: 20px, font-weight: 600, color: #1E293B
h4: 18px, font-weight: 600, color: #1E293B

/* Body Text */
body: 14px, font-weight: 400, line-height: 1.5
.text-large: 16px
.text-small: 12px
.text-tiny: 11px
```

### Spacing System

```css
/* Base unit: 4px */
--spacing-1: 4px
--spacing-2: 8px
--spacing-3: 12px
--spacing-4: 16px
--spacing-5: 20px
--spacing-6: 24px
--spacing-8: 32px
--spacing-10: 40px
--spacing-12: 48px

/* Component-specific spacing */
Card padding: 24px
Page container: 32px
Section gap: 32px
Form field gap: 24px
Button padding: 12px 24px
```

### Border Radius

```css
--radius-sm: 4px   /* Small elements, badges */
--radius-md: 8px   /* Buttons, inputs, cards */
--radius-lg: 12px  /* Modals, large cards */
--radius-full: 9999px /* Pills, avatars */
```

## Using Component Templates

All component templates are located in `/docs/wireframes/components/`. These templates provide reusable UI patterns.

### Available Components

1. **wf-header.html** - Page header with breadcrumbs
2. **wf-topbar.html** - Application top navigation bar
3. **wf-sidebar.html** - Left navigation menu
4. **wf-stat-cards.html** - Dashboard statistics cards
5. **wf-data-table.html** - Sortable data table
6. **wf-form-layout.html** - Form layout with sections
7. **wf-modal.html** - Modal dialog overlay
8. **wf-empty-state.html** - Empty state placeholders
9. **wf-states.html** - Loading, error, and success states

### Including Components in Wireframes

Copy the component HTML from the template files and paste into your wireframe. Update the content and styling as needed.

**Example: Using the Header Component**

```html
<!-- Copy from wf-header.html -->
<div class="page-header">
  <div class="breadcrumbs">
    <span class="breadcrumb">Dashboard</span>
    <span class="breadcrumb-separator">/</span>
    <span class="breadcrumb active">Page Title</span>
  </div>
  <h1>Page Title</h1>
</div>
```

**Example: Using the Data Table Component**

```html
<!-- Copy from wf-data-table.html -->
<div class="table-container">
  <table class="data-table">
    <thead>
      <tr>
        <th>Column 1</th>
        <th>Column 2</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Data 1</td>
        <td>Data 2</td>
        <td>
          <button class="btn-action">Edit</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

## Creating New Wireframes

### Step 1: Choose the Correct Directory

Place your wireframe in the appropriate role-based directory:

```
docs/wireframes/
├── system-admin/      # System administrator views
├── tenant-admin/      # Tenant administrator views
├── officer/           # Loan officer views
├── approver/          # Loan approver views
└── shared/            # Views accessible by multiple roles
```

### Step 2: Start with the Base Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title - Ascendent</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background: #F8FAFC;
      color: #1E293B;
      font-size: 14px;
      line-height: 1.5;
    }

    .app-layout {
      display: flex;
      min-height: 100vh;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .page-container {
      flex: 1;
      padding: 32px;
      max-width: 1400px;
      margin: 0 auto;
      width: 100%;
    }

    /* Add component styles here */
  </style>
</head>
<body>
  <div class="app-layout">
    <!-- Include sidebar component -->
    <!-- Include topbar component -->

    <div class="main-content">
      <div class="page-container">
        <!-- Include page header -->

        <!-- Page content here -->
      </div>
    </div>
  </div>
</body>
</html>
```

### Step 3: Add Component-Specific Styles

Copy styles from component templates and customize as needed. Keep all styles inline in the `<style>` tag.

### Step 4: Populate with Realistic Data

Use realistic sample data that represents actual use cases:

- **Names**: John Smith, Maria Garcia, Robert Johnson
- **Emails**: user@example.com, admin@company.com
- **Dates**: Use recent dates (within 30 days)
- **Amounts**: Realistic loan amounts ($5,000 - $500,000)
- **Status labels**: "Pending", "Approved", "In Review", "Rejected"

### Step 5: Test Responsiveness

Ensure the wireframe works at common viewport sizes:
- Desktop: 1920px, 1440px, 1280px
- Tablet: 1024px, 768px
- Mobile: 375px, 414px

## File Naming Conventions

### Format
```
[role]/[feature-name].html
```

### Examples
```
system-admin/dashboard.html
tenant-admin/users-management.html
officer/borrower-create.html
approver/approval-queue.html
shared/notifications-panel.html
```

### Rules
1. Use lowercase letters
2. Separate words with hyphens (kebab-case)
3. Use descriptive names that indicate purpose
4. Avoid abbreviations unless commonly understood
5. For forms, suffix with `-form` or specify action (`-create`, `-edit`)
6. For lists, suffix with `-list` or use plural form

## State Variant Patterns

### Loading States

```html
<div class="loading-state">
  <div class="spinner"></div>
  <p>Loading data...</p>
</div>
```

```css
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px;
  color: #64748B;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #E5E7EB;
  border-top-color: #2563EB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Empty States

```html
<div class="empty-state">
  <div class="empty-icon">📭</div>
  <h3>No items found</h3>
  <p>Get started by creating your first item</p>
  <button class="btn-primary">Create Item</button>
</div>
```

### Error States

```html
<div class="error-state">
  <div class="error-icon">⚠️</div>
  <h3>Something went wrong</h3>
  <p>Unable to load data. Please try again.</p>
  <button class="btn-secondary">Retry</button>
</div>
```

### Success States

```html
<div class="success-message">
  <span class="success-icon">✓</span>
  <span>Operation completed successfully</span>
</div>
```

### Button States

```css
/* Default */
.btn-primary {
  background: #2563EB;
  color: white;
}

/* Hover */
.btn-primary:hover {
  background: #1e40af;
}

/* Active/Pressed */
.btn-primary:active {
  background: #2563EB;
  transform: scale(0.98);
}

/* Disabled */
.btn-primary:disabled {
  background: #94A3B8;
  cursor: not-allowed;
  opacity: 0.6;
}

/* Loading */
.btn-primary.loading {
  position: relative;
  color: transparent;
}

.btn-primary.loading::after {
  content: '';
  position: absolute;
  width: 16px;
  height: 16px;
  border: 2px solid white;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
```

### Form Field States

```css
/* Default */
.form-input {
  border: 1px solid #E5E7EB;
}

/* Focus */
.form-input:focus {
  border-color: #2563EB;
  outline: none;
  box-shadow: 0 0 0 3px rgba(30, 58, 138, 0.1);
}

/* Error */
.form-input.error {
  border-color: #EF4444;
}

/* Success */
.form-input.success {
  border-color: #10B981;
}

/* Disabled */
.form-input:disabled {
  background: #F8FAFC;
  color: #94A3B8;
  cursor: not-allowed;
}
```

## Browser Compatibility

### Supported Browsers

Wireframes should work correctly in:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### CSS Features to Use Safely

✅ **Safe to use:**
- Flexbox
- CSS Grid
- CSS Variables (custom properties)
- Border-radius
- Box-shadow
- Transforms (translate, scale, rotate)
- Transitions
- Media queries

⚠️**Use with caution (provide fallbacks):**
- backdrop-filter (provide solid background fallback)
- CSS aspect-ratio (provide padding-hack fallback)
- gap property in flex (use margins as fallback)

❌ **Avoid:**
- CSS Container Queries (limited support)
- CSS Subgrid (limited support)
- CSS Houdini APIs

### Testing Checklist

Before finalizing a wireframe:

- [ ] Test in Chrome, Firefox, and Safari
- [ ] Test at 3+ viewport sizes (desktop, tablet, mobile)
- [ ] Verify all interactive elements have hover states
- [ ] Check text contrast meets WCAG AA standards
- [ ] Ensure form inputs have visible focus states
- [ ] Verify modal overlays block background interaction
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Check that all images have alt text
- [ ] Verify button states (default, hover, active, disabled)
- [ ] Test with browser zoom at 125% and 150%

## Best Practices

### Accessibility

1. **Semantic HTML**: Use proper HTML elements (`<button>`, `<nav>`, `<main>`, `<form>`)
2. **Alt Text**: All images must have descriptive alt text
3. **Focus States**: All interactive elements must have visible focus styles
4. **Color Contrast**: Text must meet WCAG AA standards (4.5:1 for normal text)
5. **Keyboard Navigation**: All functionality must be keyboard accessible
6. **ARIA Labels**: Use ARIA attributes for screen readers when necessary

### Performance

1. **Inline Styles**: Keep all styles in a single `<style>` tag in the `<head>`
2. **No External Dependencies**: Don't link to external CSS or JS files
3. **Optimize Images**: Use compressed images or CSS-based graphics
4. **Minimal DOM**: Keep DOM structure as simple as possible

### Maintainability

1. **Comments**: Add comments to explain complex layouts or interactions
2. **Consistent Naming**: Use BEM or similar naming convention for CSS classes
3. **Reuse Components**: Copy from component templates rather than recreating
4. **Version Control**: Always use `git mv` when moving wireframes to preserve history

## Additional Resources

- **Component Templates**: `/docs/wireframes/components/`
- **Wireframe Gallery**: `/docs/wireframes/index.html`
- **Wireframe Comparison**: `/docs/wireframes/WIREFRAME_COMPARISON.md`
- **Design Decisions**: `/docs/brainstorms/2026-03-03-complete-wireframe-coverage-brainstorm.md`

## Questions?

For questions or suggestions about wireframe development, please:
1. Check existing wireframes for patterns
2. Review the brainstorm document for design decisions
3. Consult the WIREFRAME_COMPARISON.md for feature coverage
4. Create an issue in the project repository
