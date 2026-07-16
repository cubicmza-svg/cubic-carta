import { isAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import AdminPanel from '@/components/admin/AdminPanel';

export const dynamic = 'force-dynamic';

export default function CartaAdminPage() {
  if (!isAuthenticated()) redirect('/admin');
  return <AdminPanel />;
}
