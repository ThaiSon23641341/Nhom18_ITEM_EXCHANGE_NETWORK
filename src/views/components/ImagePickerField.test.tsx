import { fireEvent, render, waitFor } from '@testing-library/react-native';
import type { PickedImage } from '../../services/media/imagePickerService';
import { pickImageFromLibrary, takePhoto } from '../../services/media/imagePickerService';
import { uploadImage } from '../../services/api/uploadService';
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
  uploadImage: jest.fn(),
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
    XStack: Native.View,
    YStack: Native.View,
  };
});

const pickedImage: PickedImage = {
  uri: 'file:///picked-image.jpg',
  mimeType: 'image/jpeg',
};

describe('ImagePickerField', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uploads a camera photo and returns its server URL', async () => {
    const onImageSelected = jest.fn();
    jest.mocked(takePhoto).mockResolvedValue(pickedImage);
    jest.mocked(uploadImage).mockResolvedValue('/uploads/profile.jpg');
    const { getByLabelText } = await render(
      <ImagePickerField shape="circle" onImageSelected={onImageSelected} />,
    );

    fireEvent.press(getByLabelText('Chụp ảnh'));

    await waitFor(() => {
      expect(onImageSelected).toHaveBeenCalledWith('/uploads/profile.jpg', pickedImage);
    });
    expect(uploadImage).toHaveBeenCalledWith(pickedImage.uri, pickedImage.mimeType);
  });

  test('uploads a gallery selection and reports upload errors without selecting the image', async () => {
    const onImageSelected = jest.fn();
    jest.mocked(pickImageFromLibrary).mockResolvedValue(pickedImage);
    jest.mocked(uploadImage).mockRejectedValue(new Error('Server unavailable'));
    const { getByLabelText, findByText } = await render(
      <ImagePickerField onImageSelected={onImageSelected} />,
    );

    fireEvent.press(getByLabelText('Chọn từ thư viện'));

    expect(await findByText('Server unavailable')).toBeTruthy();
    expect(onImageSelected).not.toHaveBeenCalled();
  });

  test('does not upload or call back when the picker is cancelled', async () => {
    const onImageSelected = jest.fn();
    jest.mocked(pickImageFromLibrary).mockResolvedValue(null);
    const { getByLabelText } = await render(
      <ImagePickerField onImageSelected={onImageSelected} />,
    );

    fireEvent.press(getByLabelText('Chọn từ thư viện'));

    await waitFor(() => expect(pickImageFromLibrary).toHaveBeenCalledTimes(1));
    expect(uploadImage).not.toHaveBeenCalled();
    expect(onImageSelected).not.toHaveBeenCalled();
  });
});
