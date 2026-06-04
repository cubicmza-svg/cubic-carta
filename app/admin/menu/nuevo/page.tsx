import { getAllItems } from '@/lib/sheetsAdmin';
import ItemForm from '@/components/admin/ItemForm';

export default async function NuevoItemPage() {
  let categorias: string[] = [];
  let subcategoriasMap: Record<string, string[]> = {};

  try {
    const items = await getAllItems();
    categorias = [...new Set(items.map((i) => i.categoria))].sort();
    for (const item of items) {
      if (!subcategoriasMap[item.categoria]) subcategoriasMap[item.categoria] = [];
      if (item.subcategoria && !subcategoriasMap[item.categoria].includes(item.subcategoria)) {
        subcategoriasMap[item.categoria].push(item.subcategoria);
      }
    }
  } catch {
    // Si no hay conexión, el formulario funciona con categorías vacías
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest">Nuevo ítem</h1>
        <p className="font-dm text-cubic-muted text-sm mt-1">Agregar un plato o bebida a la carta</p>
      </div>
      <ItemForm categorias={categorias} subcategoriasMap={subcategoriasMap} />
    </div>
  );
}
