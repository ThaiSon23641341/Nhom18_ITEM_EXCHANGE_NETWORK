import React, { useRef, useState } from 'react';
import { Alert, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView as RNScrollView, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions, type CameraView as CameraViewComponent } from 'expo-camera';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Redirect, router } from 'expo-router';
import { Button, Input, Text, TextArea, XStack, YStack } from 'tamagui';
import type { ItemCondition } from '../../models/itemModel';
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from '../../utils/itemOptions';
import { useItemFormController } from '../../controllers/useItemFormController';
import { CustomButton } from '../components/CustomButton';
import { pickImagesFromLibrary } from '../../services/device/imagePickerService';
import { getAccessibilityProps } from '../../utils/accessibility';
import { goBackOrReplace } from '../../utils/navigation';
import { resolveMediaUrl } from '../../services/api/uploadService';
import {
  availableUntilToDate,
  combineAvailableUntil,
  formatAvailableUntilDate,
  formatAvailableUntilTime,
} from '../../utils/availability';

interface ItemFormScreenProps {
  mode: 'create' | 'edit';
  itemId?: string;
}

export function ItemFormScreen({ mode, itemId }: ItemFormScreenProps) {
  const controller = useItemFormController({
    mode,
    itemId,
    onSuccess: (item) => {
      if (mode === 'create') {
        router.replace({ pathname: '/item/[id]', params: { id: item.id } });
      }
      else goBackOrReplace('/(tabs)/my-items');
    },
  });
  const cameraRef = useRef<CameraViewComponent>(null);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [isPickingImage, setIsPickingImage] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time' | null>(null);

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
      if (photo && controller.values.imageUrls.length < 5) {
        const imageUrls = [...controller.values.imageUrls, photo.uri];
        controller.setField('imageUrls', imageUrls);
        controller.setField('imageUrl', imageUrls[0] ?? '');
        setCameraVisible(false);
      }
    } catch (error) {
      Alert.alert('Không thể chụp ảnh', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    }
  };

  const pickFromLibrary = async () => {
    setIsPickingImage(true);
    try {
      const remaining = 5 - controller.values.imageUrls.length;
      const selected = await pickImagesFromLibrary(remaining);
      if (selected.length > 0) {
        const imageUrls = [
          ...controller.values.imageUrls,
          ...selected.map((image) => image.uri).filter((uri) => !controller.values.imageUrls.includes(uri)),
        ].slice(0, 5);
        controller.setField('imageUrls', imageUrls);
        controller.setField('imageUrl', imageUrls[0] ?? '');
      }
    } catch (error) {
      Alert.alert('Không thể chọn ảnh', error instanceof Error ? error.message : 'Vui lòng kiểm tra quyền thư viện ảnh.');
    } finally {
      setIsPickingImage(false);
    }
  };

  const removeImage = (uri: string) => {
    const imageUrls = controller.values.imageUrls.filter((imageUri) => imageUri !== uri);
    controller.setField('imageUrls', imageUrls);
    controller.setField('imageUrl', imageUrls[0] ?? '');
  };

  if (!controller.user) return <Redirect href="/login" />;

  if (controller.isLoading) return <YStack flex={1} backgroundColor="background" items="center" justify="center"><Text color="color">Đang tải bài đăng...</Text></YStack>;

  if (controller.loadError) return (
    <YStack flex={1} backgroundColor="background" items="center" justify="center" p="4" gap="3">
      <Text color="color" {...getAccessibilityProps({ role: 'alert' })}>{controller.loadError}</Text>
      <Button onPress={controller.retryLoad}>Thử lại</Button>
      <Button onPress={() => goBackOrReplace('/(tabs)/my-items')}>Quay lại</Button>
    </YStack>
  );

  if (controller.permissionError) return (
    <YStack flex={1} backgroundColor="background" items="center" justify="center" p="4" gap="3">
      <Text color="color" fontSize="5" fontWeight="700" text="center">{controller.permissionError}</Text>
      <Button onPress={() => goBackOrReplace('/(tabs)/my-items')}>Quay lại</Button>
    </YStack>
  );

  const isEdit = mode === 'edit';
  const currentDeadline = availableUntilToDate(controller.values.availableUntil) ?? new Date();
  const minimumDeadline = new Date();
  const maximumDeadline = new Date();
  maximumDeadline.setDate(maximumDeadline.getDate() + 90);

  const handleDeadlinePickerChange = (_event: unknown, selectedDate?: Date) => {
    if (!selectedDate) {
      setPickerMode(null);
      return;
    }
    setPickerMode(null);
    if (pickerMode === 'date') {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const time = formatAvailableUntilTime(controller.values.availableUntil) || '23:59';
      controller.setField('availableUntil', combineAvailableUntil(`${year}-${month}-${day}`, time));
    } else if (pickerMode === 'time') {
      const hours = String(selectedDate.getHours()).padStart(2, '0');
      const minutes = String(selectedDate.getMinutes()).padStart(2, '0');
      const date = formatAvailableUntilDate(controller.values.availableUntil);
      controller.setField('availableUntil', combineAvailableUntil(date, `${hours}:${minutes}`));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <RNScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1 }}>
        <YStack flex={1} backgroundColor="background" p="4" gap="4">
          <XStack items="center" justify="space-between">
            <Button onPress={() => goBackOrReplace('/(tabs)/my-items')} {...getAccessibilityProps({ label: 'Quay lại' })}>Quay lại</Button>
            <Text color="color" fontSize="6" fontWeight="700">{isEdit ? 'Chỉnh sửa bài đăng' : 'Đăng đồ dùng'}</Text>
            <YStack />
          </XStack>

          {isEdit && controller.item?.status === 'reserved' ? (
            <Text color="color" {...getAccessibilityProps({ role: 'alert' })}>Món đang giữ: bài đăng đã có người đặt lịch.</Text>
          ) : null}

          <YStack gap="2">
            <Text color="color" fontWeight="700">Tên món đồ</Text>
            <Input
              value={controller.values.title}
              onChangeText={(value) => controller.setField('title', value)}
              onBlur={() => controller.blurField('title')}
              maxLength={120}
              placeholder="Ví dụ: Giáo trình Lập trình C"
              {...getAccessibilityProps({ label: 'Tên món đồ' })}
            />
            {controller.errors.title ? <Text color="color" fontSize="2" {...getAccessibilityProps({ role: 'alert' })}>{controller.errors.title}</Text> : null}
          </YStack>

          <YStack gap="2">
            <Text color="color" fontWeight="700">Mô tả</Text>
            <TextArea
              value={controller.values.description}
              onChangeText={(value) => controller.setField('description', value)}
              onBlur={() => controller.blurField('description')}
              maxLength={2000}
              height={120}
              placeholder="Mô tả tình trạng, nguồn gốc hoặc thông tin trao đổi"
              {...getAccessibilityProps({ label: 'Mô tả món đồ' })}
            />
            <Text color="color" opacity={0.7} fontSize="2" text="right">{controller.values.description.length}/2000</Text>
            {controller.errors.description ? <Text color="color" fontSize="2" {...getAccessibilityProps({ role: 'alert' })}>{controller.errors.description}</Text> : null}
          </YStack>

          <YStack gap="2">
            <Text color="color" fontWeight="700">Danh mục</Text>
            <XStack flexWrap="wrap" gap="2">
              {CATEGORY_OPTIONS.map((option) => (
                <Button key={option.value} theme={controller.values.category === option.value ? 'active' : undefined} onPress={() => controller.setField('category', option.value)}>{option.label}</Button>
              ))}
            </XStack>
            {controller.errors.category ? <Text color="color" fontSize="2" {...getAccessibilityProps({ role: 'alert' })}>{controller.errors.category}</Text> : null}
          </YStack>

          <YStack gap="2">
            <Text color="color" fontWeight="700">Tình trạng</Text>
            <XStack flexWrap="wrap" gap="2">
              {CONDITION_OPTIONS.map((option) => (
                <Button key={option.value} theme={controller.values.condition === option.value ? 'active' : undefined} onPress={() => controller.setField('condition', option.value as ItemCondition)}>{option.label}</Button>
              ))}
            </XStack>
            {controller.errors.condition ? <Text color="color" fontSize="2" {...getAccessibilityProps({ role: 'alert' })}>{controller.errors.condition}</Text> : null}
          </YStack>

          <YStack gap="2">
            <Text color="color" fontWeight="700">Giá tiền (VNĐ)</Text>
            <Input
              value={controller.values.price}
              onChangeText={(value) => controller.setField('price', value)}
              onBlur={() => controller.blurField('price')}
              keyboardType="number-pad"
              maxLength={15}
              placeholder="Để trống nếu muốn trao đổi/cho tặng"
              {...getAccessibilityProps({ label: 'Giá tiền, đơn vị Việt Nam đồng' })}
            />
            {controller.errors.price ? <Text color="color" fontSize="2" {...getAccessibilityProps({ role: 'alert' })}>{controller.errors.price}</Text> : null}
          </YStack>

          <YStack gap="2">
            <Text color="color" fontWeight="700">Địa điểm giao dịch *</Text>
            <Input
              value={controller.values.location}
              onChangeText={(value) => controller.setField('location', value)}
              onBlur={() => controller.blurField('location')}
              maxLength={200}
              placeholder="Ví dụ: Sảnh thư viện IUH"
              {...getAccessibilityProps({ label: 'Địa điểm giao dịch' })}
            />
            {controller.errors.location ? <Text color="color" fontSize="2" {...getAccessibilityProps({ role: 'alert' })}>{controller.errors.location}</Text> : null}
          </YStack>

          <YStack gap="2">
            <Text color="color" fontWeight="700">Hạn trao *</Text>
            <XStack gap="2">
              <YStack flex={1} gap="1">
                <Text color="color" fontSize="2">Ngày</Text>
                <Button
                  onPress={() => setPickerMode('date')}
                  {...getAccessibilityProps({ label: 'Chọn ngày hạn trao' })}
                >
                  {formatAvailableUntilDate(controller.values.availableUntil) || 'Chọn ngày'}
                </Button>
              </YStack>
              <YStack flex={1} gap="1">
                <Text color="color" fontSize="2">Giờ</Text>
                <Button
                  onPress={() => setPickerMode('time')}
                  {...getAccessibilityProps({ label: 'Chọn giờ hạn trao' })}
                >
                  {formatAvailableUntilTime(controller.values.availableUntil) || 'HH:MM'}
                </Button>
              </YStack>
            </XStack>
            {Platform.OS === 'web' ? (
              <XStack gap="2">
                {React.createElement('input', {
                  type: 'date',
                  value: formatAvailableUntilDate(controller.values.availableUntil),
                  min: `${minimumDeadline.getFullYear()}-${String(minimumDeadline.getMonth() + 1).padStart(2, '0')}-${String(minimumDeadline.getDate()).padStart(2, '0')}`,
                  max: `${maximumDeadline.getFullYear()}-${String(maximumDeadline.getMonth() + 1).padStart(2, '0')}-${String(maximumDeadline.getDate()).padStart(2, '0')}`,
                  onChange: (event: { target: { value: string } }) => {
                    if (!event.target.value) return;
                    const time = formatAvailableUntilTime(controller.values.availableUntil) || '23:59';
                    controller.setField('availableUntil', combineAvailableUntil(event.target.value, time));
                  },
                  style: { flex: 1, minWidth: 0, minHeight: 44, padding: 10, fontSize: 16, borderRadius: 8 },
                  'aria-label': 'Chọn ngày hạn trao',
                })}
                {React.createElement('input', {
                  type: 'time',
                  value: formatAvailableUntilTime(controller.values.availableUntil),
                  onChange: (event: { target: { value: string } }) => {
                    if (!event.target.value) return;
                    const date = formatAvailableUntilDate(controller.values.availableUntil);
                    controller.setField('availableUntil', combineAvailableUntil(date, event.target.value));
                  },
                  style: { flex: 1, minWidth: 0, minHeight: 44, padding: 10, fontSize: 16, borderRadius: 8 },
                  'aria-label': 'Chọn giờ hạn trao',
                })}
              </XStack>
            ) : pickerMode ? (
              <DateTimePicker
                value={currentDeadline}
                mode={pickerMode}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                is24Hour
                minimumDate={pickerMode === 'date' ? minimumDeadline : undefined}
                maximumDate={pickerMode === 'date' ? maximumDeadline : undefined}
                onChange={handleDeadlinePickerChange}
              />
            ) : null}
            {controller.errors.availableUntil ? <Text color="color" fontSize="2" {...getAccessibilityProps({ role: 'alert' })}>{controller.errors.availableUntil}</Text> : null}
          </YStack>

          <YStack gap="2" p="3" borderWidth={1} borderColor="border-color" rounded="3">
            <Text color="color" fontWeight="700">Hình ảnh ({controller.values.imageUrls.length}/5)</Text>
            {controller.values.imageUrls.length > 0 ? (
              <RNScrollView horizontal showsHorizontalScrollIndicator={false}>
                <XStack gap="2">
                  {controller.values.imageUrls.map((uri, index) => (
                    <YStack key={`${uri}-${index}`} gap="1">
                      <Image source={{ uri: resolveMediaUrl(uri) }} style={styles.thumbnail} {...getAccessibilityProps({ label: `Ảnh ${index + 1} của món đồ` })} />
                      <Button px="2" py="1" onPress={() => removeImage(uri)} {...getAccessibilityProps({ label: `Xóa ảnh ${index + 1}` })}>
                        Xóa ảnh
                      </Button>
                    </YStack>
                  ))}
                </XStack>
              </RNScrollView>
            ) : (
              <View style={styles.emptyPreview}><Text style={styles.muted}>Chưa có ảnh</Text></View>
            )}
            <XStack gap="2">
              <Button flex={1} disabled={controller.values.imageUrls.length >= 5} onPress={() => { void openCamera(); }}>Mở máy ảnh</Button>
              <Button flex={1} disabled={isPickingImage || controller.values.imageUrls.length >= 5} onPress={() => { void pickFromLibrary(); }}>
                {isPickingImage ? 'Đang chọn...' : 'Chọn từ thư viện'}
              </Button>
            </XStack>
            {controller.errors.imageUrls ? <Text color="color" {...getAccessibilityProps({ role: 'alert' })}>{controller.errors.imageUrls}</Text> : null}
          </YStack>

          {controller.submitError ? <Text color="color" {...getAccessibilityProps({ role: 'alert' })}>{controller.submitError}</Text> : null}

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
            <Pressable style={styles.captureButton} onPress={() => { void takePhoto(); }} {...getAccessibilityProps({ label: 'Chụp ảnh' })} />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  thumbnail: { width: 120, height: 120, borderRadius: 12, backgroundColor: '#e5e7eb' },
  emptyPreview: { height: 220, borderRadius: 12, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  muted: { color: '#6b7280' },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraControls: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  captureButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', borderWidth: 5, borderColor: '#d1d5db' },
  closeButton: { position: 'absolute', left: 24, top: 18, padding: 12 },
});

export default ItemFormScreen;
