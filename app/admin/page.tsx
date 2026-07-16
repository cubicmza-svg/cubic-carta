import { isAuthenticated } from '@/lib/adminAuth';
import LoginForm from '@/components/admin/LoginForm';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function AdminHub() {
  return (
    <div className="min-h-screen bg-cubic-bg flex flex-col">
      {/* Header */}
      <header className="border-b border-cubic-border px-6 py-4 flex items-center justify-between">
        <span className="font-bebas text-2xl tracking-widest text-white">
          CUBIC <span className="text-cubic-accent">·</span> ADMIN
        </span>
        <form action="/api/admin/logout" method="POST">
          <button
            type="submit"
            className="font-dm text-xs text-cubic-muted hover:text-white transition-colors tracking-widest uppercase"
          >
            Salir
          </button>
        </form>
      </header>

      {/* Hub */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-2xl flex flex-col gap-6">
          <p className="font-bebas text-cubic-muted text-sm tracking-widest uppercase text-center">
            Seleccioná una sección
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* CARTA */}
            <Link
              href="/admin/carta"
              className="group relative flex flex-col gap-3 p-8 rounded-2xl bg-cubic-card border border-cubic-border hover:border-cubic-accent transition-all duration-300"
            >
              <div className="text-4xl">🍽️</div>
              <div>
                <h2 className="font-bebas text-3xl tracking-widest text-white group-hover:text-cubic-accent transition-colors">
                  CARTA
                </h2>
                <p className="font-dm text-sm text-cubic-muted mt-1 leading-snug">
                  Gestioná los ítems del menú — agregar, editar, activar/desactivar.
                </p>
              </div>
              <span className="font-bebas text-xs tracking-widest text-cubic-muted uppercase mt-auto">
                Menú digital →
              </span>
            </Link>

            {/* ORDEN & REDES */}
            <Link
              href="/admin/studio"
              className="group relative flex flex-col gap-3 p-8 rounded-2xl bg-cubic-card border border-cubic-border hover:border-cubic-accent transition-all duration-300"
            >
              <div className="text-4xl">📐</div>
              <div>
                <h2 className="font-bebas text-3xl tracking-widest text-white group-hover:text-cubic-accent transition-colors">
                  ORDEN & REDES
                </h2>
                <p className="font-dm text-sm text-cubic-muted mt-1 leading-snug">
                  Calendario de contenido, pedidos de diseño y gestión de redes.
                </p>
              </div>
              <span className="font-bebas text-xs tracking-widest text-cubic-muted uppercase mt-auto">
                Estrategia →
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  const auth = isAuthenticated();
  return auth ? <AdminHub /> : <LoginForm />;
}
