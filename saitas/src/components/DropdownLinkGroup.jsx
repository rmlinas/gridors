import React from 'react';

export default function DropdownLinkGroup({ links, onClick, isMobile = false }) {
  const currentLinks = links || [];

  return (
    <ul
      className={`
        flex flex-col space-y-2 w-full px-4 max-w-sm mx-auto rounded-lg
        ${isMobile ? 'mobile-dropdown-menu text-center' : 'desktop-dropdown-menu text-left'}
      `}
    >
      {currentLinks.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            onClick={onClick}
            className={`
              block rounded-lg transition-colors duration-200
              ${isMobile
                ? 'mobile-nav-link py-3 hover:bg-gray-800 text-white' // Pakeista iš 'bg-transparent hover:bg-white/10' į 'hover:bg-gray-800'
                : 'text-gray-800 hover:bg-[var(--color-primary-light)] hover:text-white px-3 py-2'}
            `}
          >
            {link.text}
          </a>
        </li>
      ))}
    </ul>
  );
}