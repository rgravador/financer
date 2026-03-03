# System Admin UI Implementation Brainstorm

**Date:** March 3, 2026
**Feature:** Implement System Admin pages (Dashboard, Tenants, Tenant Details, Audit Logs)
**Status:** Ready for Planning
**Related Documents:**
- [UI Rebuild Plan](../plans/2026-03-02-feat-ui-rebuild-wireframe-match-plan.md)
- [Wireframe Guide](../wireframes/WIREFRAME_GUIDE.md)
- [Vuetify Customization](../VUETIFY_CUSTOMIZATION.md)

---

## What We're Building

### Overview
Implement the 4 system admin pages for the Ascendent lending platform by converting HTML wireframes into Vue 3 pages using Vuetify 3 components. The system admin role manages tenants (financial institutions) platform-wide with full CRUD capabilities.

### Scope
**In Scope:**
- Screenshot all 4 system admin wireframes for design reference
- Build reusable layout components (AppLayout, AppSidebar, AppTopbar)
- Create reusable wireframe components (WfStatCard, WfStatusBadge, WfPageHeader)
- Implement dashboard page with stats cards and recent tenants table
- Verify and adjust Vuetify theme to match wireframe colors exactly
- Focus on desktop/fullscreen web (1920x1080 and above)

**Out of Scope:**
- Mobile responsiveness (future work)
- Tablet layouts (future work)
- Other role dashboards (tenant-admin, officer, approver - separate tasks)
- Implementing tenants-list, tenant-details, audit-logs pages (dashboard establishes patterns, others follow)

### Pages
1. **Dashboard** (`/system/dashboard`)
   - 4 stat cards: Total Tenants, Total Users, Active Loans, System Uptime
   - Recent tenants table with user counts
   - System health indicators (mock data initially)
   - Resource usage charts (CPU, memory, disk - future)

2. **Tenants List** (future after dashboard)
3. **Tenant Details** (future after dashboard)
4. **Audit Logs** (future after dashboard)

### Wireframes
All wireframes located in `/docs/wireframes/system-admin/`:
- `dashboard.html` (9 KB) - Primary focus
- `tenants-list.html` (8 KB)
- `tenant-details.html` (8 KB)
- `audit-logs.html` (21 KB)

### Backend Status
✅ **Fully Complete** - All API endpoints implemented and tested:
- `GET /api/system/stats` - Dashboard statistics
- `GET /api/system/tenants` - List tenants with user counts
- `GET /api/system/tenants/:id` - Tenant details
- `POST /api/system/tenants` - Create tenant
- `PATCH /api/system/tenants/:id` - Update tenant
- `GET /api/system/audit-logs` - Audit logs with filtering

Pinia store (`stores/system.ts`) provides full CRUD operations.

---

## Why This Approach

### Selected Approach: Sequential Component-First

**Build order:**
1. Screenshot wireframes using Playwright MCP → Design reference images
2. Verify Vuetify theme colors match wireframes exactly
3. Build layout components (AppLayout, AppSidebar, AppTopbar)
4. Create reusable components (WfStatCard, WfStatusBadge, WfPageHeader)
5. Implement dashboard page using these components

**Rationale:**

#### 1. Cleanest Architecture from Day One
Building layout and reusable components first creates a solid foundation for all future pages. Since Ascendent has 4 user roles (system admin, tenant admin, officer, approver), each with their own dashboard, extracting components immediately maximizes reuse.

**Example:** WfStatCard appears in all 4 dashboards with the same design. Building it once saves 4× effort.

#### 2. Component Reuse Across Roles
- **AppLayout/Sidebar/Topbar** → Shared by all authenticated users (system admin, tenant admin, officer, approver)
- **WfStatCard** → All 4 role dashboards use stat cards
- **WfStatusBadge** → Appears in tenant lists, loan lists, user lists across all roles
- **WfPageHeader** → Every page has consistent header with breadcrumbs

Building these first means the next 3 role dashboards are 50%+ faster to implement.

#### 3. Theme Verification Early
The wireframes use a specific navy (#1e3a8a) and gold (#f59e0b) color scheme. The current Vuetify theme uses similar but potentially different colors:
- **Wireframe Primary:** #1e3a8a (navy blue)
- **Wireframe Secondary:** #f59e0b (gold/amber)
- **Current Vuetify Primary:** #2563EB (potentially different)

Verifying colors early prevents having to update 4 pages later if there's a mismatch.

#### 4. Vuetify Components Over Custom HTML
Using Vuetify components (v-card, v-data-table, v-btn) instead of matching wireframe HTML exactly ensures:
- Consistency with the rest of the Vuetify theme
- Accessibility out of the box (ARIA labels, keyboard navigation)
- Responsive behavior built-in for future mobile work
- Maintainability (Vuetify updates propagate automatically)

**Trade-off:** Initial implementation is slightly slower than copy-pasting wireframe HTML, but long-term maintainability is much better.

#### 5. Screenshot-Driven Development
Taking Playwright screenshots of wireframes provides pixel-perfect reference images while building. This ensures:
- Visual fidelity to the original design
- Quick verification (compare screenshot vs implementation)
- Documentation for stakeholders (show before/after)

---

## Key Decisions

### 1. Component Extraction Strategy
**Decision:** Extract reusable components immediately, not after repetition.

**Options Considered:**
- ❌ **Extract after 2-3 uses** - Standard DRY principle, but we know from wireframes that stat cards appear in all dashboards
- ✅ **Extract immediately** - The wireframe pattern is obvious, and we're building 4 role dashboards total
- ❌ **Extract after all pages done** - Risks inconsistency and requires large refactor

**Rationale:** The wireframes clearly show repeating patterns (stat cards, status badges, page headers). Since we're building 4 role-specific dashboards (not just system admin), extracting these components on first use maximizes reuse and prevents drift.

**Components to Extract Immediately:**
- `WfStatCard.vue` - Dashboard statistics cards (appears in all 4 dashboards)
- `WfStatusBadge.vue` - Status indicators (active, pending, suspended - appears in all list views)
- `WfPageHeader.vue` - Page header with breadcrumbs and action buttons (every page)

**Components to Extract on Second Use:**
- `WfDataTable.vue` - If the table pattern repeats exactly across tenants-list and audit-logs
- `WfFilterCard.vue` - If the filter pattern repeats across multiple list pages

### 2. Layout Architecture
**Decision:** Build AppLayout, AppSidebar, AppTopbar as separate components before building any pages.

**Options Considered:**
- ❌ **Inline layout in dashboard** - Faster initially but requires refactoring when building page 2
- ✅ **Separate layout components first** - More upfront work but cleaner architecture
- ❌ **Use Nuxt layouts/** - Standard Nuxt pattern, but wireframes have role-specific navigation that needs Vue logic

**Rationale:** The wireframe layout (260px sidebar + 64px topbar) is shared across all authenticated pages. Building it as reusable components prevents duplication across 4 role dashboards and 15+ total pages.

**Component Structure:**
```
components/
  shared/
    AppLayout.vue        # Wrapper: sidebar + topbar + main content area
    AppSidebar.vue       # Navigation menu (role-based routing)
    AppTopbar.vue        # Search, notifications, user menu
  wireframe/
    WfStatCard.vue       # Dashboard statistics card
    WfStatusBadge.vue    # Status indicator (active, pending, etc.)
    WfPageHeader.vue     # Page header with breadcrumbs
```

**Why not Nuxt layouts/?** The wireframes show role-specific navigation menus (system admin sees "Tenants" and "Audit Logs", tenant admin sees "Users" and "Loan Types"). This requires Vue logic in the sidebar component (v-if based on user role), making it better suited as a component than a static layout.

### 3. Vuetify vs Custom HTML
**Decision:** Use Vuetify components (v-card, v-data-table, v-btn) styled to match wireframes, not wireframe HTML directly.

**Options Considered:**
- ❌ **Match wireframe HTML exactly** - Fastest initially, but loses Vuetify benefits (theming, accessibility, responsiveness)
- ✅ **Use Vuetify components** - Slightly slower but consistent with Vuetify ecosystem
- ❌ **Hybrid (Vuetify for tables/forms, custom for layouts)** - Inconsistent and hard to maintain

**Rationale:** The wireframes use plain HTML/CSS for prototyping speed. The production implementation should leverage Vuetify's component library for:
- **Theming:** All colors, spacing, and typography come from the Vuetify theme (easy to adjust globally)
- **Accessibility:** v-data-table includes sorting, pagination, and keyboard navigation out of the box
- **Responsiveness:** Even though we're focusing on desktop now, Vuetify components include responsive breakpoints for future mobile work
- **Consistency:** All buttons, cards, and inputs use the same Vuetify defaults (no upstream button, no elevation unless specified)

**Component Mapping:**
| Wireframe HTML | Vuetify Component | Notes |
|----------------|-------------------|-------|
| `<div class="stat-card">` | `<v-card>` with custom slot | Wrap in WfStatCard for reuse |
| `<table class="table">` | `<v-data-table>` | Includes sorting, pagination built-in |
| `<button class="btn-primary">` | `<v-btn color="primary">` | No uppercase (theme default) |
| `<span class="status-badge">` | `<v-chip>` | Wrap in WfStatusBadge for consistency |
| `<div class="sidebar">` | `<v-navigation-drawer>` | 260px fixed width, navy background |
| `<header class="topbar">` | `<v-app-bar>` | 64px height, white background |

### 4. Theme Color Verification
**Decision:** Verify and adjust Vuetify theme to match wireframe colors exactly before building pages.

**Wireframe Colors:**
- **Primary (Navy):** #1e3a8a
- **Secondary (Gold):** #f59e0b
- **Success (Green):** #10B981
- **Warning (Amber):** #F59E0B (same as secondary)
- **Error (Red):** #EF4444
- **Background (Light Gray):** #F8FAFC
- **Surface (White):** #FFFFFF

**Current Vuetify Theme (plugins/vuetify.ts):**
- **Primary:** #2563EB (different blue - needs adjustment)
- **Secondary:** #64748B (slate gray - needs adjustment to gold)
- Other colors need verification

**Action:** Audit and update `plugins/vuetify.ts` to match wireframe colors exactly before building any pages. This prevents color mismatches and ensures consistent branding.

### 5. Screenshot Strategy
**Decision:** Use Playwright MCP to screenshot wireframes for design reference, not automated testing.

**Options Considered:**
- ✅ **Design reference** - Quick screenshots for side-by-side comparison while building
- ❌ **Visual regression testing** - Set up automated tests comparing wireframes to implementation (overkill for 4 pages)
- ❌ **Documentation only** - Screenshots for stakeholders (useful but not primary purpose)

**Rationale:** The wireframes are static HTML files, so screenshots serve as pixel-perfect reference images while building Vue pages. Developers can open the screenshot alongside VS Code and ensure the implementation matches the design.

**Screenshot Plan:**
- Take full-page screenshots of all 4 wireframes at 1920x1080 resolution
- Save to `/docs/wireframes/screenshots/system-admin/`
- Name format: `dashboard-1920x1080.png`, `tenants-list-1920x1080.png`, etc.
- Use during implementation: Open screenshot in separate window, compare to browser running Vue page

**Why not visual regression testing?** Setting up automated visual tests (Percy, Chromatic) adds infrastructure overhead for 4 pages. The wireframes are design references, not test fixtures. Manual comparison is sufficient for this scope.

### 6. Desktop-First Focus
**Decision:** Focus exclusively on desktop/fullscreen web (1920x1080 and above) initially. Mobile responsiveness is future work.

**Rationale:** The wireframes are designed for desktop (260px fixed sidebar, 64px topbar). Financial applications like Ascendent are primarily used by officers and admins on desktop computers. Mobile responsiveness adds significant complexity:
- Collapsible sidebar (hamburger menu)
- Responsive tables (horizontal scroll or card layout)
- Touch-optimized buttons and forms
- Different navigation patterns

**Future Work:** After all 4 role dashboards are built for desktop, a separate task will make the entire app responsive (mobile sidebar, responsive tables, touch targets).

---

## Open Questions

### 1. Should WfPageHeader include breadcrumbs or just title?
**Context:** The wireframes show page headers with:
- Dashboard: Just title "Dashboard" (no breadcrumbs)
- Tenants List: Title "Tenants" + breadcrumb "System Admin > Tenants"
- Tenant Details: Title "ABC Bank" + breadcrumb "System Admin > Tenants > ABC Bank"

**Question:** Should WfPageHeader be a single component that handles both cases (title-only and title+breadcrumbs), or separate components?

**Options:**
- Single component with optional breadcrumbs prop: `<WfPageHeader title="Dashboard" :breadcrumbs="[]" />`
- Separate components: `<WfPageTitle>` and `<WfPageBreadcrumbs>`
- Let each page implement headers inline (no component)

**Recommendation:** Single component with optional breadcrumbs prop. Most reusable and keeps header styling consistent.

### 2. How should AppSidebar handle role-based navigation?
**Context:** The wireframes show different navigation menus per role:
- System Admin: Dashboard, Tenants, Audit Logs
- Tenant Admin: Dashboard, Users, Loan Types, Applications, Reports
- Officer: Dashboard, Applications, Borrowers
- Approver: Dashboard, Queue, Applications

**Question:** Should AppSidebar read the user's role from the auth store and show/hide menu items, or should each role have a separate sidebar component?

**Options:**
- Single AppSidebar with v-if per menu item based on user role
- Separate sidebars: AppSidebarSystemAdmin, AppSidebarTenantAdmin, etc.
- Pass menu items as props: `<AppSidebar :items="systemAdminMenu" />`

**Recommendation:** Single AppSidebar that reads `authStore.user.role` and shows/hides menu items with v-if. Most maintainable and follows DRY principle.

### 3. Should WfStatCard support icons/graphics or just text?
**Context:** The wireframe dashboard shows stat cards with:
- Large number (e.g., "120")
- Label (e.g., "Total Tenants")
- Trend indicator (e.g., "+12% this month")

Some modern dashboards use icons (📊 chart icon, 👥 users icon) in stat cards.

**Question:** Should WfStatCard support optional icons, or keep it text-only as shown in wireframes?

**Options:**
- Text-only (match wireframe exactly)
- Add optional icon prop (more flexible for future)
- Always show icon (requires designing icons for every stat)

**Recommendation:** Text-only initially (match wireframe). Add icon support later if tenant-admin or officer dashboards need it.

### 4. How should we handle mock data vs real API calls?
**Context:** The backend APIs are fully functional. The `/api/system/stats` endpoint returns real data from MongoDB (total tenants, total users, etc.).

**Question:** Should the dashboard page call real APIs immediately, or use mock data during initial development?

**Options:**
- Call real APIs from day one (requires seeded database)
- Use mock data in component, swap to API calls after layout works
- Use API calls but have fallback mock data if API fails

**Recommendation:** Call real APIs from day one. The seed script (`npm run seed`) already creates test tenants and users, so the data exists. This validates the full stack (API → store → component) immediately.

### 5. Should we implement dark mode support now or later?
**Context:** The Vuetify theme includes both `ascendentLight` and `ascendentDark` themes. The wireframes only show light mode.

**Question:** Should we test dark mode support while building the dashboard, or focus on light mode only?

**Options:**
- Light mode only (match wireframes, faster)
- Build with dark mode in mind (test both themes)
- Add dark mode toggle to topbar (full implementation)

**Recommendation:** Light mode only initially. Dark mode support is a separate feature that requires:
- Designing dark versions of all wireframes
- Testing color contrast for accessibility
- Adding theme toggle UI

Focus on matching the light mode wireframes exactly first. Dark mode can be added later as a polish feature.

### 6. How should we organize the wireframe components directory?
**Context:** We're creating WfStatCard, WfStatusBadge, WfPageHeader, etc. as reusable components.

**Question:** Should they go in `/components/wireframe/` as a separate namespace, or directly in `/components/` alongside other components?

**Options:**
- `/components/wireframe/` - Separate namespace for wireframe-extracted components
- `/components/` - Mix with other components (future: Button, Input, etc.)
- `/components/shared/` - Alongside AppLayout, AppSidebar, AppTopbar

**Recommendation:** `/components/wireframe/` for now. This makes it clear which components came from the wireframes vs which are custom. After the UI rebuild is complete, we can refactor to `/components/` if the "wireframe" namespace feels redundant.

---

## Success Criteria

### Definition of Done
- [ ] All 4 wireframes screenshotted at 1920x1080 and saved to `/docs/wireframes/screenshots/system-admin/`
- [ ] Vuetify theme colors verified and updated to match wireframe palette exactly
- [ ] AppLayout component built with sidebar + topbar + main content area
- [ ] AppSidebar component built with system admin navigation menu
- [ ] AppTopbar component built with search, notifications, user menu (mock initially)
- [ ] WfStatCard component extracted and documented
- [ ] WfStatusBadge component extracted with active/pending/suspended variants
- [ ] WfPageHeader component built with optional breadcrumbs support
- [ ] Dashboard page (`/system/dashboard`) implemented using above components
- [ ] Dashboard calls real API (`GET /api/system/stats`) and displays data from Pinia store
- [ ] Dashboard matches wireframe design visually (within 95% accuracy)
- [ ] All TypeScript types defined (no `any` types)
- [ ] Code passes linting (no errors)

### Visual Fidelity
**Target:** 95% match to wireframe screenshot

**Allowed Deviations:**
- Vuetify component styling (e.g., v-data-table has default Vuetify spacing)
- Icon sizes (Vuetify uses 24px icons by default, wireframe may vary)
- Font rendering (browser vs screenshot anti-aliasing differences)

**Not Allowed:**
- Wrong colors (must match wireframe palette exactly)
- Wrong layout (sidebar width, topbar height, padding must match)
- Missing functionality (all wireframe features must work)

### Performance
- [ ] Dashboard loads in <500ms on localhost
- [ ] No console errors or warnings
- [ ] API calls use proper loading states (no flash of empty content)

### Code Quality
- [ ] All components have TypeScript interfaces for props
- [ ] Pinia store actions used (no direct API calls in components)
- [ ] Reusable components accept props (no hardcoded data)
- [ ] Components are <300 lines (extract if larger)

---

## Next Steps

### Immediate (This Week)
1. **Screenshot Wireframes** - Use Playwright MCP to capture all 4 wireframes
2. **Theme Verification** - Audit and update Vuetify theme colors
3. **Layout Components** - Build AppLayout, AppSidebar, AppTopbar
4. **Reusable Components** - Extract WfStatCard, WfStatusBadge, WfPageHeader
5. **Dashboard Page** - Implement `/system/dashboard` using above components

### Short-Term (Next Week)
6. **Tenants List Page** - Implement `/system/tenants` with search/filter
7. **Tenant Details Page** - Implement `/system/tenants/:id` with user list
8. **Audit Logs Page** - Implement `/system/audit-logs` with advanced filters

### Medium-Term (Next 2 Weeks)
9. **Tenant Admin Dashboard** - Reuse layout and components for tenant admin role
10. **Officer Dashboard** - Reuse layout and components for officer role
11. **Approver Dashboard** - Reuse layout and components for approver role

### Long-Term (Future)
12. **Mobile Responsiveness** - Make all pages responsive (collapsible sidebar, responsive tables)
13. **Dark Mode Support** - Design and implement dark theme
14. **Accessibility Audit** - Test with screen readers, keyboard navigation
15. **Visual Regression Tests** - Set up automated screenshot comparison tests

---

## Related Work

### Dependencies
- **Backend:** All system admin API endpoints already implemented (Steps 1-5 complete)
- **Wireframes:** All 4 system admin wireframes designed (Phase 6 complete)
- **Vuetify Theme:** Base theme configured (Step 11 complete)
- **Pinia Stores:** System store with CRUD actions ready

### Blockers
- None - all dependencies are complete

### Follow-Up Tasks
After system admin UI is complete:
1. Tenant Admin UI (dashboard, users, loan types)
2. Officer UI (dashboard, applications, borrowers)
3. Approver UI (dashboard, queue, loan reviews)
4. Shared pages (notifications, profile, settings)
5. Mobile responsiveness across all pages
6. Dark mode support

---

## Appendix

### Wireframe File Sizes
- `dashboard.html` - 9,060 bytes (simplest)
- `tenants-list.html` - 8,292 bytes
- `tenant-details.html` - 8,215 bytes
- `audit-logs.html` - 21,498 bytes (most complex - advanced filters)

### Component Library Wireframes
Located in `/docs/wireframes/components/`:
- `wf-header.html` - Page headers with breadcrumbs
- `wf-sidebar.html` - Navigation sidebar (260px fixed)
- `wf-topbar.html` - Application topbar (64px height)
- `wf-data-table.html` - Data tables with pagination
- `wf-form-layout.html` - Two-column form layout
- `wf-stat-cards.html` - Dashboard statistics cards
- `wf-empty-state.html` - Empty state messaging
- `wf-modal.html` - Modal dialogs
- `wf-states.html` - Loading, error, success states

### API Endpoints Reference
```typescript
// Dashboard stats
GET /api/system/stats
Response: {
  totalTenants: number
  totalUsers: number
  activeLoans: number
  systemUptime: string
  recentTenants: Tenant[]
  systemHealth: { database, api, storage }
  resourceUsage: { cpu, memory, disk }
}

// Tenant list
GET /api/system/tenants
Response: {
  tenants: Array<{
    id, name, slug, isActive, createdAt,
    userCount, activeLoansCount
  }>
  total: number
}

// Tenant details
GET /api/system/tenants/:id
Response: {
  tenant: Tenant & {
    users: User[]
    stats: { totalUsers, activeLoans, pendingLoans }
  }
}

// Audit logs
GET /api/system/audit-logs?tenantId&action&entity&userId&dateFrom&dateTo&page&limit
Response: {
  logs: AuditLog[]
  pagination: { page, limit, total, totalPages }
}
```

### Pinia Store Actions Reference
```typescript
// stores/system.ts
const systemStore = useSystemStore()

// Fetch all tenants
await systemStore.fetchTenants()
// Access: systemStore.tenants, systemStore.totalTenants

// Fetch single tenant
await systemStore.fetchTenant(tenantId)
// Access: systemStore.selectedTenant

// Create tenant
await systemStore.createTenant({ name, slug })

// Update tenant
await systemStore.updateTenant(tenantId, { name, isActive })

// Toggle tenant status
await systemStore.toggleTenantStatus(tenantId)
```

### Vuetify Component Reference
```typescript
// Theme colors (to be verified)
primary: '#1e3a8a'      // Navy blue
secondary: '#f59e0b'    // Gold/amber
success: '#10B981'      // Green
warning: '#F59E0B'      // Amber
error: '#EF4444'        // Red
background: '#F8FAFC'   // Light gray
surface: '#FFFFFF'      // White

// Component defaults
VBtn: { style: 'text-transform: none;', elevation: 0, rounded: 'lg' }
VCard: { elevation: 1, rounded: 'lg' }
VTextField: { variant: 'outlined', density: 'comfortable' }
VDataTable: { density: 'comfortable' }
```
