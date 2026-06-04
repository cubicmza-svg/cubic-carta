'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  nombre: string;
  rol: 'superadmin' | 'admin';
  activo: boolean;
}

export default function UsuariosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'authenticated' && session.user.role !== 'superadmin') {
      router.push('/admin/dashboard');
    }
  }, [status, session, router]);

  useEffect(() => {
    if (status === 'authenticated' && session.user.role === 'superadmin') {
      fetch('/api/admin/users')
        .then((r) => r.json())
        .then((data) => setUsers(Array.isArray(data) ? data : []))
        .finally(() => setLoading(false));
    }
  }, [status, session]);

  async function handleToggleUser(user: User) {
    if (user.id === session?.user?.id) return;
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !user.activo }),
    });
    if (res.ok) setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, activo: !u.activo } : u));
  }

  async function handleCreateUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError('');
    const data = new FormData(e.currentTarget);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: data.get('nombre'),
        email: data.get('email'),
        password: data.get('password'),
        rol: data.get('rol'),
      }),
    });
    if (res.ok) {
      const newUser = await res.json();
      setUsers((prev) => [...prev, newUser]);
      setShowModal(false);
    } else {
      const d = await res.json();
      setError(d.error || 'Error al crear usuario');
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="font-bebas text-xl text-cubic-muted tracking-widest animate-pulse">CARGANDO...</p>
      </div>
    );
  }

  const inputClass = 'w-full px-3 py-2.5 rounded-lg bg-[#211D2A] border border-cubic-border text-white font-dm text-sm placeholder-cubic-muted focus:outline-none focus:border-cubic-accent transition-colors';

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <div>
          <h1 className="font-bebas text-4xl text-white tracking-widest">Usuarios</h1>
          <p className="font-dm text-cubic-muted text-sm">{users.length} usuarios registrados</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="ml-auto px-5 py-2.5 rounded-lg bg-cubic-accent text-black font-dm font-semibold text-sm hover:bg-green-400 transition-colors"
        >
          + Nuevo usuario
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-cubic-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-cubic-border bg-[#13101A]">
              {['Nombre', 'Email', 'Rol', 'Estado', 'Acciones'].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-bebas text-sm text-cubic-muted tracking-widest">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-cubic-border/50 bg-cubic-card hover:bg-cubic-card-hover/30 transition-colors">
                <td className="px-4 py-3 font-dm font-semibold text-white text-sm">{user.nombre}</td>
                <td className="px-4 py-3 font-dm text-cubic-muted text-sm">{user.email}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-full font-dm text-xs font-semibold
                    ${user.rol === 'superadmin' ? 'bg-cubic-accent/20 text-cubic-accent' : 'bg-cubic-border text-cubic-muted'}`}>
                    {user.rol}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex px-2.5 py-1 rounded-full font-dm text-xs ${user.activo ? 'text-cubic-accent' : 'text-amber-500'}`}>
                    {user.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {user.id !== session?.user?.id && (
                    <button
                      onClick={() => handleToggleUser(user)}
                      className="font-dm text-xs text-cubic-muted hover:text-white transition-colors"
                    >
                      {user.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  )}
                  {user.id === session?.user?.id && (
                    <span className="font-dm text-xs text-cubic-muted opacity-40">Vos</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal nuevo usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-cubic-card border border-cubic-border p-6">
            <h2 className="font-bebas text-2xl text-white tracking-wide mb-5">Nuevo usuario</h2>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block font-dm text-sm text-cubic-muted mb-1.5">Nombre</label>
                <input name="nombre" required placeholder="Nombre completo" className={inputClass} />
              </div>
              <div>
                <label className="block font-dm text-sm text-cubic-muted mb-1.5">Email</label>
                <input name="email" type="email" required placeholder="email@ejemplo.com" className={inputClass} />
              </div>
              <div>
                <label className="block font-dm text-sm text-cubic-muted mb-1.5">Contraseña</label>
                <input name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className={inputClass} />
              </div>
              <div>
                <label className="block font-dm text-sm text-cubic-muted mb-1.5">Rol</label>
                <select name="rol" className={inputClass}>
                  <option value="admin">admin</option>
                  <option value="superadmin">superadmin</option>
                </select>
              </div>
              {error && <p className="font-dm text-red-400 text-sm">{error}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-cubic-accent text-black font-dm font-semibold text-sm hover:bg-green-400 transition-colors disabled:opacity-50"
                >
                  {saving ? 'Creando...' : 'Crear usuario'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-cubic-border text-cubic-muted font-dm text-sm hover:text-white transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
