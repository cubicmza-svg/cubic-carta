'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MenuItem } from '@/lib/types';
import ToggleSwitch from '@/components/admin/ToggleSwitch';
import DeleteModal from '@/components/admin/DeleteModal';

const PAGE_SIZE = 20;

export default function MenuAdminPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [page, setPage] = useState(1);
  const [toDelete, setToDelete] = useState<MenuItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/items');
      if (res.ok) setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const categorias = [...new Set(items.map((i) => i.categoria))].sort();

  const filtered = items.filter((i) => {
    const matchSearch = i.nombre.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || i.categoria === filterCat;
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && i.activo) ||
      (filterStatus === 'inactive' && !i.activo);
    return matchSearch && matchCat && matchStatus;
  });

  const total = filtered.length;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  async function handleToggle(item: MenuItem) {
    setToggling(item.id);
    try {
      const res = await fetch(`/api/admin/items/${item.id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !item.activo }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, activo: !i.activo } : i));
      }
    } finally {
      setToggling(null);
    }
  }

  async function handleDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/items/${toDelete.id}`, { method: 'DELETE' });
      if (res.ok) {
        setItems((prev) => prev.filter((i) => i.id !== toDelete.id));
        setToDelete(null);
      }
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-widest">Carta</h1>
          <p className="font-dm text-cubic-muted text-sm">{total} ítems encontrados</p>
        </div>
        <div className="sm:ml-auto">
          <Link
            href="/admin/menu/nuevo"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cubic-accent text-black font-dm font-semibold text-sm hover:bg-green-400 transition-colors"
          >
            + Agregar ítem
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 px-4 py-2.5 rounded-lg bg-cubic-card border border-cubic-border text-white font-dm text-sm placeholder-cubic-muted focus:outline-none focus:border-cubic-accent transition-colors"
        />
        <select
          value={filterCat}
          onChange={(e) => { setFilterCat(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-lg bg-cubic-card border border-cubic-border text-white font-dm text-sm focus:outline-none focus:border-cubic-accent transition-colors"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => { setFilterStatus(e.target.value as typeof filterStatus); setPage(1); }}
          className="px-4 py-2.5 rounded-lg bg-cubic-card border border-cubic-border text-white font-dm text-sm focus:outline-none focus:border-cubic-accent transition-colors"
        >
          <option value="all">Todos</option>
          <option value="active">Activos</option>
          <option value="inactive">Inactivos</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-cubic-border overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <p className="font-bebas text-xl text-cubic-muted tracking-widest animate-pulse">CARGANDO...</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-dm text-cubic-muted">No se encontraron ítems</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cubic-border bg-[#13101A]">
                  {['Imagen', 'Nombre', 'Categoría', 'Precio', 'Estado', 'Acciones'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bebas text-sm text-cubic-muted tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((item, idx) => (
                  <tr
                    key={item.id}
                    className={`border-b border-cubic-border/50 hover:bg-cubic-card-hover/30 transition-colors ${idx % 2 === 0 ? 'bg-cubic-card' : 'bg-[#1E1A28]'}`}
                  >
                    {/* Imagen */}
                    <td className="px-4 py-3">
                      {item.imagen_url ? (
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                          <Image src={item.imagen_url} alt={item.nombre} fill className="object-cover" unoptimized />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-cubic-card-hover flex items-center justify-center">
                          <span className="font-bebas text-cubic-accent text-sm">{item.nombre[0]}</span>
                        </div>
                      )}
                    </td>

                    {/* Nombre */}
                    <td className="px-4 py-3">
                      <p className="font-dm font-semibold text-white text-sm">{item.nombre}</p>
                      {item.subcategoria && <p className="font-dm text-cubic-muted text-xs">{item.subcategoria}</p>}
                    </td>

                    {/* Categoría */}
                    <td className="px-4 py-3">
                      <span className="font-dm text-sm text-cubic-muted">{item.categoria}</span>
                    </td>

                    {/* Precio */}
                    <td className="px-4 py-3">
                      <span className="font-bebas text-cubic-accent text-lg">
                        {item.precio ? `$${item.precio.toLocaleString('es-AR')}` : '—'}
                      </span>
                    </td>

                    {/* Toggle */}
                    <td className="px-4 py-3">
                      <ToggleSwitch
                        checked={item.activo}
                        onChange={() => handleToggle(item)}
                        disabled={toggling === item.id}
                      />
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/menu/${item.id}/editar`}
                          className="p-2 rounded-lg text-cubic-muted hover:text-white hover:bg-cubic-card-hover transition-all"
                          title="Editar"
                        >
                          ✏
                        </Link>
                        <button
                          onClick={() => setToDelete(item)}
                          className="p-2 rounded-lg text-cubic-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Eliminar"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="font-dm text-xs text-cubic-muted">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-lg border border-cubic-border font-dm text-sm text-cubic-muted hover:text-white disabled:opacity-30 transition-colors"
            >
              ← Anterior
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded-lg border border-cubic-border font-dm text-sm text-cubic-muted hover:text-white disabled:opacity-30 transition-colors"
            >
              Siguiente →
            </button>
          </div>
        </div>
      )}

      {/* Delete modal */}
      {toDelete && (
        <DeleteModal
          nombre={toDelete.nombre}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
