# Nuxt to Next.js Migration Guide

## Overview

This document outlines the complete migration from Nuxt 3 to Next.js 15 with TypeScript, tRPC, and HeroUI.

## ✅ Completed

### 1. Project Setup
- ✅ Next.js 15 with TypeScript
- ✅ HeroUI (React UI library, successor to NextUI)
- ✅ Tailwind CSS configuration
- ✅ tRPC v11 setup (server & client)
- ✅ Supabase SSR integration

### 2. Core Infrastructure
- ✅ tRPC routers created:
  - `auth` - Authentication (login, signup, logout, session)
  - `accounts` - Account CRUD operations
  - `loans` - Loan management
  - `payments` - Payment recording
  - `earnings` - Agent earnings
  - `cashouts` - Cashout requests
- ✅ Supabase client configuration (browser, server, middleware)
- ✅ Middleware for authentication and route protection
- ✅ Database types migrated from Nuxt

### 3. Pages Migrated
- ✅ `/` - Login page
- ✅ `/dashboard` - Dashboard with stats
- ✅ `/accounts` - Accounts list
- ✅ `/accounts/create` - Create account
- ✅ `/accounts/[id]` - Account detail
- ✅ `/loans` - Loans list
- ✅ `/loans/create` - Create loan

### 4. Utilities & Helpers
- ✅ Formatters (currency, dates, percentages)
- ✅ Constants (business rules, colors, frequencies)
- ✅ Auth hook (`useAuth`)

## 🚧 Remaining Work

### High Priority

1. **Complete Page Migrations**
   - `/loans/[id]` - Loan detail page
   - `/payments` - Payments list
   - `/payments/create` - Record payment
   - `/earnings` - Earnings dashboard (agent only)
   - `/cashouts` - Cashout requests (agent only)
   - `/admin` - Admin dashboard
   - `/admin/approvals` - Loan approvals
   - `/admin/cashouts` - Cashout approvals
   - `/admin/users` - User management

2. **Authentication Pages**
   - `/auth/signup` - Signup page

3. **Business Logic**
   - Amortization calculation hook
   - Penalty calculation hook
   - Commission calculation logic

4. **Components**
   - Create reusable table components
   - Create form components
   - Create stat card components

### Medium Priority

5. **Real-time Features**
   - Notifications system (Supabase Realtime)
   - Notification bell component
   - Real-time updates for payments

6. **File Uploads**
   - Improve file upload UX
   - Add progress indicators
   - Add file preview

7. **Admin Features**
   - User management page
   - Commission percentage updates
   - Audit log viewer

### Low Priority

8. **Enhancements**
   - Loading skeletons
   - Error boundaries
   - Toast notifications
   - Form validation with Zod
   - Responsive mobile navigation

## Architecture Differences

### Nuxt 3 → Next.js 15

| Feature | Nuxt 3 | Next.js 15 |
|---------|--------|------------|
| **Routing** | `pages/` directory | `src/app/` directory |
| **Data Fetching** | `useAsyncData`, composables | tRPC hooks, React Query |
| **State Management** | Composables (refs, computed) | React hooks (useState, useMemo) |
| **Server** | Nitro server | Next.js API routes |
| **Auth** | `useSupabaseUser()` | Supabase SSR + tRPC context |
| **Middleware** | `middleware/` files | `middleware.ts` file |
| **Layouts** | `layouts/` directory | `layout.tsx` per route |

### Composables → Hooks

```typescript
// Nuxt Composable
export const useAccounts = () => {
  const accounts = ref<Account[]>([])
  const loading = ref(false)

  const fetchAccounts = async () => { ... }

  return { accounts, loading, fetchAccounts }
}

// Next.js with tRPC
export function useAccounts() {
  const { data: accounts, isLoading } = trpc.accounts.getAll.useQuery()
  const createMutation = trpc.accounts.create.useMutation()

  return { accounts, isLoading, create: createMutation.mutateAsync }
}
```

### Vue Components → React Components

```vue
<!-- Nuxt/Vue -->
<template>
  <v-card>
    <v-card-title>{{ title }}</v-card-title>
    <v-card-text>{{ content }}</v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const title = ref('Title')
</script>
```

```tsx
// Next.js/React
export function MyCard({ title, content }: Props) {
  return (
    <Card>
      <CardHeader>{title}</CardHeader>
      <CardBody>{content}</CardBody>
    </Card>
  )
}
```

## Key Patterns

### 1. tRPC Queries

```typescript
// Fetch data
const { data, isLoading, error } = trpc.accounts.getAll.useQuery()

// Mutation
const mutation = trpc.accounts.create.useMutation({
  onSuccess: () => {
    // Invalidate cache
    utils.accounts.getAll.invalidate()
  }
})

await mutation.mutateAsync(data)
```

### 2. Authentication Check

```typescript
const { user, isAuthenticated, isAdmin } = useAuth()

if (!isAuthenticated) {
  // Redirect handled by middleware
}
```

### 3. File Upload

```typescript
const supabase = createClient()

const { error } = await supabase.storage
  .from('documents')
  .upload(filePath, file)

const { data } = supabase.storage
  .from('documents')
  .getPublicUrl(filePath)
```

## Environment Setup

1. Copy `.env.local` and fill in values:
```bash
cp .env.local .env.local
```

2. Get Supabase credentials from your Supabase project dashboard

## Running the Application

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Visit http://localhost:3001
```

## Database Schema

The application expects the following Supabase tables:
- `users_profile`
- `accounts`
- `loans`
- `payments`
- `earnings`
- `cashout_requests`
- `notifications`
- `transactions`
- `penalties`

Ensure RLS policies are configured correctly for each role (admin/agent).

## Testing Checklist

- [ ] Login/Logout flow
- [ ] Create account
- [ ] View account details
- [ ] Create loan
- [ ] Record payment
- [ ] Agent earnings display
- [ ] Cashout request
- [ ] Admin loan approval
- [ ] Admin cashout approval
- [ ] File uploads
- [ ] Real-time notifications
- [ ] Mobile responsive

## Migration Notes

### Breaking Changes
1. **No more `ref()` and `computed()`** - Use `useState()` and `useMemo()`
2. **No more `watch()`** - Use `useEffect()` with dependencies
3. **No more `navigateTo()`** - Use `router.push()` from `next/navigation`
4. **Server calls are now tRPC procedures** - No direct Supabase calls from components

### Benefits
1. **Type safety end-to-end** - tRPC provides full type inference
2. **Better performance** - React Server Components, streaming
3. **Better DX** - Hot reload, error overlay, TypeScript integration
4. **Standard React ecosystem** - Access to all React libraries

### Gotchas
1. **"use client" directive** - Required for components using hooks
2. **Async params** - Route params are now promises in Next.js 15
3. **Storage API** - File uploads still use Supabase client-side
4. **Middleware** - Runs on every request, keep it lightweight

## Next Steps

1. Complete remaining page migrations (see Remaining Work)
2. Add business logic hooks (amortization, penalties)
3. Implement notifications system
4. Add admin pages
5. Add error handling and loading states
6. Write tests
7. Deploy to Vercel

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [tRPC Docs](https://trpc.io/docs)
- [HeroUI Docs](https://heroui.com/)
- [Supabase SSR Guide](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [React Query Docs](https://tanstack.com/query/latest)

## Support

If you encounter issues:
1. Check the browser console for errors
2. Check the terminal for server errors
3. Verify environment variables are set
4. Ensure Supabase RLS policies are correct
5. Check tRPC DevTools (React Query DevTools)
