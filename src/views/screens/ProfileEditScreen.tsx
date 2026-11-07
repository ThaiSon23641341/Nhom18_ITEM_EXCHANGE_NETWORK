import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ArrowLeft, UserRound } from 'lucide-react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import { useProfileEditController } from '../../controllers/useProfileEditController';
import { resolveMediaUrl } from '../../services/api/uploadService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomButton } from '../components/CustomButton';
import { ImagePickerField } from '../components/ImagePickerField';
import { goBackOrReplace } from '../../utils/navigation';

export function ProfileEditScreen() {
  const controller = useProfileEditController();

  const saveProfile = async () => {
    if (await controller.submit()) {
      goBackOrReplace('/(tabs)/profile');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <YStack flex={1} w="100%" maxW={720} self="center" p="4" gap="4">
            <XStack items="center" gap="3">
              <Button
                circular
                minW={44}
                minH={44}
                backgroundColor="transparent"
                onPress={() => goBackOrReplace('/(tabs)/profile')}
                accessibilityRole="button"
                accessibilityLabel="Quay lại hồ sơ"
              >
                <ArrowLeft size={22} color="#17634B" />
              </Button>
              <Text color="secondary" fontSize="6" fontWeight="800" accessibilityRole="header">
                Chỉnh sửa hồ sơ
              </Text>
            </XStack>

            {controller.loadError ? (
              <YStack
                gap="3"
                p="4"
                rounded="4"
                borderWidth={1}
                borderColor="#FDA29B"
                backgroundColor="#FEF3F2"
              >
                <Text color="#B42318" accessibilityRole="alert">
                  {controller.loadError}
                </Text>
                <Button
                  minH={44}
                  self="flex-start"
                  onPress={controller.retry}
                  accessibilityRole="button"
                  accessibilityLabel="Tải lại hồ sơ"
                >
                  Thử lại
                </Button>
              </YStack>
            ) : null}

            {controller.isLoading ? (
              <YStack flex={1} items="center" justify="center" gap="3" p="6">
                <ActivityIndicator color="#16815D" />
                <Text color="color" accessibilityLabel="Đang tải hồ sơ">
                  Đang tải hồ sơ...
                </Text>
              </YStack>
            ) : (
              <YStack gap="4">
                <YStack
                  p="4"
                  gap="3"
                  rounded="5"
                  borderWidth={1}
                  borderColor="border-color"
                  backgroundColor="background"
                >
                  <Text color="color" fontSize="4" fontWeight="700">
                    Ảnh đại diện
                  </Text>
                  <ImagePickerField
                    initialImageUrl={
                      controller.values.avatarUrl
                        ? resolveMediaUrl(controller.values.avatarUrl)
                        : undefined
                    }
                    shape="circle"
                    isUploading={controller.isSubmitting}
                    onImageSelected={(uploadedUrl) => controller.setAvatarUrl(uploadedUrl)}
                  />
                </YStack>

                <YStack
                  p="4"
                  gap="4"
                  rounded="5"
                  borderWidth={1}
                  borderColor="border-color"
                  backgroundColor="background"
                >
                  <Text color="color" fontSize="4" fontWeight="700">
                    Thông tin chỉ đọc
                  </Text>
                  <ReadOnlyField label="Họ và tên" value={controller.user?.fullName} />
                  <ReadOnlyField label="Mã sinh viên" value={controller.user?.studentId} />
                  <ReadOnlyField label="Số điện thoại" value={controller.user?.phoneNumber} />

                  <YStack gap="2">
                    <Text color="color" fontSize="3" fontWeight="700">Khoa</Text>
                    <Input
                      value={controller.values.faculty}
                      onChangeText={controller.setFaculty}
                      placeholder="Nhập khoa"
                      maxLength={100}
                      autoCapitalize="words"
                      accessibilityLabel="Khoa"
                      minH={48}
                      borderColor="border-color"
                      backgroundColor="background"
                      color="color"
                    />
                  </YStack>

                  <YStack gap="2">
                    <Text color="color" fontSize="3" fontWeight="700">Lớp</Text>
                    <Input
                      value={controller.values.className}
                      onChangeText={controller.setClassName}
                      placeholder="Nhập lớp"
                      maxLength={50}
                      autoCapitalize="characters"
                      accessibilityLabel="Lớp"
                      minH={48}
                      borderColor="border-color"
                      backgroundColor="background"
                      color="color"
                    />
                  </YStack>
                </YStack>

                {controller.submitError ? (
                  <Text
                    color="#B42318"
                    p="3"
                    rounded="3"
                    backgroundColor="#FEF3F2"
                    accessibilityRole="alert"
                  >
                    {controller.submitError}
                  </Text>
                ) : null}

                <CustomButton
                  minH={50}
                  disabled={controller.isSubmitting || !controller.user}
                  onPress={() => { void saveProfile(); }}
                  accessibilityRole="button"
                  accessibilityLabel="Lưu hồ sơ"
                  accessibilityState={{
                    disabled: controller.isSubmitting || !controller.user,
                    busy: controller.isSubmitting,
                  }}
                >
                  {controller.isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                </CustomButton>
              </YStack>
            )}
          </YStack>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function ReadOnlyField({ label, value }: { label: string; value?: string }) {
  return (
    <YStack gap="1">
      <Text color="color" opacity={0.65} fontSize="2">{label}</Text>
      <XStack items="center" gap="2" minH={40}>
        <UserRound size={16} color="#667085" />
        <Text color="color" fontSize="3">
          {value?.trim() || 'Chưa cập nhật'}
        </Text>
      </XStack>
    </YStack>
  );
}

export default ProfileEditScreen;
