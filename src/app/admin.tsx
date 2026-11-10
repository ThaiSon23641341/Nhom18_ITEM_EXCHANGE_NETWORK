import { Redirect } from 'expo-router';
import { useAuthController } from '../controllers/useAuthController';
import { AdminScreen } from '../views/screens/AdminScreen';

export default function AdminRoute() {
  const { user } = useAuthController();
  if (!user) return <Redirect href="/login" />;
  if (user.role !== 'moderator') return <Redirect href="/(tabs)" />;
  return <AdminScreen />;
}
