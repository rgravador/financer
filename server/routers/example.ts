import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'

export const exampleRouter = router({
  // Public procedure - no authentication required
  hello: publicProcedure
    .input(z.object({ name: z.string().optional() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.name ?? 'World'}!`,
      }
    }),

  // Protected procedure - requires authentication
  getSecretMessage: protectedProcedure.query(({ ctx }) => {
    return {
      message: 'You are logged in!',
      userId: ctx.user.id,
    }
  }),

  // Example mutation
  createPost: protectedProcedure
    .input(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Example: Insert into Supabase
      const { data, error } = await ctx.supabase
        .from('posts')
        .insert({
          title: input.title,
          content: input.content,
          user_id: ctx.user.id,
        })
        .select()
        .single()

      if (error) {
        throw new Error(error.message)
      }

      return data
    }),
})
