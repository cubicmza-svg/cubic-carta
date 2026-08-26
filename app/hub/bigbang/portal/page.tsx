import { isAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import BigBangPortal from '@/components/hub/bigbang/portal/BigBangPortal';
export const dynamic = 'force-dynamic';
export default function BigBangPortalPage() {
  if (!isAuthenticated()) redirect('/hub');
  return <BigBangPortal />;
}
