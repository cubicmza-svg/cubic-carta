import type { Metadata } from 'next';
import AdminSessionProvider from '@/components/admin/SessionProvider';
import Sidebar from '@/components/admin/Sidebar';

export const metadata: Metadata = {
  title: 'CUBIC Admin',
  robots: 'noindex, nofollow',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSessionProvider>
      <div className="min-h-screen" style={{ backgroundColor: '#0F0D14' }}>
        <Sidebar />
        {/* Offset for desktop sidebar / mobile topbar */}
        <div className="md:pl-60 pt-14 md:pt-0">
          <main className="min-h-screen p-6 md:p-8">{children}</main>
        </div>
      </div>
    </AdminSessionProvider>
  );
}
