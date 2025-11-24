'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // Importuojame createPortal
import DropdownLinkGroup from './DropdownLinkGroup.jsx'; // Įsitikinkite, kad kelias teisingas

export default function MobileMenu({ navLinks = [] }) {
  const [open, setOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  useEffect(() => {
    // Teisingai valdome body overflow, kai meniu atidarytas
    if (open) {
      document.body.style.overflow = 'hidden'; // Neleidžia puslapiui slinkti
      document.documentElement.classList.add('overflow-hidden'); // Užtikrina suderinamumą
    } else {
      document.body.style.overflow = 'auto'; // Grąžina puslapio slinkimą
      document.documentElement.classList.remove('overflow-hidden');
    }
    // Išvalymo funkcija (vykdoma, kai komponentas išmontuojamas arba `open` pasikeičia atgal į false)
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, [open]); // Priklausomybė nuo `open` būsenos

  const toggleSubMenu = (menuText) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuText]: !prev[menuText],
    }));
  };

  const handleLinkClick = () => setOpen(false); // Uždarome meniu paspaudus nuorodą

  // Meniu turinys, kuris bus "portalintas" (perkeltas į kitą DOM vietą)
  const menuContent = (
    // Šis div dabar bus atvaizduotas tiesiai body viduje per Portalą
    <div className="fixed inset-0 bg-black text-white z-[999999999] p-6 overflow-y-auto">
      {/* Uždarymo mygtukas */}
      <button
        onClick={() => setOpen(false)}
        className="absolute top-4 right-4 p-2 text-gray-200 hover:text-[var(--color-primary-light)]"
        aria-label="Close menu"
      >
        <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Meniu įrašų sąrašas */}
      <ul className="flex flex-col space-y-4 mt-12 text-lg font-medium">
        {navLinks.map((link) =>
          link.subLinks ? (
            <li key={link.text}>
              <button
                onClick={() => toggleSubMenu(link.text)}
                className="flex justify-between items-center w-full hover:text-[var(--color-primary-light)]"
              >
                <span>{link.text}</span>
                <span>{expandedMenus[link.text] ? '−' : '+'}</span>
              </button>
              {expandedMenus[link.text] && (
                <div className="pl-4 mt-2 space-y-2">
                  <DropdownLinkGroup
                    links={link.subLinks}
                    onClick={handleLinkClick}
                    isMobile={true}
                  />
                </div>
              )}
            </li>
          ) : (
            <li key={link.text} className={link.isButton ? 'mt-4' : ''}>
              <a
                href={link.href}
                onClick={handleLinkClick}
                className={`${
                  link.isButton ? 'btn w-full py-3 text-center block' : 'hover:text-[var(--color-primary-light)]'
                }`}
              >
                {link.text}
              </a>
            </li>
          )
        )}
      </ul>
    </div>
  );

  return (
    <div className="relative z-50">
      {/* Hamburger meniu mygtukas - lieka savo vietoje */}
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-label="Toggle menu"
        className="p-2 text-gray-200 hover:text-[var(--color-primary-light)] focus:outline-none"
      >
        {open ? (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        )}
      </button>

      {/* Jei meniu atidarytas, atvaizduojame jo turinį per Portalą tiesiai į document.body */}
      {open && createPortal(menuContent, document.body)}
    </div>
  );
}