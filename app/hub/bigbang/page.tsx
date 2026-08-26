import Link from 'next/link';
import { isAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function BigBangPage() {
  if (!isAuthenticated()) redirect('/hub');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8"
      style={{ background: 'linear-gradient(160deg, #0a0812 0%, #0e0b18 100%)' }}>
      <div className="text-6xl">🎈</div>
      <h1 className="font-bebas text-5xl text-white tracking-widest">BIG BANG</h1>
      <p className="font-dm text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Pelotero & Eventos — en construcción
      </p>
      <Link href="/hub"
        className="font-dm text-xs uppercase tracking-widest mt-4 transition-colors"
        style={{ color: 'rgba(168,85,247,0.7)' }}>
        ← Volver al hub
      </Link>
    </div>
  );
}
