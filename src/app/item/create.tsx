import { CameraView, useCameraPermissions, type CameraView as CameraViewComponent } from 'expo-camera';
import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button, XStack } from 'tamagui';
import { useAuthController } from '../../controllers/useAuthController';
import { createItem } from '../../services/api/itemService';
import { CreateItemScreen } from '../../views/screens/CreateItemScreen';

export default function ItemCreateRoute() {
  const { user } = useAuthController();
  const cameraRef = useRef<CameraViewComponent>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const pendingCapture = useRef<((uri: string | null) => void) | null>(null);

  if (!user) return <Redirect href="/login" />;

  const takePhoto = async (): Promise<string | null> => {
    try {
      if (!permission?.granted) {
        const result = await requestPermission();
        if (!result.granted) {
          throw new Error('Hãy cấp quyền máy ảnh để chụp ảnh đồ dùng.');
        }
      }

      return await new Promise((resolve) => {
        pendingCapture.current = resolve;
        setCameraVisible(true);
      });
    } catch (error) {
      Alert.alert(
        'Không thể mở máy ảnh',
        error instanceof Error ? error.message : 'Vui lòng thử lại.',
      );
      return null;
    }
  };

  const closeCamera = () => {
    pendingCapture.current?.(null);
    pendingCapture.current = null;
    setCameraVisible(false);
  };

  const capturePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
      if (photo) {
        pendingCapture.current?.(photo.uri);
        pendingCapture.current = null;
        setCameraVisible(false);
      }
    } catch (error) {
      Alert.alert(
        'Không thể chụp ảnh',
        error instanceof Error ? error.message : 'Vui lòng thử lại.',
      );
    }
  };

  return (
    <>
      <CreateItemScreen
        onBack={() => router.back()}
        onTakePhoto={takePhoto}
        onSubmit={async (form) => {
          const condition = form.condition === 'Mới 100%'
            ? 'new'
            : form.condition === 'Như mới'
              ? 'good'
              : 'fair';
          const item = await createItem({
            title: form.name,
            description: form.description,
            category: form.category ?? '',
            condition,
            imageUrl: form.images[0] ?? '',
            imageUrls: form.images,
            ownerId: user.id,
            ownerName: user.fullName,
            ownerAvatarUrl: user.avatarUrl,
            priceVnd: form.price ? Number(form.price) : undefined,
            location: form.location,
          });

          router.replace({ pathname: '/item/[id]', params: { id: item.id } });
        }}
      />
      <Modal visible={cameraVisible} animationType="slide" onRequestClose={closeCamera}>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }} edges={['top', 'bottom']}>
          <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
          <XStack position="absolute" b={32} w="100%" justify="center">
            <Button
              circular
              w={72}
              h={72}
              backgroundColor="white"
              aria-label="Chụp ảnh"
              onPress={capturePhoto}
            />
          </XStack>
          <Button
            position="absolute"
            t={16}
            l={16}
            backgroundColor="#00000099"
            onPress={closeCamera}
            aria-label="Đóng camera"
          >
            <Button.Text color="white">Đóng</Button.Text>
          </Button>
        </SafeAreaView>
      </Modal>
    </>
  );
}
