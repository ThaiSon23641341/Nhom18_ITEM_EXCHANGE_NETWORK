import { Redirect, router } from 'expo-router';
import { Image, ScrollView } from 'react-native';
import { LogOut, Mail, ShieldUser, UserRound } from 'lucide-react-native';
import { Button, Text, XStack, YStack } from 'tamagui';
import { useAuthController } from '../../controllers/useAuthController';
import { getAccessibilityProps } from '../../utils/accessibility';

export function ProfileScreen() {
  const { user, logout } = useAuthController();

  if (!user) return <Redirect href="/login" />;

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <YStack flex={1} backgroundColor="background" p="4" gap="4">
        <YStack
          p="4"
          gap="3"
          rounded="4"
          borderWidth={1}
          borderColor="border-color"
          backgroundColor="background"
        >
          <XStack items="center" gap="4">
            {user.avatarUrl ? (
              <Image
                source={{ uri: user.avatarUrl }}
                style={{ width: 72, height: 72, borderRadius: 36 }}
                accessibilityLabel={`Ảnh đại diện của ${user.fullName}`}
              />
            ) : (
              <YStack
                w={72}
                h={72}
                rounded="full"
                backgroundColor="primary"
                items="center"
                justify="center"
                {...getAccessibilityProps({ label: 'Ảnh đại diện mặc định' })}
              >
                <UserRound size={34} color="white" />
              </YStack>
            )}
            <YStack flex={1} gap="1">
              <Text color="color" fontSize="6" fontWeight="800">{user.fullName}</Text>
              <Text color="color" opacity={0.75} fontSize="2">Mã sinh viên: {user.studentId}</Text>
            </YStack>
          </XStack>
        </YStack>

        <YStack gap="2">
          <XStack items="center" gap="3" p="3" rounded="3" backgroundColor="background" borderWidth={1} borderColor="border-color">
            <Mail size={20} color="#16815D" />
            <YStack flex={1}>
              <Text color="color" opacity={0.65} fontSize="2">Email</Text>
              <Text color="color" fontSize="3">{user.email}</Text>
            </YStack>
          </XStack>
          <XStack items="center" gap="3" p="3" rounded="3" backgroundColor="background" borderWidth={1} borderColor="border-color">
            <ShieldUser size={20} color="#16815D" />
            <YStack flex={1}>
              <Text color="color" opacity={0.65} fontSize="2">Vai trò</Text>
              <Text color="color" fontSize="3">{user.role === 'moderator' ? 'Kiểm duyệt viên' : 'Sinh viên'}</Text>
            </YStack>
          </XStack>
        </YStack>

        <Button
          theme="active"
          icon={<LogOut size={20} />}
          onPress={handleLogout}
          accessibilityLabel="Đăng xuất tài khoản"
        >
          Đăng xuất
        </Button>
      </YStack>
    </ScrollView>
  );
}

export default ProfileScreen;
