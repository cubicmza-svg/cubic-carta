import { getAllItems } from '@/lib/sheetsAdmin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import type { MenuItem } from '@/lib/types';

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-xl bg-cubic-card border border-cubic-border p-6">
      <p className="font-dm text-cubic-muted text-sm">{label}</p>
      <p className="font-bebas text-4xl text-white tracking-wide mt-1">{value}</p>
      {sub && <p className="font-dm text-xs text-cubic-muted mt-1">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  let items: MenuItem[] = [];
  let error = false;

  try {
    items = await getAllItems();
  } catch {
    error = true;
  }

  const activos = items.filter((i) => i.activo).length;
  const inactivos = items.length - activos;
  const categorias = new Set(items.map((i) => i.categoria)).size;
  const ultimo = items.at(-1);

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-bebas text-4xl text-white tracking-widest">Dashboard</h1>
        <p className="font-dm text-cubic-muted text-sm mt-1">
          Bienvenido, <span className="text-white">{session?.user?.name}</span>
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <p className="font-dm text-sm text-yellow-400">
            ⚠ No se pudo conectar con Google Sheets. Verificá la configuración del Service Account.
          </p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total ítems" value={items.length} />
        <StatCard label="Activos" value={activos} sub="disponibles en la carta" />
        <StatCard label="Inactivos" value={inactivos} sub="ocultos del menú" />
        <StatCard label="Categorías" value={categorias} />
      </div>

      {/* Último ítem */}
      {ultimo && (
        <div className="rounded-xl bg-cubic-card border border-cubic-border p-6">
          <p className="font-bebas text-lg text-cubic-muted tracking-widest mb-3">ÚLTIMO ÍTEM AGREGADO</p>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1">
              <p className="font-dm font-semibold text-white">{ultimo.nombre}</p>
              <p className="font-dm text-cubic-muted text-sm">{ultimo.categoria}{ultimo.subcategoria ? ` · ${ultimo.subcategoria}` : ''}</p>
            </div>
            <span className="font-bebas text-2xl text-cubic-accent">
              {ultimo.precio ? `$${ultimo.precio.toLocaleString('es-AR')}` : 'Sin precio'}
            </span>
          </div>
        </div>
      )}

      {/* Quick links */}
      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href="/admin/menu/nuevo"
          className="px-5 py-2.5 rounded-lg bg-cubic-accent text-black font-dm font-semibold text-sm hover:bg-green-400 transition-colors"
        >
          + Agregar ítem
        </a>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="px-5 py-2.5 rounded-lg border border-cubic-border text-cubic-muted font-dm text-sm hover:text-white hover:border-white transition-colors"
        >
          Ver carta pública ↗
        </a>
      </div>
    </div>
  );
}
