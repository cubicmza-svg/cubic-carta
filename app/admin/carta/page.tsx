import { isAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import CartaPdfPanel from '@/components/admin/CartaPdfPanel';

export const dynamic = 'force-dynamic';

export default function CartaAdminPage() {
  if (!isAuthenticated()) redirect('/admin');
  return <CartaPdfPanel />;
}
