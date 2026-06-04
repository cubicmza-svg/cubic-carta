import { getMenu, groupByCategoria } from '@/lib/getMenu';
import CategoryNav from '@/components/CategoryNav';
import MenuSection from '@/components/MenuSection';
import Logo from '@/components/Logo';

export const revalidate = 300; // ISR: revalidar cada 5 minutos

export default async function CartaPage() {
  const items = await getMenu();
  const grupos = groupByCategoria(items);
  const categorias = grupos.map((g) => g.categoria);

  return (
    <div className="min-h-screen bg-cubic-bg">
      {/* Header con logo */}
      <header className="w-full bg-cubic-bg border-b border-cubic-border">
        <Logo />
      </header>

      {/* Nav sticky de categorías */}
      <CategoryNav categorias={categorias} />

      {/* Contenido principal */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        {grupos.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-bebas text-3xl text-cubic-muted tracking-widest">
              Carta no disponible en este momento
            </p>
            <p className="font-dm text-cubic-muted mt-2 text-sm">
              Configurá el Google Sheet para ver la carta completa.
            </p>
          </div>
        ) : (
          grupos.map((grupo) => (
            <MenuSection key={grupo.categoria} group={grupo} />
          ))
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cubic-border py-8 text-center">
        <p className="font-bebas text-cubic-muted tracking-widest text-lg">
          CUBIC Café & Bar
        </p>
        <p className="font-dm text-cubic-muted text-xs mt-1 opacity-50">
          Precios en pesos argentinos · IVA incluido
        </p>
      </footer>
    </div>
  );
}
