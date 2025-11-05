# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LoanStar is a lending management web application built with Nuxt 3, TypeScript, Vuetify 3, and Supabase. The application supports multi-role access (Admin/Agent) for managing borrower accounts, loans, payments, earnings, and cashout requests.

**Key Stack:**
- **Framework**: Nuxt 3 (Vue 3 + TypeScript)
- **UI Library**: Vuetify 3 (Material Design)
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **State Management**: Composables pattern (NOT Pinia - migrated away)
- **Dev Server**: Port 3001

## Development Commands

```bash
# Development
npm run dev              # Start dev server on port 3001

# Build & Preview
npm run build            # Production build
npm run generate         # Static site generation
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript type checking
```

## Architecture Patterns

### 1. Composables-First Architecture (IMPORTANT)

The codebase **removed Pinia** and uses Vue 3 composables exclusively for state management. All composables follow a specific destructuring pattern.

**Composable Pattern:**
```typescript
// composables/useAccounts.ts
export const useAccounts = () => {
  const accounts = ref<Account[]>([])
  const loading = ref(false)
  const filters = ref({ search: '', status: null })

  const filteredAccounts = computed(() => {
    // Filter logic
  })

  return {
    // State
    accounts,
    loading,
    filters,
    filteredAccounts,
    // Actions
    fetchAccounts,
    createAccount,
    setFilters
  }
}
```

**Usage in Pages (CRITICAL PATTERN):**
```typescript
// ✅ CORRECT - Always destructure from composable
const accountsStore = useAccounts()
const { loading, filteredAccounts, filters } = accountsStore

// Vetur workaround - prevents "unused variable" linter warnings
void loading
void filteredAccounts
void filters
```

**DO NOT:**
- Use `accountsStore.loading` in templates - destructure instead
- Use Pinia stores - they were removed
- Access composable properties without destructuring

### 2. Authentication & User Profile

Authentication uses Supabase Auth with a custom profile system:

**Key Composables:**
- `useAuth()` - Returns user profile from `users_profile` table, NOT Supabase auth user
- `useSupabaseUser()` - Nuxt Supabase module (auth user only)

**User Profile Storage:**
- Profile data is stored in **localStorage** as `user_profile`
- Auto-syncs with Supabase auth state changes
- Cleared on logout

**Auth State Handling:**
```typescript
const { user } = useAuth()  // Returns UserProfileWithMeta | null
// user contains: id, email, role, full_name, avatar_url, display_name
```

### 3. Data Flow Pattern

**Composable → Page → Template**

```typescript
// 1. Composable provides reactive state
const useAccounts = () => {
  const accounts = ref([])
  const filteredAccounts = computed(() => /* ... */)
  return { accounts, filteredAccounts }
}

// 2. Page destructures what it needs
const { accounts, filteredAccounts } = useAccounts()

// 3. Template uses destructured values directly
<v-data-table :items="filteredAccounts" />
```

### 4. Type System

**Database Types** (`types/database.ts`):
- Mirrors Supabase schema exactly
- Uses strict TypeScript interfaces
- Includes optional relations (e.g., `Account.loans?: Loan[]`)

**Key Types:**
- `UserRole`: 'admin' | 'agent'
- `AccountStatus`: 'active' | 'inactive' | 'suspended'
- `LoanStatus`: 'pending_approval' | 'approved' | 'active' | 'closed' | 'rejected'
- `PaymentFrequency`: 'bi-monthly' | 'monthly' | 'weekly'

**Extending Types:**
When a property is missing, add it to the interface:
```typescript
export interface Account {
  // ... existing fields
  loans?: Loan[]  // Optional relation
}
```

## Business Logic

### Amortization Calculation
**Composable**: `useAmortization()`
- EMI Formula: `EMI = P * r * (1+r)^n / ((1+r)^n - 1)`
- Supports: bi-monthly (15 days), monthly, weekly (7 days)
- Generates complete schedule with due dates, principal, interest

### Penalty Calculation
**Composable**: `usePenalties()`
- Rate: 3% per month, calculated daily
- Formula: `(Due amount * 3%) / 30 per day`
- Accumulates from due date until payment

### Commission Calculation
**Composable**: `useCommissions()`
- Earned on **interest portion only**
- Percentage set by admin per agent
- Tracked in `earnings` table

### Payment Priority
1. Penalties (oldest first)
2. Interest
3. Principal

## Supabase Integration

### Row Level Security (RLS)
- **Enabled on all tables**
- Agents: Can only access their assigned accounts/loans
- Admins: Full access to all data

### Real-time Subscriptions
Implemented in composables:
```typescript
supabase.auth.onAuthStateChange((event, session) => {
  // Handle SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, USER_UPDATED
})
```

### File Upload Pattern
```typescript
// Upload to storage
const { error } = await supabase.storage
  .from('documents')
  .upload(filePath, file)

// Get public URL
const { data } = supabase.storage
  .from('documents')
  .getPublicUrl(filePath)
```

## UI/UX Patterns

### Responsive Design
- Desktop: Data tables with filters in card headers
- Mobile: Card-based layouts with bottom navigation
- Use Vuetify's responsive utilities: `hide-on-mobile`, `hide-on-desktop`

**Media Query Breakpoint:**
```scss
@media (min-width: 960px) { /* Desktop */ }
@media (max-width: 959px) { /* Mobile */ }
```

### Data Table Pattern
```vue
<v-card>
  <v-card-title class="d-flex align-center pa-4">
    <span class="text-h6 mr-4">Title</span>
    <v-spacer />
    <v-select v-model="statusFilter" />
    <v-text-field v-model="searchFilter" />
  </v-card-title>
  <v-divider />
  <v-data-table
    :headers="headers"
    :items="items"
    :search="searchFilter"
  />
</v-card>
```

### Notification System
**Composable**: `useNotifications()`
- Real-time updates via Supabase subscriptions
- Unread count badge in app bar
- Types: `past_due`, `upcoming_due`, `loan_approval`, etc.

## Common Gotchas

### 1. Readonly Refs
**DON'T** use `readonly()` wrapper on composable state - it breaks reactivity:
```typescript
// ❌ BAD
return { loading: readonly(loading) }

// ✅ GOOD
return { loading }
```

### 2. Filters Pattern
Always provide a `setFilters()` function in composables:
```typescript
const setFilters = (newFilters: Partial<FiltersType>) => {
  if (newFilters.search !== undefined) {
    filters.value.search = newFilters.search
  }
  // ... handle other filters
}
```

### 3. Computed Properties in Composables
Export computed properties for filtered/derived data:
```typescript
const filteredAccounts = computed(() =>
  accounts.value.filter(/* ... */)
)

return { accounts, filteredAccounts }
```

### 4. Vetur Linter Warnings
Destructured variables used only in templates trigger "unused" warnings:
```typescript
const { loading, items } = useStore()

// Workaround
void loading
void items
```

## File Organization

```
/composables/          # All state management (replaced Pinia stores)
  useAuth.ts          # Auth + user profile + localStorage
  useAccounts.ts      # Account CRUD + filters
  useLoans.ts         # Loan CRUD + computed (pending, active, overdue)
  usePayments.ts      # Payment CRUD
  useEarnings.ts      # Agent earnings
  useNotifications.ts # Notifications + realtime
  useUI.ts            # Global UI state (snackbar, sidebar)

/types/
  database.ts         # Supabase schema types
  index.ts            # Form types + helper types
  supabase.ts         # Supabase client types

/layouts/
  default.vue         # Main app layout (nav, app bar, bottom nav)
  home.vue            # Simple layout
  auth.vue            # Auth pages layout

/pages/
  accounts/           # Account management
  loans/              # Loan management
  payments/           # Payment recording
  earnings/           # Agent earnings
  cashouts/           # Cashout requests
  admin/              # Admin-only pages
  auth/               # Login/signup

/utils/
  formatters.ts       # Date, currency, time formatters
  constants.ts        # App constants (colors, icons)
```

## Environment Variables

Required in `.env`:
```
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
```

## Key Migration Notes

1. **Pinia Removed**: All stores migrated to composables
2. **Auth User vs Profile**: `useSupabaseUser()` returns auth user, `useAuth()` returns profile from database
3. **localStorage**: User profile cached for performance, synced with auth events
4. **No tRPC**: Direct Supabase client usage throughout

## Testing Considerations

- Business logic (amortization, penalties, commissions) is in pure composables - easily testable
- Mock Supabase client for unit tests
- Use Nuxt's `@nuxt/test-utils` for integration tests

## Performance Notes

- User profile stored in localStorage reduces database calls
- Computed properties cache filtered/derived data
- Real-time subscriptions only for notifications (not all tables)
- Pagination recommended for large datasets (already implemented in data tables)
- Add to memory, always add eslint disable next line to composable desctruct
- Add to memory, always use vuex instead of composables