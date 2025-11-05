import { createTRPCRouter } from './trpc'
import { authRouter } from './routers/auth'
import { accountsRouter } from './routers/accounts'
import { loansRouter } from './routers/loans'
import { paymentsRouter } from './routers/payments'
import { earningsRouter } from './routers/earnings'
import { cashoutsRouter } from './routers/cashouts'
import { notificationsRouter } from './routers/notifications'

export const appRouter = createTRPCRouter({
  auth: authRouter,
  accounts: accountsRouter,
  loans: loansRouter,
  payments: paymentsRouter,
  earnings: earningsRouter,
  cashouts: cashoutsRouter,
  notifications: notificationsRouter,
})

export type AppRouter = typeof appRouter
