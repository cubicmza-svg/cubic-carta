import { isAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import BigBangHub from '@/components/hub/bigbang/BigBangHub';

export const dynamic = 'force-dynamic';

export default function BigBangPage() {
  if (!isAuthenticated()) redirect('/hub');
  return <BigBangHub />;
}
