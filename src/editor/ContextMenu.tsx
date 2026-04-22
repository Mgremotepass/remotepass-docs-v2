import { useState, useEffect, useRef } from "react";

export interface ContextMenuItem {
  label: string;
  onClick: () => void;
  danger?: boolean;
}

interface ContextMenuProps {
  items: ContextMenuItem[];
}

export function ContextMenu({ items }: ContextMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="context-menu-wrapper" ref={ref}>
      <button
        className="context-menu-trigger"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        aria-label="More options"
      >
        ⋮
      </button>
      {open && (
        <ul className="context-menu-list" role="menu">
          {items.map((item) => (
            <li key={item.label} role="menuitem">
              <button
                className={`context-menu-item${item.danger ? " danger" : ""}`}
                onClick={() => { item.onClick(); setOpen(false); }}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
