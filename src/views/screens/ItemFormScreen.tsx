import React, { useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView as RNScrollView, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions, type CameraView as CameraViewComponent } from 'expo-camera';
import { router } from 'expo-router';
import { Button, Input, Text, TextArea, XStack, YStack } from 'tamagui';
import type { ItemCondition } from '../../models/itemModel';
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from '../../utils/itemOptions';
import { useItemFormController } from '../../controllers/useItemFormController';
import { CustomButton } from '../components/CustomButton';
import { pickImageFromLibrary } from '../../services/device/imagePickerService';

interface ItemFormScreenProps {
  mode: 'create' | 'edit';
  itemId?: string;
}

export function ItemFormScreen({ mode, itemId }: ItemFormScreenProps) {
  const controller = useItemFormController({
    mode,
    itemId,
    onSuccess: () => {
      if (mode === 'create') router.replace('/(tabs)/my-items');
      else router.back();
    },
  });
  const cameraRef = useRef<CameraViewComponent>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);

  const openCamera = async () => {
    try {
      if (!cameraPermission?.granted) {
        const result = await requestCameraPermission();
        if (!result.granted) {
          Alert.alert('Cần cấp quyền', 'Hãy cấp quyền máy ảnh để chụp ảnh đồ dùng.');
          return;
        }
      }
      setCameraVisible(true);
    } catch (error) {
      Alert.alert('Không thể mở máy ảnh', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    }
  };

  const takePhoto = async () => {
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 0.85 });
      if (photo) {
        controller.setField('imageUrl', photo.uri);
        setCameraVisible(false);
      }
    } catch (error) {
      Alert.alert('Không thể chụp ảnh', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    }
  };

  const pickFromLibrary = async () => {
    setIsPickingImage(true);
    try {
      const selected = await pickImageFromLibrary();
      if (selected) controller.setField('imageUrl', selected.uri);
    } catch (error) {
      Alert.alert('Không thể chọn ảnh', error instanceof Error ? error.message : 'Vui lòng kiểm tra quyền thư viện ảnh.');
    } finally {
      setIsPickingImage(false);
    }
  };

  if (controller.isLoading) return <YStack flex={1} backgroundColor="background" items="center" justify="center"><Text color="color">Đang tải bài đăng...</Text></YStack>;

  if (controller.loadError) return (
    <YStack flex={1} backgroundColor="background" items="center" justify="center" p="4" gap="3">
      <Text color="color" accessibilityRole="alert">{controller.loadError}</Text>
      <Button onPress={controller.retryLoad}>Thử lại</Button>
      <Button onPress={() => router.back()}>Quay lại</Button>
    </YStack>
  );

  if (controller.permissionError) return (
    <YStack flex={1} backgroundColor="background" items="center" justify="center" p="4" gap="3">
      <Text color="color" fontSize="5" fontWeight="700" text="center">{controller.permissionError}</Text>
      <Button onPress={() => router.back()}>Quay lại</Button>
    </YStack>
  );

  const isEdit = mode === 'edit';

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <RNScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <YStack flex={1} backgroundColor="background" p="4" gap="4">
          <XStack items="center" justify="space-between">
            <Button onPress={() => router.back()} accessibilityLabel="Quay lại">Quay lại</Button>
            <Text color="color" fontSize="6" fontWeight="700">{isEdit ? 'Chỉnh sửa bài đăng' : 'Đăng đồ dùng'}</Text>
            <YStack />
          </XStack>

          {isEdit && controller.item?.status === 'reserved' ? (
            <Text color="color" accessibilityRole="alert">Món đang giữ: bài đăng đã có người đặt lịch.</Text>
          ) : null}

          <YStack gap="2">
            <Text color="color" fontWeight="700">Tên món đồ</Text>
            <Input
              value={controller.values.title}
              onChangeText={(value) => controller.setField('title', value)}
              onBlur={() => controller.blurField('title')}
              maxLength={100}
              placeholder="Ví dụ: Giáo trình Lập trình C"
              accessibilityLabel="Tên món đồ"
            />
            {controller.errors.title ? <Text color="color" fontSize="2" accessibilityRole="alert">{controller.errors.title}</Text> : null}
          </YStack>

          <YStack gap="2">
            <Text color="color" fontWeight="700">Mô tả</Text>
            <TextArea
              value={controller.values.description}
              onChangeText={(value) => controller.setField('description', value)}
              onBlur={() => controller.blurField('description')}
              maxLength={1000}
              height={120}
              placeholder="Mô tả tình trạng, nguồn gốc hoặc thông tin trao đổi"
              accessibilityLabel="Mô tả món đồ"
            />
            <Text color="color" opacity={0.7} fontSize="2" text="right">{controller.values.description.length}/1000</Text>
            {controller.errors.description ? <Text color="color" fontSize="2" accessibilityRole="alert">{controller.errors.description}</Text> : null}
          </YStack>

          <YStack gap="2">
            <Text color="color" fontWeight="700">Danh mục</Text>
            <XStack flexWrap="wrap" gap="2">
              {CATEGORY_OPTIONS.map((option) => (
                <Button key={option.value} theme={controller.values.category === option.value ? 'active' : undefined} onPress={() => controller.setField('category', option.value)}>{option.label}</Button>
              ))}
            </XStack>
            {controller.errors.category ? <Text color="color" fontSize="2" accessibilityRole="alert">{controller.errors.category}</Text> : null}
          </YStack>

          <YStack gap="2">
            <Text color="color" fontWeight="700">Tình trạng</Text>
            <XStack flexWrap="wrap" gap="2">
              {CONDITION_OPTIONS.map((option) => (
                <Button key={option.value} theme={controller.values.condition === option.value ? 'active' : undefined} onPress={() => controller.setField('condition', option.value as ItemCondition)}>{option.label}</Button>
              ))}
            </XStack>
            {controller.errors.condition ? <Text color="color" fontSize="2" accessibilityRole="alert">{controller.errors.condition}</Text> : null}
          </YStack>

          <YStack gap="2" p="3" borderWidth={1} borderColor="border-color" rounded="3">
            <Text color="color" fontWeight="700">Hình ảnh</Text>
            {controller.values.imageUrl ? (
              <Image source={{ uri: controller.values.imageUrl }} style={styles.preview} accessibilityLabel="Ảnh đồ dùng đã chọn" />
            ) : (
              <View style={styles.emptyPreview}><Text style={styles.muted}>Chưa có ảnh</Text></View>
            )}
            <XStack gap="2">
              <Button flex={1} onPress={() => { void openCamera(); }}>Mở máy ảnh</Button>
              <Button flex={1} onPress={() => { void pickFromLibrary(); }} disabled={isPickingImage}>
                {isPickingImage ? 'Đang chọn...' : 'Chọn từ thư viện'}
              </Button>
            </XStack>
          </YStack>

          {controller.submitError ? <Text color="color" accessibilityRole="alert">{controller.submitError}</Text> : null}

          <CustomButton theme="active" disabled={!controller.canSubmit} onPress={() => { void controller.submit(); }}>
            {controller.isSubmitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Đăng món đồ'}
          </CustomButton>
        </YStack>
      </RNScrollView>
      <Modal visible={cameraVisible} animationType="slide" onRequestClose={() => setCameraVisible(false)}>
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <View style={styles.cameraControls}>
            <Pressable style={styles.closeButton} onPress={() => setCameraVisible(false)}>
              <Text color="white" fontSize={5} fontWeight="700">Đóng</Text>
            </Pressable>
            <Pressable style={styles.captureButton} onPress={() => { void takePhoto(); }} accessibilityLabel="Chụp ảnh" />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  preview: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#e5e7eb' },
  emptyPreview: { height: 220, borderRadius: 12, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  muted: { color: '#6b7280' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraControls: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  captureButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', borderWidth: 5, borderColor: '#d1d5db' },
  closeButton: { position: 'absolute', left: 24, top: 18, padding: 12 },
});

export default ItemFormScreen;
