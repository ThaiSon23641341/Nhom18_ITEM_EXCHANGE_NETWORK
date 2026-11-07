import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { ProfileEditScreen } from './ProfileEditScreen';

const mockSubmit = jest.fn();
const mockGoBackOrReplace = jest.fn();
const mockController = {
  user: {
    fullName: 'Student Example',
    studentId: '21036001',
    phoneNumber: '0900000000',
  },
  values: { faculty: 'Khoa cũ', className: 'Lớp cũ', avatarUrl: '' },
  isLoading: false,
  isSubmitting: false,
  loadError: null,
  submitError: null,
  setFaculty: jest.fn(),
  setClassName: jest.fn(),
  setAvatarUrl: jest.fn(),
  retry: jest.fn(),
  submit: mockSubmit,
};

jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => null,
  UserRound: () => null,
}));

jest.mock('../../controllers/useProfileEditController', () => ({
  useProfileEditController: () => mockController,
}));

jest.mock('../../services/api/uploadService', () => ({
  resolveMediaUrl: (url: string) => url,
}));

jest.mock('../components/CustomButton', () => {
  const Native = jest.requireActual('react-native');
  return {
    CustomButton: ({ children, ...props }: { children?: unknown; [key: string]: unknown }) => (
      <Native.Pressable {...props}>
        {typeof children === 'string' ? <Native.Text>{children}</Native.Text> : children}
      </Native.Pressable>
    ),
  };
});

jest.mock('../components/ImagePickerField', () => ({
  ImagePickerField: () => null,
}));

jest.mock('../../utils/navigation', () => ({
  goBackOrReplace: (...args: unknown[]) => mockGoBackOrReplace(...args),
}));

jest.mock('tamagui', () => {
  const Native = jest.requireActual('react-native');
  const Button = ({ children, ...props }: { children?: unknown; [key: string]: unknown }) => (
    <Native.Pressable {...props}>
      {typeof children === 'string' ? <Native.Text>{children}</Native.Text> : children}
    </Native.Pressable>
  );
  return {
    Button,
    Input: Native.TextInput,
    Text: Native.Text,
    XStack: Native.View,
    YStack: Native.View,
  };
});

describe('ProfileEditScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders read-only identity and editable profile fields', async () => {
    const { getByText, getByLabelText } = await render(<ProfileEditScreen />);

    expect(getByText('Student Example')).toBeTruthy();
    expect(getByText('21036001')).toBeTruthy();
    expect(getByText('0900000000')).toBeTruthy();
    expect(getByLabelText('Khoa').props.value).toBe('Khoa cũ');
    expect(getByLabelText('Lớp').props.value).toBe('Lớp cũ');
    expect(getByLabelText('Lưu hồ sơ')).toBeTruthy();
  });

  test('returns to profile only after a successful save', async () => {
    mockSubmit.mockResolvedValue(true);
    const { getByLabelText } = await render(<ProfileEditScreen />);

    fireEvent.press(getByLabelText('Lưu hồ sơ'));

    await waitFor(() => expect(mockGoBackOrReplace).toHaveBeenCalledWith('/(tabs)/profile'));
    expect(mockSubmit).toHaveBeenCalledTimes(1);
  });

  test('stays on the form when save fails', async () => {
    mockSubmit.mockResolvedValue(false);
    const { getByLabelText } = await render(<ProfileEditScreen />);

    fireEvent.press(getByLabelText('Lưu hồ sơ'));

    await waitFor(() => expect(mockSubmit).toHaveBeenCalledTimes(1));
    expect(mockGoBackOrReplace).not.toHaveBeenCalled();
  });
});
