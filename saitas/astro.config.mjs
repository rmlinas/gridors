// astro.config.mjs
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'url';

import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import typography from '@tailwindcss/typography';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://gridors.com',
  
  // Pašalinta 'base' konfigūracija, nes svetainė nėra subdirektorijoje.
  // base: '/classes', // <-- Ši eilutė dabar pašalinta

  output: 'static', // Puslapis eksportuojamas kaip statinis

  vite: {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      }
    },
    plugins: [],
  },

  integrations: [
    react(),
    tailwind({
      config: {
        plugins: [typography],
      },
    }),
    mdx(), // <- Pridėtas palaikymas .mdx failams
  ]
});
