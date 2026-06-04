'use client';

import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') router.push('/admin/dashboard');
  }, [status, router]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData(e.currentTarget);
    const result = await signIn('credentials', {
      email: data.get('email'),
      password: data.get('password'),
      redirect: false,
    });

    if (result?.error) {
      setError('Email o contraseña incorrectos');
      setLoading(false);
    } else {
      router.push('/admin/dashboard');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0F0D14' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-bebas text-5xl text-white tracking-widest">CUBIC</h1>
          <p className="font-dm text-cubic-muted text-sm tracking-widest mt-1">PANEL DE ADMINISTRACIÓN</p>
          <div className="mx-auto mt-3 h-[2px] w-12 bg-cubic-accent" />
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-cubic-card border border-cubic-border p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block font-dm text-sm text-cubic-muted mb-1.5">Email</label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                required
                placeholder="admin@cubic.com"
                className="w-full px-4 py-3 rounded-lg bg-[#211D2A] border border-cubic-border text-white font-dm text-sm placeholder-cubic-muted focus:outline-none focus:border-cubic-accent transition-colors"
              />
            </div>

            <div>
              <label className="block font-dm text-sm text-cubic-muted mb-1.5">Contraseña</label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-[#211D2A] border border-cubic-border text-white font-dm text-sm placeholder-cubic-muted focus:outline-none focus:border-cubic-accent transition-colors"
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
              className="w-full py-3 rounded-lg bg-cubic-accent text-black font-dm font-semibold text-sm hover:bg-green-400 transition-colors disabled:opacity-50"
            >
              {loading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>

        <p className="text-center font-dm text-xs text-cubic-muted mt-6 opacity-50">
          CUBIC Café & Bar © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
