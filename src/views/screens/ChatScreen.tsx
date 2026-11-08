import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, RefreshCw, Send } from 'lucide-react-native';
import { Button, Input, Text, XStack, YStack } from 'tamagui';
import { useAuthController } from '../../controllers/useAuthController';
import { useChatController } from '../../controllers/useChatController';
import type { Message } from '../../models/messageModel';

export interface ChatScreenProps {
  appointmentId: string;
}

export function ChatScreen({ appointmentId }: ChatScreenProps) {
  const [draft, setDraft] = useState('');
  const messagesList = useRef<FlatList<Message>>(null);
  const { user } = useAuthController();
  const {
    messages,
    isLoading,
    isSending,
    isReadOnly,
    error,
    reload,
    send,
  } = useChatController(appointmentId);

  const renderMessage = ({ item }: { item: Message }) => {
    const isMine = item.senderId === user?.id;
    return (
      <XStack justify={isMine ? 'flex-end' : 'flex-start'} px="3" py="1">
        <YStack
          style={{ width: '85%' }}
          backgroundColor={isMine ? 'primary' : 'background-hover'}
          rounded="4"
          px="3"
          py="2"
        >
          <Text color={isMine ? 'white' : 'color'}>{item.text}</Text>
          <Text color={isMine ? 'white' : 'color'} opacity={0.7} fontSize="2">
            {new Date(item.createdAt).toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </YStack>
      </XStack>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <YStack flex={1} backgroundColor="background">
        <XStack h={56} px="3" items="center" gap="2" borderBottomWidth={1} borderColor="border-color">
          <Button
            circular
            w={40}
            h={40}
            aria-label="Quay lại lịch hẹn"
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} />
          </Button>
          <Text flex={1} color="color" fontSize="5" fontWeight="700">
            Chat lịch hẹn
          </Text>
          <Button
            circular
            w={40}
            h={40}
            aria-label="Tải lại tin nhắn"
            onPress={() => void reload()}
          >
            <RefreshCw size={18} />
          </Button>
        </XStack>

        {isLoading ? (
          <YStack flex={1} items="center" justify="center">
            <ActivityIndicator />
          </YStack>
        ) : (
          <FlatList
            ref={messagesList}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(message) => message.id}
            contentContainerStyle={{ flexGrow: 1, paddingVertical: 12 }}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() => messagesList.current?.scrollToEnd({ animated: true })}
            ListEmptyComponent={(
              <YStack flex={1} items="center" justify="center" p="4">
                <Text color="color" opacity={0.7}>Chưa có tin nhắn. Hãy bắt đầu cuộc trò chuyện.</Text>
              </YStack>
            )}
          />
        )}

        {error ? (
          <Text role="alert" color="red" px="3" py="2">{error}</Text>
        ) : null}
        {isReadOnly ? (
          <Text color="color" opacity={0.7} text="center" px="3" py="3">
            Cuộc chat chưa mở hoặc lịch hẹn đã kết thúc; chỉ có thể xem tin nhắn.
          </Text>
        ) : (
          <XStack px="3" py="2" gap="2" items="center" borderTopWidth={1} borderColor="border-color">
            <Input
              flex={1}
              value={draft}
              onChangeText={setDraft}
              placeholder="Nhập tin nhắn..."
              maxLength={2000}
              aria-label="Tin nhắn"
              onSubmitEditing={() => {
                void send(draft).then((sent) => {
                  if (sent) setDraft('');
                });
              }}
            />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Gửi tin nhắn"
              disabled={!draft.trim() || isSending}
              onPress={() => {
                void send(draft).then((sent) => {
                  if (sent) setDraft('');
                });
              }}
              style={{ opacity: !draft.trim() || isSending ? 0.5 : 1, padding: 8 }}
            >
              <Send size={20} color="#16815D" />
            </Pressable>
          </XStack>
        )}
      </YStack>
    </KeyboardAvoidingView>
  );
}
