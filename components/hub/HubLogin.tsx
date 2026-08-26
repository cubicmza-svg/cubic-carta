'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HubLogin() {
  const router = useRouter();
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });
    if (res.ok) { router.refresh(); }
    else { setError('Contraseña incorrecta'); setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #0a0812 0%, #130f1e 50%, #0a0812 100%)' }}>

      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #4ADE80, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #a855f7, transparent)', filter: 'blur(80px)' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-3"
          style={{ background: 'radial-gradient(circle, #ec4899, transparent)', filter: 'blur(120px)' }} />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Marcas en miniatura */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className="font-bebas text-base tracking-widest text-white/40">CUBIC</span>
          <span className="text-white/20">·</span>
          <span className="font-bebas text-base tracking-widest text-white/40">BIG BANG</span>
          <span className="text-white/20">·</span>
          <span className="font-bebas text-base tracking-widest text-white/40">GLOW UP</span>
        </div>

        {/* Card login */}
        <div className="rounded-3xl border p-8"
          style={{ background: 'rgba(26,23,33,0.85)', borderColor: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #4ADE80 0%, #a855f7 100%)' }}>
              <span className="text-2xl">⚡</span>
            </div>
            <h1 className="font-bebas text-3xl text-white tracking-widest">PORTAL ADMIN</h1>
            <p className="font-dm text-xs text-white/40 tracking-widest mt-1 uppercase">Gestión de marcas</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-dm text-xs text-white/50 mb-2 uppercase tracking-widest">Contraseña</label>
              <input name="password" type="password" autoFocus required placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl text-white font-dm text-sm placeholder-white/20 focus:outline-none transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                onFocus={e => e.target.style.borderColor = 'rgba(74,222,128,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
            </div>

            {error && (
              <p className="font-dm text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-dm font-bold text-sm text-black transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #4ADE80 0%, #22c55e 100%)' }}>
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
