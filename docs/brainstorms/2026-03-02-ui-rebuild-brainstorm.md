# UI Rebuild Brainstorm
**Date:** March 2, 2026
**Status:** Ready for Planning

## What We're Building

A complete UI rebuild of the Ascendent loan management application to match the wireframe designs in `docs/wireframes/`, while preserving all existing backend functionality, authentication, and data flow.

**Scope:** Replace all frontend pages across all user roles (System Admin, Tenant Admin, Officer, Approver) with new implementations that match wireframe layouts, using Vuetify components styled to the Navy Blue & Gold brand palette.

**Page Count:** 18 total pages across 4 roles
- System Admin: 4 pages (Dashboard, Tenants List, Tenant Details, Audit Logs)
- Tenant Admin: 7 pages (Dashboard, Users, Loan Types List, Loan Type Form, Applications, Audit Logs, Settings)
- Officer: 4 pages (Dashboard, Applications List, New Application, Application Details)
- Approver: 3 pages (Dashboard, Review Queue, Review Details)
- Plus: Login page (shared by all roles)

## Why This Approach

### Selected Strategy: Page-by-Page Direct Replacement

**Decision:** Rebuild each page directly to match its wireframe counterpart, extracting reusable components as patterns naturally emerge during development.

**Rationale:**
- **Immediate visual progress** - Each completed page looks exactly like the wireframe
- **Faster time to first win** - Don't wait for a complete component library before seeing results
- **Organic pattern discovery** - Component patterns emerge from actual page needs, not assumptions
- **Incremental delivery** - Complete one role's pages at a time, maintaining a working application
- **Lower upfront cost** - Less planning overhead, learn and adapt as we build

**Trade-offs Accepted:**
- May need to refactor early pages as component patterns solidify (acceptable - part of the learning process)
- Requires discipline to extract components when patterns repeat 2-3 times (mitigated by code review)
- Risk of slight inconsistencies if not careful (mitigated by incremental-by-role approach and design reference)

## Key Decisions

### 1. UI Framework: Vuetify 3 with Wireframe Styling

**Decision:** Keep Vuetify 3 but style components to match wireframe designs exactly.

**Why:**
- Vuetify provides robust, accessible components out of the box
- Wireframes use simple HTML/CSS patterns that map cleanly to Vuetify components
- Best of both worlds: component library power + wireframe design aesthetic
- Avoid "Material Design" look by customizing Vuetify theme and component defaults

**Implementation Notes:**
- Replace emoji icons (📊, 🏢) with Material Design Icons (mdi-chart-bar, mdi-domain)
- Override Vuetify defaults to match wireframe spacing, borders, shadows
- Use wireframe CSS patterns for custom elements (expandable rows, filter cards)

### 2. Color Palette: Navy Blue & Gold

**Decision:** Use wireframe color scheme - Navy Blue (#1e3a8a) and Gold (#f59e0b) as primary/secondary.

**Current State:** App uses different blue (#2563EB) and emerald green (#10B981)

**Migration:**
- Update `/plugins/vuetify.ts` theme configuration
- Primary: Navy Blue (#1e3a8a) - trust, professionalism
- Secondary: Amber Gold (#f59e0b) - wealth, prosperity
- Accent: Yellow Gold (#eab308) - premium, success
- Semantic colors remain: Success green, Warning amber, Error red

**Visual Impact:** More premium, financial services aesthetic vs. current modern tech look

### 3. Implementation Order: Incremental by Role

**Decision:** Rebuild pages role-by-role, starting with System Admin, then Tenant Admin, then Officer/Approver.

**Sequence:**
1. **System Admin** (4 pages) - Simplest role, good starting point
   - Dashboard, Tenants List, Tenant Details, Audit Logs
2. **Tenant Admin** (7 pages) - Most complex, core business functionality
   - Dashboard, Users List, Loan Types List/Form, Loan Applications, Audit Logs
3. **Officer** (4 pages) - Application creation workflow
   - Dashboard, Applications List, New Application, Application Details
4. **Approver** (3 pages) - Review and approval interface
   - Dashboard, Review Queue, Review Details

**Why this order:**
- Start simple (System Admin) to establish patterns
- Build momentum with quick wins before tackling complex forms
- Each role can go live independently as completed
- Tenant Admin has most pages, do it when component patterns are established

### 4. Backend Preservation: Zero Backend Changes

**Decision:** Keep all existing backend APIs, authentication, Pinia stores, and data models completely intact.

**This is UI-only:**
- Reuse existing `/server/api/*` endpoints
- Keep authentication system (JWT, role guards, session management)
- Preserve Pinia stores (auth, tenants, users, loanTypes)
- Maintain data models and MongoDB schemas
- No database migrations or API contract changes

**Benefits:**
- Significantly reduces scope and risk
- Working backend means UI can be tested with real data immediately
- No backend developer coordination needed
- Can rollback UI changes without affecting data

**Constraints:**
- UI must work with existing API response formats
- Can't add new backend features during rebuild (defer to future iterations)
- If wireframe shows features not in current backend, defer or adapt design

## Wireframe Design System

### Layout Structure (All Pages)

```
┌─────────────────────────────────────────────┐
│  Topbar (64px)                              │
│  [Page Title]  [🔔] [User Avatar]          │
├──────┬──────────────────────────────────────┤
│      │                                      │
│ Side │  Content Area                        │
│ bar  │  - Page header (title + subtitle)   │
│      │  - Toolbar (actions + filters)       │
│ 260px│  - Main content (cards/tables)       │
│      │  - Pagination (if applicable)        │
│      │                                      │
└──────┴──────────────────────────────────────┘
```

**Shared Components (Identified from Wireframes):**
- AppTopbar - User menu, notifications, page title
- AppSidebar - Role-based navigation, logo, user info
- Stat Cards - Dashboard metrics (4 per dashboard)
- Data Tables - Sortable, paginated, with status badges
- Filter Cards - Collapsible filter sections with form inputs
- Action Buttons - Primary (navy), outline, icon buttons
- Status Badges - Color-coded chips (active, pending, rejected)
- Empty States - Icon + message + optional action button
- Pagination - Previous/Next with page info

### Visual Design Tokens

**Colors:**
- Primary: #1e3a8a (Navy Blue)
- Secondary: #f59e0b (Amber Gold)
- Accent: #eab308 (Yellow Gold)
- Success: #10B981 (Emerald)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Background: #F8FAFC (Light Gray)
- Surface: #FFFFFF (White)

**Typography:**
- Font: System font stack (Segoe UI, sans-serif) - matches wireframes
- H1: 32px/700 - Page headers
- Body: 14px/400 - Default text
- Caption: 12px/400 - Labels, metadata

**Spacing:**
- Page padding: 32px
- Card padding: 24px
- Section gaps: 24px
- Form field spacing: 16px

**Borders & Shadows:**
- Card borders: 1px solid #e5e7eb
- Card shadow: 0 1px 3px rgba(0,0,0,0.1)
- Active nav: Navy blue background (#1e3a8a)
- Hover: rgba(30, 58, 138, 0.04)

## Page-Specific Requirements

### Login Page
- Centered card on gradient background (Navy → Blue)
- Logo: "A" in navy square + "ASCENDENT" text
- Email/password inputs with "Remember me" checkbox
- "Forgot password?" link

### Dashboards (All Roles)
- 4 stat cards in responsive grid
- Primary action button(s) in page header
- Recent activity table or task list
- Role-specific widgets (charts, pending tasks)

### List Pages (Tenants, Users, Loan Types, Applications)
- Toolbar: Primary action button + search box + filters
- Data table: Headers, sortable columns, row actions
- Status badges with color coding
- Pagination controls at bottom

### Detail Pages (Tenant Details, Application Review)
- Two-column layout: Main content (left) + sidebar info (right)
- Info cards with label/value pairs
- Action buttons in sidebar
- Activity timeline or history table

### Form Pages (Loan Type Form, New Application)
- Two-column layout: Form (left) + summary info (right)
- Grouped sections with clear labels
- Inline validation
- Cancel + Submit actions at bottom

### Audit Logs
- Filter card with 4 filter fields (Action, Entity, Date From, Date To)
- Expandable table rows showing metadata
- Timestamp in monospace font
- User info with role badges

## Component Extraction Strategy

### When to Extract a Component

**Rule:** Extract when a pattern repeats **2-3 times** across different pages.

**Examples from Wireframes:**

1. **StatCard** - Appears on all 4 dashboards (4 cards each)
   - Props: value, label, icon
   - Extracted after: 2nd dashboard completed

2. **FilterCard** - Appears on Users, Loan Types, Applications, Audit Logs
   - Flexible slot-based for different filter fields
   - Extracted after: 2nd filtered list page

3. **DataTable** - Appears on 8+ list pages
   - Props: columns, data, sortable, pagination
   - Extracted after: 3rd table page (establish pattern first)

4. **StatusBadge** - Appears on Applications, Tenants, Users
   - Props: status (string), colorMap (object)
   - Extracted after: 2nd page using badges

**Don't Extract Prematurely:**
- Single-use components (specific form sections)
- Components likely to change (experimental features)
- Over-abstracted "god components" that do too much

### Component Organization

```
/components/
  wireframe/          # New wireframe-styled components
    WfStatCard.vue
    WfDataTable.vue
    WfFilterCard.vue
    WfStatusBadge.vue
    WfPageHeader.vue
  shared/             # Keep existing layout components
    AppLayout.vue     # Update to use wireframe styling
    AppSidebar.vue    # Update colors, keep role-based nav
    AppTopbar.vue     # Update colors, keep user menu
```

**Naming Convention:** Prefix wireframe components with `Wf` to distinguish from existing components during transition.

## Migration Path

### Phase 1: Foundation (Week 1)

**Goal:** Update theme and layout components to support wireframe designs.

**Tasks:**
1. Update Vuetify theme in `/plugins/vuetify.ts`
   - Change primary to Navy Blue (#1e3a8a)
   - Change secondary to Amber Gold (#f59e0b)
   - Update component defaults (buttons, cards, inputs)
2. Update AppSidebar styling
   - New logo (navy square + text)
   - Active nav item background (navy blue)
   - Role-based navigation (keep existing logic)
3. Update AppTopbar styling
   - Remove theme toggle (static light theme)
   - Keep notification bell and user menu
4. Create `/styles/wireframe.scss` for shared CSS patterns

**Success Criteria:**
- Layout components render with new colors
- Existing pages look different but still functional
- No broken functionality

### Phase 2: System Admin Pages (Week 2)

**Goal:** Rebuild all System Admin pages to match wireframes.

**Pages (in order):**
1. System Admin Dashboard
   - 4 stat cards (Tenants, Users, Active Loans, Uptime)
   - Recent tenant activity table
   - System health + resource usage cards
2. Tenants List
   - Create Tenant button + search
   - Table with status badges
   - Pagination
3. Tenant Details
   - Two-column layout
   - Info card + quick actions sidebar
   - Recent activity table
4. System Audit Logs
   - Filter card (4 fields)
   - Expandable table rows
   - Pagination

**Component Extraction:**
- After Dashboard: Extract StatCard
- After Tenants List: Extract DataTable (basic version)
- After Tenant Details: Extract InfoCard pattern
- After Audit Logs: Extract FilterCard, update DataTable with expand

### Phase 3: Tenant Admin Pages (Week 3-4)

**Goal:** Rebuild all Tenant Admin pages to match wireframes.

**Pages (in order):**
1. Tenant Admin Dashboard (similar to System Admin Dashboard)
2. Users Management List
3. Loan Types List
4. Loan Type Form (Create/Edit)
5. Loan Applications List
6. Tenant Audit Logs (reuse from Phase 2)

**Component Extraction:**
- After Users List: Enhance DataTable with filters
- After Loan Type Form: Extract form patterns (if repeated in applications)

### Phase 4: Officer & Approver Pages (Week 4-5)

**Goal:** Complete remaining role pages.

**Officer Pages:**
1. Officer Dashboard
2. Applications List (reuse components from Tenant Admin)
3. New Application (multi-step form - most complex page)
4. Application Details

**Approver Pages:**
1. Approver Dashboard
2. Review Queue (similar to Applications List)
3. Review Details (comparison interface)

**Component Extraction:**
- After New Application: Extract multi-step wizard pattern (if applicable to other flows)

## Risks & Mitigation

### Risk 1: Scope Creep During Rebuild

**Risk:** While rebuilding pages, discover missing features or design improvements, leading to scope expansion.

**Mitigation:**
- Create "Future Enhancements" document for ideas that arise during rebuild
- Stick strictly to wireframe specifications - if it's not in the wireframe, defer it
- Code review checkpoint after each role's pages to prevent drift

### Risk 2: Breaking Existing Functionality

**Risk:** UI changes inadvertently break working backend integrations or authentication.

**Mitigation:**
- Keep backend 100% untouched (zero API changes)
- Test auth flow after Phase 1 (theme update)
- Manual QA checklist for each page: login, data loading, CRUD operations
- Feature branch allows easy rollback

### Risk 3: Component Pattern Inconsistency

**Risk:** Page-by-page approach leads to different implementations of similar patterns.

**Mitigation:**
- Extract components when pattern repeats 2-3 times (documented rule)
- Code review focused on DRY principle
- Reference wireframes as single source of truth for patterns
- Refactor early pages when patterns solidify (accept this cost)

### Risk 4: Timeline Slippage

**Risk:** 4-5 week estimate underestimates complexity, especially for multi-step forms.

**Mitigation:**
- Start with simplest pages (System Admin) to validate velocity
- Mark New Application form as highest complexity - allocate extra buffer
- Each role can ship independently (incremental value delivery)
- If behind schedule, defer Officer/Approver to later iteration

## Open Questions

### 1. Component Library Transition

**Question:** Should we keep old components during rebuild or delete immediately?

**Options:**
- Keep both (old in `/components/shared`, new in `/components/wireframe`) until all pages migrated
- Replace old components in place (riskier but cleaner)

**Recommendation:** Keep both during transition, delete old after all pages rebuilt.

---

### 2. Mobile Responsiveness

**Question:** Wireframes show desktop layouts. What's the mobile experience?

**Current State:** Existing app has some mobile styles (sidebar becomes drawer).

**Options:**
- Match desktop wireframes exactly, add mobile after rebuild complete
- Build mobile responsiveness into each page as we go
- Defer mobile to separate phase

**Recommendation:** Defer mobile polish to separate phase - focus on desktop wireframe accuracy first.

---

### 3. Empty States & Loading States

**Question:** Wireframes show one empty state example. Should we build comprehensive states?

**Options:**
- Build full empty/loading/error states for every page (slower but complete)
- Build generic reusable components, apply to all pages (recommended)
- Skip for now, add polish later (fastest but less polished)

**Recommendation:** Build generic EmptyState and LoadingState components early, use throughout.

---

### 4. Animation & Transitions

**Question:** Wireframes are static. What's the interaction feel?

**Options:**
- Minimal transitions (fast, functional, matches wireframes)
- Moderate transitions (smooth, professional feel)
- Rich animations (premium feel but slower)

**Recommendation:** Start minimal, add subtle transitions for polish if time permits.

---

### 5. Component Testing Strategy

**Question:** Should we write tests during the rebuild or after?

**Current State:** No test suite exists for frontend.

**Options:**
- Write component tests as we extract them (slower but safer)
- Defer all testing until rebuild complete (faster but riskier)
- Manual QA only (fastest, lowest confidence)

**Recommendation:** Manual QA during rebuild, defer automated tests to future iteration (YAGNI).

---

### 6. Accessibility Compliance

**Question:** What level of accessibility (a11y) should we target?

**Wireframes:** Use semantic HTML but don't specify ARIA labels.

**Options:**
- WCAG AA compliance (keyboard nav, screen readers, color contrast)
- Basic accessibility (semantic HTML, focus states)
- Defer to future iteration

**Recommendation:** Basic accessibility (Vuetify handles most), keyboard navigation for tables/forms.

---

## Success Metrics

### Completion Criteria

**Phase 1 (Foundation):**
- [ ] Theme colors updated to Navy Blue & Gold
- [ ] AppSidebar and AppTopbar styled to match wireframes
- [ ] No broken pages after theme change

**Phase 2 (System Admin):**
- [ ] 4 System Admin pages match wireframes pixel-perfect
- [ ] StatCard, DataTable, FilterCard components extracted and reusable
- [ ] All existing backend APIs still functional

**Phase 3 (Tenant Admin):**
- [ ] 6 Tenant Admin pages match wireframes
- [ ] Form patterns established (Loan Type Form)
- [ ] Tenant Admin can manage users, loan types, applications

**Phase 4 (Officer & Approver):**
- [ ] All remaining pages rebuilt
- [ ] Multi-step wizard implemented (New Application)
- [ ] All user roles can complete core workflows

### Quality Checks

**Visual Accuracy:**
- Side-by-side comparison with wireframe screenshots
- Color values match exactly (#1e3a8a, #f59e0b)
- Spacing, typography, borders match wireframe CSS

**Functional Integrity:**
- All existing features still work (auth, CRUD, role guards)
- No backend changes required
- Data flows correctly from APIs to UI

**Code Quality:**
- Components extracted when patterns repeat 2-3x
- No duplication of 50+ lines of code
- Props clearly defined with TypeScript interfaces

## Next Steps

After this brainstorm is approved:

1. **Run `/workflows:plan`** to create detailed implementation plan
   - Break down each page into specific tasks
   - Identify component extraction points
   - Estimate effort for each phase

2. **Set up development environment**
   - Create feature branch `feature/ui-rebuild`
   - Verify all existing tests pass before starting

3. **Begin Phase 1 (Foundation)**
   - Update theme configuration
   - Restyle layout components
   - Verify no regressions

---

**Document Status:** Ready for planning phase
**Next Action:** Run `/workflows:plan docs/brainstorms/2026-03-02-ui-rebuild-brainstorm.md`
