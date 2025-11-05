'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card, CardBody, CardHeader, Input, Button, Select, SelectItem } from '@heroui/react'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const signupMutation = trpc.auth.signup.useMutation()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')

    const formData = new FormData(e.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    try {
      const result = await signupMutation.mutateAsync({
        email: formData.get('email') as string,
        password,
        full_name: formData.get('full_name') as string,
        display_name: formData.get('display_name') as string,
        role: (formData.get('role') as 'admin' | 'agent' | 'internal_admin') || 'agent',
      })

      if (result.success) {
        alert('Account created successfully! Please check your email to verify your account.')
        router.push('/')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create account')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col items-center gap-2 pb-6">
          <h1 className="text-3xl font-bold text-primary">LoanStar</h1>
          <p className="text-lg font-semibold">Create Account</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              name="full_name"
              placeholder="Enter your full name"
              required
              variant="bordered"
              labelPlacement="outside"
            />

            <Input
              label="Display Name (Optional)"
              name="display_name"
              placeholder="How you'd like to be called"
              variant="bordered"
              labelPlacement="outside"
            />

            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter your email"
              required
              variant="bordered"
              labelPlacement="outside"
            />

            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              required
              description="Minimum 6 characters"
              variant="bordered"
              labelPlacement="outside"
            />

            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              required
              variant="bordered"
              labelPlacement="outside"
            />

            <Select
              label="Role"
              name="role"
              placeholder="Select your role"
              defaultSelectedKeys={['agent']}
              required
              variant="bordered"
              labelPlacement="outside"
            >
              <SelectItem key="agent">
                Agent
              </SelectItem>
              <SelectItem key="admin">
                Admin
              </SelectItem>
              <SelectItem key="internal_admin">
                Internal Admin
              </SelectItem>
            </Select>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              color="primary"
              isLoading={signupMutation.isPending}
              fullWidth
            >
              Create Account
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/" className="text-primary font-semibold hover:underline">
                  Login
                </Link>
              </p>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
