import Link from 'next/link';
import { isAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default function BigBangMarketingPage() {
  if (!isAuthenticated()) redirect('/hub');
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8"
      style={{ background: 'linear-gradient(160deg, #020818 0%, #050d24 100%)' }}>
      <div className="text-6xl">🎯</div>
      <h1 className="font-bebas text-5xl text-white tracking-widest">MARKETING</h1>
      <p className="font-dm text-sm text-white/40">En construcción</p>
      <Link href="/hub/bigbang" className="font-dm text-xs uppercase tracking-widest text-violet-400/70 hover:text-violet-400 transition-colors mt-4">
        ← Big Bang
      </Link>
    </div>
  );
}
