import { z } from 'astro/zod';

// Strict on purpose: an unknown or misspelt key fails the build with the file's name.
export const postSchema = z
  .object({
    title: z.string().min(1),
    publishedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD'),
    slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
    summary: z.string().default(''),
    tags: z.array(z.string()).default([]),
    author: z.string().default('Laurence Ininda'),
    authorLink: z.url().default('https://bsky.app/profile/laudebugs.me'),
    type: z.enum(['dev']).default('dev'),
    /** The cover file name in public/assets/post-covers. */
    image: z.string().optional(),
    /** HTML: the photo credit, with its links. */
    imageCredit: z.string().optional(),
    imageDescription: z.string().default(''),
    imageOriginalUrl: z.url().optional(),
    /** The page's H1 when it differs from the title, for example because it holds code. Backticks mark code. */
    heading: z.string().optional(),
  })
  .strict();
