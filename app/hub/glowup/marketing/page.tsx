import { isAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import GUMarketing from '@/components/hub/glowup/marketing/GUMarketing';

export default function GlowUpMarketingPage() {
  if (!isAuthenticated()) redirect('/hub');
  return <GUMarketing />;
}
