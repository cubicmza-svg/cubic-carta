'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/admin/menu', label: 'Carta', icon: '☰' },
  { href: '/admin/usuarios', label: 'Usuarios', icon: '◈' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);

  const isSuperadmin = session?.user?.role === 'superadmin';

  const links = NAV.filter((n) => n.href !== '/admin/usuarios' || isSuperadmin);

  const NavLinks = () => (
    <nav className="flex flex-col gap-1 mt-6">
      {links.map((n) => {
        const active = pathname.startsWith(n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            onClick={() => setOpen(false)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-dm text-sm transition-all duration-200
              ${active
                ? 'bg-cubic-accent text-black font-semibold'
                : 'text-cubic-muted hover:text-white hover:bg-white/5'
              }`}
          >
            <span className="text-base">{n.icon}</span>
            {n.label}
          </Link>
        );
      })}
    </nav>
  );

  const UserFooter = () => (
    <div className="border-t border-cubic-border p-4">
      <p className="font-dm text-white text-sm font-semibold truncate">{session?.user?.name}</p>
      <p className="font-dm text-cubic-muted text-xs truncate">{session?.user?.email}</p>
      <button
        onClick={() => signOut({ callbackUrl: '/admin/login' })}
        className="mt-3 w-full text-left font-dm text-xs text-cubic-muted hover:text-red-400 transition-colors"
      >
        Cerrar sesión →
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile topbar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-[#13101A] border-b border-cubic-border">
        <span className="font-bebas text-xl text-white tracking-widest">CUBIC ADMIN</span>
        <button onClick={() => setOpen(!open)} className="text-cubic-accent text-2xl leading-none">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/60"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-[#13101A] border-r border-cubic-border flex flex-col transform transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-6 border-b border-cubic-border">
          <span className="font-bebas text-2xl text-white tracking-widest">CUBIC</span>
          <p className="font-dm text-cubic-muted text-xs tracking-widest">PANEL DE ADMIN</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          <NavLinks />
        </div>
        <UserFooter />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed top-0 left-0 h-full w-60 bg-[#13101A] border-r border-cubic-border z-40">
        <div className="p-6 border-b border-cubic-border">
          <span className="font-bebas text-2xl text-white tracking-widest">CUBIC</span>
          <p className="font-dm text-cubic-muted text-xs tracking-widest">PANEL DE ADMIN</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3">
          <NavLinks />
        </div>
        <UserFooter />
      </aside>
    </>
  );
}
