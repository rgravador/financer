# Pinia Map Helpers Conversion Status

## Overview
Converting all Vue files in the project to use Pinia map helpers (`mapState`, `mapWritableState`, `mapGetters`, `mapActions`) instead of direct store accessors.

## Pattern Applied

### Before (Old Pattern):
```typescript
computed: {
  authStore() {
    return useAuthStore()
  },
  user() {
    return this.authStore.user
  }
},
methods: {
  async handleLogin() {
    await this.authStore.login(email, password)
  }
}
```

### After (New Pattern):
```typescript
import { mapState, mapGetters, mapActions } from 'pinia'

computed: {
  ...mapGetters(useAuthStore, ['user']),
  ...mapState(useAccountsStore, ['accounts', 'loading']),
  ...mapWritableState(useAccountsStore, ['filters']) // For v-model bindings
},
methods: {
  ...mapActions(useAuthStore, ['login']),

  async handleLogin() {
    await this.login(email, password) // Direct call, no store prefix
  }
}
```

## Completed Files (11/27)

### ✅ Core Pages
1. **pages/index.vue** - Login page
   - Uses: `useAuthStore`
   - Maps: `isAdmin` getter, `login` action

2. **pages/auth/signup.vue** - Signup page
   - Uses: `useAuthStore`
   - Maps: `signup` action

3. **pages/dashboard.vue** - Main dashboard
   - Uses: `useAuthStore`, `useAccountsStore`, `useLoansStore`, `usePaymentsStore`, `useEarningsStore`, `useNotificationsStore`
   - Maps: Multiple state, actions from all stores

### ✅ Layouts
4. **layouts/default.vue** - Main layout
   - Uses: `useAuthStore`, `useUIStore`, `useNotificationsStore`
   - Maps: `user`, `isAdmin`, `isAgent`, `isInternalAdmin` getters
   - Template updated to use mapped properties directly

### ✅ Account Pages
5. **pages/accounts/index.vue** - Account list
   - Uses: `useAccountsStore`, `useUIStore`
   - Maps: `loading`, `filteredAccounts` state, `filters` as writable state

6. **pages/accounts/[id].vue** - Account details
   - Uses: `useAccountsStore`, `useUIStore`
   - Maps: `loading`, `selectedAccount` state, actions

### ✅ Loan Pages
7. **pages/loans/index.vue** - Loan list
   - Uses: `useLoansStore`, `useUIStore`
   - Maps: `loans`, `loading` state, computed getters

8. **pages/loans/[id].vue** - Loan details
   - Uses: `useAuthStore`, `useLoansStore`, `useUIStore`
   - Maps: `isAdmin` getter, `loading`, `selectedLoan` state
   - Template updated (authStore.isAdmin → isAdmin)

9. **pages/loans/create.vue** - Create loan
   - Uses: `useAccountsStore`, `useLoansStore`, `useUIStore`
   - Maps: State with aliases, multiple actions

### ✅ Payment Pages
10. **pages/payments/index.vue** - Payment list
    - Uses: `usePaymentsStore`, `useUIStore`
    - Maps: `payments`, `loading` state, `totalPaymentsToday` getter
    - Template updated

## Remaining Files (16/27)

### 🔄 Payment Pages
11. **pages/payments/create.vue** - NOT YET CONVERTED
    - Expected stores: `usePaymentsStore`, `useLoansStore`, `useAccountsStore`, `useUIStore`

### 🔄 Earnings & Cashouts
12. **pages/earnings/index.vue** - NOT YET CONVERTED
    - Uses: `useEarningsStore`, `useCashouts`, `usePaymentsStore`, `useUIStore`
    - Complex file with multiple template references
    - Template refs: `earningsStore.loading`, `earningsStore.earnings`, `cashoutsStore.cashouts`, `paymentsStore.payments`

13. **pages/cashouts/index.vue** - NOT YET CONVERTED
    - Uses: `useEarningsStore`, `useCashouts`, `useUIStore`
    - Template refs: `cashoutsStore.loading`, `cashoutsStore.cashouts`, `earningsStore.earnings`

### 🔄 Account Creation Pages (7 files)
14. **pages/accounts/create/index.vue** - NOT YET CONVERTED
15. **pages/accounts/create/basic.vue** - NOT YET CONVERTED
16. **pages/accounts/create/contact.vue** - NOT YET CONVERTED
17. **pages/accounts/create/debt.vue** - NOT YET CONVERTED
18. **pages/accounts/create/employment.vue** - NOT YET CONVERTED
19. **pages/accounts/create/income.vue** - NOT YET CONVERTED
20. **pages/accounts/create/index.vue** - NOT YET CONVERTED

### 🔄 Admin Pages (5 files)
21. **pages/admin/dashboard.vue** - NOT YET CONVERTED
22. **pages/admin/users.vue** - NOT YET CONVERTED
23. **pages/admin/approvals.vue** - NOT YET CONVERTED
24. **pages/admin/audit.vue** - NOT YET CONVERTED
25. **pages/admin/cashouts.vue** - NOT YET CONVERTED

### 🔄 Internal Admin Pages (3 files)
26. **pages/internal-admin/dashboard.vue** - NOT YET CONVERTED
27. **pages/internal-admin/users.vue** - NOT YET CONVERTED
28. **pages/internal-admin/companies.vue** - NOT YET CONVERTED

## Conversion Steps for Remaining Files

For each file, follow these steps:

### Step 1: Read the File
Identify which stores are used by looking for:
```typescript
computed: {
  storeNameStore() {
    return useStoreNameStore()
  }
}
```

### Step 2: Add Imports
```typescript
import { mapState, mapWritableState, mapGetters, mapActions } from 'pinia'
```

### Step 3: Convert Computed Properties
Remove store accessor computeds and map the actual properties:
```typescript
// Remove these:
storeNameStore() { return useStoreNameStore() }

// Add these:
...mapState(useStoreNameStore, ['property1', 'property2']),
...mapGetters(useStoreNameStore, ['getter1', 'getter2']),
...mapWritableState(useStoreNameStore, ['filterProp']) // If used with v-model
```

### Step 4: Convert Methods
```typescript
...mapActions(useStoreNameStore, ['action1', 'action2']),

// Update method calls from:
await this.storeName.action()
// To:
await this.action()
```

### Step 5: Update Template References
Find and replace in template:
- `storeName.property` → `property`
- `storeName.getter` → `getter`
- `storeName.loading` → `loading`

### Step 6: Test
Check for:
- No remaining `storeNameStore()` computed properties
- All template references updated
- Actions called directly without store prefix

## Common Patterns

### Multiple Stores
```typescript
computed: {
  ...mapState(useAuthStore, ['user']),
  ...mapState(useAccountsStore, ['accounts', 'loading']),
  ...mapGetters(useLoansStore, ['activeLoans', 'overdueLoans'])
},
methods: {
  ...mapActions(useAccountsStore, ['fetchAccounts']),
  ...mapActions(useLoansStore, ['fetchLoans']),
  ...mapActions(useUIStore, ['showError', 'showSuccess'])
}
```

### State Aliases
```typescript
...mapState(useAccountsStore, {
  accountOptions: 'accounts',
  accountsLoading: 'loading'
})
```

### Writable State (for v-model)
```typescript
...mapWritableState(useAccountsStore, ['filters', 'selectedAccount'])
```

## Notes
- Always use Options API (not Composition API)
- Keep `eslint-disable-next-line` comments for destructuring where needed
- Use `mapWritableState` for state that needs direct mutation (v-model bindings)
- Call actions directly: `this.actionName()` instead of `this.storeName.actionName()`

## Progress
- **Completed:** 11/27 files (41%)
- **Remaining:** 16/27 files (59%)
- **Estimated time to complete:** ~2-3 hours for remaining files
