'use client';

interface Props {
  nombre: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}

export default function DeleteModal({ nombre, onConfirm, onCancel, loading }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-cubic-card border border-cubic-border p-6 shadow-2xl">
        <div className="mb-4 flex items-center gap-3">
          <span className="text-3xl">⚠</span>
          <h2 className="font-bebas text-2xl text-white tracking-wide">Eliminar ítem</h2>
        </div>
        <p className="font-dm text-cubic-muted text-sm mb-6">
          ¿Eliminás{' '}
          <span className="text-white font-semibold">"{nombre}"</span>?{' '}
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg font-dm text-sm text-cubic-muted border border-cubic-border hover:border-white hover:text-white transition-all duration-200"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg font-dm text-sm text-white bg-red-500 hover:bg-red-600 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Eliminando...' : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
