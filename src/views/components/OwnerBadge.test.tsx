import { render } from '@testing-library/react-native';
import { OwnerBadge } from './OwnerBadge';

jest.mock('lucide-react-native', () => ({
  ShieldCheck: () => null,
  UserRound: () => null,
}));

jest.mock('../../services/api/uploadService', () => ({
  resolveMediaUrl: (url: string) => url,
}));

jest.mock('tamagui', () => {
  const Native = jest.requireActual('react-native');
  return {
    Text: Native.Text,
    XStack: Native.View,
    YStack: Native.View,
  };
});

describe('OwnerBadge', () => {
  test('shows available owner details and reputation accessibly', async () => {
    const { getByText, getByLabelText } = await render(
      <OwnerBadge
        name="Owner Example"
        faculty="Khoa Công nghệ thông tin"
        avatarUrl="/uploads/avatar.jpg"
        reputation={75}
      />,
    );

    expect(getByText('Owner Example').props.color).toBe('#0D6247');
    expect(getByText('Khoa Công nghệ thông tin').props.color).toBe('#475467');
    expect(getByText('75')).toBeTruthy();
    expect(getByLabelText('Điểm uy tín 75')).toBeTruthy();
  });

  test('renders a fallback name when owner details are missing', async () => {
    const { getByText, queryByText } = await render(<OwnerBadge />);

    expect(getByText('Người đăng')).toBeTruthy();
    expect(queryByText('undefined')).toBeNull();
  });
});
