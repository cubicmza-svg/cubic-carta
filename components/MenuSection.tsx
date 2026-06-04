import type { MenuGroup } from '@/lib/getMenu';
import MenuItem from './MenuItem';

interface Props {
  group: MenuGroup;
}

function slugify(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}

export default function MenuSection({ group }: Props) {
  const subcats = Object.entries(group.subcategorias);
  const hasSubs = subcats.some(([key]) => key !== '_');

  return (
    <section id={slugify(group.categoria)} className="scroll-mt-20 mb-16">
      {/* Header de categoría */}
      <div className="mb-8">
        <h2 className="font-bebas text-5xl md:text-6xl text-white tracking-widest uppercase">
          {group.categoria}
        </h2>
        <div className="h-[3px] w-20 bg-cubic-accent mt-2" />
      </div>

      {/* Subcategorías */}
      {hasSubs ? (
        <div className="space-y-10">
          {subcats.map(([sub, items]) => (
            <div key={sub}>
              {sub !== '_' && (
                <h3 className="font-bebas text-2xl text-cubic-muted tracking-widest uppercase mb-4">
                  — {sub}
                </h3>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {items.map((item, i) => (
                  <MenuItem key={`${item.nombre}-${i}`} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subcats.flatMap(([, items]) =>
            items.map((item, i) => (
              <MenuItem key={`${item.nombre}-${i}`} item={item} />
            ))
          )}
        </div>
      )}
    </section>
  );
}
