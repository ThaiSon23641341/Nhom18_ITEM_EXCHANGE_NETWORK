import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { Camera, Plus } from 'lucide-react-native';
import { Button, Spinner, Text, useTheme, XStack, YStack } from 'tamagui';
import {
  pickImageFromLibrary,
  takePhoto,
  type PickedImage,
} from '../../services/media/imagePickerService';
import { resolveMediaUrl } from '../../services/api/uploadService';

export interface ImagePickerFieldProps {
  initialImageUrl?: string;
  onImageSelected: (file: PickedImage) => void;
  shape?: 'circle' | 'square';
  isUploading?: boolean;
}

export function ImagePickerField({
  initialImageUrl,
  onImageSelected,
  shape = 'square',
  isUploading = false,
}: ImagePickerFieldProps) {
  const theme = useTheme();
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const imageUrl = selectedImageUrl ?? initialImageUrl;
  const isBusy = isUploading || isProcessing;
  const isCircle = shape === 'circle';

  const selectImage = async (pickImage: () => Promise<PickedImage | null>) => {
    if (isBusy) return;

    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const pickedImage = await pickImage();
      if (!pickedImage) return;

      setSelectedImageUrl(pickedImage.uri);
      onImageSelected(pickedImage);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Không thể xử lý ảnh. Vui lòng thử lại.',
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <YStack gap="3">
      <XStack
        self={isCircle ? 'center' : undefined}
        w={isCircle ? 128 : '100%'}
        aspectRatio={1}
        position="relative"
        overflow="hidden"
        items="center"
        justify="center"
        borderWidth={1}
        borderColor="border-color"
        rounded={isCircle ? 64 : 4}
        backgroundColor="background"
        accessibilityLabel={imageUrl ? 'Ảnh đã chọn' : 'Chưa chọn ảnh'}
      >
        {imageUrl ? (
          <Image
            source={{ uri: resolveMediaUrl(imageUrl) }}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
            accessibilityLabel="Ảnh xem trước"
          />
        ) : (
          <YStack items="center" justify="center" gap="2">
            {isCircle
              ? <Camera size={28} color="#648273" />
              : <Plus size={28} color="#648273" />}
            <Text color="color" opacity={0.65} fontSize="3">
              Chưa có ảnh
            </Text>
          </YStack>
        )}
        {isBusy ? (
          <View style={styles.loadingOverlay}>
            <Spinner size="large" color="white" />
          </View>
        ) : null}
      </XStack>

      <XStack gap="2">
        <Button
          flex={1}
          minH={48}
          borderWidth={1}
          borderColor="primary"
          backgroundColor="background"
          disabled={isBusy}
          onPress={() => { void selectImage(takePhoto); }}
          accessibilityRole="button"
          accessibilityLabel="Chụp ảnh"
          accessibilityState={{ disabled: isBusy, busy: isBusy }}
        >
          <XStack items="center" gap="2">
            <Camera size={18} color={theme.primary.val} />
            <Text color="color" fontSize="3" fontWeight="600">
              Chụp ảnh
            </Text>
          </XStack>
        </Button>
        <Button
          flex={1}
          minH={48}
          borderWidth={1}
          borderColor="primary"
          backgroundColor="background"
          disabled={isBusy}
          onPress={() => { void selectImage(pickImageFromLibrary); }}
          accessibilityRole="button"
          accessibilityLabel="Chọn từ thư viện"
          accessibilityState={{ disabled: isBusy, busy: isBusy }}
        >
          <XStack items="center" gap="2">
            <Plus size={18} color={theme.primary.val} />
            <Text color="color" fontSize="3" fontWeight="600">
              Chọn từ thư viện
            </Text>
          </XStack>
        </Button>
      </XStack>

      {errorMessage ? (
        <Text color="#B42318" fontSize="2" accessibilityRole="alert">
          {errorMessage}
        </Text>
      ) : null}
    </YStack>
  );
}

const styles = StyleSheet.create({
  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
});

export default ImagePickerField;
