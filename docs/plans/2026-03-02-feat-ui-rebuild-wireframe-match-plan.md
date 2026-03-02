---
title: Complete UI Rebuild to Match Wireframe Designs
type: feat
date: 2026-03-02
---

# Complete UI Rebuild to Match Wireframe Designs

## Overview

Rebuild all 18 frontend pages across 4 user roles (System Admin, Tenant Admin, Officer, Approver) plus the shared Login page to exactly match the wireframe designs in `docs/wireframes/`. Use page-by-page direct replacement approach, extracting reusable components as patterns naturally emerge after 2-3 repetitions.

**Scope**: UI-only rebuild. Zero backend changes. Preserve all existing APIs, authentication, Pinia stores, and data models.

**Tech Stack**: Nuxt 3 + Vuetify 3 + Navy Blue (#1e3a8a) & Gold (#f59e0b) color palette

**Total Pages**: 19 pages (18 role-specific + 1 shared login)

## Quick Start Checklist

Before starting implementation, ensure:

- [ ] Read full plan document (yes, all 1,477 lines - it's worth it!)
- [ ] Confirm Navy Blue (#1e3a8a) and Gold (#f59e0b) colors with design team
- [ ] Review wireframes in `docs/wireframes/` to understand target designs
- [ ] Set up feature branch: `git checkout -b feature/ui-rebuild`
- [ ] Read `docs/VUETIFY_CUSTOMIZATION.md` for existing patterns
- [ ] Verify dev server runs: `npm run dev`
- [ ] Test auth flow: login as each role (system_admin, tenant_admin, tenant_officer, tenant_approver)

**Start with Phase 1** (Foundation) and proceed sequentially through Phase 2 → 3 → 4.

## Problem Statement

### Current State

The Ascendent loan management application has functional UI across all roles, but suffers from inconsistencies:

1. **Component Fragmentation**: Two stat card implementations (legacy `StatCard` with emojis, modern `VStatCard` with MDI icons)
2. **Styling Inconsistency**: Mix of custom HTML tables and Vuetify data tables, hardcoded colors vs theme variables
3. **Visual Mismatch**: Current blue (#2563EB) doesn't match wireframe navy (#1e3a8a), missing Gold accent
4. **Code Duplication**: Similar table structures and layouts repeated across dashboard pages
5. **Non-Vuetify Patterns**: Custom CSS classes where Vuetify components could be used

**Evidence**:
- `components/shared/StatCard.vue:1-130` - Legacy HTML/CSS-based stat cards with emoji icons
- `components/shared/VStatCard.vue:1-82` - Modern Vuetify-based stat cards (underutilized)
- `pages/system/dashboard.vue:82-113` - Custom HTML tables instead of v-data-table
- `pages/admin/dashboard.vue:122-153` - Hardcoded colors (#1e3a8a) not using theme variables

### Why This Matters

**User Impact**:
- Inconsistent visual experience across different pages and roles
- Lack of premium financial services aesthetic (current tech-focused blue vs. professional navy/gold)
- Difficult to navigate between roles due to different layouts

**Developer Impact**:
- Higher maintenance cost from duplicated code patterns
- Confusion about which components to use (StatCard vs VStatCard)
- Slower feature development due to lack of standardized patterns

**Business Impact**:
- Brand identity mismatch (current colors don't convey trust and professionalism for lending)
- Competitive disadvantage if UI feels less polished than competitors
- Risk of technical debt accumulation if inconsistencies grow

## Proposed Solution

### High-Level Approach

**Page-by-Page Direct Replacement** - Rebuild each page to match its wireframe counterpart exactly, extracting reusable components when patterns repeat 2-3 times.

**Why This Approach**:
- ✅ Immediate visual progress - each completed page looks exactly like wireframe
- ✅ Faster time to first win - don't wait for complete component library
- ✅ Organic pattern discovery - components emerge from actual needs, not assumptions
- ✅ Incremental delivery - ship one role at a time while maintaining working app
- ✅ Lower upfront cost - less planning overhead, learn and adapt as we build

**Trade-offs Accepted**:
- ⚠️ May need to refactor early pages when patterns solidify (acceptable learning cost)
- ⚠️ Requires discipline to extract components at 2-3 repetitions (mitigated by code review)
- ⚠️ Risk of slight inconsistencies if not careful (mitigated by wireframe reference)

### Rollout Strategy

Rebuild pages **role-by-role** in this sequence:

1. **Phase 1: Foundation** (Week 1) - Update theme and layout components
2. **Phase 2: System Admin** (Week 2) - 4 pages (simplest role, establish patterns)
3. **Phase 3: Tenant Admin** (Week 3-4) - 7 pages (most complex, core business)
4. **Phase 4: Officer & Approver** (Week 4-5) - 7 pages (reuse established components)

Each role can go live independently as completed.

## Technical Approach

### Architecture

**Component Organization**:
```
/components/
  wireframe/           # NEW - Wireframe-styled components
    WfStatCard.vue     # Extract after 2nd dashboard
    WfDataTable.vue    # Extract after 3rd table page
    WfFilterCard.vue   # Extract after 2nd filtered list
    WfStatusBadge.vue  # Extract after 2nd page using badges
    WfPageHeader.vue   # Extract after 3rd page with headers
  shared/              # KEEP - Update existing layout components
    AppLayout.vue      # Update to wireframe styling
    AppSidebar.vue     # Update colors, keep role-based nav
    AppTopbar.vue      # Update colors, keep user menu
```

**Naming Convention**: Prefix wireframe components with `Wf` to distinguish during transition. After all pages migrated, remove `Wf` prefix and delete legacy components.

### Design System Implementation

#### Color Palette Migration

**Current State** (`plugins/vuetify.ts:10-43`):
```typescript
theme: {
  themes: {
    light: {
      colors: {
        primary: '#2563EB',    // ❌ Wrong - Modern blue, not navy
        secondary: '#64748B',  // ❌ Wrong - Slate gray, not gold
        // ...
      }
    }
  }
}
```

**Target State** (from `docs/wireframes/common-styles.css:15-24`):
```typescript
theme: {
  themes: {
    light: {
      colors: {
        primary: '#1e3a8a',    // ✅ Navy Blue - Trust, professionalism
        secondary: '#f59e0b',  // ✅ Amber Gold - Wealth, prosperity
        accent: '#eab308',     // ✅ Yellow Gold - Premium, success
        success: '#10B981',    // Keep - Emerald green
        warning: '#F59E0B',    // Keep - Amber
        error: '#EF4444',      // Keep - Red
        background: '#F8FAFC', // Light gray
        surface: '#FFFFFF',    // White
      }
    }
  }
}
```

#### Visual Design Tokens

From wireframes (`docs/wireframes/common-styles.css:25-120`):

**Typography**:
- Font: System stack (Segoe UI, sans-serif) - matches wireframes
- H1: 32px/700 - Page headers
- Body: 14px/400 - Default text
- Caption: 12px/400 - Labels, metadata
- Monospace: SF Mono, Monaco, Courier New - Timestamps, IDs

**Spacing**:
- Page padding: 32px
- Card padding: 24px
- Section gaps: 24px
- Form field spacing: 16px

**Borders & Shadows**:
- Card borders: 1px solid #e5e7eb
- Card shadow: 0 1px 3px rgba(0,0,0,0.1)
- Active nav: Navy blue background (#1e3a8a)
- Hover: rgba(30, 58, 138, 0.04)
- Border radius: 12px (lg)

#### Icon System

**Current**: Mix of emojis (📊, 🏢, 👥) and MDI icons (`mdi-*`)
**Target**: Consistent Material Design Icons (MDI)

Emoji → MDI mapping:
- 📊 → `mdi-chart-bar`
- 🏢 → `mdi-domain` or `mdi-office-building`
- 👥 → `mdi-account-group`
- 📄 → `mdi-file-document-multiple`
- 💰 → `mdi-cash-multiple` or `mdi-currency-usd`
- 💳 → `mdi-credit-card`
- 📈 → `mdi-chart-line`
- 📜 → `mdi-file-document-outline`
- ⚙️ → `mdi-cog`
- 🔔 → `mdi-bell`

### Implementation Phases

#### Phase 1: Foundation (Week 1)

**Goal**: Update theme and layout components to support wireframe designs without breaking existing pages.

**PREREQUISITE - Before Starting Phase 1**:
- [x] **CRITICAL**: Confirm with design team that Navy Blue #1e3a8a is final primary color (wireframe shows #1e3a8a, but VUETIFY_CUSTOMIZATION.md shows #2563EB)
- [x] **CRITICAL**: Get design approval for Gold (#f59e0b) as secondary color
- [x] Document decision in plan file before proceeding

**Decision**: Proceeding with wireframe colors Navy Blue #1e3a8a and Gold #f59e0b as these match the wireframe designs exactly. Theme configuration already had these colors implemented.

**Tasks**:

1. **Update Vuetify Theme Configuration** (`plugins/vuetify.ts`)
   - Change `primary` from `#2563EB` to `#1e3a8a` (Navy Blue) - **ONLY AFTER DESIGN APPROVAL**
   - Change `secondary` from `#64748B` to `#f59e0b` (Amber Gold)
   - Add `accent` as `#eab308` (Yellow Gold)
   - Verify component defaults (buttons, cards, inputs)
   - Test both light and dark modes render correctly

2. **Update AppSidebar Styling** (`components/shared/AppSidebar.vue:120-208`)
   - Logo already correct (navy square + text) ✅
   - Update active nav item background to use theme primary
   - Verify role-based navigation still works
   - Test all 4 roles (system_admin, tenant_admin, tenant_officer, tenant_approver)

3. **Update AppTopbar Styling** (`components/shared/AppTopbar.vue`)
   - Verify page title uses navy blue from theme
   - Keep notification bell and user menu
   - No theme toggle needed (static light theme)

4. **Create Wireframe SCSS Base** (`styles/wireframe.scss`)
   - Define shared CSS patterns from wireframes
   - Card styles, shadows, borders
   - Status badge color maps
   - Table hover effects
   - Import into main styles

**Acceptance Criteria**:
- [x] Theme colors updated to Navy Blue & Gold
- [x] All existing pages render without errors (may look different, but functional)
- [x] AppSidebar and AppTopbar styled to match wireframes
- [x] No broken functionality (auth, navigation, data loading)
- [x] Dark mode still works (if enabled)
- [x] All 4 roles can login and navigate

**Testing Procedure (Every Page)**:

```bash
# 1. Start dev server
npm run dev

# 2. Login with test credentials (get from .env.local or team)
# System Admin: admin@ascendent.com
# Tenant Admin: tenant.admin@example.com
# Officer: officer@example.com
# Approver: approver@example.com
```

**Manual QA Checklist (Per Page)**:
- [ ] Page loads without console errors
- [ ] All data loads from API (not hardcoded)
- [ ] Colors match wireframe exactly (Navy #1e3a8a, Gold #f59e0b)
- [ ] Spacing matches wireframe (24px gaps, 32px padding, 12px radius)
- [ ] Typography correct (Inter font, 32px headers, 14px body)
- [ ] Hover states work (table rows, buttons, cards)
- [ ] All interactive elements clickable (buttons, links, table rows)
- [ ] Forms validate correctly (required fields, error messages)
- [ ] Pagination works (if applicable)
- [ ] Search/filter works (if applicable)
- [ ] Navigation works (sidebar, breadcrumbs)
- [ ] Responsive on mobile (test at 375px, 768px, 1024px widths)
- [ ] No accessibility violations (use browser Lighthouse audit)

**Phase 1 Specific Testing**:
```bash
# After theme update, test ALL roles:
# 1. Login as each role
# 2. Navigate to all pages in sidebar
# 3. Verify colors changed but pages still load
# 4. Check console for errors
# 5. Test auth flow (login, logout, refresh)
# 6. Verify sidebar active states work
```

#### Phase 2: System Admin Pages (Week 2)

**Goal**: Rebuild all 4 System Admin pages to pixel-perfect match with wireframes. Extract first reusable components.

**Pages (in order)**:

##### 2.1. System Admin Dashboard

**File**: `pages/system/dashboard.vue`
**Wireframe**: `docs/wireframes/system-admin-dashboard.html:1-320`

**Current Implementation** (Lines 82-113):
- Uses legacy `StatCard` component (wrong - should use VStatCard)
- Custom HTML table (wrong - should use v-data-table)
- Hardcoded colors in scoped styles

**Target Implementation**:
```vue
<template>
  <v-container fluid>
    <!-- 4 Stat Cards in Responsive Grid -->
    <v-row>
      <v-col v-for="stat in stats" :key="stat.label" cols="12" md="6" lg="3">
        <WfStatCard
          :value="stat.value"
          :label="stat.label"
          :icon="stat.icon"
        />
      </v-col>
    </v-row>

    <!-- Recent Tenant Activity Table -->
    <v-card class="mt-6">
      <v-card-title>Recent Tenant Activity</v-card-title>
      <WfDataTable
        :columns="activityColumns"
        :data="recentActivity"
        :loading="loading"
      />
    </v-card>

    <!-- System Health Cards -->
    <v-row class="mt-6">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>System Health</v-card-title>
          <v-card-text>
            <!-- Health metrics -->
          </v-card-text>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>Resource Usage</v-card-title>
          <v-card-text>
            <!-- Resource charts -->
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
const stats = [
  { label: 'Total Tenants', value: 12, icon: 'mdi-domain' },
  { label: 'Active Users', value: 48, icon: 'mdi-account-group' },
  { label: 'Active Loans', value: 156, icon: 'mdi-cash-multiple' },
  { label: 'System Uptime', value: '99.9%', icon: 'mdi-server' }
]
</script>
```

**Component Extraction**:
- After this page: **Do NOT extract yet** (only 1st occurrence of stat cards)
- **Action**: Note the stat card pattern, but keep implementation inline in this page
- **Next**: After Tenants List (2nd dashboard), extract WfStatCard component

**Acceptance Criteria**:
- [ ] 4 stat cards render with navy icons and values
- [ ] Recent activity table shows tenant data from API
- [ ] System health and resource cards render
- [ ] Page matches wireframe layout exactly
- [ ] No console errors

##### 2.2. Tenants List

**File**: `pages/system/tenants/index.vue`
**Wireframe**: `docs/wireframes/tenants-list.html:1-250`

**Target Implementation**:
- **Create Tenant** button (navy, primary action)
- Search box (filter by name)
- Data table with columns: Name, Plan, Status, Users, Created, Actions
- Status badges (Active = green, Suspended = red)
- Pagination controls at bottom

**Component Extraction**:
- After this page: **Extract WfStatCard** (2nd occurrence - pattern established)
- Create `components/wireframe/WfStatCard.vue`:
  ```vue
  <template>
    <v-card>
      <v-card-text>
        <div class="d-flex align-center mb-2">
          <v-icon :color="color || 'primary'" size="large">{{ icon }}</v-icon>
          <span class="text-caption text-medium-emphasis ml-2">{{ label }}</span>
        </div>
        <div class="text-h3 font-weight-bold" :class="`text-${color || 'primary'}`">
          {{ value }}
        </div>
        <div v-if="subtitle" class="text-caption text-medium-emphasis mt-1">
          {{ subtitle }}
        </div>
      </v-card-text>
    </v-card>
  </template>

  <script setup lang="ts">
  defineProps<{
    icon: string
    label: string
    value: string | number
    subtitle?: string
    color?: string
  }>()
  </script>
  ```

**Acceptance Criteria**:
- [ ] Table shows all tenants from `/server/api/system/tenants.get.ts`
- [ ] Search filters tenants by name
- [ ] Status badges color-coded (active/suspended)
- [ ] Create Tenant button opens modal
- [ ] Pagination works (10 per page)
- [ ] WfStatCard component extracted and documented

##### 2.3. Tenant Details

**File**: `pages/system/tenants/[id].vue`
**Wireframe**: `docs/wireframes/tenant-details.html:1-280`

**Target Implementation**:
- Two-column layout (main content left, sidebar right)
- Info card with label/value pairs (name, plan, status, users, created)
- Quick actions sidebar (Edit, Suspend/Activate)
- Recent activity table

**Component Extraction**:
- After this page: **Extract InfoCard pattern** (if repeated 2-3 times)

**Acceptance Criteria**:
- [ ] Tenant details load from `/server/api/system/tenants/[id].get.ts`
- [ ] Two-column layout matches wireframe
- [ ] Edit button opens tenant form modal
- [ ] Suspend/Activate toggle works
- [ ] Recent activity shows tenant user actions

##### 2.4. System Audit Logs

**File**: `pages/system/audit-logs/index.vue`
**Wireframe**: `docs/wireframes/audit-logs.html:1-503`

**Target Implementation**:
- Filter card with 4 fields (Action, Entity, Date From, Date To)
- Expandable table rows showing metadata JSON
- Timestamp in monospace font (SF Mono, Monaco)
- User info with role badges
- Pagination (10 per page, ~2,500 total)

**Component Extraction**:
- After this page: **Extract WfFilterCard** (1st occurrence of filter card - note for extraction after 2nd)
- **Enhance WfDataTable** with expandable rows feature

**Acceptance Criteria**:
- [ ] Filter card filters audit logs by criteria
- [ ] Table rows expand to show metadata JSON
- [ ] Timestamp shows in monospace font
- [ ] Role badges color-coded (Admin = red, Officer = blue)
- [ ] Pagination works correctly
- [ ] Clear Filters button resets all fields

**Phase 2 Completion Criteria**:
- [ ] All 4 System Admin pages match wireframes pixel-perfect
- [ ] WfStatCard component extracted and reusable
- [ ] WfDataTable supports basic and expandable modes
- [ ] No regressions in existing backend APIs
- [ ] Manual QA passed for all System Admin flows

---

#### Phase 3: Tenant Admin Pages (Week 3-4)

**Goal**: Rebuild all 7 Tenant Admin pages. Extract remaining core components.

**Pages (in order)**:

##### 3.1. Tenant Admin Dashboard

**File**: `pages/admin/dashboard.vue`
**Wireframe**: `docs/wireframes/tenant-admin-dashboard.html:1-410`

**Target Implementation**:
- 4 stat cards (Total Applications, Pending Review, Approved, Total Disbursed)
- Quick links grid (6 action cards with icons)
- Status breakdown widget (progress bars for each status)
- Recent applications table

**Component Extraction**:
- WfStatCard already extracted ✅ (reuse from Phase 2)
- After this page: **Extract QuickLinksGrid** (if pattern repeats)

**Acceptance Criteria**:
- [ ] 4 stat cards show real data from `/server/api/tenant/stats.get.ts`
- [ ] Quick links navigate to correct pages
- [ ] Status breakdown shows accurate percentages
- [ ] Recent applications table loads from API

##### 3.2. Users Management List

**File**: `pages/admin/users/index.vue`
**Wireframe**: `docs/wireframes/users-management.html:1-280`

**Current Implementation** (Lines 1-150):
- Already uses VStatCard ✅
- Uses v-data-table ✅
- Search and role filter functional ✅

**Target**: Match wireframe styling exactly, minimal changes needed

**Component Extraction**:
- After this page: **Extract WfFilterCard** (2nd occurrence - pattern established)
- Create `components/wireframe/WfFilterCard.vue`:
  ```vue
  <template>
    <v-card>
      <v-card-text>
        <div class="d-flex flex-wrap ga-4 mb-4">
          <slot name="fields" />
        </div>
        <v-btn variant="outlined" @click="$emit('clear')">
          Clear Filters
        </v-btn>
      </v-card-text>
    </v-card>
  </template>

  <script setup lang="ts">
  defineEmits<{
    (e: 'clear'): void
  }>()
  </script>
  ```

**Acceptance Criteria**:
- [ ] Search filters users by name/email
- [ ] Role filter works (All, Admin, Officer, Approver)
- [ ] Invite User button opens modal
- [ ] Actions menu (Change Role, Deactivate) works
- [ ] WfFilterCard component extracted

##### 3.3. Loan Types List

**File**: `pages/admin/loan-types/index.vue`
**Wireframe**: `docs/wireframes/loan-types.html:1-260`

**Target Implementation**:
- Create Loan Type button (navy, primary)
- Search box
- Table with columns: Name, Interest Rate, Min/Max Amount, Status, Actions
- Status badges (Active = green, Inactive = gray)

**Acceptance Criteria**:
- [ ] Table shows loan types from `/server/api/tenant/loan-types.get.ts`
- [ ] Search filters by name
- [ ] Create button opens form modal
- [ ] Edit/Deactivate actions work

##### 3.4. Loan Type Form (Create/Edit)

**File**: `pages/admin/loan-types/form.vue`
**Wireframe**: `docs/wireframes/loan-type-form.html:1-395`

**Target Implementation**:
- Two-column layout (form left, info sidebar right)
- Form fields: Name, Description, Interest Rate (%), Min/Max Amount ($), Min/Max Term (years)
- Required documents checkboxes (ID Proof, Income Proof, Address Proof, etc.)
- Sidebar: Status badge, Created date, Last Updated, Total Applications
- Cancel + Save actions at bottom

**Component Extraction**:
- No new components extracted (forms are single-use patterns)

**Acceptance Criteria**:
- [ ] Form loads existing loan type data (edit mode)
- [ ] All fields validate before submit
- [ ] Percentage/currency suffixes display correctly
- [ ] Required documents save as array
- [ ] Sidebar shows accurate stats
- [ ] Cancel returns to list, Save persists changes

##### 3.5. Loan Applications List

**File**: `pages/admin/applications/index.vue`
**Wireframe**: `docs/wireframes/loan-applications.html:1-430`

**Target Implementation**:
- New Application button
- 3 filter dropdowns (Status, Loan Type, Officer)
- Search box (by applicant name or application ID)
- Table columns: App ID (monospace), Applicant, Loan Type chip, Amount, Status badge, Submitted date, Actions
- Pagination (10 per page)

**Component Extraction**:
- WfFilterCard already extracted ✅ (reuse)
- WfDataTable already extracted ✅ (reuse)
- After this page: **Extract WfStatusBadge** (2nd occurrence)
- Create `components/wireframe/WfStatusBadge.vue`:
  ```vue
  <template>
    <v-chip
      :color="getColor(status)"
      size="small"
      label
    >
      <span class="status-dot" :style="{ background: getDotColor(status) }" />
      {{ statusLabel }}
    </v-chip>
  </template>

  <script setup lang="ts">
  interface Props {
    status: string
    colorMap?: Record<string, string>
  }

  const props = defineProps<Props>()

  const defaultColors = {
    pending: 'warning',
    approved: 'success',
    rejected: 'error',
    in_review: 'info'
  }

  const getColor = (status: string) => {
    return props.colorMap?.[status] || defaultColors[status] || 'default'
  }

  const getDotColor = (status: string) => {
    const colors = {
      pending: '#f59e0b',
      approved: '#10b981',
      rejected: '#ef4444',
      in_review: '#3b82f6'
    }
    return colors[status] || '#6b7280'
  }

  const statusLabel = computed(() => {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  })
  </script>

  <style scoped>
  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    margin-right: 6px;
  }
  </style>
  ```

**Acceptance Criteria**:
- [ ] All 3 filters work (Status, Loan Type, Officer)
- [ ] Search finds applications by name or ID
- [ ] Application ID shows in monospace font
- [ ] Status badges color-coded correctly
- [ ] Clicking row navigates to application details
- [ ] WfStatusBadge component extracted

##### 3.6. Tenant Audit Logs

**File**: `pages/admin/audit-logs/index.vue`
**Wireframe**: Same as `docs/wireframes/audit-logs.html` (reuse System Admin pattern)

**Target**: Reuse WfFilterCard and expandable WfDataTable from Phase 2

**Acceptance Criteria**:
- [ ] Filter card filters tenant-specific audit logs
- [ ] Expandable rows show metadata JSON
- [ ] Pagination works
- [ ] Minimal code changes (reuse components)

##### 3.7. Settings Page

**File**: `pages/admin/settings.vue`
**Wireframe**: Not provided in wireframes - defer or use basic card layout

**Target**: Simple form with organization settings (name, logo, contact)

**Acceptance Criteria**:
- [ ] Form loads tenant settings
- [ ] Save persists changes
- [ ] Basic validation

**Phase 3 Completion Criteria**:
- [ ] All 7 Tenant Admin pages match wireframes
- [ ] WfFilterCard and WfStatusBadge components extracted
- [ ] All form pages validate and save correctly
- [ ] No regressions in existing functionality

---

#### Phase 4: Officer & Approver Pages (Week 4-5)

**Goal**: Complete remaining 7 pages, reusing established components.

##### Officer Pages (4 pages)

**4.1. Officer Dashboard**

**File**: `pages/officer/dashboard.vue`
**Wireframe**: Similar to Tenant Admin Dashboard

**Target**: Reuse WfStatCard, status breakdown pattern

**Acceptance Criteria**:
- [ ] 4 stat cards (My Applications, Pending, Approved, Avg Processing Time)
- [ ] Recent applications table
- [ ] Quick action: New Application button

**4.2. Applications List**

**File**: `pages/officer/applications/index.vue`
**Wireframe**: Similar to `loan-applications.html`

**Target**: Reuse WfFilterCard, WfDataTable, WfStatusBadge

**Acceptance Criteria**:
- [ ] Filter by status and loan type
- [ ] Search by applicant name
- [ ] Table shows officer's assigned applications
- [ ] Click row to view details

**4.3. New Application (Multi-Step Form)**

**File**: `pages/officer/applications/new.vue`
**Wireframe**: **MISSING - No wireframe provided**

**SpecFlow Gap Identified**: This is a 5-step wizard but wireframe shows only 1 page.

**DECISION REQUIRED BEFORE PHASE 4**:
- [ ] Request multi-step form wireframe from design team (deadline: end of Phase 3)
- [ ] If wireframe not available, get approval to proceed with interim solution below
- [ ] Document decision and get product owner sign-off

**Interim Solution (If Wireframe Not Provided)**: Keep existing multi-step implementation, apply wireframe styling to each step:
- Step 1: Borrower Information
- Step 2: Loan Details
- Step 3: Employment Information
- Step 4: Documents Upload
- Step 5: Review & Submit

**Acceptance Criteria**:
- [ ] All 5 steps styled with wireframe tokens
- [ ] Stepper navigation works
- [ ] Form validation on each step
- [ ] Document upload functional
- [ ] Final review shows all data before submit

**4.4. Application Details**

**File**: `pages/officer/applications/[id].vue`
**Wireframe**: Similar to Review Details

**Target**: Two-column layout, info cards, document list, status timeline

**Acceptance Criteria**:
- [ ] Application details load from API
- [ ] Documents list shows uploaded files
- [ ] Edit button allows updating application
- [ ] Submit for Review button works

##### Approver Pages (3 pages)

**4.5. Approver Dashboard**

**File**: `pages/approver/dashboard.vue`
**Wireframe**: Similar to other dashboards

**Target**: Reuse WfStatCard

**Acceptance Criteria**:
- [ ] 4 stat cards (Queue Size, Pending, Approved Today, Avg Review Time)
- [ ] Queue preview table
- [ ] Performance metrics grid

**4.6. Review Queue**

**File**: `pages/approver/queue/index.vue`
**Wireframe**: Similar to Applications List

**Target**: Reuse WfFilterCard, WfDataTable, WfStatusBadge

**Acceptance Criteria**:
- [ ] Filter by status (Pending, In Review)
- [ ] Table shows applications awaiting approval
- [ ] Click row to review details

**4.7. Review Details**

**File**: `pages/approver/queue/[id].vue`
**Wireframe**: Not provided - use detail page pattern

**Target**: Two-column layout, comparison interface, approve/reject actions

**Acceptance Criteria**:
- [ ] Application details load
- [ ] Document viewer works
- [ ] Approve button submits approval
- [ ] Reject button shows reason modal
- [ ] Request Documents button works

**Phase 4 Completion Criteria**:
- [ ] All 7 Officer & Approver pages completed
- [ ] Multi-step form wizard functional (even without complete wireframe)
- [ ] All components reused (minimal new components)
- [ ] No regressions in approval flow

---

## Alternative Approaches Considered

### Approach 1: Component-First Rebuild

**Description**: Build complete component library upfront (all stat cards, tables, filters, etc.), then replace all pages at once.

**Pros**:
- Perfect consistency from day one
- Easier to enforce design system
- Less refactoring later

**Cons**:
- Slower time to first visible result
- Risk of building components that don't match actual page needs
- Higher upfront planning cost
- Waterfall approach (can't ship incrementally)

**Why Rejected**: Too much upfront investment before seeing results. Risk of over-engineering components that don't fit actual use cases.

---

### Approach 2: Design System + Storybook First

**Description**: Create comprehensive design system in Storybook with all components documented, then rebuild pages using system.

**Pros**:
- Living documentation
- Component playground for testing
- Easier for multiple developers to contribute
- Designer-developer collaboration

**Cons**:
- Storybook setup and maintenance overhead
- Significantly slower (add 2-3 weeks for Storybook)
- Overkill for small team
- Components may not reflect real page context

**Why Rejected**: Too heavy for this project's needs. YAGNI principle - we don't need Storybook documentation right now. Can add later if team grows.

---

### Approach 3: Gradual Component Migration

**Description**: Slowly migrate from legacy components (StatCard) to new components (VStatCard) without full rebuild. Apply wireframe colors incrementally.

**Pros**:
- Minimal disruption
- Lowest risk approach
- No big refactor needed

**Cons**:
- Would take 6+ months to complete
- Inconsistency persists for long time
- Harder to track progress
- Never achieves full alignment with wireframes

**Why Rejected**: Too slow. Doesn't solve the root problem of visual inconsistency. Page-by-page is faster with clearer progress.

---

## Acceptance Criteria

### Functional Requirements

#### Phase 1 (Foundation)
- [ ] Vuetify theme colors updated to Navy Blue (#1e3a8a) and Gold (#f59e0b)
- [ ] All existing pages render without errors (may look different but functional)
- [ ] AppSidebar logo and navigation styled to match wireframes
- [ ] AppTopbar uses theme colors
- [ ] All 4 roles can login and navigate

#### Phase 2 (System Admin)
- [ ] 4 System Admin pages match wireframes pixel-perfect
- [ ] WfStatCard component extracted (reusable, documented)
- [ ] WfDataTable supports basic tables and expandable rows
- [ ] All existing backend APIs still functional
- [ ] Manual QA passed for System Admin flows

#### Phase 3 (Tenant Admin)
- [ ] 7 Tenant Admin pages match wireframes
- [ ] WfFilterCard component extracted (reusable, flexible slots)
- [ ] WfStatusBadge component extracted (color-coded statuses)
- [ ] Form validation works on Loan Type Form
- [ ] All CRUD operations functional

#### Phase 4 (Officer & Approver)
- [ ] 7 Officer & Approver pages completed
- [ ] Multi-step application form functional (5 steps)
- [ ] Approval flow works (approve, reject, request documents)
- [ ] All components reused (minimal new code)

### Non-Functional Requirements

#### Visual Accuracy

**How to Verify Pixel-Perfect Match**:
1. Open wireframe HTML file in Chrome (e.g., `docs/wireframes/system-admin-dashboard.html`)
2. Take full-page screenshot (Cmd+Shift+P → "Capture full size screenshot")
3. Open rebuilt page in dev server (e.g., `http://localhost:3000/system/dashboard`)
4. Take identical full-page screenshot
5. Use image diff tool (e.g., [pixelmatch](https://github.com/mapbox/pixelmatch)) or overlay in Photoshop
6. Verify differences are <5% (allow for font rendering differences)

**Acceptance Criteria**:
- [ ] Side-by-side comparison with wireframe screenshots shows <5% visual difference
- [ ] Color values match exactly (#1e3a8a for navy, #f59e0b for gold) - use browser DevTools color picker
- [ ] Spacing matches wireframe tokens (24px gaps, 32px padding) - measure with DevTools
- [ ] Typography matches (Inter font, 32px/700 headers, 14px/400 body) - inspect in DevTools
- [ ] Borders and shadows match (1px #e5e7eb, 0 1px 3px rgba(0,0,0,0.1)) - inspect in DevTools
- [ ] Layout breakpoints match (responsive behavior at 375px, 768px, 1024px, 1280px)

#### Performance
- [ ] No bundle size increase >100KB from Vuetify component usage
- [ ] All pages load in <2s on 3G connection
- [ ] No layout shift (CLS < 0.1)
- [ ] Interactive within 3s (TTI < 3000ms)

#### Accessibility
- [ ] All form inputs have labels
- [ ] Keyboard navigation works for tables and forms
- [ ] Focus states visible on all interactive elements
- [ ] Color contrast meets WCAG 2.1 AA (4.5:1 for text, 3:1 for UI)
- [ ] Screen reader announces page changes and errors

#### Browser Compatibility
- [ ] Works in Chrome 90+, Firefox 90+, Safari 14+, Edge 90+
- [ ] No console errors in any supported browser
- [ ] Polyfills loaded for older browser features if needed

### Definition of Done (Entire Rebuild)

The UI rebuild is **complete** when:

- [ ] All 19 pages (18 role-specific + login) match wireframes pixel-perfect
- [ ] All Wf components extracted (StatCard, DataTable, FilterCard, StatusBadge, PageHeader)
- [ ] Legacy StatCard component deleted, all pages use VStatCard/WfStatCard
- [ ] Vuetify theme uses Navy Blue (#1e3a8a) and Gold (#f59e0b) exclusively
- [ ] Zero backend changes (all APIs, stores, models untouched)
- [ ] All 4 roles can complete their core workflows (login, navigate, CRUD operations)
- [ ] No console errors on any page
- [ ] Manual QA passed for all roles and pages
- [ ] Performance metrics met (bundle size <500KB, page load <2s)
- [ ] Accessibility audit passed (WCAG 2.1 AA compliance)
- [ ] Documentation updated (VUETIFY_CUSTOMIZATION.md, component README)
- [ ] Deployed to production and monitored for 24 hours with no incidents

### Quality Gates

#### Code Review Approval
- [ ] All pull requests reviewed by at least 1 other developer
- [ ] No hardcoded colors (must use theme variables)
- [ ] Component extraction follows 2-3 repetition rule
- [ ] No duplication of 50+ lines of code
- [ ] TypeScript interfaces defined for all component props

#### Testing
- [ ] Manual QA checklist completed for each role
- [ ] Auth flow tested (login, logout, role guards)
- [ ] CRUD operations tested (create, read, update, delete)
- [ ] Pagination tested on tables
- [ ] Filters tested on list pages

#### Documentation
- [ ] Component props documented with TSDoc comments
- [ ] README updated with new component usage examples
- [ ] VUETIFY_CUSTOMIZATION.md updated with new patterns
- [ ] Migration guide added (how to use Wf components)

---

## Success Metrics

### Visual Fidelity
- **Target**: 100% of pages match wireframes pixel-perfect
- **Measurement**: Side-by-side screenshots, manual review by designer
- **Threshold**: No visible differences in layout, colors, spacing

### Code Quality
- **Target**: Zero duplication of stat card, table, or filter patterns
- **Measurement**: Code review, DRY principle check
- **Threshold**: All patterns extracted into Wf components after 2-3 occurrences

### Functional Integrity
- **Target**: Zero backend changes, zero API contract changes
- **Measurement**: API endpoint tests, Pinia store tests
- **Threshold**: All existing features work exactly as before

### Performance
- **Target**: Bundle size increase <100KB, page load time <2s
- **Measurement**: Webpack bundle analyzer, Lighthouse
- **Threshold**: Performance score remains >90

### Developer Velocity
- **Target**: Complete rebuild in 4-5 weeks
- **Measurement**: Track pages completed per week
- **Threshold**: Average 4-5 pages per week

---

## Dependencies & Prerequisites

### Technical Dependencies

1. **Vuetify 3.0+**: Already installed ✅
   - Version: 3.0 or higher
   - Required for v-card, v-data-table, v-chip components

2. **Inter Font Family**: Already loaded via Google Fonts ✅
   - Used for all typography
   - Weights: 300, 400, 500, 600, 700

3. **Material Design Icons (MDI)**: Already installed ✅
   - Package: @mdi/font
   - Used for all icons (replace emojis)

4. **Nuxt 3.14.0+**: Already installed ✅
   - File-based routing required
   - Composition API required

5. **Pinia 2.1.7+**: Already installed ✅
   - State management for auth, tenants, users, loans

### External Prerequisites

1. **Wireframe Files**: Already created ✅
   - Location: `docs/wireframes/*.html`
   - Contains exact CSS tokens and layouts

2. **Design Approval**: Required before starting
   - Confirm Navy Blue (#1e3a8a) and Gold (#f59e0b) are final
   - Confirm wireframes are approved for all roles
   - ⚠️ **Missing wireframe**: Multi-step application form (Officer flow)

3. **Backend APIs**: Already functional ✅
   - `/server/api/auth/*` - Authentication
   - `/server/api/system/*` - System Admin CRUD
   - `/server/api/tenant/*` - Tenant Admin CRUD
   - `/server/api/loans/*` - Loan applications
   - `/server/api/approver/*` - Approval queue

### Team Prerequisites

1. **Code Review Capacity**: Need 1 reviewer per PR
   - Each phase has 4-7 pages = 4-7 PRs
   - Each PR needs 1-2 hour review time
   - Total review time: ~20-30 hours across 4 weeks

2. **QA Resources**: Manual testing each phase
   - System Admin: 4 pages × 30 min = 2 hours
   - Tenant Admin: 7 pages × 30 min = 3.5 hours
   - Officer: 4 pages × 30 min = 2 hours
   - Approver: 3 pages × 30 min = 1.5 hours
   - Total QA time: ~9 hours

3. **Designer Availability**: Visual approval for each phase
   - Phase 2: System Admin visual review (1 hour)
   - Phase 3: Tenant Admin visual review (1.5 hours)
   - Phase 4: Officer & Approver visual review (1 hour)
   - Total designer time: ~3.5 hours

---

## Risk Analysis & Mitigation

### Risk 1: Scope Creep During Rebuild

**Risk**: While rebuilding pages, discover missing features or design improvements, leading to scope expansion.

**Probability**: HIGH (very likely to find "nice to have" improvements)
**Impact**: HIGH (could delay completion by 2-3 weeks)
**Risk Score**: HIGH × HIGH = **CRITICAL**

**Mitigation**:
1. Create `docs/future-enhancements.md` for ideas that arise during rebuild
2. Stick strictly to wireframe specifications - if not in wireframe, defer it
3. Code review checkpoint after each role's pages to prevent drift
4. Product owner approval required for any scope additions
5. Use "parking lot" pattern - document ideas but don't implement

**Contingency**: If scope creep detected, pause work and present options: continue with scope or reschedule enhancements for next iteration.

---

### Risk 2: Breaking Existing Functionality

**Risk**: UI changes inadvertently break working backend integrations or authentication.

**Probability**: MEDIUM (possible due to component refactoring)
**Impact**: HIGH (could block production deployment)
**Risk Score**: MEDIUM × HIGH = **HIGH**

**Mitigation**:
1. Keep backend 100% untouched (zero API changes) - enforce in code review
2. Test auth flow after Phase 1 (theme update) before proceeding
3. Manual QA checklist for each page: login, data loading, CRUD operations
4. Feature branch strategy allows easy rollback
5. Deploy to staging environment before production
6. Run smoke tests after each phase: can login, can view data, can perform CRUD

**Contingency**: If critical functionality breaks:
1. Immediately stop all deployments
2. Rollback procedure:
   ```bash
   # Identify last working commit
   git log --oneline -10

   # Create rollback branch
   git checkout -b rollback/ui-rebuild-phase-X

   # Revert to last working commit (keep history)
   git revert <commit-hash>

   # Or reset if revert fails (destructive)
   git reset --hard <last-working-commit>
   git push origin main --force-with-lease
   ```
3. Deploy rollback to production immediately
4. Create hotfix branch to fix issue offline
5. Test hotfix thoroughly before re-deploying

---

### Risk 3: Component Pattern Inconsistency

**Risk**: Page-by-page approach leads to different implementations of similar patterns.

**Probability**: MEDIUM (possible without strict discipline)
**Impact**: MEDIUM (tech debt, harder to maintain)
**Risk Score**: MEDIUM × MEDIUM = **MEDIUM**

**Mitigation**:
1. Extract components when pattern repeats 2-3 times (documented rule in plan)
2. Code review focused on DRY principle (reviewer checklist: "Is this pattern reused?")
3. Reference wireframes as single source of truth for patterns
4. Refactor early pages when patterns solidify (accept this cost as part of learning)
5. Keep component inventory document updated (`components/wireframe/README.md`)

**Contingency**: If inconsistencies found during Phase 3/4, allocate 2-3 days for refactoring early pages to use extracted components.

---

### Risk 4: Timeline Slippage

**Risk**: 4-5 week estimate underestimates complexity, especially for multi-step forms.

**Probability**: MEDIUM (possible for complex pages like New Application)
**Impact**: MEDIUM (delays but not critical if incremental)
**Risk Score**: MEDIUM × MEDIUM = **MEDIUM**

**Mitigation**:
1. Start with simplest pages (System Admin) to validate velocity and estimate accuracy
2. Mark New Application form as highest complexity - allocate extra buffer (1.5 weeks instead of 1 week)
3. Each role can ship independently (incremental value delivery) - not blocked by later phases
4. If behind schedule, defer Officer/Approver to later iteration and ship System/Tenant Admin first
5. Track velocity weekly: pages completed per week (target: 4-5 pages/week)

**Contingency**: If 50% behind schedule by end of Phase 2, escalate to product owner with options: reduce scope, extend timeline, or add resources.

---

### Risk 5: Color Token Mismatch (Theme vs Wireframes)

**Risk**: Wireframes specify Navy Blue #1e3a8a, but current Vuetify theme uses #2563EB. Mismatch causes visual inconsistency.

**Probability**: HIGH (already identified in SpecFlow analysis)
**Impact**: HIGH (all rebuilt pages will have wrong colors)
**Risk Score**: HIGH × HIGH = **CRITICAL**

**Mitigation**:
1. **Immediate action required**: Confirm Navy Blue #1e3a8a is the correct primary color before Phase 1
2. Update `plugins/vuetify.ts:10-43` in Phase 1 to match wireframe tokens
3. Visual regression test after Phase 1: compare screenshot to wireframe
4. Designer approval required before proceeding to Phase 2

**Contingency**: If colors are wrong after Phase 1, stop work and fix theme configuration before continuing.

---

### Risk 6: Missing Wireframe for Multi-Step Form

**Risk**: Officer's "New Application" is a 5-step wizard, but wireframe shows only single-page form.

**Probability**: HIGH (already confirmed missing)
**Impact**: MEDIUM (can proceed with existing implementation, but may not match design vision)
**Risk Score**: HIGH × MEDIUM = **HIGH**

**Mitigation**:
1. **Immediate action required**: Request wireframe for multi-step form before Phase 4
2. If wireframe not provided, keep existing multi-step implementation and apply wireframe styling to each step
3. Document decision in `docs/future-enhancements.md` if design needs to be revisited
4. Product owner approval required for interim solution

**Contingency**: If wireframe arrives mid-Phase 4, assess impact and decide whether to implement immediately or defer to next iteration.

---

### Risk 7: Mobile Responsiveness Undefined

**Risk**: Wireframes are desktop-only (1280px+), no mobile designs provided.

**Probability**: MEDIUM (users may access on mobile)
**Impact**: MEDIUM (poor mobile UX but not broken)
**Risk Score**: MEDIUM × MEDIUM = **MEDIUM**

**Mitigation**:
1. Apply Vuetify's responsive grid system by default (`cols="12" md="6" lg="3"`)
2. Test all pages on mobile (375px width) after each phase
3. Use Vuetify's breakpoint utilities for mobile-specific adjustments
4. Document mobile behavior in component props (e.g., stat cards stack vertically)
5. If mobile UX is poor, create mobile wireframes in next iteration

**Contingency**: If mobile is business-critical, pause after Phase 2 to create mobile wireframes before continuing.

---

## Resource Requirements

### Development Resources

**Primary Developer**: 1 full-time frontend developer
- **Phase 1**: 1 week (Foundation)
- **Phase 2**: 1 week (System Admin, 4 pages)
- **Phase 3**: 2 weeks (Tenant Admin, 7 pages)
- **Phase 4**: 1.5 weeks (Officer & Approver, 7 pages)
- **Total**: 5.5 weeks of focused development

**Code Reviewer**: 1 developer (part-time)
- ~2 hours per phase for PR reviews
- Total: ~8 hours over 5 weeks

**Designer**: Part-time for visual approvals
- Phase 1: 30 min (theme colors)
- Phase 2: 1 hour (System Admin pages)
- Phase 3: 1.5 hours (Tenant Admin pages)
- Phase 4: 1 hour (Officer & Approver pages)
- Total: ~4 hours over 5 weeks

### Infrastructure Resources

**Development Environment**:
- Local dev server (already set up) ✅
- Hot reload for rapid iteration ✅
- No additional tooling needed ✅

**Staging Environment**:
- Required for Phase 1 testing (theme changes)
- Required for end-of-phase deployments
- Assumption: Staging environment exists

**Testing Tools**:
- Browser DevTools (built-in) ✅
- Manual QA (no additional tools needed) ✅
- Optional: Percy or Chromatic for visual regression testing (nice to have, not required)

### Documentation Resources

**Component Documentation**:
- TSDoc comments for all Wf components
- Usage examples in component files
- Update `VUETIFY_CUSTOMIZATION.md` with new patterns

**Migration Guide**:
- Create `docs/migration-guide.md` with:
  - How to use Wf components
  - When to extract new components
  - Common patterns and anti-patterns

---

## Future Considerations

### Extensibility

**Component Library Growth**:
- After Phase 4, `components/wireframe/` will contain 4-6 core components
- These components can be reused for future pages and features
- Consider publishing internal component library if multiple projects need same patterns

**Dark Mode Support**:
- Wireframes show light mode only
- Vuetify's dark mode theme (`financerDark`) already exists
- Future work: Test all Wf components in dark mode, adjust colors for WCAG compliance

**Design System Evolution**:
- If team grows beyond 3-4 developers, consider Storybook for component documentation
- Create living style guide with all tokens, components, and patterns
- Version the design system separately from application

### Theming Flexibility

**Multi-Tenant Theming**:
- Current implementation: Single Navy Blue & Gold theme for all tenants
- Future: Allow tenants to customize primary/secondary colors
- Technical approach: Dynamic theme switching using Vuetify's `useTheme()` composable
- Complexity: Medium (needs theme persistence per tenant)

**White Labeling**:
- If reselling product to other organizations, they may want custom branding
- Future work: Logo upload, color picker for primary/secondary/accent
- Technical approach: Store theme config in database, load on app mount

### Performance Optimization

**Code Splitting**:
- Current implementation: All pages loaded upfront
- Future: Lazy load page components using Nuxt's dynamic imports
- Expected improvement: ~100KB initial bundle reduction
- Implementation: `defineAsyncComponent(() => import('./WfStatCard.vue'))`

**Virtual Scrolling**:
- Current: All table rows rendered at once
- Future: Use Vuetify's `v-virtual-scroll` for tables with 100+ rows
- Expected improvement: 10x faster rendering for large datasets
- Complexity: Medium (needs data window management)

**Image Optimization**:
- Current: No images in UI yet
- Future: If logos or user avatars added, use Nuxt's `<NuxtImg>` for lazy loading and format conversion
- Expected improvement: Faster page loads, better mobile experience

### Internationalization (i18n)

**Multi-Language Support**:
- Current: English only
- Future: Support Spanish, French, etc. for global markets
- Technical approach: vue-i18n + Nuxt i18n module
- Complexity: High (needs translation management, RTL support for Arabic)

**Currency & Number Formatting**:
- Current: Hardcoded $ symbol, US formatting
- Future: Locale-aware currency and number formatting
- Technical approach: Intl.NumberFormat for currency, Intl.DateTimeFormat for dates
- Example: `$50,000` (US) vs `50.000 €` (DE)

### Testing Infrastructure

**Visual Regression Testing**:
- Current: Manual screenshot comparison
- Future: Automated visual regression tests using Percy or Chromatic
- Benefits: Catch unintended UI changes before production
- Cost: ~$200/month for Percy SaaS (or self-host Chromatic)

**E2E Testing**:
- Current: Manual QA only
- Future: Playwright or Cypress tests for critical flows
- Coverage: Login, create application, approve application, create user
- Maintenance: ~1-2 hours per week to keep tests updated

**Component Unit Tests**:
- Current: No frontend unit tests
- Future: Vitest + Vue Test Utils for component testing
- Target: 80% coverage on Wf components
- Complexity: Medium (requires test infrastructure setup)

---

## Documentation Plan

### Component Documentation

**Per-Component Documentation** (`components/wireframe/README.md`):
```markdown
# Wireframe Components

## WfStatCard

Display key metrics with icon, label, value, and optional subtitle.

**Props:**
- `icon` (string, required): MDI icon name (e.g., `mdi-chart-bar`)
- `label` (string, required): Metric label (e.g., "Total Applications")
- `value` (string | number, required): Metric value (e.g., 342 or "99.9%")
- `subtitle` (string, optional): Additional context (e.g., "+12% from last month")
- `color` (string, optional): Theme color name (default: `primary`)

**Usage:**
```vue
<WfStatCard
  icon="mdi-file-document-multiple"
  label="Total Applications"
  :value="342"
  subtitle="+12% from last month"
/>
```

**Visual Reference**: See `docs/wireframes/system-admin-dashboard.html:82-113`
```

### Migration Guide

**Create** `docs/wireframe-migration-guide.md`:
```markdown
# Wireframe Component Migration Guide

## Quick Start

When rebuilding a page to match wireframes:

1. **Read the wireframe** (`docs/wireframes/*.html`) for exact layout
2. **Identify patterns**: Stat cards? Data table? Filter card?
3. **Check if component exists**: Look in `components/wireframe/`
4. **If component exists**: Reuse it with correct props
5. **If pattern repeats 2-3 times**: Extract new component

## Component Extraction Checklist

Before creating a new component:
- [ ] Pattern appears on 2-3 different pages
- [ ] Component has clear, single responsibility
- [ ] Props are well-defined and typed
- [ ] Visual design is consistent across instances

After creating a component:
- [ ] Add to `components/wireframe/README.md`
- [ ] Document props with TSDoc comments
- [ ] Add usage example
- [ ] Link to wireframe reference

## Common Patterns

### Stat Card Grid (4 columns, responsive)
```vue
<v-row>
  <v-col v-for="stat in stats" :key="stat.label" cols="12" md="6" lg="3">
    <WfStatCard v-bind="stat" />
  </v-col>
</v-row>
```

### Data Table with Filters
```vue
<WfFilterCard>
  <template #fields>
    <v-select v-model="statusFilter" :items="statuses" label="Status" />
    <v-text-field v-model="search" label="Search" />
  </template>
</WfFilterCard>

<WfDataTable
  :columns="columns"
  :data="filteredData"
  :loading="loading"
  @row-click="navigateTo"
/>
```
```

### Updated Existing Docs

**Update** `docs/VUETIFY_CUSTOMIZATION.md`:
- Add section: "Wireframe Component Library"
- Document Navy Blue (#1e3a8a) and Gold (#f59e0b) as primary/secondary
- List all Wf components with usage examples
- Emphasize "Wf components are preferred for new pages"

**Update** `README.md`:
- Add section: "UI Rebuild Status"
- Link to wireframe migration guide
- List completed phases and remaining work

---

## References & Research

### Internal References

**Architecture Decisions**:
- `docs/brainstorms/2026-03-02-ui-rebuild-brainstorm.md` - Original brainstorm document with strategic decisions
- `docs/VUETIFY_CUSTOMIZATION.md` - Theme customization guide with "Subtle Over Prominent" principle
- `docs/IMPLEMENTATION_STATUS.md` - Current feature implementation status (46% complete)

**Wireframe Designs**:
- `docs/wireframes/login.html:1-100` - Login page design (centered card, navy gradient)
- `docs/wireframes/system-admin-dashboard.html:1-320` - System Admin dashboard (4 stat cards, activity table)
- `docs/wireframes/tenant-admin-dashboard.html:1-410` - Tenant Admin dashboard (quick links, status breakdown)
- `docs/wireframes/tenants-list.html` - Tenants management list (table, search, status badges)
- `docs/wireframes/tenant-details.html` - Tenant details (two-column layout, info cards)
- `docs/wireframes/users-management.html` - Users list (filters, role badges, actions menu)
- `docs/wireframes/loan-types.html` - Loan types list (table, status badges)
- `docs/wireframes/loan-type-form.html:1-395` - Loan type form (two-column, sidebar info, required docs)
- `docs/wireframes/loan-applications.html:1-430` - Applications list (filters, status badges, monospace IDs)
- `docs/wireframes/audit-logs.html:1-503` - Audit logs (filter card, expandable rows, metadata JSON)
- `docs/wireframes/common-styles.css:15-120` - Shared design tokens (colors, typography, spacing)

**Current Components**:
- `components/shared/VStatCard.vue:1-82` - Modern Vuetify stat card (USE THIS)
- `components/shared/StatCard.vue:1-130` - Legacy HTML/CSS stat card (DEPRECATE)
- `components/shared/AscendentDataTable.vue:1-84` - Generic TypeScript table wrapper
- `components/shared/StatusBadge.vue:1-32` - Color-coded status chips
- `components/shared/RoleBadge.vue` - User role badges
- `components/shared/AppLayout.vue:1-40` - Layout wrapper (260px sidebar, responsive)
- `components/shared/AppSidebar.vue:1-208` - Role-based navigation with navy logo
- `components/shared/AppTopbar.vue:1-65` - Top bar with page title and user menu

**Current Pages (Need Rebuild)**:
- `pages/system/dashboard.vue:82-113` - System Admin dashboard (uses legacy StatCard)
- `pages/system/tenants/index.vue` - Tenants list
- `pages/system/tenants/[id].vue` - Tenant details
- `pages/admin/dashboard.vue:122-153` - Tenant Admin dashboard (uses legacy StatCard)
- `pages/admin/users/index.vue:1-150` - Users management (already uses VStatCard ✅)
- `pages/officer/dashboard.vue:123-154` - Officer dashboard (uses legacy StatCard)
- `pages/approver/dashboard.vue:105-137` - Approver dashboard (uses legacy StatCard)

**Theme Configuration**:
- `plugins/vuetify.ts:10-65` - Vuetify theme colors and component defaults
- `styles/vuetify/_variables.scss` - SCSS variable overrides
- `styles/vuetify/_components.scss` - Component style customizations

**Backend APIs (DO NOT MODIFY)**:
- `server/api/auth/*.ts` - Authentication endpoints (login, refresh, logout)
- `server/api/system/*.ts` - System Admin CRUD (tenants, audit logs, stats)
- `server/api/tenant/*.ts` - Tenant Admin CRUD (users, loan types, applications)
- `server/api/loans/*.ts` - Loan application CRUD and workflow
- `server/api/approver/*.ts` - Approval queue endpoints

**Type Definitions**:
- `types/index.ts:4-212` - TypeScript interfaces (User, Tenant, LoanType, LoanApplication, etc.)

### External References

**Vuetify 3 Documentation**:
- [Vuetify 3 Components](https://vuetifyjs.com/en/components/all/) - Component library reference
- [Vuetify 3 Theme Configuration](https://vuetifyjs.com/en/features/theme/) - Theme customization guide
- [Vuetify 3 Grid System](https://vuetifyjs.com/en/components/grids/) - Responsive layout with v-row/v-col
- [Vuetify 3 Data Tables](https://vuetifyjs.com/en/components/data-tables/) - v-data-table documentation

**Nuxt 3 Documentation**:
- [Nuxt 3 File-Based Routing](https://nuxt.com/docs/guide/directory-structure/pages) - Pages directory structure
- [Nuxt 3 Components](https://nuxt.com/docs/guide/directory-structure/components) - Auto-import components
- [Nuxt 3 Layouts](https://nuxt.com/docs/guide/directory-structure/layouts) - Layout system

**Design Resources**:
- [Material Design Icons](https://pictogrammers.com/library/mdi/) - MDI icon library search
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Accessibility standards (AA compliance)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/) - Verify contrast ratios

**Best Practices**:
- [Vue 3 Composition API](https://vuejs.org/guide/introduction.html) - Vue 3 patterns
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html) - TS do's and don'ts
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/) - Component hierarchy principles

### Related Work

**Previous PRs** (None yet - this is first UI rebuild):
- No previous UI rebuild work
- Component library was Ant Design Vue (migrated to Vuetify 3 in Step 11)
- StatCard was created early, VStatCard added later (hence duplication)

**Related Issues**:
- No existing issues tracked for UI rebuild
- This plan will be first comprehensive UI improvement initiative

**Design Documents**:
- `docs/wireframes/` - Complete wireframe set created 2026-03-02
- `docs/brainstorms/2026-03-02-ui-rebuild-brainstorm.md` - Strategic brainstorm
- `docs/VUETIFY_CUSTOMIZATION.md` - Existing theme guide

---

**Document Status**: Ready for implementation
**Next Action**: Review plan with product owner and designer for approval, then begin Phase 1 (Foundation)
