"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export type NavItem = { label: string; href: string; highlight?: boolean };

export function MainNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="main-nav" aria-label="Categorias principais">
      <div className="container nav-scroll">
        {items.map((item) => {
          const current = pathname === item.href;
          return (
            <Link
              className={item.highlight ? "nav-offer" : undefined}
              href={item.href}
              key={item.href}
              aria-current={current ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
