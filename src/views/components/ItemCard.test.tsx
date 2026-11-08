import { render } from '@testing-library/react-native';
import { ItemCard } from './ItemCard';

jest.mock('tamagui', () => {
  const Native = jest.requireActual('react-native');
  return {
    Card: Native.View,
    Text: Native.Text,
    YStack: Native.View,
  };
});

describe('ItemCard', () => {
  test('renders its title and description with readable foreground colors', async () => {
    const { getByText } = await render(
      <ItemCard title="Desk lamp" description="Works well" />,
    );

    expect(getByText('Desk lamp').props.color).toBe('#172033');
    expect(getByText('Works well').props.color).toBe('#475467');
  });
});
