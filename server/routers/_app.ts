import { router } from '../trpc'
import { exampleRouter } from './example'
import { usersRouter } from './users'
import { accountsRouter } from './accounts'
import { loansRouter } from './loans'
import { paymentsRouter } from './payments'
import { earningsRouter, cashoutRouter } from './earnings'
import { transactionsRouter } from './transactions'
import { notificationsRouter } from './notifications'
import { penaltiesRouter } from './penalties'
import { dashboardRouter } from './dashboard'
import { tenantsRouter } from './tenants'

export const appRouter = router({
  example: exampleRouter,
  users: usersRouter,
  accounts: accountsRouter,
  loans: loansRouter,
  payments: paymentsRouter,
  earnings: earningsRouter,
  cashouts: cashoutRouter,
  transactions: transactionsRouter,
  notifications: notificationsRouter,
  penalties: penaltiesRouter,
  dashboard: dashboardRouter,
  tenants: tenantsRouter,
})

export type AppRouter = typeof appRouter
