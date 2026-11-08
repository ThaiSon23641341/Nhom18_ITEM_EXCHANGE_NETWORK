import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ExpandableItemCard } from './ExpandableItemCard';

jest.mock('react-native-reanimated', () => ({
  __esModule: true,
  default: { View: 'AnimatedView' },
  useAnimatedStyle: () => ({}),
  useSharedValue: (value: number) => ({ value }),
  withTiming: (value: number) => value,
}));

jest.mock('tamagui', () => {
  const Native = jest.requireActual('react-native');
  return {
    Card: Native.View,
    Text: Native.Text,
    YStack: Native.View,
  };
});

describe('ExpandableItemCard', () => {
  test('toggles details accessibly while keeping text readable', async () => {
    const { getByLabelText, getByText, queryByText } = await render(
      <ExpandableItemCard
        title="Desk lamp"
        description="Works well"
        details="Available near campus"
      />,
    );
    const toggle = getByLabelText('Desk lamp, expand details');

    expect(queryByText('Available near campus')).toBeNull();
    fireEvent.press(toggle);

    await waitFor(() => {
      expect(getByLabelText('Desk lamp, collapse details')).toBeTruthy();
    });
    expect(getByText('Chi tiết')).toBeTruthy();
    expect(getByText('Available near campus').props.color).toBe('#475467');
  });
});
