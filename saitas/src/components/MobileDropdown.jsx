import { useState } from 'react';

export default function MobileDropdown({ title, links }) {
  const [open, setOpen] = useState(false);

  return (
    <div class="w-full border-b border-gray-200">
      <button
        class="w-full flex justify-between items-center px-4 py-3 text-left text-sm font-medium text-gray-800 bg-gray-100 hover:bg-gray-200"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span>{title}</span>
        <svg
          class={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul class="bg-white">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                class="block px-6 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
