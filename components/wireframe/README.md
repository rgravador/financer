# Wireframe Components

Reusable components extracted from wireframes for consistent UI across all role dashboards.

## WfStatCard

Dashboard statistics card with value, label, and optional trend indicator.

**Props:**
- `value` (string | number) - Main stat value to display
- `label` (string) - Stat label/description
- `trend` (string, optional) - Trend indicator text (e.g., "+12% this month")
- `trendPositive` (boolean, default: true) - Trend color (green if true, red if false)

**Usage:**
```vue
<WfStatCard
  :value="120"
  label="Total Tenants"
  trend="+12% this month"
  :trend-positive="true"
/>
```

**Features:**
- Hover effect with transform and shadow animation
- Large value display (32px, bold)
- Descriptive label (14px, gray)
- Optional trend with arrow icon (green/red based on trendPositive)
- 12px border radius matching wireframe design

---

## WfStatusBadge

Status indicator chip with color coding.

**Props:**
- `status` ('active' | 'pending' | 'suspended' | 'inactive') - Status to display

**Color Mapping:**
- `active` → Success (green)
- `pending` → Warning (amber)
- `suspended` → Error (red)
- `inactive` → Grey

**Usage:**
```vue
<WfStatusBadge status="active" />
<WfStatusBadge status="pending" />
<WfStatusBadge status="suspended" />
<WfStatusBadge status="inactive" />
```

**Features:**
- Uses Vuetify v-chip component
- Small size for compact display
- Flat variant for subtle appearance
- Capitalized text labels

---

## WfPageHeader

Page header with title, optional subtitle, and optional breadcrumbs.

**Props:**
- `title` (string) - Page title
- `subtitle` (string, optional) - Page subtitle/description
- `breadcrumbs` (Breadcrumb[], optional) - Breadcrumb navigation items

**Breadcrumb Interface:**
```typescript
interface Breadcrumb {
  title: string    // Display text
  to?: string      // Navigation path (optional)
  disabled?: boolean  // Whether breadcrumb is clickable
}
```

**Usage:**
```vue
<WfPageHeader
  title="System Dashboard"
  subtitle="Monitor system health and tenant activity"
  :breadcrumbs="[
    { title: 'System', disabled: true },
    { title: 'Dashboard', disabled: true }
  ]"
/>
```

**Features:**
- Large title (28px, bold, navy color)
- Descriptive subtitle (14px, gray)
- Optional Vuetify breadcrumbs with chevron dividers
- 32px bottom margin for consistent spacing
- Compact density for breadcrumbs

---

## Design Guidelines

All wireframe components follow these design principles:

1. **Navy Blue Accents** (`rgb(var(--v-theme-navy))`)
   - Used for primary text and emphasis
   - Matches wireframe color scheme exactly

2. **12px Border Radius**
   - Softer than Material Design default
   - Consistent across all cards and components

3. **Subtle Shadows**
   - Default: minimal shadow on cards
   - Hover: enhanced shadow for interactive feedback

4. **Typography Hierarchy**
   - Large values: 32px, bold
   - Titles: 28px, semi-bold
   - Labels: 14px, medium weight
   - Body text: 14px, regular

5. **Spacing**
   - Card padding: 24px
   - Page padding: 32px
   - Component gaps: 24px (grid), 12px (inline)

6. **Color Palette**
   - Primary: Navy #1e3a8a
   - Secondary: Gold #f59e0b
   - Success: #22c55e (green)
   - Warning: #f59e0b (amber)
   - Error: #ef4444 (red)

## Component Extraction Strategy

Components were extracted based on these criteria:

1. **Pattern Recognition** - Appears in multiple wireframes or will appear in future pages
2. **Visual Consistency** - Ensures identical appearance across role dashboards
3. **Reusability** - Can be used with different data without modification
4. **Maintainability** - Centralized styling and behavior updates

**Extracted Immediately:**
- WfStatCard (obvious pattern in all dashboard wireframes)
- WfStatusBadge (used in tables across all roles)
- WfPageHeader (standard page header pattern)

**Defer Extraction** (until 2-3 repetitions):
- Data tables (wait to see if all roles use same format)
- Form fields (may vary by role requirements)
- Action buttons (context-specific actions)

## Testing

Components are visually tested on:
- `/system/dashboard` - Live implementation showing all wireframe components in action

## Related Documentation

- `/docs/wireframes/` - Original HTML wireframes
- `/docs/plans/2026-03-03-feat-system-admin-ui-dashboard-plan.md` - Implementation plan
- `/docs/IMPLEMENTATION_STATUS.md` - Overall project status
