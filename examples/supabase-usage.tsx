// Example: Using Supabase in a Client Component
'use client'

import { createClient as createClientClient } from '@/src/lib/supabase/client'
import { useEffect, useState } from 'react'

export function SupabaseClientExample() {
  const [user, setUser] = useState<any>(null)
  const [posts, setPosts] = useState<any[]>([])
  const supabase = createClientClient()

  useEffect(() => {
    // Get current user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
    }

    // Fetch data from database
    const fetchPosts = async () => {
      const { data, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching posts:', error)
      } else {
        setPosts(data || [])
      }
    }

    getUser()
    fetchPosts()

    // Subscribe to real-time changes
    const channel = supabase
      .channel('posts-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posts' }, (payload) => {
        console.log('Change received!', payload)
        fetchPosts() // Refetch posts when changes occur
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'user@example.com',
      password: 'password',
    })

    if (error) {
      console.error('Error signing in:', error)
    }
  }

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error signing out:', error)
    }
  }

  const handleInsertPost = async () => {
    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: 'New Post',
        content: 'This is a new post',
        user_id: user?.id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error inserting post:', error)
    } else {
      console.log('Post inserted:', data)
    }
  }

  return (
    <div>
      <h1>Supabase Client Example</h1>

      {/* Authentication */}
      <div>
        {user ? (
          <div>
            <p>Logged in as: {user.email}</p>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        ) : (
          <button onClick={handleSignIn}>Sign In</button>
        )}
      </div>

      {/* Database operations */}
      <div>
        <h2>Posts</h2>
        {user && <button onClick={handleInsertPost}>Add Post</button>}
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Example: Using Supabase in a Server Component
import { createClient as createServerClient } from '@/src/lib/supabase/server'

export async function SupabaseServerExample() {
  const supabase = await createServerClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch data from database
  const { data: posts, error } = await supabase.from('posts').select('*').order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching posts:', error)
  }

  return (
    <div>
      <h1>Supabase Server Example</h1>

      {/* Show user info */}
      {user ? (
        <div>
          <p>Logged in as: {user.email}</p>
        </div>
      ) : (
        <p>Not logged in</p>
      )}

      {/* Display posts */}
      <div>
        <h2>Posts</h2>
        <ul>
          {posts?.map((post) => (
            <li key={post.id}>
              <h3>{post.title}</h3>
              <p>{post.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Example: Using Supabase Auth Helpers
export function SupabaseAuthHelpers() {
  const supabase = createClientClient()

  const signUpWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  }

  const signInWithEmail = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signInWithOAuth = async (provider: 'google' | 'github' | 'gitlab') => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  const resetPassword = async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })
    return { data, error }
  }

  return {
    signUpWithEmail,
    signInWithEmail,
    signInWithOAuth,
    signOut,
    resetPassword,
  }
}
