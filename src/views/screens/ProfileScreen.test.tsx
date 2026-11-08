import { fireEvent, render } from '@testing-library/react-native';
import { router } from 'expo-router';
import { useAuthController } from '../../controllers/useAuthController';
import { ProfileScreen } from './ProfileScreen';

jest.mock('expo-router', () => ({ router: { replace: jest.fn(), push: jest.fn() } }));

jest.mock('lucide-react-native', () => ({
  Award: () => null,
  GraduationCap: () => null,
  Heart: () => null,
  LogOut: () => null,
  MapPin: () => null,
  Package: () => null,
  Pencil: () => null,
  ShieldCheck: () => null,
  UserRound: () => null,
}));

jest.mock('../../controllers/useAuthController', () => ({
  useAuthController: jest.fn(() => ({
    user: {
      id: '21036001',
      email: '21036001.nguyen@student.iuh.edu.vn',
      fullName: 'Local login name',
      studentId: '21036001',
      avatarUrl: '/uploads/old-avatar.jpg',
      faculty: 'Khoa cũ',
      className: 'Lớp cũ',
      successfulExchanges: 1,
      reputation: 20,
    },
    logout: jest.fn(),
  })),
}));

jest.mock('../../controllers/usePublicProfileController', () => ({
  usePublicProfileController: () => ({
    profile: {
      id: 'user-001',
      fullName: 'Public profile name',
      avatarUrl: '/uploads/old-avatar.jpg',
      faculty: 'Khoa Công nghệ thông tin',
      className: 'DHKTPM17A',
      successfulExchanges: 2,
      reputation: 60,
    },
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('shows the public profile name with the local account details', async () => {
    const { getByText, getByLabelText, queryByText } = await render(<ProfileScreen />);

    expect(getByText('Public profile name')).toBeTruthy();
    expect(getByText('21036001.nguyen@student.iuh.edu.vn')).toBeTruthy();
    expect(getByText('Khoa: Khoa Công nghệ thông tin')).toBeTruthy();
    expect(getByText('Lớp: DHKTPM17A')).toBeTruthy();
    expect(getByText('Giao dịch thành công: 2')).toBeTruthy();
    expect(getByText('Uy tín: 60')).toBeTruthy();
    expect(queryByText('Khoa: Khoa cũ')).toBeNull();
    expect(queryByText('Giao dịch thành công: 1')).toBeNull();
    expect(getByLabelText('Chỉnh sửa hồ sơ')).toBeTruthy();
    expect(getByLabelText('Khám phá đồ dùng')).toBeTruthy();
  });

  test('shows the newly saved account avatar when the public profile is stale', async () => {
    jest.mocked(useAuthController).mockReturnValue({
      user: {
        id: '21036001',
        email: '21036001.nguyen@student.iuh.edu.vn',
        fullName: 'Local login name',
        studentId: '21036001',
        phoneNumber: '0900000000',
        avatarUrl: '/uploads/new-avatar.jpg',
        faculty: 'Khoa cũ',
        className: 'Lớp cũ',
        role: 'student',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
      },
      logout: jest.fn(),
    } as unknown as ReturnType<typeof useAuthController>);

    const { getByLabelText } = await render(<ProfileScreen />);
    const avatar = getByLabelText('Ảnh đại diện Public profile name');

    expect(avatar.props.src).toContain('/uploads/new-avatar.jpg');
  });

  test('opens the profile editor', async () => {
    const { getByLabelText } = await render(<ProfileScreen />);

    fireEvent.press(getByLabelText('Chỉnh sửa hồ sơ'));

    expect(router.push).toHaveBeenCalledWith('/profile/edit');
  });

  test('logs out and navigates to the login screen', async () => {
    const { getByLabelText } = await render(<ProfileScreen />);
    const authCalls = jest.mocked(useAuthController).mock.results;
    const logout = authCalls[authCalls.length - 1]?.value.logout;

    fireEvent.press(getByLabelText('Đăng xuất'));

    expect(logout).toHaveBeenCalledTimes(1);
    expect(router.replace).toHaveBeenCalledWith('/login');
  });
});
