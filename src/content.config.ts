import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './content/blog' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        pubDate: z.coerce.date(),
        keywords: z.array(z.string()),
    }),
});

const page = defineCollection({
    loader: glob({ pattern: '**/*.md', base: './content/page' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
    }),
});

export const collections = { page, blog };
