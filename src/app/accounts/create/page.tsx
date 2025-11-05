'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card, CardBody, CardHeader, Input, Button } from '@heroui/react'
import { createClient } from '@/lib/supabase/client'

export default function CreateAccountPage() {
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const createAccountMutation = trpc.accounts.createMultiStep.useMutation()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    try {
      let idProofUrl: string | null = null

      // Handle file upload
      const file = formData.get('id_proof') as File
      if (file && file.size > 0) {
        setIsUploading(true)
        const fileExt = file.name.split('.').pop()
        const fileName = `${Date.now()}.${fileExt}`
        const filePath = `id-proofs/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)

        if (uploadError) {
          throw new Error('Failed to upload ID proof')
        }

        const { data: urlData } = supabase.storage
          .from('documents')
          .getPublicUrl(filePath)

        idProofUrl = urlData.publicUrl
        setIsUploading(false)
      }

      await createAccountMutation.mutateAsync({
        name: formData.get('name') as string,
        date_of_birth: formData.get('date_of_birth') as string,
        ssn_tax_id: formData.get('ssn_tax_id') as string,
        government_id_type: formData.get('government_id_type') as string,
        government_id_number: formData.get('government_id_number') as string,
        id_proof_url: idProofUrl,
      })

      router.push('/accounts')
    } catch (error) {
      console.error('Failed to create account:', error)
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="light" onPress={() => router.back()}>
          ← Back
        </Button>
        <h1 className="text-3xl font-bold">Create Account</h1>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <h2 className="text-xl font-semibold">Basic Information</h2>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Full Name" name="name" required />
            <Input label="Date of Birth" name="date_of_birth" type="date" />
            <Input label="SSN / Tax ID" name="ssn_tax_id" />
            <Input label="Government ID Type" name="government_id_type" />
            <Input label="Government ID Number" name="government_id_number" />
            <Input
              label="ID Proof Document"
              name="id_proof"
              type="file"
              accept="image/*,.pdf"
            />

            <div className="flex gap-4 justify-end pt-4">
              <Button type="button" variant="light" onPress={() => router.back()}>
                Cancel
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={createAccountMutation.isPending || isUploading}
              >
                Create Account
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  )
}
