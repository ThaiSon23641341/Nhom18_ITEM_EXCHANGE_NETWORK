import { fireEvent, render } from '@testing-library/react-native';
import type { Item } from '../../models/itemModel';
import { ItemCardGrid } from './ItemCardGrid';

jest.mock('lucide-react-native', () => ({
  ImageOff: () => null,
  MapPin: () => null,
}));

jest.mock('../../services/api/uploadService', () => ({
  resolveMediaUrl: (url: string) => url,
}));

jest.mock('./OwnerBadge', () => ({
  OwnerBadge: ({
    name,
    faculty,
    reputation,
  }: { name?: string; faculty?: string; reputation?: number }) => {
    const Native = jest.requireActual('react-native');
    return (
      <Native.View>
        <Native.Text>{name}</Native.Text>
        <Native.Text>{faculty}</Native.Text>
        <Native.Text>{reputation}</Native.Text>
      </Native.View>
    );
  },
}));

jest.mock('tamagui', () => {
  const Native = jest.requireActual('react-native');
  return {
    Card: Native.View,
    Text: Native.Text,
    XStack: Native.View,
    YStack: Native.View,
  };
});

const item: Item = {
  id: 'item-001',
  title: 'Desk lamp',
  description: 'Works well',
  category: 'electronics',
  condition: 'good',
  imageUrl: '',
  status: 'available',
  ownerId: 'user-001',
  ownerName: 'Owner Example',
  ownerFaculty: 'Khoa Công nghệ thông tin',
  ownerReputation: 75,
  priceVnd: 25000,
  location: 'Khu A, IUH',
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

describe('ItemCardGrid', () => {
  test('shows the owner, formatted price, location, and handles press', async () => {
    const onPress = jest.fn();
    const { getByText, getByLabelText } = await render(
      <ItemCardGrid item={item} onPress={onPress} />,
    );

    expect(getByText('Owner Example')).toBeTruthy();
    expect(getByText('Khoa Công nghệ thông tin')).toBeTruthy();
    expect(getByText('75')).toBeTruthy();
    expect(getByText('25.000đ')).toBeTruthy();
    expect(getByText('Khu A, IUH')).toBeTruthy();
    fireEvent.press(getByLabelText('Xem chi tiết Desk lamp'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('shows free format when price is zero', async () => {
    const { getByText } = await render(
      <ItemCardGrid item={{ ...item, priceVnd: 0 }} onPress={jest.fn()} />,
    );

    expect(getByText('Miễn phí')).toBeTruthy();
  });
});
