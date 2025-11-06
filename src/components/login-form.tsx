'use client'

import { useState } from 'react'
import { Card, CardBody, CardHeader } from '@heroui/card'
import { Input } from '@heroui/input'
import { Button } from '@heroui/button'
import { Link } from '@heroui/link'
import { Divider } from '@heroui/divider'
import { createClient } from '@/src/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (data.user) {
        // Fetch user profile to determine role and redirect appropriately
        const { data: profile, error: profileError } = await supabase
          .from('users_profile')
          .select('role')
          .eq('id', data.user.id)
          .single()

        console.log('Login - User profile:', profile)

        if (profileError) {
          console.error('Login - Error fetching profile:', profileError)
        }

        // Redirect admin users to admin dashboard, others to tenant dashboard
        if (profile?.role === 'admin') {
          console.log('Login - Redirecting to admin dashboard')
          router.replace('/admin/dashboard')
        } else {
          console.log('Login - Redirecting to tenant dashboard')
          router.replace('/dashboard')
        }
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-4">
        <h1 className="text-2xl font-bold">Welcome Back</h1>
        <p className="text-sm text-default-500">Sign in to your account to continue</p>
      </CardHeader>
      <Divider />
      <CardBody className="px-6 py-6">
        <form onSubmit={handleLogin} className="flex flex-col gap-4 pb-12">
          {error && (
            <div className="bg-danger-50 text-danger border border-danger-200 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onValueChange={setEmail}
            isRequired
            variant="bordered"
            autoComplete="email"
            size="lg"
            labelPlacement="outside"
          />

          <Input
            type="password"
            label="Password"
            placeholder="Enter your password"
            value={password}
            onValueChange={setPassword}
            isRequired
            variant="bordered"
            autoComplete="current-password"
            size="lg"
            labelPlacement="outside"
          />

          <div className="flex justify-end">
            <Link href="/forgot-password" size="sm" className="text-primary">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            color="primary"
            size="lg"
            isLoading={loading}
            className="w-full"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
