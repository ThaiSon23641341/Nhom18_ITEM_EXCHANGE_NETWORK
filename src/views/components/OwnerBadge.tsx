import { useState } from 'react';
import { Image, StyleSheet } from 'react-native';
import { ShieldCheck, UserRound } from 'lucide-react-native';
import { Text, XStack, YStack } from 'tamagui';
import { resolveMediaUrl } from '../../services/api/uploadService';

export interface OwnerBadgeProps {
  name?: string;
  avatarUrl?: string;
  faculty?: string;
  reputation?: number;
  compact?: boolean;
}

export function OwnerBadge({
  name,
  avatarUrl,
  faculty,
  reputation,
  compact = false,
}: OwnerBadgeProps) {
  const [avatarFailed, setAvatarFailed] = useState(false);
  const avatarSize = compact ? 26 : 34;
  const hasReputation = typeof reputation === 'number' && Number.isFinite(reputation);

  return (
    <XStack flex={1} style={{ minWidth: 0 }} items="center" gap={compact ? '1' : '2'}>
      <XStack
        w={avatarSize}
        h={avatarSize}
        style={{ flexShrink: 0 }}
        overflow="hidden"
        rounded="10"
        backgroundColor="#E8F5EF"
        items="center"
        justify="center"
      >
        {avatarUrl && !avatarFailed ? (
          <Image
            source={{ uri: resolveMediaUrl(avatarUrl) }}
            resizeMode="cover"
            style={StyleSheet.absoluteFill}
            onError={() => setAvatarFailed(true)}
            accessibilityLabel={name ? `Ảnh đại diện ${name}` : 'Ảnh đại diện người đăng'}
          />
        ) : (
          <UserRound size={compact ? 14 : 18} color="#16815D" />
        )}
      </XStack>

      <YStack flex={1} style={{ minWidth: 0 }}>
        <Text color="color" fontSize={compact ? '1' : '2'} fontWeight="700" numberOfLines={1}>
          {name?.trim() || 'Người đăng'}
        </Text>
        {faculty?.trim() ? (
          <Text color="color" opacity={0.65} fontSize="1" numberOfLines={1}>
            {faculty.trim()}
          </Text>
        ) : null}
      </YStack>

      {hasReputation ? (
        <XStack
          style={{ flexShrink: 0 }}
          items="center"
          gap="1"
          px="1.5"
          py="1"
          rounded="3"
          backgroundColor="#FFF7E0"
          accessibilityLabel={`Điểm uy tín ${Math.round(reputation)}`}
        >
          <ShieldCheck size={compact ? 12 : 14} color="#B7791F" />
          <Text color="#8A5A10" fontSize="1" fontWeight="700">
            {Math.round(reputation)}
          </Text>
        </XStack>
      ) : null}
    </XStack>
  );
}

export default OwnerBadge;
