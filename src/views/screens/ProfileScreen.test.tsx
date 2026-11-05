import { render } from '@testing-library/react-native';
import { ProfileScreen } from './ProfileScreen';

jest.mock('expo-router', () => ({ router: { replace: jest.fn(), push: jest.fn() } }));

jest.mock('lucide-react-native', () => ({
  Heart: () => null,
  MapPin: () => null,
  Package: () => null,
  UserRound: () => null,
}));

jest.mock('../../controllers/useAuthController', () => ({
  useAuthController: () => ({
    user: {
      id: '21036001',
      email: '21036001.nguyen@student.iuh.edu.vn',
      fullName: 'Local login name',
      studentId: '21036001',
      avatarUrl: '',
    },
  }),
}));

jest.mock('../../controllers/usePublicProfileController', () => ({
  usePublicProfileController: () => ({
    profile: { id: 'user-001', fullName: 'Public profile name', avatarUrl: '' },
    isLoading: false,
    error: null,
    retry: jest.fn(),
  }),
}));

jest.mock('../../controllers/useFavoritesController', () => ({
  useFavoritesController: (() => {
    const favorites: never[] = [];
    return () => ({
      favorites,
      isLoading: false,
      error: null,
      pendingItemIds: new Set<string>(),
      retry: jest.fn(),
      toggleFavorite: jest.fn(),
    });
  })(),
}));

jest.mock('tamagui', () => {
  const Native = jest.requireActual('react-native');
  const Button = ({ children, ...props }: { children?: unknown; [key: string]: unknown }) => (
    <Native.Pressable {...props}>
      {typeof children === 'string' ? <Native.Text>{children}</Native.Text> : children}
    </Native.Pressable>
  );
  Button.Text = Native.Text;
  return {
    Button,
    Image: Native.Image,
    ScrollView: Native.ScrollView,
    Text: Native.Text,
    XStack: Native.View,
    YStack: Native.View,
  };
});

describe('ProfileScreen', () => {
  test('shows the public profile name with the local account details', async () => {
    const { getByText, getByLabelText } = await render(<ProfileScreen />);

    expect(getByText('Public profile name')).toBeTruthy();
    expect(getByText('21036001.nguyen@student.iuh.edu.vn')).toBeTruthy();
    expect(getByLabelText('Khám phá đồ dùng')).toBeTruthy();
  });
});
