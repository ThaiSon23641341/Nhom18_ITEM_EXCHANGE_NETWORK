import { render } from '@testing-library/react-native';
import { ProductCard } from './ProductCard';

const mockOwnerBadge = jest.fn((_props: unknown) => null);

jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

jest.mock('lucide-react-native', () => ({
  Heart: () => null,
  MapPin: () => null,
  Tag: () => null,
}));

jest.mock('./OwnerBadge', () => ({
  OwnerBadge: (props: unknown) => mockOwnerBadge(props),
}));

jest.mock('tamagui', () => {
  const Native = jest.requireActual('react-native');
  return {
    Button: Native.Pressable,
    Card: Native.View,
    Image: Native.Image,
    Text: Native.Text,
    XStack: Native.View,
    YStack: Native.View,
  };
});

describe('ProductCard', () => {
  beforeEach(() => mockOwnerBadge.mockClear());

  test('passes owner identity and reputation to the shared badge', async () => {
    await render(
      <ProductCard
        itemId="item-001"
        title="Desk lamp"
        category="Electronics"
        location="Khu A"
        distance=""
        price="25.000đ"
        ownerName="Owner Example"
        faculty="Khoa Công nghệ thông tin"
        avatarUrl="/uploads/avatar.jpg"
        reputation={75}
        imageUrl=""
      />,
    );

    expect(mockOwnerBadge).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Owner Example',
      faculty: 'Khoa Công nghệ thông tin',
      avatarUrl: '/uploads/avatar.jpg',
      reputation: 75,
      compact: true,
    }));
  });
});
