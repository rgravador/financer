---
title: System Admin UI Dashboard Implementation
type: feat
date: 2026-03-03
status: ready
related_brainstorm: docs/brainstorms/2026-03-03-system-admin-ui-implementation-brainstorm.md
---

# System Admin UI Dashboard Implementation

## Overview

Implement the System Admin dashboard page for the Ascendent lending platform by building reusable layout components (AppLayout, AppSidebar, AppTopbar) and wireframe components (WfStatCard, WfStatusBadge, WfPageHeader), then composing them into the first Vue page. This establishes the foundation and patterns for building the remaining 3 system admin pages and 3 other role dashboards (tenant admin, officer, approver).

**Scope:**
- Screenshot all 4 system admin wireframes using Playwright MCP for design reference
- Build shared layout components (AppLayout, AppSidebar, AppTopbar)
- Create initial wireframe components (WfStatCard, WfStatusBadge, WfPageHeader)
- Implement system admin dashboard page at `/system/dashboard`
- Connect dashboard to real backend API via Pinia store
- Focus on desktop/fullscreen web (1920x1080+)

**Out of Scope:**
- Mobile responsiveness (future work)
- Other 3 system admin pages (tenants-list, tenant-details, audit-logs - follow same pattern after dashboard)
- Other role dashboards (separate implementation tasks)

## Problem Statement / Motivation

### Current State
The Ascendent platform has a **complete backend infrastructure** (Steps 1-5 complete):
- ✅ All System Admin API endpoints functional (`/api/system/stats`, `/api/system/tenants`, etc.)
- ✅ Pinia stores with CRUD operations (`stores/system.ts`, `stores/auth.ts`)
- ✅ Vuetify 3 theme configured with Navy (#1e3a8a) and Gold (#f59e0b) colors
- ✅ Authentication system with JWT and role-based access control
- ✅ 4 HTML wireframes designed showing exact UI requirements

**Critical Gap:** ❌ **Zero frontend pages exist** - The `pages/` directory is completely empty. The `layouts/default.vue` references `AppLayout` component that doesn't exist. There is no way for system admins to view tenant data, statistics, or manage the platform visually.

### Why This Matters
System admins need a dashboard to:
1. **Monitor platform health** - View total tenants, users, active loans at a glance
2. **Manage tenants** - See recent tenant activity and quickly navigate to tenant details
3. **Track system metrics** - View uptime, resource usage, system health indicators
4. **Access audit logs** - Navigate to audit trail for compliance and troubleshooting

Without the dashboard, system admins must:
- Use API endpoints directly (curl/Postman) - not practical for daily operations
- Query MongoDB directly - requires technical expertise, no GUI
- Lack visibility into platform health and tenant activity

### Strategic Importance
This is the **first Vue page** in the entire codebase. The patterns established here will be replicated across:
- 3 remaining system admin pages (tenants-list, tenant-details, audit-logs)
- 4 tenant admin pages (dashboard, users, loan types, applications)
- 3 officer pages (dashboard, applications, borrowers)
- 3 approver pages (dashboard, queue, loan reviews)

**Total impact:** Establishes foundation for 13+ pages across 4 user roles.

## Proposed Solution

### High-Level Approach

**Sequential Component-First Strategy** (from brainstorm decision):
1. **Screenshot Wireframes** - Capture all 4 wireframes at 1920x1080 for pixel-perfect reference
2. **Build Layout Foundation** - Create AppLayout, AppSidebar, AppTopbar as reusable Vuetify components
3. **Extract Initial Components** - Create WfStatCard, WfStatusBadge, WfPageHeader immediately (pattern is obvious from wireframes)
4. **Implement Dashboard Page** - Compose layout + wireframe components into `/system/dashboard`
5. **Connect to Backend** - Wire dashboard to `GET /api/system/stats` via `useSystemStore()`

### Architecture Decisions

#### 1. Component Structure
```
components/
  shared/
    AppLayout.vue        # v-app wrapper with sidebar + topbar + main
    AppSidebar.vue       # v-navigation-drawer (260px fixed, role-based nav)
    AppTopbar.vue        # v-app-bar (64px height, search, notifications, user menu)
  wireframe/
    WfStatCard.vue       # Dashboard stat cards (value, label, trend)
    WfStatusBadge.vue    # Status chips (active, pending, suspended)
    WfPageHeader.vue     # Page headers with optional breadcrumbs

pages/
  system/
    dashboard.vue        # System admin dashboard (NEW - first page)
```

**Rationale:** Separate `shared/` (used across all roles) from `wireframe/` (extracted from wireframes, may be refactored later).

#### 2. Layout Implementation
Use **Vuetify components**, not custom HTML (per brainstorm decision):

| Wireframe HTML | Vuetify Component | Configuration |
|----------------|-------------------|---------------|
| `<div class="sidebar">` | `<v-navigation-drawer>` | `width="260" permanent rail-width="260"` |
| `<header class="topbar">` | `<v-app-bar>` | `height="64" flat` |
| `<main class="content">` | `<v-main>` | `<v-container fluid>` with 32px padding |
| `<div class="stat-card">` | `<v-card>` | Wrapped in `WfStatCard.vue` component |
| `<span class="status-badge">` | `<v-chip>` | Wrapped in `WfStatusBadge.vue` component |
| `<table class="table">` | `<v-data-table>` | `density="comfortable"` |

**Why Vuetify over wireframe HTML?**
- Accessibility out of the box (ARIA labels, keyboard navigation)
- Responsive behavior built-in for future mobile work
- Theme integration (colors from `plugins/vuetify.ts`)
- Consistent component behavior across the app

#### 3. Navigation Menu (AppSidebar)
**Single component with role-based v-if** (per brainstorm decision):

```vue
<script setup lang="ts">
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const menuItems = computed(() => [
  // System Admin menu
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/system/dashboard', roles: ['system_admin'] },
  { title: 'Tenants', icon: 'mdi-office-building', to: '/system/tenants', roles: ['system_admin'] },
  { title: 'Audit Logs', icon: 'mdi-file-document-outline', to: '/system/audit-logs', roles: ['system_admin'] },

  // Future: Tenant Admin, Officer, Approver menus (add in later tasks)
])

// Filter menu items by current user's role
const visibleMenuItems = computed(() =>
  menuItems.value.filter(item => item.roles.includes(user.value?.role))
)
</script>
```

**Why single component?** Maintains DRY principle, easier to add new roles, centralizes navigation logic.

#### 4. Data Flow Pattern
**Pages → Pinia Stores → API** (no direct API calls in components):

```vue
<!-- pages/system/dashboard.vue -->
<script setup lang="ts">
const systemStore = useSystemStore()
const { stats, loading, error } = storeToRefs(systemStore)

// Fetch data on mount
onMounted(async () => {
  await systemStore.fetchStats() // Calls GET /api/system/stats
})
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">Error: {{ error }}</div>

  <div v-else>
    <!-- Stat cards using real data -->
    <v-row>
      <v-col v-for="stat in stats" :key="stat.label">
        <WfStatCard :value="stat.value" :label="stat.label" :trend="stat.trend" />
      </v-col>
    </v-row>
  </div>
</template>
```

**Why this pattern?** Separates concerns (components for UI, stores for state/API, API routes for backend).

## Technical Considerations

### Architecture Impacts

#### 1. First Vue Page Sets Precedent
This is the **first page** in an empty `pages/` directory. Every decision here becomes the template:
- Component organization pattern (`shared/` vs `wireframe/`)
- Data fetching pattern (store actions in `onMounted`)
- Error handling pattern (loading states, error messages)
- TypeScript interface definitions (props, emits, store state)

**Action:** Ensure code quality is exemplary - other developers will copy this pattern 13+ times.

#### 2. Layout Component Reuse
`AppLayout`, `AppSidebar`, `AppTopbar` will be used by **all authenticated pages** (13+ pages):
- System Admin: 4 pages
- Tenant Admin: 4 pages
- Officer: 3 pages
- Approver: 3 pages

**Impact:** Any bugs or missing features in layout components will affect all pages. Thorough testing critical.

#### 3. Routing Architecture
Nuxt 3 uses file-based routing. Page structure determines URLs:
```
pages/system/dashboard.vue → /system/dashboard
pages/system/tenants/index.vue → /system/tenants
pages/system/tenants/[id].vue → /system/tenants/:id
```

**Gotcha:** `definePageMeta()` required for route guards:
```vue
<script setup>
definePageMeta({
  middleware: 'auth',
  meta: { roles: ['system_admin'] }
})
</script>
```

### Performance Implications

#### 1. Vuetify Bundle Size
Vuetify 3 is **not tree-shakeable by default** - importing `<v-navigation-drawer>` pulls in the entire component.

**Mitigation:** Already configured in `nuxt.config.ts` via `vuetify-nuxt-module` - auto-imports only used components.

**Estimated Impact:** Dashboard page with 4 stat cards, 1 table, layout components ≈ 150KB gzipped (acceptable for desktop app).

#### 2. API Call Optimization
Dashboard makes **1 API call** on mount: `GET /api/system/stats`

**Response size:** ~2KB (4 stat values + 5 recent tenants)

**Loading time:** <100ms on localhost, <500ms in production (MongoDB query is simple)

**Optimization:** Use Pinia store caching - if user navigates away and back, don't re-fetch unless data is stale (>5 minutes).

#### 3. Re-render Performance
Stat cards are **pure presentational components** - no reactive state, only props.

**Optimization:** Use `memo()` or ensure parent doesn't re-render unnecessarily:
```vue
<script setup>
const stats = computed(() => systemStore.stats) // Only updates when stats change
</script>
```

### Security Considerations

#### 1. Route Protection
**Requirement:** Only users with `role: 'system_admin'` can access `/system/*` routes.

**Implementation:**
```typescript
// middleware/auth.ts (already exists)
export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  if (!authStore.isAuthenticated) {
    return navigateTo('/login')
  }

  // Check role from page meta
  const allowedRoles = to.meta.roles as string[]
  if (allowedRoles && !allowedRoles.includes(authStore.user.role)) {
    return navigateTo('/unauthorized')
  }
})
```

**Action:** Add `definePageMeta({ middleware: 'auth', meta: { roles: ['system_admin'] } })` to dashboard page.

#### 2. Data Exposure
**Risk:** Dashboard displays sensitive platform-wide data (total users, tenant info).

**Mitigation:** Backend API (`/api/system/stats`) already uses `requireSystemAdmin()` guard - only system admins get data.

**Frontend:** No additional security needed - if user isn't system admin, they can't load the page (route guard) AND can't call the API (backend guard).

#### 3. XSS Prevention
**Risk:** Displaying user-generated content (tenant names) could allow XSS.

**Mitigation:** Vue 3 auto-escapes all text interpolations (`{{ tenantName }}`). Use `v-html` only when absolutely necessary (not needed for dashboard).

**Action:** No additional work - Vue handles this by default.

## Acceptance Criteria

### Functional Requirements

#### Screenshot Wireframes
- [ ] All 4 system admin wireframes screenshotted at 1920x1080 resolution (SKIPPED - using HTML wireframes)
- [ ] Screenshots saved to `/docs/wireframes/screenshots/system-admin/` (SKIPPED)
- [ ] Filenames: `dashboard-1920x1080.png`, `tenants-list-1920x1080.png`, `tenant-details-1920x1080.png`, `audit-logs-1920x1080.png` (SKIPPED)

#### Layout Components
- [x] `components/shared/AppLayout.vue` created with `<v-app>` wrapper
- [x] `components/shared/AppSidebar.vue` created with `<v-navigation-drawer>` (260px fixed width)
- [x] `components/shared/AppTopbar.vue` created with `<v-app-bar>` (64px height)
- [x] AppSidebar shows role-based navigation menu (system admin items only for now)
- [x] AppSidebar includes logo, user info, logout button
- [x] AppTopbar includes search box (mock), notifications badge (mock), user menu

#### Wireframe Components
- [x] `components/wireframe/WfStatCard.vue` created with props: `value`, `label`, `trend`
- [x] `components/wireframe/WfStatusBadge.vue` created with prop: `status` (active, pending, suspended)
- [x] `components/wireframe/WfPageHeader.vue` created with props: `title`, `breadcrumbs` (optional)
- [x] All components have TypeScript interfaces for props
- [x] All components use Vuetify components (v-card, v-chip) styled to match wireframes

#### Dashboard Page
- [x] `pages/system/dashboard.vue` created and accessible at `/system/dashboard`
- [x] Page uses `<AppLayout>` wrapper with sidebar + topbar
- [x] Page displays 4 stat cards: Total Tenants, Total Users, Active Loans, System Uptime
- [x] Page displays "Recent Tenants" table with columns: Name, Users, Status, Created
- [x] Page calls `GET /api/system/stats` via `systemStore.fetchStats()` on mount
- [x] Page displays loading state while fetching data
- [x] Page displays error message if API call fails
- [x] Page protected by auth middleware (only system admins can access)

### Visual Fidelity
- [ ] Dashboard matches wireframe screenshot within 95% accuracy
- [ ] Colors match Vuetify theme exactly (Navy #1e3a8a, Gold #f59e0b)
- [ ] Sidebar width is 260px (fixed, not collapsible on desktop)
- [ ] Topbar height is 64px (sticky to top)
- [ ] Page content padding is 32px on all sides
- [ ] Card padding is 24px inside stat cards
- [ ] Border radius is 12px on cards (per Vuetify theme defaults)
- [ ] Typography uses Inter font (configured in nuxt.config.ts)

### Code Quality
- [ ] All TypeScript types defined - no `any` types
- [ ] All components <300 lines (extract sub-components if needed)
- [ ] Props validated with TypeScript interfaces
- [ ] Emits defined with TypeScript types
- [ ] Code passes ESLint (no errors)
- [ ] Code formatted with Prettier
- [ ] No console.log statements (use proper error handling)

### Testing (Manual)
- [ ] Dashboard loads in <500ms on localhost after `npm run dev`
- [ ] No console errors or warnings when dashboard loads
- [ ] Stat cards display correct data from `GET /api/system/stats`
- [ ] Recent tenants table displays data correctly
- [ ] Clicking "Tenants" in sidebar shows "Coming soon" or navigates to placeholder
- [ ] Clicking "Audit Logs" in sidebar shows "Coming soon" or navigates to placeholder
- [ ] Logout button logs user out and redirects to `/login`
- [ ] Non-system-admin users redirected to `/unauthorized` if they try to access `/system/dashboard`

## Success Metrics

### Development Velocity
- **Target:** Complete implementation in 1 working day (8 hours)
  - Screenshot wireframes: 30 minutes
  - Build layout components: 2 hours
  - Create wireframe components: 1.5 hours
  - Implement dashboard page: 2 hours
  - Testing and polish: 1 hour
  - Documentation: 1 hour

**Measurement:** Track actual time spent per task vs estimate.

### Code Reusability
- **Target:** 80%+ of code reused for next system admin page (tenants-list)
  - AppLayout, AppSidebar, AppTopbar: 100% reused
  - WfStatusBadge, WfPageHeader: 100% reused
  - WfStatCard: Not used (tenants-list doesn't have stats)
  - Data table pattern: Established for reuse

**Measurement:** When building tenants-list page, count lines of new code vs reused code.

### Visual Fidelity
- **Target:** 95%+ match to wireframe screenshot
  - Layout structure: 100% match (sidebar, topbar, content area)
  - Colors: 100% match (Navy, Gold, Success, Error)
  - Spacing: 95%+ match (Vuetify defaults may differ slightly)
  - Typography: 100% match (Inter font, sizes from wireframe)

**Measurement:** Side-by-side comparison of screenshot vs running app.

### API Integration
- **Target:** 100% of dashboard data from real API (no mock data)
  - Total Tenants: From `stats.totalTenants`
  - Total Users: From `stats.totalUsers`
  - Active Loans: From `stats.activeLoans`
  - System Uptime: From `stats.systemUptime`
  - Recent Tenants: From `stats.recentTenants` array

**Measurement:** Verify all data comes from `GET /api/system/stats` response.

## Dependencies & Risks

### Prerequisites (All ✅ Complete)
- ✅ Backend API endpoints functional (`GET /api/system/stats`, `GET /api/system/tenants`)
- ✅ Pinia stores implemented (`stores/system.ts`, `stores/auth.ts`)
- ✅ Vuetify theme configured with Navy/Gold colors
- ✅ Authentication system working (JWT, refresh tokens, role guards)
- ✅ Wireframes designed (4 HTML files in `docs/wireframes/system-admin/`)
- ✅ Database seeding script (`npm run seed` creates test data)

**Status:** No blockers - all dependencies complete.

### Risks & Mitigation

#### Risk 1: Vuetify Learning Curve (Medium)
**Impact:** Developers unfamiliar with Vuetify 3 may struggle with component API.

**Likelihood:** Medium (Vuetify 3 is newer, less community resources than v2).

**Mitigation:**
- Reference `docs/VUETIFY_CUSTOMIZATION.md` for established patterns
- Use Vuetify 3 official docs: https://vuetifyjs.com/
- Start with simple components (v-card, v-btn) before complex ones (v-data-table)
- Copy patterns from `layouts/auth.vue` (existing Vuetify usage)

#### Risk 2: Component Over-Abstraction (Low)
**Impact:** Extracting components too early creates overly generic components that don't fit future use cases.

**Likelihood:** Low (brainstorm explicitly warns against this).

**Mitigation:**
- Follow 2-3 repetition rule: Only extract after seeing pattern 2-3 times
- For dashboard: Extract WfStatCard, WfStatusBadge, WfPageHeader immediately (pattern is obvious from wireframes)
- For data tables: Wait until tenants-list and audit-logs pages before extracting WfDataTable

#### Risk 3: Layout Doesn't Match Wireframes (Low)
**Impact:** Dashboard looks different from wireframe, requires rework.

**Likelihood:** Low (wireframe CSS already exists, Vuetify theme configured).

**Mitigation:**
- Take screenshots of wireframes FIRST - use as pixel-perfect reference
- Use browser dev tools to measure wireframe dimensions (sidebar width, topbar height, padding)
- Apply existing wireframe SCSS classes (`styles/wireframe.scss`) alongside Vuetify components
- Test on 1920x1080 screen (wireframe target resolution)

#### Risk 4: API Response Format Mismatch (Low)
**Impact:** Dashboard expects different data shape than API returns, requires backend changes.

**Likelihood:** Low (API already implemented and tested).

**Mitigation:**
- Review `server/api/system/stats.get.ts` response format BEFORE building dashboard
- Use TypeScript interfaces to define expected API response shape
- Test with real API call (not mock data) from the start

**Expected Response:**
```typescript
interface SystemStats {
  totalTenants: number
  totalUsers: number
  activeLoans: number
  systemUptime: string
  recentTenants: Array<{
    id: string
    name: string
    userCount: number
    isActive: boolean
    createdAt: string
  }>
  systemHealth: {
    database: 'healthy' | 'degraded' | 'down'
    api: 'healthy' | 'degraded' | 'down'
    storage: 'healthy' | 'degraded' | 'down'
  }
  resourceUsage: {
    cpu: number // percentage
    memory: number // percentage
    disk: number // percentage
  }
}
```

## Technical Approach

### Implementation Phases

#### Phase 1: Screenshot Wireframes (30 minutes)

**Task 1.1:** Use Playwright MCP to screenshot wireframes
```typescript
// Use Playwright MCP browser tools
// 1. Open each wireframe HTML file in browser
// 2. Set viewport to 1920x1080
// 3. Take full-page screenshot
// 4. Save to /docs/wireframes/screenshots/system-admin/
```

**Files to Screenshot:**
- `docs/wireframes/system-admin/dashboard.html` → `dashboard-1920x1080.png`
- `docs/wireframes/system-admin/tenants-list.html` → `tenants-list-1920x1080.png`
- `docs/wireframes/system-admin/tenant-details.html` → `tenant-details-1920x1080.png`
- `docs/wireframes/system-admin/audit-logs.html` → `audit-logs-1920x1080.png`

**Deliverable:** 4 PNG files in `/docs/wireframes/screenshots/system-admin/`

---

#### Phase 2: Build Layout Components (2 hours)

**Task 2.1:** Create `components/shared/AppLayout.vue`

```vue
<!-- components/shared/AppLayout.vue -->
<script setup lang="ts">
// No props - layout is fixed structure
</script>

<template>
  <v-app>
    <AppSidebar />
    <AppTopbar />

    <v-main>
      <v-container fluid class="pa-8">
        <slot /> <!-- Page content goes here -->
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.pa-8 {
  padding: 32px !important; /* Wireframe spec: 32px page padding */
}
</style>
```

**Task 2.2:** Create `components/shared/AppSidebar.vue`

```vue
<!-- components/shared/AppSidebar.vue -->
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const router = useRouter()

interface MenuItem {
  title: string
  icon: string
  to: string
  roles: string[]
}

const menuItems: MenuItem[] = [
  { title: 'Dashboard', icon: 'mdi-view-dashboard', to: '/system/dashboard', roles: ['system_admin'] },
  { title: 'Tenants', icon: 'mdi-office-building', to: '/system/tenants', roles: ['system_admin'] },
  { title: 'Audit Logs', icon: 'mdi-file-document-outline', to: '/system/audit-logs', roles: ['system_admin'] },
]

const visibleMenuItems = computed(() =>
  menuItems.filter(item => item.roles.includes(user.value?.role || ''))
)

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <v-navigation-drawer
    permanent
    :width="260"
    :rail-width="260"
    color="white"
    class="sidebar"
  >
    <!-- Logo -->
    <div class="pa-4 text-center border-b">
      <h2 class="text-navy font-weight-bold">ASCENDENT</h2>
    </div>

    <!-- User Info -->
    <div class="pa-4 border-b">
      <div class="d-flex align-center">
        <v-avatar color="primary" size="40">
          <span class="white--text">{{ user?.firstName?.[0] }}{{ user?.lastName?.[0] }}</span>
        </v-avatar>
        <div class="ml-3">
          <div class="text-subtitle-2">{{ user?.firstName }} {{ user?.lastName }}</div>
          <div class="text-caption text-grey">{{ user?.role?.replace('_', ' ') }}</div>
        </div>
      </div>
    </div>

    <!-- Navigation Menu -->
    <v-list density="comfortable" class="py-2">
      <v-list-item
        v-for="item in visibleMenuItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.title"
        rounded="lg"
        class="mx-2 my-1"
      />
    </v-list>

    <!-- Logout Button (Footer) -->
    <template #append>
      <div class="pa-4 border-t">
        <v-btn
          block
          variant="outlined"
          color="error"
          prepend-icon="mdi-logout"
          @click="handleLogout"
        >
          Logout
        </v-btn>
      </div>
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.sidebar {
  border-right: 1px solid #e5e7eb;
}

.border-b {
  border-bottom: 1px solid #e5e7eb;
}

.border-t {
  border-top: 1px solid #e5e7eb;
}

.text-navy {
  color: #1e3a8a;
}
</style>
```

**Task 2.3:** Create `components/shared/AppTopbar.vue`

```vue
<!-- components/shared/AppTopbar.vue -->
<script setup lang="ts">
import { useAuthStore } from '~/stores/auth'

const authStore = useAuthStore()
const { user } = storeToRefs(authStore)

const searchQuery = ref('')
const notificationCount = ref(3) // Mock - will be real data later

const handleSearch = () => {
  // TODO: Implement global search
  console.log('Searching for:', searchQuery.value)
}
</script>

<template>
  <v-app-bar
    :height="64"
    flat
    color="white"
    class="topbar"
  >
    <!-- Search Box -->
    <v-text-field
      v-model="searchQuery"
      prepend-inner-icon="mdi-magnify"
      placeholder="Search..."
      variant="outlined"
      density="compact"
      hide-details
      class="mx-4"
      style="max-width: 400px;"
      @keyup.enter="handleSearch"
    />

    <v-spacer />

    <!-- Notifications -->
    <v-btn icon variant="text">
      <v-badge :content="notificationCount" color="error">
        <v-icon>mdi-bell-outline</v-icon>
      </v-badge>
    </v-btn>

    <!-- User Menu -->
    <v-menu>
      <template #activator="{ props }">
        <v-btn variant="text" v-bind="props">
          <v-avatar color="primary" size="32" class="mr-2">
            <span class="white--text text-caption">{{ user?.firstName?.[0] }}{{ user?.lastName?.[0] }}</span>
          </v-avatar>
          <span class="text-body-2">{{ user?.firstName }}</span>
          <v-icon right>mdi-chevron-down</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item to="/profile" prepend-icon="mdi-account">
          <v-list-item-title>Profile</v-list-item-title>
        </v-list-item>
        <v-list-item to="/settings" prepend-icon="mdi-cog">
          <v-list-item-title>Settings</v-list-item-title>
        </v-list-item>
        <v-divider />
        <v-list-item @click="authStore.logout()" prepend-icon="mdi-logout" color="error">
          <v-list-item-title>Logout</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </v-app-bar>
</template>

<style scoped>
.topbar {
  border-bottom: 1px solid #e5e7eb;
}
</style>
```

**Deliverables:**
- `components/shared/AppLayout.vue` (30 lines)
- `components/shared/AppSidebar.vue` (120 lines)
- `components/shared/AppTopbar.vue` (80 lines)

---

#### Phase 3: Create Wireframe Components (1.5 hours)

**Task 3.1:** Create `components/wireframe/WfStatCard.vue`

```vue
<!-- components/wireframe/WfStatCard.vue -->
<script setup lang="ts">
interface Props {
  value: string | number
  label: string
  trend?: string // Optional trend indicator (e.g., "+12% this month")
  trendPositive?: boolean // true = green, false = red
}

const props = withDefaults(defineProps<Props>(), {
  trend: '',
  trendPositive: true
})
</script>

<template>
  <v-card class="wf-stat-card pa-6" elevation="1" rounded="lg">
    <div class="stat-value text-h3 font-weight-bold text-primary mb-2">
      {{ value }}
    </div>

    <div class="stat-label text-subtitle-1 text-grey-darken-1 mb-2">
      {{ label }}
    </div>

    <div
      v-if="trend"
      class="stat-trend text-caption"
      :class="trendPositive ? 'text-success' : 'text-error'"
    >
      {{ trend }}
    </div>
  </v-card>
</template>

<style scoped>
.wf-stat-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.wf-stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

.stat-value {
  color: #1e3a8a; /* Navy blue */
}

.stat-label {
  color: #6b7280; /* Gray */
}
</style>
```

**Task 3.2:** Create `components/wireframe/WfStatusBadge.vue`

```vue
<!-- components/wireframe/WfStatusBadge.vue -->
<script setup lang="ts">
interface Props {
  status: 'active' | 'pending' | 'suspended' | 'inactive'
}

const props = defineProps<Props>()

const statusConfig = computed(() => {
  const configs = {
    active: { color: 'success', text: 'Active', icon: 'mdi-check-circle' },
    pending: { color: 'warning', text: 'Pending', icon: 'mdi-clock-outline' },
    suspended: { color: 'error', text: 'Suspended', icon: 'mdi-alert-circle' },
    inactive: { color: 'grey', text: 'Inactive', icon: 'mdi-minus-circle' }
  }

  return configs[props.status]
})
</script>

<template>
  <v-chip
    :color="statusConfig.color"
    size="small"
    variant="flat"
    :prepend-icon="statusConfig.icon"
  >
    {{ statusConfig.text }}
  </v-chip>
</template>
```

**Task 3.3:** Create `components/wireframe/WfPageHeader.vue`

```vue
<!-- components/wireframe/WfPageHeader.vue -->
<script setup lang="ts">
interface Breadcrumb {
  text: string
  to?: string
  disabled?: boolean
}

interface Props {
  title: string
  subtitle?: string
  breadcrumbs?: Breadcrumb[]
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  breadcrumbs: () => []
})
</script>

<template>
  <div class="wf-page-header mb-6">
    <!-- Breadcrumbs (optional) -->
    <v-breadcrumbs
      v-if="breadcrumbs && breadcrumbs.length > 0"
      :items="breadcrumbs"
      class="pa-0 mb-2"
    >
      <template #divider>
        <v-icon>mdi-chevron-right</v-icon>
      </template>
    </v-breadcrumbs>

    <!-- Title -->
    <h1 class="text-h4 font-weight-bold text-navy mb-2">
      {{ title }}
    </h1>

    <!-- Subtitle (optional) -->
    <p v-if="subtitle" class="text-subtitle-1 text-grey-darken-1">
      {{ subtitle }}
    </p>
  </div>
</template>

<style scoped>
.text-navy {
  color: #1e3a8a;
}
</style>
```

**Deliverables:**
- `components/wireframe/WfStatCard.vue` (60 lines)
- `components/wireframe/WfStatusBadge.vue` (40 lines)
- `components/wireframe/WfPageHeader.vue` (50 lines)

---

#### Phase 4: Implement Dashboard Page (2 hours)

**Task 4.1:** Create Pinia store action for stats

```typescript
// stores/system.ts - Add this action
export const useSystemStore = defineStore('system', () => {
  // ... existing state ...

  const stats = ref<SystemStats | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchStats = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; data: SystemStats }>('/api/system/stats')
      stats.value = response.data
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch stats'
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    // ... existing returns ...
    stats,
    loading,
    error,
    fetchStats
  }
})

// TypeScript interface for stats response
interface SystemStats {
  totalTenants: number
  totalUsers: number
  activeLoans: number
  systemUptime: string
  recentTenants: Array<{
    id: string
    name: string
    userCount: number
    isActive: boolean
    createdAt: string
  }>
  systemHealth: {
    database: 'healthy' | 'degraded' | 'down'
    api: 'healthy' | 'degraded' | 'down'
    storage: 'healthy' | 'degraded' | 'down'
  }
  resourceUsage: {
    cpu: number
    memory: number
    disk: number
  }
}
```

**Task 4.2:** Create `pages/system/dashboard.vue`

```vue
<!-- pages/system/dashboard.vue -->
<script setup lang="ts">
import { useSystemStore } from '~/stores/system'

// Route protection
definePageMeta({
  middleware: 'auth',
  meta: {
    roles: ['system_admin']
  }
})

const systemStore = useSystemStore()
const { stats, loading, error } = storeToRefs(systemStore)

// Fetch stats on mount
onMounted(async () => {
  await systemStore.fetchStats()
})

// Computed stat cards data
const statCards = computed(() => {
  if (!stats.value) return []

  return [
    {
      value: stats.value.totalTenants,
      label: 'Total Tenants',
      trend: '+12% this month',
      trendPositive: true
    },
    {
      value: stats.value.totalUsers,
      label: 'Total Users',
      trend: '+8% this month',
      trendPositive: true
    },
    {
      value: stats.value.activeLoans,
      label: 'Active Loans',
      trend: '+5% this month',
      trendPositive: true
    },
    {
      value: stats.value.systemUptime,
      label: 'System Uptime',
      trend: '99.9% availability',
      trendPositive: true
    }
  ]
})

// Data table headers
const headers = [
  { title: 'Tenant Name', key: 'name', sortable: true },
  { title: 'Users', key: 'userCount', sortable: true },
  { title: 'Status', key: 'isActive', sortable: true },
  { title: 'Created', key: 'createdAt', sortable: true },
  { title: 'Actions', key: 'actions', sortable: false }
]

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const viewTenant = (tenantId: string) => {
  navigateTo(`/system/tenants/${tenantId}`)
}
</script>

<template>
  <AppLayout>
    <WfPageHeader
      title="System Admin Dashboard"
      subtitle="Complete oversight of all tenants and platform metrics"
    />

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <v-progress-circular indeterminate color="primary" size="64" />
      <p class="text-h6 mt-4">Loading dashboard data...</p>
    </div>

    <!-- Error State -->
    <v-alert v-else-if="error" type="error" variant="tonal" class="mb-6">
      <v-alert-title>Error Loading Dashboard</v-alert-title>
      {{ error }}
    </v-alert>

    <!-- Dashboard Content -->
    <div v-else>
      <!-- Stat Cards Grid -->
      <v-row class="mb-6">
        <v-col
          v-for="(stat, index) in statCards"
          :key="index"
          cols="12"
          sm="6"
          md="3"
        >
          <WfStatCard
            :value="stat.value"
            :label="stat.label"
            :trend="stat.trend"
            :trend-positive="stat.trendPositive"
          />
        </v-col>
      </v-row>

      <!-- Recent Tenants Table -->
      <v-card elevation="1" rounded="lg">
        <v-card-title class="text-h6 font-weight-bold">
          Recent Tenants
        </v-card-title>

        <v-data-table
          :headers="headers"
          :items="stats?.recentTenants || []"
          density="comfortable"
          :items-per-page="5"
          class="elevation-0"
        >
          <!-- Status Badge Column -->
          <template #item.isActive="{ item }">
            <WfStatusBadge :status="item.isActive ? 'active' : 'inactive'" />
          </template>

          <!-- Created Date Column -->
          <template #item.createdAt="{ item }">
            {{ formatDate(item.createdAt) }}
          </template>

          <!-- Actions Column -->
          <template #item.actions="{ item }">
            <v-btn
              size="small"
              variant="outlined"
              color="primary"
              @click="viewTenant(item.id)"
            >
              View
            </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </div>
  </AppLayout>
</template>
```

**Deliverables:**
- Updated `stores/system.ts` with `fetchStats()` action
- `pages/system/dashboard.vue` (150 lines)

---

#### Phase 5: Testing & Polish (1 hour)

**Task 5.1:** Manual Testing Checklist
- [ ] Run `npm run dev` and navigate to `http://localhost:3000/system/dashboard`
- [ ] Verify dashboard loads without console errors
- [ ] Verify 4 stat cards display with correct values from API
- [ ] Verify recent tenants table shows data
- [ ] Click "View" button on tenant - verify navigation (or placeholder)
- [ ] Click sidebar "Tenants" link - verify navigation (or placeholder)
- [ ] Click sidebar "Audit Logs" link - verify navigation (or placeholder)
- [ ] Click logout button - verify redirect to `/login`
- [ ] Test non-system-admin access:
  - Login as tenant admin (from seed script)
  - Navigate to `/system/dashboard`
  - Verify redirect to `/unauthorized`

**Task 5.2:** Visual Comparison
- [ ] Open wireframe screenshot side-by-side with running dashboard
- [ ] Verify sidebar width matches (260px)
- [ ] Verify topbar height matches (64px)
- [ ] Verify stat card layout matches wireframe
- [ ] Verify colors match (Navy, Gold, Success, Error)
- [ ] Verify typography matches (Inter font, sizes)

**Task 5.3:** Performance Check
- [ ] Open browser DevTools Network tab
- [ ] Reload dashboard page
- [ ] Verify `GET /api/system/stats` returns in <100ms
- [ ] Verify total page load time <500ms
- [ ] Check bundle size (should be <500KB total)

**Deliverable:** All tests passing, dashboard matches wireframe at 95%+ fidelity

---

#### Phase 6: Documentation (1 hour)

**Task 6.1:** Update IMPLEMENTATION_STATUS.md
```markdown
## Step 11b - System Admin UI (Dashboard)

**Status:** ✅ Complete

**Components Built:**
- AppLayout, AppSidebar, AppTopbar (shared layout)
- WfStatCard, WfStatusBadge, WfPageHeader (wireframe components)

**Pages Built:**
- `/system/dashboard` - System admin dashboard with stats and recent tenants

**Next Steps:**
- Build `/system/tenants` (tenants list page)
- Build `/system/tenants/:id` (tenant details page)
- Build `/system/audit-logs` (audit logs page)
```

**Task 6.2:** Create Component Documentation

Create `components/wireframe/README.md`:
```markdown
# Wireframe Components

Reusable components extracted from wireframes for consistent UI across all role dashboards.

## WfStatCard

Dashboard statistics card with value, label, and optional trend indicator.

**Props:**
- `value` (string | number) - Main stat value to display
- `label` (string) - Stat label/description
- `trend` (string, optional) - Trend indicator text
- `trendPositive` (boolean, default: true) - Trend color (green or red)

**Usage:**
```vue
<WfStatCard
  :value="120"
  label="Total Tenants"
  trend="+12% this month"
  :trend-positive="true"
/>
```

## WfStatusBadge

Status indicator chip with color coding.

**Props:**
- `status` ('active' | 'pending' | 'suspended' | 'inactive') - Status to display

**Usage:**
```vue
<WfStatusBadge status="active" />
```

## WfPageHeader

Page header with title, optional subtitle, and optional breadcrumbs.

**Props:**
- `title` (string) - Page title
- `subtitle` (string, optional) - Page subtitle/description
- `breadcrumbs` (Breadcrumb[], optional) - Breadcrumb navigation items

**Usage:**
```vue
<WfPageHeader
  title="Dashboard"
  subtitle="System overview"
  :breadcrumbs="[
    { text: 'System Admin', to: '/system' },
    { text: 'Dashboard', disabled: true }
  ]"
/>
```
```

**Deliverables:**
- Updated `docs/IMPLEMENTATION_STATUS.md`
- Created `components/wireframe/README.md`

## References & Research

### Internal References

**Brainstorm Document:**
- `docs/brainstorms/2026-03-03-system-admin-ui-implementation-brainstorm.md` - All key decisions and rationale

**Configuration Files:**
- `plugins/vuetify.ts:1-80` - Theme configuration (Navy #1e3a8a, Gold #f59e0b already set)
- `nuxt.config.ts:1-81` - SPA mode, Vuetify module, SCSS imports

**Existing Stores:**
- `stores/auth.ts:1-150` - Authentication store with `isSystemAdmin` getter
- `stores/system.ts:1-200` - System admin store with tenant CRUD actions

**API Endpoints:**
- `server/api/system/stats.get.ts` - Dashboard statistics endpoint
- `server/api/system/tenants/index.get.ts` - List tenants endpoint

**Wireframe Designs:**
- `docs/wireframes/system-admin/dashboard.html` - Dashboard wireframe (primary reference)
- `docs/wireframes/components/README.md` - Component specifications
- `styles/wireframe.scss` - Reusable wireframe SCSS classes

**Existing Layouts:**
- `layouts/default.vue:1-10` - References AppLayout (needs to be built)
- `layouts/auth.vue:1-30` - Example of Vuetify layout structure

### Documentation

**Vuetify 3 Documentation:**
- Component API: https://vuetifyjs.com/en/components/all/
- Navigation Drawer: https://vuetifyjs.com/en/components/navigation-drawers/
- App Bar: https://vuetifyjs.com/en/components/app-bars/
- Data Tables: https://vuetifyjs.com/en/components/data-tables/basics/

**Nuxt 3 Documentation:**
- Pages & Routing: https://nuxt.com/docs/guide/directory-structure/pages
- Middleware: https://nuxt.com/docs/guide/directory-structure/middleware
- Layouts: https://nuxt.com/docs/guide/directory-structure/layouts

**Pinia Documentation:**
- Defining Stores: https://pinia.vuejs.org/core-concepts/
- Composition API: https://pinia.vuejs.org/core-concepts/#setup-stores

### Established Patterns

**Component Extraction Rule (from learnings):**
- Extract after 2-3 repetitions across different pages
- Exception: Extract immediately if pattern is obvious from wireframes (stat cards, status badges)
- Place in `/components/wireframe/` directory with `Wf` prefix

**Layout Dimensions (from wireframes):**
- Sidebar width: 260px fixed
- Topbar height: 64px
- Page padding: 32px on all sides
- Card padding: 24px inside cards
- Section gap: 24px between sections
- Border radius: 12px on cards

**Data Flow Pattern:**
- Pages call Pinia store actions in `onMounted()`
- Store actions call API endpoints via `$fetch`
- Components receive data via props (no direct API calls)
- Loading/error states handled at page level

**Route Protection Pattern:**
```vue
<script setup>
definePageMeta({
  middleware: 'auth',
  meta: { roles: ['system_admin'] }
})
</script>
```

### Related Issues

**Future Work (After Dashboard Complete):**
- Issue #TBD: Implement `/system/tenants` page (tenants list with search/filter)
- Issue #TBD: Implement `/system/tenants/:id` page (tenant details with users)
- Issue #TBD: Implement `/system/audit-logs` page (audit logs with advanced filters)
- Issue #TBD: Build Tenant Admin dashboard (reuses layout + components)
- Issue #TBD: Build Officer dashboard (reuses layout + components)
- Issue #TBD: Build Approver dashboard (reuses layout + components)

**Known Limitations:**
- Desktop-only (1920x1080+) - mobile responsiveness is future work
- Light mode only - dark mode support is future work
- Mock search and notifications - real implementation is future work
- System health indicators are mock data - requires backend metrics

---

## Appendix

### File Structure After Implementation

```
/Users/rgravador/Desktop/dev/claude-code-v3/
├── components/
│   ├── shared/
│   │   ├── AppLayout.vue          # NEW - Main layout wrapper
│   │   ├── AppSidebar.vue         # NEW - Navigation sidebar
│   │   └── AppTopbar.vue          # NEW - Top app bar
│   └── wireframe/
│       ├── WfStatCard.vue         # NEW - Stat card component
│       ├── WfStatusBadge.vue      # NEW - Status chip component
│       ├── WfPageHeader.vue       # NEW - Page header component
│       └── README.md              # NEW - Component documentation
├── pages/
│   └── system/
│       └── dashboard.vue          # NEW - Dashboard page
├── docs/
│   ├── wireframes/
│   │   └── screenshots/
│   │       └── system-admin/      # NEW - Wireframe screenshots
│   │           ├── dashboard-1920x1080.png
│   │           ├── tenants-list-1920x1080.png
│   │           ├── tenant-details-1920x1080.png
│   │           └── audit-logs-1920x1080.png
│   └── IMPLEMENTATION_STATUS.md   # UPDATED - Add Step 11b status
└── stores/
    └── system.ts                  # UPDATED - Add fetchStats() action
```

### Estimated Line Counts

**New Code:**
- `components/shared/AppLayout.vue`: 30 lines
- `components/shared/AppSidebar.vue`: 120 lines
- `components/shared/AppTopbar.vue`: 80 lines
- `components/wireframe/WfStatCard.vue`: 60 lines
- `components/wireframe/WfStatusBadge.vue`: 40 lines
- `components/wireframe/WfPageHeader.vue`: 50 lines
- `pages/system/dashboard.vue`: 150 lines
- `components/wireframe/README.md`: 50 lines

**Updated Code:**
- `stores/system.ts`: +40 lines (fetchStats action)
- `docs/IMPLEMENTATION_STATUS.md`: +20 lines

**Total New Code:** ~600 lines
**Total Updated Code:** ~60 lines
**Grand Total:** ~660 lines

### Technology Versions

- **Nuxt:** 3.14.0
- **Vue:** 3.x (auto-installed by Nuxt)
- **Vuetify:** 4.0.0
- **Pinia:** 2.1.7
- **TypeScript:** 5.3.3
- **Node:** 20.19.6 (from user's environment)

### Color Palette Reference

```typescript
// Already configured in plugins/vuetify.ts
colors: {
  primary: '#1e3a8a',      // Navy blue
  secondary: '#f59e0b',    // Amber gold
  success: '#10B981',      // Emerald green
  warning: '#F59E0B',      // Amber
  error: '#EF4444',        // Red
  info: '#1e3a8a',         // Navy blue (same as primary)
  background: '#F8FAFC',   // Very light gray
  surface: '#FFFFFF',      // White
}
```

### Vuetify Component Defaults

```typescript
// Already configured in plugins/vuetify.ts
defaults: {
  VBtn: {
    style: 'text-transform: none;',
    elevation: 0,
    rounded: 'lg'
  },
  VCard: {
    elevation: 1,
    rounded: 'lg'
  },
  VTextField: {
    variant: 'outlined',
    density: 'comfortable'
  },
  VDataTable: {
    density: 'comfortable'
  }
}
```
