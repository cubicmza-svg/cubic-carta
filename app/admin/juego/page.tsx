import { isAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import JuegoPanel from '@/components/admin/JuegoPanel';

export const dynamic = 'force-dynamic';

export default function JuegoPage() {
  if (!isAuthenticated()) redirect('/admin');
  return <JuegoPanel />;
}
