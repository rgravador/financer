'use client'

import { Button } from '@heroui/button'
import { Card, CardBody } from '@heroui/card'
import { useRouter } from 'next/navigation'
import { useUserProfile } from '@/src/hooks/use-user-profile'
import { getRedirectPath } from '@/src/lib/auth/route-protection'

export default function Unauthorized() {
  const router = useRouter()
  const { userProfile } = useUserProfile()

  const handleGoBack = () => {
    if (userProfile) {
      const redirectPath = getRedirectPath(userProfile.role)
      router.replace(redirectPath)
    } else {
      router.replace('/')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardBody className="text-center p-8">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-default-500 mb-6">
            You don't have permission to access this page.
          </p>
          <Button 
            color="primary" 
            onPress={handleGoBack}
            className="w-full"
          >
            Go to Dashboard
          </Button>
        </CardBody>
      </Card>
    </div>
  )
}