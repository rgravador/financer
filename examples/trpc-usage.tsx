// Example: Using tRPC in a Client Component
'use client'

import { trpc as trpcProvider } from '@/src/lib/trpc/Provider'

export function TRPCClientExample() {
  // Simple query
  const { data, isLoading } = trpcProvider.example.hello.useQuery({ name: 'World' })

  // Protected query (requires authentication)
  const secretMessage = trpcProvider.example.getSecretMessage.useQuery()

  // Mutation
  const createPost = trpcProvider.example.createPost.useMutation({
    onSuccess: (data) => {
      console.log('Post created:', data)
    },
    onError: (error) => {
      console.error('Error creating post:', error)
    },
  })

  const handleCreatePost = () => {
    createPost.mutate({
      title: 'My First Post',
      content: 'This is the content of my post',
    })
  }

  return (
    <div>
      <h1>tRPC Client Example</h1>

      {/* Query example */}
      <div>
        {isLoading && <p>Loading...</p>}
        {data && <p>{data.greeting}</p>}
      </div>

      {/* Protected query example */}
      <div>
        {secretMessage.data && (
          <div>
            <p>{secretMessage.data.message}</p>
            <p>User ID: {secretMessage.data.userId}</p>
          </div>
        )}
        {secretMessage.error && <p>Not authenticated</p>}
      </div>

      {/* Mutation example */}
      <div>
        <button onClick={handleCreatePost} disabled={createPost.isPending}>
          {createPost.isPending ? 'Creating...' : 'Create Post'}
        </button>
        {createPost.error && <p>Error: {createPost.error.message}</p>}
      </div>
    </div>
  )
}

// Example: Using tRPC in a Server Component
import { trpc as trpcServer } from '@/src/lib/trpc/client'

export async function TRPCServerExample() {
  // Call tRPC procedures directly on the server
  const greeting = await trpcServer.example.hello.query({ name: 'Server' })

  return (
    <div>
      <h1>tRPC Server Example</h1>
      <p>{greeting.greeting}</p>
    </div>
  )
}
