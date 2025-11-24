// src/utils/getGuidesSubcategories.ts
import { getCollection } from 'astro:content';

export async function getGuidesSubcategories(): Promise<{ text: string; href: string }[]> {
  const guides = await getCollection('guides', ({ data }) => !data.draft);
  
  const slugs = new Set(
    guides
      .map((item) => item.slug.split('/')[0])
      .filter((slug) => slug !== 'guides')
  );

  return Array.from(slugs).sort().map((sub) => ({
    text: sub.charAt(0).toUpperCase() + sub.slice(1).replace(/-/g, ' '),
    href: `/guides/${sub}/`
  }));
}
