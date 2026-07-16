import { isAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import StudioPanel from '@/components/admin/StudioPanel';

export const dynamic = 'force-dynamic';

export default function StudioPage() {
  if (!isAuthenticated()) redirect('/admin');
  return <StudioPanel />;
}
