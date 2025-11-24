'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import DropdownLinkGroup from './DropdownLinkGroup.jsx';

export default function MobileMenu({ navLinks = [] }) {
  const [open, setOpen] = useState(false); // Valdo pagrindinio mobiliojo meniu atidarymą/uždarymą
  const [expandedMenus, setExpandedMenus] = useState({}); // Saugoma, kurie submeniu yra atidaryti (naudojant teksto pavadinimą)
  const [lastClickedParent, setLastClickedParent] = useState(null); // Saugoma paskutinio paspausto tėvinio elemento tekstas (kad atskirtume pirmą/antrą paspaudimą)

  useEffect(() => {
    // Teisingai valdome body overflow, kai meniu atidarytas
    if (open) {
      document.body.style.overflow = 'hidden'; // Neleidžia puslapiui slinkti
      document.documentElement.classList.add('overflow-hidden'); // Užtikrina suderinamumą
    } else {
      document.body.style.overflow = 'auto'; // Grąžina puslapio slinkimą
      document.documentElement.classList.remove('overflow-hidden');
      setExpandedMenus({}); // Uždaro visus submeniu, kai uždaromas pagrindinis meniu
      setLastClickedParent(null); // Atstato paskutinį paspaustą tėvinį elementą
    }
    // Išvalymo funkcija (vykdoma, kai komponentas išmontuojamas arba `open` pasikeičia atgal į false)
    return () => {
      document.body.style.overflow = 'auto';
      document.documentElement.classList.remove('overflow-hidden');
    };
  }, [open]); // Priklausomybė nuo `open` būsenos

  // Tvarkyklė tėviniams meniu punktams (tiems, kurie turi sub-nuorodas)
  const handleParentMenuClick = (linkItem) => {
    if (lastClickedParent === linkItem.text) { // Antras paspaudimas ant to paties tėvinio elemento
      if (linkItem.href) { // Jei nuoroda egzistuoja, nukreipia
        window.location.href = linkItem.href; // Aiškiai nukreipia
      }
      setLastClickedParent(null); // Atstato, nes jau įvyko navigacija
      setOpen(false); // Uždaro pagrindinį meniu po navigacijos
    } else { // Pirmas paspaudimas ant šio tėvinio elemento ARBA paspausta ant kito tėvinio elemento
      // Uždaro visus kitus atidarytus submeniu ir atidaro tik šį
      setExpandedMenus((prev) => ({
        ...Object.fromEntries(Object.keys(prev).map(key => [key, false])), // Uždaro visus kitus
        [linkItem.text]: true, // Atidaro šį
      }));
      setLastClickedParent(linkItem.text); // Nustato šį kaip paskutinį paspaustą tėvinį elementą
    }
  };

  // Tvarkyklė įprastoms nuorodoms (be sub-nuorodų) ir submeniu nuorodoms
  const handleRegularLinkClick = () => {
    setOpen(false); // Uždaro pagrindinį meniu
    setExpandedMenus({}); // Uždaro visus submeniu
    setLastClickedParent(null); // Atstato paskutinį paspaustą tėvinį elementą
  };

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
        {navLinks.map((link) => (
          <li key={link.text}>
            {link.subLinks ? (
              // Tėvinis meniu punktas su sub-nuorodomis
              <button
                onClick={() => handleParentMenuClick(link)} // Naudojama nauja tėvinio elemento tvarkyklė
                className="mobile-nav-link flex justify-between items-center w-full"
              >
                <span>{link.text}</span>
                <span>{expandedMenus[link.text] ? '−' : '+'}</span>
              </button>
            ) : (
              // Įprastas meniu punktas be sub-nuorodų (arba yra mygtukas)
              <a
                href={link.href}
                onClick={handleRegularLinkClick} // Naudojama nauja įprastų nuorodų tvarkyklė
                className={`${
                  link.isButton ? 'btn w-full py-3 text-center block' : 'mobile-nav-link'
                } `}
              >
                {link.text}
              </a>
            )}
            {expandedMenus[link.text] && (
              <div className="pl-4 mt-2 space-y-2">
                <DropdownLinkGroup
                  links={link.subLinks}
                  onClick={handleRegularLinkClick} // Submeniu nuorodos taip pat naudoja įprastą tvarkyklę
                  isMobile={true}
                />
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="relative z-50">
      {/* Hamburger meniu mygtukas */}
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

      {/* Atvaizduoti meniu turinį per Portalą, jei atidarytas */}
      {open && createPortal(menuContent, document.body)}
    </div>
  );
}