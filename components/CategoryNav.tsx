'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  categorias: string[];
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function CategoryNav({ categorias }: Props) {
  const [active, setActive] = useState<string>(categorias[0] ?? '');
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    categorias.forEach((cat) => {
      const el = document.getElementById(slugify(cat));
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActive(cat);
        },
        { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, [categorias]);

  // Scroll the active pill into view in the nav
  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const pill = nav.querySelector(`[data-cat="${active}"]`) as HTMLElement | null;
    if (pill) {
      pill.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [active]);

  const handleClick = (cat: string) => {
    setActive(cat);
    const el = document.getElementById(slugify(cat));
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full backdrop-blur-md border-b border-cubic-border"
      style={{ backgroundColor: 'rgba(26, 23, 33, 0.95)' }}
    >
      <div
        ref={navRef}
        className="flex gap-2 px-4 py-3 overflow-x-auto scrollbar-hide max-w-5xl mx-auto"
      >
        {categorias.map((cat) => {
          const isActive = active === cat;
          return (
            <button
              key={cat}
              data-cat={cat}
              onClick={() => handleClick(cat)}
              className={`
                flex-shrink-0 px-4 py-1.5 rounded-full font-bebas tracking-widest text-sm transition-all duration-200
                ${isActive
                  ? 'bg-cubic-accent text-black'
                  : 'border border-cubic-accent text-white hover:bg-cubic-accent/10'
                }
              `}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
