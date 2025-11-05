'use client'

import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import SideNav from '@/components/SideNav'

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { isAuthenticated, isLoading } = useAuth()

  // Check if we should show the sidebar
  const shouldShowSidebar = !pathname?.startsWith('/auth') && !isLoading && isAuthenticated

  if (shouldShowSidebar) {
    return (
      <div className="flex">
        <div className="w-64">
          <SideNav />
        </div>
        <main className="flex-auto p-16">
          {children}
        </main>
      </div>
    )
  }

  return (
    <main className="p-16">
      {children}
    </main>
  )
}
