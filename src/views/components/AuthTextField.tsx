import { useState, type ComponentType } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { Input, Text, XStack, YStack } from 'tamagui';

export interface AuthTextFieldProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  icon: ComponentType<{ size?: number; color?: string }>;
  secure?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  disabled?: boolean;
  onSubmitEditing?: () => void;
  hint?: string;
}

export function AuthTextField({
  label,
  value,
  onChangeText,
  placeholder,
  icon: Icon,
  secure = false,
  keyboardType,
  disabled,
  onSubmitEditing,
  hint,
}: AuthTextFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const hidden = secure && !revealed;

  return (
    <YStack gap="2">
      <Text color="#17634B" fontSize="3" fontWeight="700">
        {label}
      </Text>
      <XStack
        items="center"
        gap="3"
        backgroundColor="#FFFFFF"
        borderColor="#DCE9E1"
        borderWidth={1}
        rounded="4"
        px="4"
        h={56}
      >
        <Icon size={20} color="#648273" />
        <Input
          flex={1}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          secureTextEntry={hidden}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={onSubmitEditing}
          borderWidth={0}
          backgroundColor="transparent"
          px={0}
          color="#153D30"
          fontSize="3"
          aria-label={label}
          disabled={disabled}
        />
        {secure ? (
          <Pressable
            onPress={() => setRevealed((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            hitSlop={8}
          >
            {revealed ? <EyeOff size={20} color="#648273" /> : <Eye size={20} color="#648273" />}
          </Pressable>
        ) : null}
      </XStack>
      {hint ? (
        <Text color="#718078" fontSize="2">
          {hint}
        </Text>
      ) : null}
    </YStack>
  );
}

export default AuthTextField;
