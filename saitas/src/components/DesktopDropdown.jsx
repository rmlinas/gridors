import { useState, useRef, useEffect } from 'react';
import DesktopDropdownLinkGroup from './DesktopDropdownLinkGroup.jsx';

export default function DesktopDropdown({ title, links, href }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();
  const timeoutRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Jei paspaudimas yra už dropdown ribų – uždarom
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 150);
  };

  return (
    <div
      className="relative"
      ref={ref}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        href={href}
        className="nav-link flex items-center gap-1 text-white hover:text-[var(--color-primary-light)] transition-colors duration-150 cursor-pointer"
        aria-haspopup="true"
        aria-expanded={open}
      >
        {title}
        <i className={`fa-solid ${open ? 'fa-caret-up' : 'fa-caret-down'} text-xs ml-1`}></i>
      </a>

      {open && (
        <div
          className="absolute top-full left-0 mt-2 z-50 desktop-dropdown-menu"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <DesktopDropdownLinkGroup
            links={links}
            onClick={() => setOpen(false)}
          />
        </div>
      )}
    </div>
  );
}
