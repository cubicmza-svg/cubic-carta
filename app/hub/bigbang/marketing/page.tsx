import { isAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import BBMarketing from '@/components/hub/bigbang/marketing/BBMarketing';
export const dynamic = 'force-dynamic';
export default function BigBangMarketingPage() {
  if (!isAuthenticated()) redirect('/hub');
  return <BBMarketing />;
}
