import { isAuthenticated } from '@/lib/adminAuth';
import LoginForm from '@/components/admin/LoginForm';
import AdminPanel from '@/components/admin/AdminPanel';

export const dynamic = 'force-dynamic';

export default function AdminPage() {
  const auth = isAuthenticated();
  return auth ? <AdminPanel /> : <LoginForm />;
}
