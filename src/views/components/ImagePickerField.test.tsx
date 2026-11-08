import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { PickedImage } from '../../services/media/imagePickerService';
import { pickImageFromLibrary, takePhoto } from '../../services/media/imagePickerService';
import { ImagePickerField } from './ImagePickerField';

jest.mock('lucide-react-native', () => ({
  Camera: () => null,
  Plus: () => null,
}));

jest.mock('../../services/media/imagePickerService', () => ({
  pickImageFromLibrary: jest.fn(),
  takePhoto: jest.fn(),
}));

jest.mock('../../services/api/uploadService', () => ({
  resolveMediaUrl: (url: string) => url,
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
    Spinner: () => null,
    Text: Native.Text,
    useTheme: () => ({
      background: { val: '#101827' },
      color: { val: '#F3F4F6' },
      primary: { val: '#4ADE80' },
    }),
    XStack: Native.View,
    YStack: Native.View,
  };
});

const pickedImage: PickedImage = {
  uri: 'file:///picked-image.jpg',
  mimeType: 'image/jpeg',
  fileName: 'picked-image.jpg',
  asset: {
    uri: 'file:///picked-image.jpg',
    fileName: 'picked-image.jpg',
    mimeType: 'image/jpeg',
    width: 10,
    height: 10,
    type: 'image',
    assetId: null,
    base64: null,
    duration: null,
    exif: null,
  },
};

describe('ImagePickerField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('selects a camera photo and returns its local file', async () => {
    const onImageSelected = jest.fn();
    jest.mocked(takePhoto).mockResolvedValue(pickedImage);
    const { getByLabelText } = await render(
      <ImagePickerField shape="circle" onImageSelected={onImageSelected} />,
    );

    fireEvent.press(getByLabelText('Chụp ảnh'));

    await waitFor(() => expect(onImageSelected).toHaveBeenCalledWith(pickedImage));
  });

  test('selects a gallery image without uploading it before profile save', async () => {
    const onImageSelected = jest.fn();
    jest.mocked(pickImageFromLibrary).mockResolvedValue(pickedImage);
    const { getByLabelText } = await render(
      <ImagePickerField onImageSelected={onImageSelected} />,
    );

    fireEvent.press(getByLabelText('Chọn từ thư viện'));

    await waitFor(() => expect(onImageSelected).toHaveBeenCalledWith(pickedImage));
  });

  test('does not upload or call back when the picker is cancelled', async () => {
    const onImageSelected = jest.fn();
    jest.mocked(pickImageFromLibrary).mockResolvedValue(null);
    const { getByLabelText } = await render(
      <ImagePickerField onImageSelected={onImageSelected} />,
    );

    fireEvent.press(getByLabelText('Chọn từ thư viện'));

    await waitFor(() => expect(pickImageFromLibrary).toHaveBeenCalledTimes(1));
    expect(onImageSelected).not.toHaveBeenCalled();
  });
});
