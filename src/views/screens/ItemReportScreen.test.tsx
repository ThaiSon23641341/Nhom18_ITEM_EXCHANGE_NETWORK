import { render } from '@testing-library/react-native';
import { ItemReportScreen } from './ItemReportScreen';

jest.mock('expo-router', () => ({
  router: { canGoBack: () => false, back: jest.fn(), replace: jest.fn() },
  useLocalSearchParams: () => ({ id: 'item-001' }),
}));

jest.mock('../../controllers/useItemReportController', () => ({
  useItemReportController: () => ({
    item: { id: 'item-001', title: 'Giao trinh Lap trinh C' },
    isLoading: false,
    loadError: null,
    reason: 'other',
    setReason: jest.fn(),
    details: '',
    setDetails: jest.fn(),
    isSubmitting: false,
    submitError: null,
    submitted: false,
    submitReport: jest.fn(),
  }),
}));

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const Native = jest.requireActual('react-native');
  const Button = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <Native.Pressable {...props}>
      {typeof children === 'string' ? <Native.Text>{children}</Native.Text> : children}
    </Native.Pressable>
  );
  Button.Text = Native.Text;
  return {
    Button,
    ScrollView: Native.ScrollView,
    Text: Native.Text,
    TextArea: Native.TextInput,
    YStack: Native.View,
  };
});

describe('ItemReportScreen accessibility', () => {
  test('labels the report reason, details field, and submit action', async () => {
    const { getByLabelText, getByRole } = await render(<ItemReportScreen />);

    expect(getByRole('radio', { name: 'Lý do khác' }).props.accessibilityState).toMatchObject({
      checked: true,
    });
    expect(getByLabelText('Thông tin bổ sung cho báo cáo')).toBeTruthy();
    expect(getByRole('button', { name: 'Gửi báo cáo' })).toBeTruthy();
  });
});
