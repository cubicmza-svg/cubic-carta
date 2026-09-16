import Link from 'next/link';
import { isAuthenticatedAsync } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import BBWebHub from '@/components/hub/bigbang/web/BBWebHub';
export const dynamic = 'force-dynamic';

export default async function BigBangWebPage() {
  if (!await isAuthenticatedAsync()) redirect('/hub');
  return (
    <div className="min-h-screen" style={{ background: '#f9fafb' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #f3f4f6', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/hub/bigbang" style={{ fontSize: 12, color: '#9ca3af', textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 2 }}>
            ← Big Bang
          </Link>
          <span style={{ color: '#e5e7eb' }}>|</span>
          <span style={{ fontSize: 20 }}>🌐</span>
          <span style={{ fontWeight: 800, fontSize: 16, letterSpacing: 2, textTransform: 'uppercase', color: '#111827' }}>Página Web</span>
        </div>
        <a href="https://bigbangpelotero.com" target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: '#3b82f6', textDecoration: 'none' }}>
          Ver web pública →
        </a>
      </div>

      <BBWebHub />
    </div>
  );
}
