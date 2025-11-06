# Supabase + tRPC Setup Guide

This project is now configured with Supabase and tRPC. Follow these instructions to get started.

## Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Go to your [Supabase Dashboard](https://app.supabase.com)
   - Create a new project or select an existing one
   - Go to Project Settings > API
   - Copy the **Project URL** and paste it as `NEXT_PUBLIC_SUPABASE_URL`
   - Copy the **anon/public key** and paste it as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Copy the **service_role secret** and paste it as `SUPABASE_SERVICE_ROLE_KEY`
     - ⚠️ **IMPORTANT**: The service role key bypasses Row Level Security
     - Keep it secret and never expose it to the client
     - Only use it for admin operations on the server side

## Project Structure

```
├── app/
│   ├── api/
│   │   └── trpc/
│   │       └── [trpc]/
│   │           └── route.ts          # tRPC API route handler
│   └── providers.tsx                 # Updated with TRPCProvider
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 # Supabase client for browser
│   │   ├── server.ts                 # Supabase client for server
│   │   ├── admin.ts                  # Supabase admin client (service role)
│   │   └── middleware.ts             # Supabase middleware helper
│   └── trpc/
│       ├── client.ts                 # Vanilla tRPC client
│       └── Provider.tsx              # tRPC React provider
├── server/
│   ├── trpc.ts                       # tRPC initialization & context
│   └── routers/
│       ├── _app.ts                   # Main router
│       └── example.ts                # Example router with procedures
└── middleware.ts                     # Next.js middleware for auth
```

## Using tRPC in Components

### Client Components

```tsx
'use client'

import { trpc } from '@/lib/trpc/Provider'

export default function ExampleComponent() {
  // Query example
  const hello = trpc.example.hello.useQuery({ name: 'World' })

  // Mutation example
  const createPost = trpc.example.createPost.useMutation()

  return (
    <div>
      {hello.data ? <p>{hello.data.greeting}</p> : <p>Loading...</p>}

      <button
        onClick={() => {
          createPost.mutate({
            title: 'My Post',
            content: 'Hello world!'
          })
        }}
      >
        Create Post
      </button>
    </div>
  )
}
```

### Server Components

```tsx
import { trpc } from '@/lib/trpc/client'

export default async function ServerComponent() {
  const result = await trpc.example.hello.query({ name: 'Server' })

  return <div>{result.greeting}</div>
}
```

## Using Supabase

### Client Components

```tsx
'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function ExampleComponent() {
  const [user, setUser] = useState(null)
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [])

  return <div>{user ? user.email : 'Not logged in'}</div>
}
```

### Server Components

```tsx
import { createClient } from '@/lib/supabase/server'

export default async function ServerComponent() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <div>{user ? user.email : 'Not logged in'}</div>
}
```

## Creating New tRPC Routes

1. Create a new router file in `server/routers/`:

```typescript
// server/routers/posts.ts
import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const postsRouter = router({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const { data } = await ctx.supabase
      .from('posts')
      .select('*')
    return data
  }),

  create: protectedProcedure
    .input(z.object({
      title: z.string(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { data } = await ctx.supabase
        .from('posts')
        .insert({
          title: input.title,
          content: input.content,
          user_id: ctx.user.id,
        })
        .select()
        .single()
      return data
    }),
})
```

2. Add it to the main router in `server/routers/_app.ts`:

```typescript
import { router } from '../trpc'
import { exampleRouter } from './example'
import { postsRouter } from './posts'

export const appRouter = router({
  example: exampleRouter,
  posts: postsRouter,
})

export type AppRouter = typeof appRouter
```

## Authentication with Supabase

The middleware is already configured to handle Supabase authentication. To add protected routes:

1. Update `lib/supabase/middleware.ts` to add your authentication logic
2. Use `protectedProcedure` in your tRPC routes to ensure authentication

## Database Setup

1. Go to your Supabase project
2. Navigate to the SQL Editor
3. Create your tables (example):

```sql
create table posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  title text not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table posts enable row level security;

-- Create policies
create policy "Users can insert their own posts"
  on posts for insert
  with check (auth.uid() = user_id);

create policy "Posts are viewable by everyone"
  on posts for select
  using (true);
```

## Next Steps

1. Set up your Supabase database tables
2. Configure your authentication providers in Supabase
3. Create your tRPC routes based on your database schema
4. Build your UI components using the tRPC hooks

For more information:
- [Supabase Documentation](https://supabase.com/docs)
- [tRPC Documentation](https://trpc.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
