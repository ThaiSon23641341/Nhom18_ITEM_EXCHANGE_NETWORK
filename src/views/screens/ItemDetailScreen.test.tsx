import { fireEvent, render } from '@testing-library/react-native';
import { ItemDetailScreen } from './ItemDetailScreen';

const mockToggleFavorite = jest.fn();

jest.mock('expo-router', () => ({
  router: { push: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ id: 'item-001' }),
}));

jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => null,
  CalendarDays: () => null,
  ChevronRight: () => null,
  Heart: () => null,
  MapPin: () => null,
  PackageCheck: () => null,
  Share2: () => null,
  ShieldCheck: () => null,
  Tag: () => null,
  UserRound: () => null,
}));

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { View: 'View' },
  useAnimatedStyle: () => ({}),
  useSharedValue: (value: number) => ({ value }),
  withTiming: (value: number) => value,
}));

jest.mock('../../controllers/useAuthController', () => ({
  useAuthController: () => ({ user: { id: 'user-002' } }),
}));

jest.mock('../../controllers/useItemDetailController', () => ({
  useItemDetailController: () => ({
    item: {
      id: 'item-001',
      title: 'Sample item',
      description: 'Sample description',
      category: 'Study tools',
      condition: 'good',
      imageUrl: '',
      status: 'available',
      ownerId: 'user-001',
      createdAt: '2026-11-01T00:00:00.000Z',
      updatedAt: '2026-11-01T00:00:00.000Z',
    },
    isLoading: false,
    loadError: null,
    retry: jest.fn(),
  }),
}));

jest.mock('../../controllers/useFavoritesController', () => ({
  useFavoritesController: () => ({
    favorites: [],
    isLoading: false,
    error: null,
    pendingItemIds: new Set<string>(),
    toggleFavorite: mockToggleFavorite,
  }),
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

describe('ItemDetailScreen favorite accessibility', () => {
  beforeEach(() => mockToggleFavorite.mockClear());

  test('labels the favorite control and sends the selected item ID', async () => {
    const { getByLabelText, getByRole } = await render(<ItemDetailScreen />);
    const favoriteButton = getByLabelText('Lưu Sample item vào danh sách yêu thích');

    expect(getByRole('button', { name: 'Lưu Sample item vào danh sách yêu thích' })).toBeTruthy();
    await fireEvent.press(favoriteButton);
    expect(mockToggleFavorite).toHaveBeenCalledWith('item-001');
  });
});
