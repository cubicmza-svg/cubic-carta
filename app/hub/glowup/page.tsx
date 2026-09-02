import { isAuthenticated } from '@/lib/adminAuth';
import { redirect } from 'next/navigation';
import GlowUpHub from '@/components/hub/glowup/GlowUpHub';

export default function GlowUpPage() {
  if (!isAuthenticated()) redirect('/hub');
  return <GlowUpHub />;
}
