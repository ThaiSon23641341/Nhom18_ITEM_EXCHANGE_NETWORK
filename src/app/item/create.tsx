import { CameraView, useCameraPermissions, type CameraView as CameraViewComponent } from 'expo-camera';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useAuthController } from '../../controllers/useAuthController';
import { createItem } from '../../services/api/itemService';
import { pickImageFromLibrary, type DeviceImage } from '../../services/device';

export default function ItemCreateRoute() {
  const cameraRef = useRef<CameraViewComponent>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [image, setImage] = useState<DeviceImage | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPicking, setIsPicking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuthController();

  const openCamera = async () => {
    try {
      if (!permission?.granted) {
        const result = await requestPermission();
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
        setImage({ uri: photo.uri, width: photo.width, height: photo.height });
        setCameraVisible(false);
      }
    } catch (error) {
      Alert.alert('Không thể chụp ảnh', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    }
  };

  const pickFromLibrary = async () => {
    setIsPicking(true);
    try {
      const selected = await pickImageFromLibrary();
      if (selected) setImage(selected);
    } catch (error) {
      Alert.alert('Không thể chọn ảnh', error instanceof Error ? error.message : 'Vui lòng kiểm tra quyền thư viện ảnh.');
    } finally {
      setIsPicking(false);
    }
  };

  const saveItem = async () => {
    if (!title.trim()) {
      Alert.alert('Thiếu thông tin', 'Vui lòng nhập tên đồ dùng.');
      return;
    }

    setIsSaving(true);
    try {
      await createItem({
        title: title.trim(),
        description: description.trim(),
        category: 'Khác',
        condition: 'good',
        imageUrl: image?.uri ?? '',
        ownerId: user?.id ?? 'user-001',
      });
      Alert.alert('Đã đăng bài', 'Bài đăng của bạn đã được tạo.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('Không thể đăng bài', error instanceof Error ? error.message : 'Vui lòng thử lại.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.heading}>Đăng đồ dùng mới</Text>
      <Text style={styles.label}>Ảnh đồ dùng</Text>
      {image ? (
        <Image source={{ uri: image.uri }} style={styles.preview} accessibilityLabel="Ảnh đồ dùng đã chọn" />
      ) : (
        <View style={styles.emptyPreview}><Text style={styles.muted}>Chưa có ảnh</Text></View>
      )}
      <View style={styles.actions}>
        <Pressable style={styles.secondaryButton} onPress={openCamera}>
          <Text style={styles.secondaryText}>Mở máy ảnh</Text>
        </Pressable>
        <Pressable style={styles.secondaryButton} onPress={pickFromLibrary} disabled={isPicking}>
          {isPicking ? <ActivityIndicator /> : <Text style={styles.secondaryText}>Chọn từ thư viện</Text>}
        </Pressable>
      </View>
      <Text style={styles.label}>Tên đồ dùng</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Ví dụ: Balo đi học" />
      <Text style={styles.label}>Mô tả</Text>
      <TextInput
        style={[styles.input, styles.multiline]}
        value={description}
        onChangeText={setDescription}
        placeholder="Mô tả tình trạng và thông tin trao đổi"
        multiline
        textAlignVertical="top"
      />
      <Pressable style={styles.primaryButton} onPress={saveItem} disabled={isSaving}>
        {isSaving ? <ActivityIndicator color="#fff" /> : <Text style={styles.primaryText}>Đăng bài</Text>}
      </Pressable>
      <Pressable style={styles.cancelButton} onPress={() => router.back()} disabled={isSaving}>
        <Text style={styles.secondaryText}>Quay lại</Text>
      </Pressable>

      <Modal visible={cameraVisible} animationType="slide" onRequestClose={() => setCameraVisible(false)}>
        <View style={styles.cameraContainer}>
          <CameraView ref={cameraRef} style={styles.camera} facing="back" />
          <View style={styles.cameraControls}>
            <Pressable style={styles.closeButton} onPress={() => setCameraVisible(false)}>
              <Text style={styles.cameraText}>Đóng</Text>
            </Pressable>
            <Pressable style={styles.captureButton} onPress={takePhoto} accessibilityLabel="Chụp ảnh" />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, gap: 12 },
  heading: { fontSize: 26, fontWeight: '700', marginBottom: 8 },
  label: { fontSize: 16, fontWeight: '600', marginTop: 8 },
  preview: { width: '100%', height: 220, borderRadius: 12, backgroundColor: '#e5e7eb' },
  emptyPreview: { height: 220, borderRadius: 12, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
  muted: { color: '#6b7280' },
  actions: { flexDirection: 'row', gap: 10 },
  secondaryButton: { flex: 1, minHeight: 46, borderRadius: 8, borderWidth: 1, borderColor: '#2563eb', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 8 },
  secondaryText: { color: '#2563eb', fontWeight: '600', textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, padding: 12, fontSize: 16 },
  multiline: { minHeight: 100 },
  primaryButton: { minHeight: 48, borderRadius: 8, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  primaryText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancelButton: { alignItems: 'center', padding: 12 },
  cameraContainer: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  cameraControls: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  captureButton: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#fff', borderWidth: 5, borderColor: '#d1d5db' },
  closeButton: { position: 'absolute', left: 24, top: 18, padding: 12 },
  cameraText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
