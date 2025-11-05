'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Avatar
} from '@heroui/react'
import Link from 'next/link'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, isLoading, isAuthenticated, logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isBordered>
        <NavbarBrand>
          <Link href="/dashboard" className="font-bold text-xl text-primary">
            LoanStar
          </Link>
        </NavbarBrand>

        <NavbarContent className="hidden sm:flex gap-4" justify="center">
          <NavbarItem>
            <Link href="/dashboard" className="text-foreground">
              Dashboard
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/accounts" className="text-foreground">
              Accounts
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/loans" className="text-foreground">
              Loans
            </Link>
          </NavbarItem>
          <NavbarItem>
            <Link href="/payments" className="text-foreground">
              Payments
            </Link>
          </NavbarItem>
          {user?.role === 'agent' && (
            <>
              <NavbarItem>
                <Link href="/earnings" className="text-foreground">
                  Earnings
                </Link>
              </NavbarItem>
              <NavbarItem>
                <Link href="/cashouts" className="text-foreground">
                  Cashouts
                </Link>
              </NavbarItem>
            </>
          )}
          {user?.role === 'admin' && (
            <NavbarItem>
              <Link href="/admin" className="text-foreground">
                Admin
              </Link>
            </NavbarItem>
          )}
        </NavbarContent>

        <NavbarContent justify="end">
          <Dropdown placement="bottom-end">
            <DropdownTrigger>
              <Avatar
                as="button"
                className="transition-transform"
                name={user?.full_name || 'User'}
                size="sm"
              />
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-semibold">{user?.full_name}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </DropdownItem>
              <DropdownItem key="logout" color="danger" onClick={logout}>
                Log Out
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarContent>
      </Navbar>

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {children}
      </main>
    </div>
  )
}
