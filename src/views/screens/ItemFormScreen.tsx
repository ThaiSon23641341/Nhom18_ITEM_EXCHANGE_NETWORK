import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView as RNScrollView } from 'react-native';
import { router } from 'expo-router';
import { Button, Input, Text, TextArea, XStack, YStack } from 'tamagui';
import type { ItemCondition } from '../../models/itemModel';
import { CATEGORY_OPTIONS, CONDITION_OPTIONS } from '../../utils/itemOptions';
import { useItemFormController } from '../../controllers/useItemFormController';
import { CustomButton } from '../components/CustomButton';

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

          {/* TẠM: Tạm thời hiển thị vùng ảnh; Thành viên D gắn Camera và chọn ảnh. */}
          <YStack gap="2" p="3" borderWidth={1} borderColor="border-color" rounded="3">
            <Text color="color" fontWeight="700">Hình ảnh</Text>
            <Text color="color" opacity={0.75} fontSize="2">D sẽ tích hợp Camera và thư viện ảnh tại vùng này.</Text>
          </YStack>

          {controller.submitError ? <Text color="color" accessibilityRole="alert">{controller.submitError}</Text> : null}

          <CustomButton theme="active" disabled={!controller.canSubmit} onPress={() => { void controller.submit(); }}>
            {controller.isSubmitting ? 'Đang lưu...' : isEdit ? 'Lưu thay đổi' : 'Đăng món đồ'}
          </CustomButton>
        </YStack>
      </RNScrollView>
    </KeyboardAvoidingView>
  );
}

export default ItemFormScreen;
