'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HomeIcon,
  CreditCardIcon,
  BanknotesIcon,
  UserGroupIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/react/24/outline'
import { useAuth } from '@/hooks/useAuth'

interface NavItem {
  name: string
  href: string
  icon: any
}

const navItems: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
  { name: 'Accounts', href: '/accounts', icon: UserGroupIcon },
  { name: 'Loans', href: '/loans', icon: BanknotesIcon },
  { name: 'Payments', href: '/payments', icon: CreditCardIcon },
  { name: 'Earnings', href: '/earnings', icon: ChartBarIcon },
  { name: 'Cashouts', href: '/cashouts', icon: CurrencyDollarIcon },
  { name: 'Admin', href: '/admin', icon: ShieldCheckIcon },
]

export default function SideNav() {
  const pathname = usePathname()
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { logout, isAuthenticated, isLoading } = useAuth()

  // Don't show navigation on auth pages
  if (pathname?.startsWith('/auth')) {
    return null
  }

  // Don't show navigation if user is not authenticated
  if (!isLoading && !isAuthenticated) {
    return null
  }

  return (
    <aside className="w-64 bg-gray-900 min-h-screen text-white fixed left-0 top-0 flex flex-col">
      <div className="p-6 flex-1">
        <h1 className="text-2xl font-bold mb-8">LoanStar</h1>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-gray-800">
        <button
          onClick={() => void logout()}
          className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800 hover:text-white w-full"
        >
          <ArrowLeftOnRectangleIcon className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </aside>
  )
}
