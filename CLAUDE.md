# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Financer is a multi-tenant loan management system built with Next.js 15, Supabase, and tRPC. It supports role-based access control with different user types managing accounts, loans, payments, and earnings across multiple tenant organizations.

## Essential Commands

```bash
# Development
npm run dev              # Start Next.js dev server with Turbopack
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint with auto-fix

# Type checking
npx tsc --noEmit --skipLibCheck  # Check TypeScript types without emitting files
```

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only, bypasses RLS)

**CRITICAL**: The service role key must NEVER be exposed to the client. Only use it in server-side code via `lib/supabase/admin.ts`.

## Architecture

### Multi-Tenant Role-Based System

**User Roles** (defined in `server/db/database.ts`):
- `admin` - Platform administrator (manages all tenants)
- `tenant_admin` - Tenant organization administrator
- `tenant_officer` - Loan officer (creates accounts and loans)
- `tenant_approver` - Approves/rejects loans
- `tenant_legal` - Legal compliance officer

**tRPC Procedures** (defined in `server/trpc.ts`):
- `publicProcedure` - No authentication required
- `protectedProcedure` - Requires authentication
- `authenticatedProcedure` - Requires active user profile
- `adminProcedure` - Admin only
- `tenantAdminProcedure` - Admin or tenant_admin
- `tenantOfficerProcedure` - Admin, tenant_admin, or tenant_officer
- `tenantApproverProcedure` - Admin, tenant_admin, or tenant_approver
- `tenantLegalProcedure` - Admin, tenant_admin, or tenant_legal

### Database & RLS Policies

**Critical Pattern**: To prevent infinite recursion in Row Level Security (RLS) policies, use SECURITY DEFINER helper functions:

```sql
-- Helper functions bypass RLS (see supabase/migrations/04_fix_infinite_recursion.sql)
is_admin()                -- Checks if current user is admin
get_user_tenant_id()      -- Returns current user's tenant_id

-- NEVER query users_profile directly in RLS policies, use helpers instead:
CREATE POLICY "Example policy" ON table_name FOR SELECT
  USING (is_admin() OR get_user_tenant_id() = tenant_id);
```

**Migration Files**:
- `00_initial_schema.sql` - Full database schema with tables, types, RLS policies
- `04_fix_infinite_recursion.sql` - SECURITY DEFINER helper functions for RLS
- `06_add_tenant_id_to_loans.sql` - Adds tenant_id field to loans table for proper tenant isolation

### tRPC Client Usage

**Client Components**:
```typescript
'use client'
import { trpc } from '@/lib/trpc/Provider'

export default function Component() {
  const { data } = trpc.accounts.list.useQuery({ limit: 20 })
  const mutation = trpc.accounts.create.useMutation()
  // ...
}
```

**Server Components**:
```typescript
import { trpc } from '@/lib/trpc/client'

export default async function ServerComponent() {
  const data = await trpc.accounts.list.query({ limit: 20 })
  // ...
}
```

### Supabase Client Variants

- `lib/supabase/client.ts` - Browser/client component usage
- `lib/supabase/server.ts` - Server component usage
- `lib/supabase/admin.ts` - Admin operations with service role key (bypasses RLS)

**Use admin client ONLY for**:
- Creating auth users via `supabase.auth.admin.createUser()`
- Operations that legitimately need to bypass RLS
- Server-side administrative tasks

### Next.js 15 Dynamic Routes

**Important**: Next.js 15 changed `params` to be asynchronous in dynamic routes:

```typescript
// Correct pattern
import { use } from 'react'

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)  // Use React.use() to unwrap Promise
  // ...
}
```

### Layout Structure

The app has two distinct layouts that render based on user role:

1. **Admin Layout** (`app/admin/layout.tsx`):
   - For users with `role === 'admin'`
   - Navigation: Dashboard, Tenants, Users, Settings

2. **Tenant Layout** (applied to root routes):
   - For tenant users (tenant_admin, tenant_officer, etc.)
   - Navigation: Dashboard, Accounts, Loans, Payments, Earnings, Users
   - Tenant-scoped data access

**Layout Selection Logic** (`components/sidenav.tsx`):
- Fetches `userProfile` on mount to determine role
- Shows loading state until profile loads (prevents race conditions)
- Conditionally renders admin or tenant navigation

### HeroUI Component Type Issues

**Known Issue**: HeroUI Select component has TypeScript type definition issues when using the `items` prop pattern. Suppress with:

```typescript
import type { Selection } from '@react-types/shared'

// Define items array
const items = [
  { key: 'value1', label: 'Label 1' },
  { key: 'value2', label: 'Label 2' },
] as const

// Use with @ts-ignore suppression
{/* @ts-ignore - HeroUI Select type definition issue */}
<Select
  selectedKeys={selected ? [selected] : []}
  onSelectionChange={(keys: Selection) => setSelected(Array.from(keys)[0] as string)}
  items={items}
>
  {(item: typeof items[number]) => <SelectItem key={item.key}>{item.label}</SelectItem>}
</Select>
```

## Key Application Domains

### Accounts Management
- Full KYC (Know Your Customer) data collection
- Fields: Basic info, personal info, employment, financial details
- Routes: `/accounts` (list), `/accounts/new` (create), `/accounts/[id]` (view)
- Router: `server/routers/accounts.ts`

### Loans Management
- Loan applications with amortization schedules
- Approval workflow (tenant_officer creates, tenant_approver approves)
- Status tracking: pending_approval, approved, active, closed, rejected
- Router: `server/routers/loans.ts`

### Payments & Earnings
- Payment tracking with types: regular, penalty, partial
- Commission-based earnings for loan officers
- Cashout request system
- Routers: `server/routers/payments.ts`, `server/routers/earnings.ts`

### Tenant Management (Admin Only)
- Create and manage tenant organizations
- Create users within tenants using admin client
- Router: `server/routers/tenants.ts`

## Database Schema Highlights

**Core Tables**:
- `users_profile` - User profiles with role and tenant_id
- `tenants` - Tenant organizations
- `accounts` - Customer accounts with full KYC fields
- `loans` - Loan records with amortization_schedule JSONB
- `payments` - Payment tracking
- `earnings` - Agent commission tracking
- `transactions` - Audit log of all operations

**Key Patterns**:
- All tables use UUID primary keys (`gen_random_uuid()`)
- Timestamps: `created_at`, `updated_at` (automatic via triggers)
- Soft deletes via status fields (no hard deletes)
- RLS policies enforce tenant isolation
- Generated columns for backward compatibility (e.g., `contact_number`)

## Creating New tRPC Routes

1. Create router file in `server/routers/[domain].ts`
2. Export router using appropriate procedures:
   ```typescript
   import { router, tenantOfficerProcedure } from '../trpc'
   import { z } from 'zod'

   export const myRouter = router({
     list: tenantOfficerProcedure
       .input(z.object({ limit: z.number() }))
       .query(async ({ ctx, input }) => {
         // ctx.supabase - Supabase client
         // ctx.user - Authenticated user
         // ctx.userProfile - User profile with role
         return data
       }),
   })
   ```
3. Add to `server/routers/_app.ts`:
   ```typescript
   import { myRouter } from './my-router'

   export const appRouter = router({
     // ...existing
     myDomain: myRouter,
   })
   ```

## Common Patterns

### Admin User Creation
```typescript
import { createAdminClient } from '@/lib/supabase/admin'

const adminClient = createAdminClient()
const { data, error } = await adminClient.auth.admin.createUser({
  email: input.email,
  password: input.password,
  email_confirm: true,
  user_metadata: { full_name: input.full_name, role: input.role }
})
```

### Tenant Data Isolation in Queries
```typescript
// Tenant officers see only their tenant's data
if (ctx.userProfile.role === 'tenant_officer') {
  query = query.eq('tenant_id', ctx.userProfile.tenant_id)
}
```

### Transaction Logging
```typescript
await ctx.supabase.from('transactions').insert({
  type: 'create_account',
  user_id: ctx.userProfile.id,
  account_id: data.id,
  details: { account_name: data.name },
})
```

## Important Notes

- **Infinite Recursion**: Never query `users_profile` directly in RLS policies. Use `is_admin()` or `get_user_tenant_id()` helpers.
- **Race Conditions**: When checking user roles in components, always wait for profile to load before rendering role-specific UI.
- **Service Role Key**: Only use in `lib/supabase/admin.ts` for legitimate admin operations. Never expose to client.
- **Params in Next.js 15**: Always use `React.use()` to unwrap async params in dynamic routes.
- **HeroUI Select**: Use `items` prop pattern with `@ts-ignore` for type compatibility.
- Add to memory, always outside-top label placement for Input if there is label
- Add to memory, always outside-top label placement for Select if there is label
- Add to memory, use size lg as default for all Input, Select
- Add to memory, in all money related symbol/icon use philippines peso sign not dollar
- Add to memory, always use router.replace instead of router.push
- Add to memory, for tRPC mutations that redirect after success, use optimistic updates with `utils.[router].[procedure].setData()` to update cache before redirect to prevent infinite loading with `refetchOnMount: true`