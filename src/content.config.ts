import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    tags: z.array(z.string()).default(["others"]),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    heroImage: z.string().optional(),
    hide: z.boolean().optional(),
  }),
});

const academic = defineCollection({
  loader: glob({ base: "./src/content/academic", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    parent: z.string().optional(),
    order: z.number().default(0),
    hide: z.boolean().optional(),
    type: z.string().optional() // Add this property
  }),
});

export const collections = { blog, academic };