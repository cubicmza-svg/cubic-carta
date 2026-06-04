import { getAllItems } from '@/lib/sheetsAdmin';
import ItemForm from '@/components/admin/ItemForm';
import { notFound } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default async function EditarItemPage({ params }: Props) {
  let item = null;
  let categorias: string[] = [];
  let subcategoriasMap: Record<string, string[]> = {};

  try {
    const items = await getAllItems();
    item = items.find((i) => i.id === params.id) ?? null;
    categorias = [...new Set(items.map((i) => i.categoria))].sort();
    for (const i of items) {
      if (!subcategoriasMap[i.categoria]) subcategoriasMap[i.categoria] = [];
      if (i.subcategoria && !subcategoriasMap[i.categoria].includes(i.subcategoria)) {
        subcategoriasMap[i.categoria].push(i.subcategoria);
      }
    }
  } catch {
    // sheetsAdmin error — still render, item will be null
  }

  if (!item) notFound();

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest">Editar ítem</h1>
        <p className="font-dm text-cubic-muted text-sm mt-1">{item.nombre}</p>
      </div>
      <ItemForm item={item} categorias={categorias} subcategoriasMap={subcategoriasMap} />
    </div>
  );
}
