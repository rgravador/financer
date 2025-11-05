import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { HeroUIProvider } from '@heroui/react'
import { TRPCProvider } from '@/lib/trpc/client'
import LayoutContent from '@/components/LayoutContent'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LoanStar - Lending Management',
  description: 'Lending Management Web Application',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCProvider>
          <HeroUIProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
          </HeroUIProvider>
        </TRPCProvider>
      </body>
    </html>
  )
}
