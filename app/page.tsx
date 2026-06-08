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

      {/* Banner promocional */}
      <div className="relative w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/banner.jpg"
          alt="CUBIC Café & Bar — Subí tu foto etiquetándonos y obtené un 5% off"
          className="w-full h-auto block"
        />
        {/* Overlay oscuro semitransparente */}
        <div className="absolute inset-0 bg-black/50" />
        {/* Botón centrado */}
        <div className="absolute inset-0 flex items-center justify-center">
          <a
            href="https://www.instagram.com/cubic.mza/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#4ADE80] text-black font-dm font-bold text-sm md:text-base tracking-wide hover:bg-green-400 active:scale-95 transition-all duration-200 shadow-lg"
          >
            {/* Ícono oficial Instagram */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-5 h-5 flex-shrink-0"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
            </svg>
            SEGUINOS EN INSTAGRAM
          </a>
        </div>
      </div>

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
              Ingresá al panel /admin y cargá los datos iniciales.
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
