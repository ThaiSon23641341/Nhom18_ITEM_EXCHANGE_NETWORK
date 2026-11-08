import { fireEvent, render } from '@testing-library/react-native';
import type { Item } from '../../models/itemModel';
import { ItemCardLarge } from './ItemCardLarge';

jest.mock('lucide-react-native', () => ({
  ImageOff: () => null,
  MapPin: () => null,
  Tag: () => null,
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
  status: 'reserved',
  ownerId: 'user-001',
  ownerName: 'Owner Example',
  ownerFaculty: 'Khoa Công nghệ thông tin',
  ownerReputation: 75,
  priceVnd: 0,
  location: 'Khu A, IUH',
  createdAt: '2026-11-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

describe('ItemCardLarge', () => {
  test('shows owner, free price, location, and reserved status and handles press', async () => {
    const onPress = jest.fn();
    const { getByText, getByLabelText } = await render(
      <ItemCardLarge item={item} onPress={onPress} />,
    );

    expect(getByText('Owner Example')).toBeTruthy();
    expect(getByText('Khoa Công nghệ thông tin')).toBeTruthy();
    expect(getByText('75')).toBeTruthy();
    expect(getByText('Miễn phí')).toBeTruthy();
    expect(getByText('Khu A, IUH')).toBeTruthy();
    expect(getByText('Đang giữ')).toBeTruthy();
    fireEvent.press(getByLabelText('Xem chi tiết Desk lamp'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  test('shows exchange format when the item has no price', async () => {
    const { getByText } = await render(
      <ItemCardLarge item={{ ...item, priceVnd: undefined }} onPress={jest.fn()} />,
    );

    expect(getByText('Trao đổi')).toBeTruthy();
  });
});
