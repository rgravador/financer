# Financer TRPC API Documentation

This document provides an overview of all the TRPC routes created for the Financer application with role-based access control.

## Role-Based Access Control

The system implements the following roles with hierarchical permissions:

- **admin**: Full access to all resources
- **tenant_admin**: Administrative access to tenant-level resources
- **tenant_officer**: Can manage accounts, loans, and payments assigned to them
- **tenant_approver**: Can approve/reject loans and cashout requests
- **tenant_legal**: Legal department access (can be extended as needed)

### Available Procedures

- `publicProcedure`: No authentication required
- `protectedProcedure`: Requires authentication
- `authenticatedProcedure`: Requires authentication + active user profile
- `adminProcedure`: Admin only
- `tenantAdminProcedure`: Admin + Tenant Admin
- `tenantOfficerProcedure`: Admin + Tenant Admin + Tenant Officer
- `tenantApproverProcedure`: Admin + Tenant Admin + Tenant Approver
- `tenantLegalProcedure`: Admin + Tenant Admin + Tenant Legal

## API Routes Overview

### 1. Users Router (`server/routers/users.ts`)

**Endpoints:**
- `getCurrentProfile` - Get current user's profile (authenticated users)
- `getById` - Get user by ID (tenant admin+)
- `list` - List all users with filters (tenant admin+)
- `update` - Update user profile (own profile or admin)
- `updateRole` - Update user role (admin only)
- `updateStatus` - Activate/deactivate user (admin only)

### 2. Accounts Router (`server/routers/accounts.ts`)

**Endpoints:**
- `getById` - Get account by ID (with access control)
- `list` - List accounts with filters
- `create` - Create new account (tenant officer+)
- `update` - Update account (tenant officer+)
- `updateStatus` - Change account status (tenant admin+)
- `reassignAgent` - Reassign account to another agent (tenant admin+)

**Access Control:**
- Tenant officers can only access accounts assigned to them
- Admins can access all accounts

### 3. Loans Router (`server/routers/loans.ts`)

**Endpoints:**
- `getById` - Get loan by ID with related data
- `list` - List loans with filters
- `create` - Create new loan (tenant officer+)
- `approve` - Approve pending loan (tenant approver+)
- `reject` - Reject pending loan (tenant approver+)

**Features:**
- Automatic amortization schedule generation
- Support for multiple payment frequencies (weekly, bi-monthly, monthly)
- Transaction logging
- Notification creation

### 4. Payments Router (`server/routers/payments.ts`)

**Endpoints:**
- `getById` - Get payment by ID
- `list` - List payments with filters
- `create` - Record new payment (tenant officer+)
- `cancel` - Cancel payment (tenant officer+)

**Features:**
- Automatic payment distribution (penalties → interest → principal)
- Commission calculation (10% default)
- Earnings update
- Loan balance update
- Transaction and notification logging

### 5. Earnings Router (`server/routers/earnings.ts`)

**Endpoints:**
- `getMy` - Get current user's earnings
- `getByAgentId` - Get earnings by agent ID (tenant admin+)
- `list` - List all earnings (tenant admin+)
- `updateCommission` - Update commission percentage (tenant admin+)

### 6. Cashout Router (`server/routers/earnings.ts`)

**Endpoints:**
- `getById` - Get cashout request by ID
- `list` - List cashout requests with filters
- `getMy` - Get current user's cashout requests
- `create` - Create cashout request (authenticated users)
- `approve` - Approve cashout request (tenant approver+)
- `reject` - Reject cashout request (tenant approver+)

**Features:**
- Validates available collectible earnings
- Updates earnings on approval
- Transaction and notification logging

### 7. Transactions Router (`server/routers/transactions.ts`)

**Endpoints:**
- `getById` - Get transaction by ID (tenant admin+)
- `list` - List all transactions with filters (tenant admin+)
- `getMy` - Get current user's transactions

**Transaction Types:**
- create_account
- update_account
- create_loan
- approve_loan
- reject_loan
- receive_payment
- cashout_request
- cashout_approved
- cashout_rejected
- commission_update

### 8. Notifications Router (`server/routers/notifications.ts`)

**Endpoints:**
- `getMy` - Get current user's notifications
- `getUnreadCount` - Get unread notification count
- `markAsRead` - Mark notification as read
- `markAllAsRead` - Mark all notifications as read
- `delete` - Delete notification

**Notification Types:**
- past_due
- upcoming_due
- loan_approval
- loan_rejection
- cashout_approved
- cashout_rejected
- payment_received

### 9. Penalties Router (`server/routers/penalties.ts`)

**Endpoints:**
- `getById` - Get penalty by ID
- `list` - List penalties with filters
- `create` - Create penalty (tenant officer+)
- `markAsPaid` - Mark penalty as paid (tenant officer+)
- `delete` - Delete penalty (tenant officer+)

**Features:**
- Automatically updates loan total penalties
- Access control based on account assignment

### 10. Dashboard Router (`server/routers/dashboard.ts`)

**Endpoints:**
- `getAgentStats` - Get agent dashboard statistics (authenticated users)
  - Total accounts
  - Active loans
  - Collectible earnings
  - Upcoming payments (next 7 days)

- `getAdminStats` - Get admin dashboard statistics (tenant admin+)
  - Total/active users and agents
  - Account and loan counts
  - Financial metrics (disbursed, collected, outstanding, penalties, commissions)
  - Pending approvals and cashouts

- `getAgentPerformance` - Get agent performance metrics (tenant admin+)
  - Per-agent statistics
  - Collection rates
  - Commission earnings

- `getRecentActivities` - Get recent transaction activities
  - Filtered by user role

## Usage Examples

### Client-Side Usage

```typescript
import { trpc } from '@/lib/trpc/client'

// Get current user profile
const { data: profile } = trpc.users.getCurrentProfile.useQuery()

// List accounts (tenant officers see only their accounts)
const { data: accounts } = trpc.accounts.list.useQuery({
  limit: 20,
  offset: 0,
  status: 'active'
})

// Create a new loan
const createLoan = trpc.loans.create.useMutation()
await createLoan.mutateAsync({
  account_id: 'account-id',
  principal_amount: 10000,
  interest_rate: 5.5,
  tenure_months: 12,
  payment_frequency: 'monthly'
})

// Record a payment
const recordPayment = trpc.payments.create.useMutation()
await recordPayment.mutateAsync({
  loan_id: 'loan-id',
  amount: 1000,
  payment_date: '2025-11-06',
  type: 'regular'
})

// Get dashboard stats
const { data: agentStats } = trpc.dashboard.getAgentStats.useQuery()
const { data: adminStats } = trpc.dashboard.getAdminStats.useQuery()
```

## Security Features

1. **Role-Based Access Control**: All routes check user roles before allowing access
2. **User Profile Validation**: Ensures user has an active profile in users_profile table
3. **Data Isolation**: Tenant officers can only access their assigned accounts/loans/payments
4. **Transaction Logging**: All mutations create transaction records for audit trails
5. **Notification System**: Users receive notifications for important events

## Database Schema

The API works with the following main tables:
- `users_profile` - User profiles with roles
- `accounts` - Customer accounts
- `loans` - Loan records with amortization schedules
- `payments` - Payment records
- `earnings` - Agent earnings tracking
- `cashout_requests` - Cashout requests
- `transactions` - Audit log
- `notifications` - User notifications
- `penalties` - Loan penalties

## Error Handling

All routes use TRPC error codes:
- `UNAUTHORIZED` - User not authenticated
- `FORBIDDEN` - User doesn't have required permissions
- `NOT_FOUND` - Resource not found
- `BAD_REQUEST` - Invalid input or business logic violation
- `INTERNAL_SERVER_ERROR` - Database or server errors

## Next Steps

1. Test all routes with different user roles
2. Add rate limiting for sensitive operations
3. Implement real-time subscriptions for notifications
4. Add data validation middleware
5. Create integration tests for critical flows
