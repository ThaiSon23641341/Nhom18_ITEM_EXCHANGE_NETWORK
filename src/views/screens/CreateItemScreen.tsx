import { useState } from 'react';
import { ArrowLeft, Camera } from 'lucide-react-native';
import { Button, Input, ScrollView, Text, TextArea, XStack, YStack, useTheme } from 'tamagui';
// eslint-disable-next-line import/no-named-as-default
import CustomButton from '../components/CustomButton';

const CATEGORIES = ['Sách', 'Học tập', 'Đồ gia dụng'] as const;
const CONDITIONS = ['Mới 100%', 'Như mới', 'Đã sử dụng'] as const;

export type CreateItemFormData = {
  name: string;
  category: (typeof CATEGORIES)[number] | null;
  condition: (typeof CONDITIONS)[number] | null;
  price: string;
  description: string;
  location: string;
};

export interface CreateItemScreenProps {
  onBack?: () => void;
  onPressUpload?: () => void;
  onSubmit?: (data: CreateItemFormData) => void;
}

interface ChipGroupProps<T extends string> {
  label: string;
  options: readonly T[];
  selected: T | null;
  onSelect: (value: T) => void;
}

function ChipGroup<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: ChipGroupProps<T>) {
  return (
    <YStack gap="2">
      <Text color="color" fontSize="4" fontWeight="600">
        {label}
      </Text>
      <XStack flexWrap="wrap" gap="2">
        {options.map((option) => {
          const isSelected = selected === option;

          return (
            <Button
              key={option}
              minH={40}
              px="3"
              borderWidth={1}
              borderColor={isSelected ? 'primary' : 'border-color'}
              rounded="10"
              bg={isSelected ? 'primary' : 'background'}
              onPress={() => onSelect(option)}
              accessibilityRole="radio"
              accessibilityState={{ checked: isSelected }}
            >
              <Button.Text color={isSelected ? 'white' : 'color'} fontWeight="600">
                {option}
              </Button.Text>
            </Button>
          );
        })}
      </XStack>
    </YStack>
  );
}

export function CreateItemScreen({
  onBack,
  onPressUpload,
  onSubmit,
}: CreateItemScreenProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CreateItemFormData['category']>(null);
  const [condition, setCondition] = useState<CreateItemFormData['condition']>(null);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    onSubmit?.({
      name: name.trim(),
      category,
      condition,
      price: price.trim(),
      description: description.trim(),
      location: location.trim(),
    });
  };

  return (
    <YStack flex={1} bg="background" p="4" gap="4">
      <XStack items="center" justify="space-between" minH={48}>
        <Button
          w={44}
          h={44}
          circular
          variant="outlined"
          onPress={onBack}
          accessibilityRole="button"
          accessibilityLabel="Quay lại"
        >
          <ArrowLeft size={20} color={theme.color?.val as string} />
        </Button>
        <Text
          flex={1}
          color="color"
          fontSize="6"
          fontWeight="700"
          text="center"
          accessibilityRole="header"
        >
          Đăng đồ dùng mới
        </Text>
        <XStack w={44} />
      </XStack>

      <ScrollView flex={1} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <YStack gap="5" pb="4">
          <YStack
            minH={160}
            borderWidth={1}
            borderColor="border-color"
            borderStyle="dashed"
            rounded="4"
            bg="background-hover"
            justify="center"
            items="center"
            gap="2"
            p="4"
            onPress={onPressUpload}
            accessibilityRole="button"
            accessibilityLabel="Tải ảnh lên, tối đa 5 ảnh"
          >
            <Camera size={28} color={theme['color-11']?.val as string} />
            <Text color="color-11" text="center">
              Nhấn để tải ảnh lên (Tối đa 5 ảnh)
            </Text>
          </YStack>

          <YStack gap="2">
            <Text color="color" fontSize="4" fontWeight="600">
              Tên đồ dùng *
            </Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="VD: Giáo trình Giải tích 1"
              accessibilityLabel="Tên đồ dùng"
              borderColor="border-color"
              rounded="3"
              bg="background"
            />
          </YStack>

          <ChipGroup
            label="Danh mục *"
            options={CATEGORIES}
            selected={category}
            onSelect={setCategory}
          />

          <ChipGroup
            label="Tình trạng *"
            options={CONDITIONS}
            selected={condition}
            onSelect={setCondition}
          />

          <YStack gap="2">
            <Text color="color" fontSize="4" fontWeight="600">
              Giá tiền (VNĐ)
            </Text>
            <Input
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
              placeholder="Để 0 hoặc bỏ trống nếu cho tặng"
              accessibilityLabel="Giá tiền, đơn vị Việt Nam đồng"
              borderColor="border-color"
              rounded="3"
              bg="background"
            />
          </YStack>

          <YStack gap="2">
            <Text color="color" fontSize="4" fontWeight="600">
              Mô tả chi tiết
            </Text>
            <TextArea
              value={description}
              onChangeText={setDescription}
              minH={100}
              placeholder="Mô tả tình trạng, năm mua, lý do pass..."
              accessibilityLabel="Mô tả chi tiết"
              borderColor="border-color"
              rounded="3"
              bg="background"
              textAlignVertical="top"
            />
          </YStack>

          <YStack gap="2">
            <Text color="color" fontSize="4" fontWeight="600">
              Địa điểm giao dịch *
            </Text>
            <Input
              value={location}
              onChangeText={setLocation}
              placeholder="VD: KTX Khu B, Thư viện IUH"
              accessibilityLabel="Địa điểm giao dịch"
              borderColor="border-color"
              rounded="3"
              bg="background"
            />
          </YStack>

          <CustomButton mt="2" onPress={handleSubmit} accessibilityLabel="Đăng bài ngay">
            Đăng bài ngay
          </CustomButton>
        </YStack>
      </ScrollView>
    </YStack>
  );
}

export default CreateItemScreen;
