# LoanStar - Lending Management System

A comprehensive lending management web application built with Next.js, TypeScript, tRPC, and HeroUI.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **UI Library:** HeroUI (React)
- **Styling:** Tailwind CSS
- **Backend:** tRPC v11
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **State Management:** React Query (via tRPC)

## Features

- 🔐 Multi-role authentication (Admin, Agent, Internal Admin)
- 👤 Account management with KYC
- 💰 Loan creation and approval workflow
- 💳 Payment recording and tracking
- 📊 Earnings and commission tracking
- 💸 Cashout request system
- 📈 Dashboard with real-time analytics
- 🔔 Notifications system
- 📱 Responsive design

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd Financer
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.local .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Run the development server
```bash
npm run dev
```

5. Open [http://localhost:3001](http://localhost:3001)

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── (auth)/            # Auth pages
│   ├── dashboard/         # Dashboard
│   ├── accounts/          # Account management
│   ├── loans/             # Loan management
│   ├── payments/          # Payment recording
│   ├── earnings/          # Agent earnings
│   ├── cashouts/          # Cashout requests
│   └── admin/             # Admin pages
├── components/            # Reusable components
├── hooks/                 # Custom React hooks
├── lib/                   # Library configurations
│   ├── supabase/         # Supabase clients
│   └── trpc/             # tRPC client setup
├── server/                # tRPC server
│   └── api/
│       ├── routers/      # tRPC routers
│       └── trpc.ts       # tRPC config
├── types/                 # TypeScript types
└── utils/                 # Utility functions
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## User Roles

### Admin
- Approve/reject loans
- Approve/reject cashout requests
- Manage users and permissions
- View all accounts and loans
- Set commission rates

### Agent
- Create and manage accounts
- Create loan applications
- Record payments
- View earnings
- Request cashouts

### Internal Admin
- System-wide management
- Company management
- Advanced analytics

## Key Features

### Account Management
- Multi-step account creation with KYC
- Document upload (ID proofs, address proofs)
- Employment and income verification
- Debt-to-income ratio calculation

### Loan Management
- Flexible loan terms
- Multiple payment frequencies (weekly, bi-monthly, monthly)
- Automatic amortization schedule generation
- Interest and penalty calculations

### Payment Tracking
- Payment allocation (principal, interest, penalties)
- Payment history
- Outstanding balance tracking

### Commission System
- Interest-based commission for agents
- Automatic earnings calculation
- Cashout request workflow

## API Routes

All API routes are handled by tRPC at `/api/trpc/*`

### Available Routers

- `auth` - Authentication and session management
- `accounts` - Account CRUD operations
- `loans` - Loan management
- `payments` - Payment recording
- `earnings` - Earnings tracking
- `cashouts` - Cashout requests

## Database Schema

See Supabase dashboard for complete schema. Main tables:

- `users_profile` - User profiles with roles
- `accounts` - Customer accounts
- `loans` - Loan applications
- `payments` - Payment records
- `earnings` - Agent earnings
- `cashout_requests` - Cashout requests
- `notifications` - User notifications
- `transactions` - Audit log

## Security

- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Supabase Auth for authentication
- Protected API routes via tRPC middleware
- Server-side validation with Zod

## Development Notes

### Adding a New Page

1. Create page in `src/app/your-page/page.tsx`
2. Add navigation link in dashboard layout
3. Create tRPC router if needed
4. Add middleware protection if required

### Adding a New tRPC Route

1. Create router in `src/server/api/routers/your-router.ts`
2. Export router in `src/server/api/root.ts`
3. Use in components via `trpc.yourRouter.yourProcedure.useQuery()`

### Supabase Storage

Documents are stored in the `documents` bucket:
- `id-proofs/` - Government IDs
- `account-documents/` - Account-related documents

## Migration from Nuxt

This project was migrated from Nuxt 3. See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for details.

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Ensure the platform supports:
- Node.js 18+
- Server-side rendering
- Environment variables

## License

Private - All Rights Reserved

## Support

For issues or questions, contact the development team.
