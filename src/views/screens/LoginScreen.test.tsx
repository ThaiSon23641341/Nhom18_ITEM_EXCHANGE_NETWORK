import { fireEvent, render } from '@testing-library/react-native';
import { LoginScreen } from './LoginScreen';

jest.mock('lucide-react-native', () => ({
  CheckCircle2: () => null,
  Eye: () => null,
  EyeOff: () => null,
  Leaf: () => null,
  Lock: () => null,
  Mail: () => null,
}));

jest.mock('tamagui', () => {
  const React = jest.requireActual('react');
  const Native = jest.requireActual('react-native');
  const Button = ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) => (
    <Native.Pressable
      accessibilityRole={props.accessibilityRole ?? 'button'}
      accessible
      {...props}
    >
      {typeof children === 'string' ? <Native.Text>{children}</Native.Text> : children}
    </Native.Pressable>
  );
  Button.Text = Native.Text;
  return {
    Button,
    Image: Native.Image,
    Input: Native.TextInput,
    Text: Native.Text,
    XStack: Native.View,
    YStack: Native.View,
  };
});

describe('LoginScreen accessibility', () => {
  test('exposes a labeled email field and submitting login button', async () => {
    const onLoginPress = jest.fn();
    const { getByLabelText, getByRole, rerender } = await render(
      <LoginScreen onLoginPress={onLoginPress} />,
    );

    expect(getByLabelText('Email sinh viên')).toBeTruthy();
    expect(getByRole('button', { name: 'Đăng nhập' })).toBeTruthy();
    await fireEvent.changeText(
      getByLabelText('Email sinh viên'),
      '21036001.nguyen@student.iuh.edu.vn',
    );
    await fireEvent.changeText(getByLabelText('Mật khẩu'), 'Demo@1234');
    await fireEvent.press(getByRole('button', { name: 'Đăng nhập' }));
    expect(onLoginPress).toHaveBeenCalledWith(
      '21036001.nguyen@student.iuh.edu.vn',
      'Demo@1234',
    );

    await rerender(<LoginScreen isSubmitting onLoginPress={onLoginPress} />);
    expect(
      getByRole('button', { name: /Đang đăng nhập/ }).props.accessibilityState,
    ).toMatchObject({
      disabled: true,
      busy: true,
    });
  });
});
