'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardBody, CardHeader, Input, Button } from '@heroui/react'
import { trpc } from '@/lib/trpc/client'

export default function HomePage() {
  const router = useRouter()
  const { data: session } = trpc.auth.getSession.useQuery()
  const loginMutation = trpc.auth.login.useMutation()

  useEffect(() => {
    if (session?.user) {
      router.push('/dashboard')
    }
  }, [session, router])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await loginMutation.mutateAsync({ email, password })
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      console.error('Login failed:', error)
    }
  }

  if (session?.user) {
    return <div>Redirecting...</div>
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-2 pb-6">
          <h1 className="text-3xl font-bold text-primary">LoanStar</h1>
          <p className="text-sm text-gray-600">Lending Management System</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
            />
            <Button
              type="submit"
              color="primary"
              isLoading={loginMutation.isPending}
              fullWidth
            >
              Login
            </Button>

            <div className="text-center mt-4">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <a href="/auth/signup" className="text-primary font-semibold hover:underline">
                  Sign up
                </a>
              </p>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
