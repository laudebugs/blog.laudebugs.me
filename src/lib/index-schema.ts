import { z } from 'astro/zod';

/** The shape of /assets/posts-index.json, which laudebugs.me reads (docs/plans/astro-rebuild.md, O5). */
export const postsIndexSchema = z
  .object({
    version: z.literal(1),
    posts: z.array(
      z
        .object({
          title: z.string().min(1),
          publishedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          url: z.url(),
          tags: z.array(z.string()),
          image: z.url().nullable(),
          imageAlt: z.string(),
        })
        .strict(),
    ),
  })
  .strict();
