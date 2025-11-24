// src/data/navLinks.ts
export const navLinks = [
  { text: 'Home', href: '/' },
  {
    text: 'Start Here',
    subLinks: [
      { text: 'Quick Start', href: '/start-here/quick-start/' },
      { text: 'Why Homesteading?', href: '/start-here/why-homesteading/' },
    ],
  },
  { text: 'Blog', href: '/blog' },
  {
    text: 'Guides',
    dynamicKey: 'guidesSubLinks', // dinamiškai inject'inama per await
  },
  { text: 'Reviews', href: '/reviews/' },
  {
    text: 'Resources',
    subLinks: [
      { text: 'Tools & Gear', href: '/resources/tools-gear/' },
      { text: 'Books & Guides', href: '/resources/books-guides/' },
      { text: 'Workshops & Courses', href: '/resources/workshops-courses/' },
    ],
  },
  { text: 'About', href: '/about/' },
  { text: 'Contact', href: '/contact/', isButton: true },
];
