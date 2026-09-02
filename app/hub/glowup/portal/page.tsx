import { isAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import GlowUpPortal from '@/components/hub/glowup/portal/GlowUpPortal';

export default function GlowUpPortalPage() {
  if (!isAuthenticated()) redirect('/hub');
  return <GlowUpPortal />;
}
