'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
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

    if (res.ok) {
      router.refresh();
    } else {
      setError('Contraseña incorrecta');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F0D14]">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-bebas text-6xl text-white tracking-widest">CUBIC</h1>
          <div className="mx-auto mt-2 h-[3px] w-16 bg-[#4ADE80]" />
          <p className="font-dm text-[#9B97A8] text-sm tracking-widest mt-3">PANEL DE ADMINISTRACIÓN</p>
        </div>

        <div className="rounded-2xl bg-[#1A1721] border border-[#2D2840] p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-dm text-sm text-[#9B97A8] mb-2">Contraseña</label>
              <input
                name="password"
                type="password"
                autoFocus
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-[#211D2A] border border-[#2D2840] text-white font-dm text-sm placeholder-[#9B97A8] focus:outline-none focus:border-[#4ADE80] transition-colors"
              />
            </div>

            {error && (
              <p className="font-dm text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg bg-[#4ADE80] text-black font-dm font-bold text-sm hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
