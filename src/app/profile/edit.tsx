import { Redirect } from 'expo-router';
import { useAuthController } from '../../controllers/useAuthController';
import { ProfileEditScreen } from '../../views/screens/ProfileEditScreen';

export default function ProfileEditRoute() {
  const { isAuthenticated } = useAuthController();

  if (!isAuthenticated) return <Redirect href="/login" />;

  return <ProfileEditScreen />;
}
