import React from 'react';

export default function DropdownLinkGroup({ links, onClick }) {
  const currentLinks = links || []; 

  return (
    // Pakeista: dabar šios nuorodos visada bus baltos, skirtos tamsiam fonui
    <ul className="flex flex-col space-y-2 text-center w-full px-4 max-w-sm mx-auto"> {/* Pridėta text-center w-full px-4 max-w-sm mx-auto */}
      {currentLinks.map((link) => (
        <li key={link.href}>
          <a
            href={link.href}
            // NAUJAS STILIUS: Dabar tai atrodo kaip mygtukas mobiliajam meniu
            className="mobile-nav-link py-3 bg-transparent hover:bg-white/10 rounded-lg text-white" 
            onClick={onClick}
          >
            {link.text}
          </a>
        </li>
      ))}
    </ul>
  );
}