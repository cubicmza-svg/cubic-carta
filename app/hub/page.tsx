import { isAuthenticated } from '@/lib/adminAuth';
import HubLogin from '@/components/hub/HubLogin';
import HubLanding from '@/components/hub/HubLanding';

export const dynamic = 'force-dynamic';

export default function HubPage() {
  return isAuthenticated() ? <HubLanding /> : <HubLogin />;
}
