# Vuetify 3 Customization Guide - Ascendent

This document outlines how Vuetify 3 has been customized for the Ascendent lending platform and provides guidelines for maintaining design consistency.

## Overview

Ascendent uses Vuetify 3 as its component library with a heavily customized theme to achieve a modern, professional financial application aesthetic that moves away from the default Material Design appearance.

## Theme Colors

### Light Mode (ascendentLight)

#### Primary Palette
- **Primary**: `#2563EB` - Modern blue (used for primary actions, links, emphasis)
- **Secondary**: `#64748B` - Slate gray (used for secondary actions, muted elements)
- **Accent**: `#0EA5E9` - Sky blue (used for highlights, interactive elements)

#### Semantic Colors
- **Success**: `#10B981` - Emerald green (approvals, confirmations, positive states)
- **Warning**: `#F59E0B` - Amber (pending states, cautions, alerts)
- **Error**: `#EF4444` - Red (rejections, errors, destructive actions)
- **Info**: `#3B82F6` - Blue (informational messages, tips)

#### Surface Colors
- **Background**: `#F8FAFC` - Very light gray (page background)
- **Surface**: `#FFFFFF` - White (card backgrounds, elevated surfaces)
- **Surface Variant**: `#F1F5F9` - Light slate (alternative surfaces, hover states)

#### Text Colors
- **On Primary/Secondary/Success/Error**: `#FFFFFF` - White text
- **On Warning**: `#000000` - Black text (for contrast)
- **On Background/Surface**: `#1E293B` - Dark slate (primary text)

### Dark Mode (ascendentDark)

#### Primary Palette
- **Primary**: `#3B82F6` - Brighter blue
- **Secondary**: `#64748B` - Slate gray
- **Accent**: `#0EA5E9` - Sky blue

#### Semantic Colors
- Same as light mode for consistency

#### Surface Colors
- **Background**: `#0F172A` - Dark slate
- **Surface**: `#1E293B` - Slate
- **Surface Variant**: `#334155` - Medium slate
- **Text**: `#F1F5F9` - Light slate (primary text)

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Fallback**: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif

### Why Inter?
- Clean, modern, professional appearance
- Excellent readability at all sizes
- Popular in fintech and enterprise applications
- Strong support for numerals and tables

### Font Weights
- **Light (300)**: Subtle text, less important information
- **Regular (400)**: Body text, descriptions
- **Medium (500)**: Buttons, emphasis, card titles
- **Semi-Bold (600)**: Headings, table headers
- **Bold (700)**: Major headings, hero text

## Component Defaults

### Buttons (v-btn)
```typescript
{
  style: 'text-transform: none;', // No uppercase (unlike Material Design)
  rounded: 'lg',                  // 12px border radius
  elevation: 0,                   // Flat by default
}
```

**Usage Guidelines:**
- Use `color="primary"` for main actions
- Use `variant="outlined"` for secondary actions
- Use `variant="text"` for tertiary/destructive actions
- Avoid using more than one primary button per section

### Cards (v-card)
```typescript
{
  elevation: 1,     // Subtle shadow (not the Material's prominent elevation-2)
  rounded: 'lg',    // 12px border radius
}
```

**Shadow Details:**
- **Elevation 1**: `0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.06)`
- **Elevation 2**: `0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)`
- **Elevation 3**: `0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)`

Much more subtle than Material Design defaults!

### Form Inputs (v-text-field, v-select)
```typescript
{
  variant: 'outlined',      // Outlined style by default
  density: 'comfortable',   // Comfortable spacing (not compact or default)
}
```

**Usage Guidelines:**
- Always use `label` prop for accessibility
- Use `prepend-inner-icon` for context (e.g., `mdi-email` for email fields)
- Use `hint` for additional help text
- Use `persistent-hint` if the hint should always show

### Data Tables (v-data-table)
```typescript
{
  density: 'comfortable',   // Comfortable row spacing
}
```

**Custom Styling:**
- Hover effect: Light primary color background (4% opacity)
- Headers: Semi-bold (600), slate color
- Clean borders and spacing

## Design Principles

### 1. Subtle Over Prominent
- Reduce Material Design's heavy shadows and elevations
- Use subtle borders instead of strong shadows where possible
- Prefer flat surfaces with slight elevations for hierarchy

### 2. Professional Color Usage
- Primary blue for actions and emphasis (not overused)
- Gray/slate for secondary elements and text hierarchy
- Semantic colors (success, warning, error) only where appropriate
- Avoid color overload - let white space work

### 3. Clean Typography
- No uppercase text transformations on buttons (modern, approachable)
- Clear font weight hierarchy (400 → 500 → 600 → 700)
- Comfortable line heights for readability

### 4. Consistent Spacing
- Use Vuetify's spacing utilities (ma-*, pa-*, ga-*)
- Base unit: 8px (1 unit = 8px)
- Common spacing: 2 (16px), 3 (24px), 4 (32px), 6 (48px)

## Customization Workflow

### Modifying Theme Colors

Edit `/plugins/vuetify.ts`:

```typescript
theme: {
  themes: {
    ascendentLight: {
      colors: {
        primary: '#2563EB', // Change this
        // ...
      }
    }
  }
}
```

### Modifying SCSS Variables

Edit `/styles/vuetify/_variables.scss`:

```scss
$border-radius-root: 12px; // Change border radius globally
$spacer: 8px;              // Change spacing unit
```

### Modifying Component Styles

Edit `/styles/vuetify/_components.scss`:

```scss
.v-card {
  // Your custom card styles
}
```

## Dark Mode Implementation

### Automatic Detection
The app automatically loads the user's saved theme preference from `localStorage` on mount (see `app.vue`).

### Manual Toggle
Use the `useTheme()` composable:

```vue
<script setup>
const { isDark, toggleTheme } = useTheme()
</script>

<template>
  <v-btn @click="toggleTheme">
    <v-icon>{{ isDark ? 'mdi-white-balance-sunny' : 'mdi-weather-night' }}</v-icon>
  </v-btn>
</template>
```

### Programmatic Theme Setting
```typescript
const { setTheme } = useTheme()

setTheme('ascendentDark')  // Switch to dark
setTheme('ascendentLight') // Switch to light
```

## Accessibility

### Color Contrast
All color combinations meet **WCAG 2.1 AA** standards:
- Primary on white: 4.61:1 (AA+)
- Text on background: 12.18:1 (AAA)
- Warning text on warning background: 10.5:1 (AAA)

### Focus States
Vuetify handles focus states automatically. Ensure:
- All interactive elements are keyboard accessible
- Focus indicators are visible (default browser or Vuetify styles)

### Screen Readers
Use semantic HTML and ARIA labels where appropriate:
- `<v-btn aria-label="Close dialog">` for icon-only buttons
- `<v-text-field label="Email">` always has labels

## Do's and Don'ts

### ✅ Do
- Use the custom theme colors (`color="primary"` not `color="#2563EB"`)
- Follow the component defaults (let Vuetify handle styling)
- Use Vuetify's spacing utilities (`ma-4`, `pa-2`, `ga-3`)
- Test both light and dark modes
- Maintain consistent border radius (lg = 12px)

### ❌ Don't
- Don't use inline styles for colors (use theme variables)
- Don't override Vuetify classes without good reason
- Don't use uppercase text transformations
- Don't add heavy shadows (keep it subtle)
- Don't use more than 3 font weights per component
- Don't create custom components when Vuetify provides one

## Component Usage Examples

### Stat Card
```vue
<v-card>
  <v-card-text>
    <div class="d-flex align-center mb-2">
      <v-icon color="primary" size="large">mdi-file-document</v-icon>
      <span class="text-caption text-medium-emphasis ml-2">Applications</span>
    </div>
    <div class="text-h3 font-weight-bold text-primary">156</div>
    <div class="text-caption text-medium-emphasis mt-1">Total this month</div>
  </v-card-text>
</v-card>
```

### Status Badge
```vue
<v-chip
  :color="status === 'approved' ? 'success' : 'warning'"
  size="small"
  label
>
  {{ status }}
</v-chip>
```

### Form Section
```vue
<v-card>
  <v-card-title>Applicant Information</v-card-title>
  <v-card-text>
    <v-row>
      <v-col cols="12" md="6">
        <v-text-field
          label="First Name"
          prepend-inner-icon="mdi-account"
          required
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          label="Last Name"
          required
        />
      </v-col>
    </v-row>
  </v-card-text>
  <v-card-actions>
    <v-spacer />
    <v-btn variant="text">Cancel</v-btn>
    <v-btn color="primary">Save</v-btn>
  </v-card-actions>
</v-card>
```

## Further Customization

### Adding New Theme Colors
If you need additional semantic colors (e.g., `teal` for disbursed status):

1. Add to theme definition in `plugins/vuetify.ts`:
```typescript
colors: {
  // ...existing colors
  teal: '#14B8A6',
  'on-teal': '#FFFFFF',
}
```

2. Use in components:
```vue
<v-chip color="teal">Disbursed</v-chip>
```

### Creating Custom Component Variants
For frequently used patterns, create reusable components in `/components/shared/`:

```vue
<!-- /components/shared/StatCard.vue -->
<template>
  <v-card>
    <v-card-text>
      <div class="d-flex align-center mb-2">
        <v-icon :color="color" size="large">{{ icon }}</v-icon>
        <span class="text-caption text-medium-emphasis ml-2">{{ label }}</span>
      </div>
      <div class="text-h3 font-weight-bold" :class="`text-${color}`">{{ value }}</div>
      <div class="text-caption text-medium-emphasis mt-1">{{ subtitle }}</div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
defineProps<{
  icon: string
  label: string
  value: string | number
  subtitle: string
  color?: string
}>()
</script>
```

## Resources

- [Vuetify 3 Documentation](https://vuetifyjs.com/en/)
- [Material Design Icons](https://materialdesignicons.com/)
- [Inter Font](https://fonts.google.com/specimen/Inter)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Support

For questions or issues with Vuetify customization:
1. Check Vuetify documentation
2. Review this guide
3. Check `/plugins/vuetify.ts` for theme configuration
4. Check `/styles/vuetify/` for SCSS overrides

---

**Last Updated:** March 2, 2026
**Version:** 1.0
**Maintainer:** Ascendent Development Team
