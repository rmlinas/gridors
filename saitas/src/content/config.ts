import { defineCollection, z } from 'astro:content';

// Blog Collection
const blog = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    // Pataisymas: padaryta neprivalomu, kad būtų išvengta klaidų su nepilnais įrašais
    pubDate: z.date().optional(),
    updatedDate: z.date().optional(),
    author: z.string().optional(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
    // Paveikslėlis apibrėžtas teisingai, kad veiktų astro:assets
    image: image().optional(),
  }),
});

// Guides Collection
const guides = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    // Pataisymas: padaryta neprivalomu, kad būtų išvengta klaidų su nepilnais įrašais
    pubDate: z.date().optional(),
    updatedDate: z.date().optional(),
    author: z.string().default('Gridors Team'),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    category: z.string().optional(),
    // Paveikslėlis apibrėžtas teisingai, kad veiktų astro:assets
    image: image().optional(),
  }),
});

// Reviews Collection
const reviews = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    description: z.string(),
    // Pataisymas: padaryta neprivalomu, kad būtų išvengta klaidų su nepilnais įrašais
    pubDate: z.date().optional(),
    updatedDate: z.date().optional(),
    author: z.string().default('Gridors Team'),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).optional(),
    product: z.string().optional(),
    rating: z.number().min(1).max(5).optional(),
    // Paveikslėlis apibrėžtas teisingai, kad veiktų astro:assets
    image: image().optional(),
  }),
});

export const collections = {
  blog,
  guides,
  reviews,
};
