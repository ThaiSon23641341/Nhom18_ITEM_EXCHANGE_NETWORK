import { useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, Camera, X } from 'lucide-react-native';
import { Button, Image, Input, ScrollView, Text, TextArea, XStack, YStack, useTheme } from 'tamagui';
// eslint-disable-next-line import/no-named-as-default
import CustomButton from '../components/CustomButton';

const CATEGORIES = [
  'Sách',
  'Giáo trình',
  'Dụng cụ học tập',
  'Học tập',
  'Đồ gia dụng',
  'Thời trang',
  'Thiết bị điện tử',
  'Phụ kiện',
] as const;
const CONDITIONS = ['Mới 100%', 'Như mới', 'Đã sử dụng'] as const;

export type CreateItemFormData = {
  name: string;
  category: (typeof CATEGORIES)[number] | null;
  condition: (typeof CONDITIONS)[number] | null;
  price: string;
  description: string;
  location: string;
  images: string[];
};

export interface CreateItemScreenProps {
  onBack?: () => void;
  onTakePhoto?: () => Promise<string | null>;
  onSubmit?: (data: CreateItemFormData) => Promise<void>;
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
              aria-pressed={isSelected}
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
  onTakePhoto,
  onSubmit,
}: CreateItemScreenProps) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [category, setCategory] = useState<CreateItemFormData['category']>(null);
  const [condition, setCondition] = useState<CreateItemFormData['condition']>(null);
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [imageError, setImageError] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickImages = async () => {
    const remaining = 5 - images.length;
    if (remaining <= 0) {
      setImageError('Bạn chỉ có thể chọn tối đa 5 ảnh.');
      return;
    }

    setImageError('');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: remaining > 1,
        selectionLimit: remaining,
        quality: 0.8,
      });

      if (!result.canceled) {
        setImages((current) => [
          ...current,
          ...result.assets.map((asset) => asset.uri).filter((uri) => !current.includes(uri)),
        ].slice(0, 5));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không xác định';
      setImageError(`Không thể mở thư viện ảnh: ${message}`);
    }
  };

  const handleTakePhoto = async () => {
    if (images.length >= 5) {
      setImageError('Bạn chỉ có thể chọn tối đa 5 ảnh.');
      return;
    }

    setImageError('');
    try {
      const uri = await onTakePhoto?.();
      if (uri) {
        setImages((current) => [...current, uri].slice(0, 5));
      }
    } catch (error) {
      setImageError(error instanceof Error ? error.message : 'Không thể chụp ảnh.');
    }
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!name.trim() || !category || !condition || !description.trim() || !location.trim()) {
      setFormError('Vui lòng nhập tên, danh mục, tình trạng, mô tả và địa điểm giao dịch.');
      return;
    }
    if (name.trim().length > 120 || description.trim().length > 2000 || location.trim().length > 200) {
      setFormError('Tên tối đa 120 ký tự, mô tả 2.000 ký tự và địa điểm 200 ký tự.');
      return;
    }
    if (price.trim() && !/^\d+$/.test(price.trim())) {
      setFormError('Giá tiền chỉ được nhập số nguyên không âm.');
      return;
    }
    if (!onSubmit) {
      setFormError('Chức năng đăng bài chưa được cấu hình.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
      name: name.trim(),
      category,
      condition,
      price: price.trim(),
      description: description.trim(),
      location: location.trim(),
      images,
      });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Không thể đăng đồ dùng. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
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
          aria-label="Quay lại"
        >
          <ArrowLeft size={20} color={theme.color?.val as string} />
        </Button>
        {onTakePhoto ? (
          <Button
            minH={44}
            borderWidth={1}
            borderColor="border-color"
            backgroundColor="background"
            onPress={handleTakePhoto}
            aria-label="Chụp ảnh đồ dùng"
          >
            <Button.Text color="primary">Chụp ảnh bằng camera</Button.Text>
          </Button>
        ) : null}
        <Text
          flex={1}
          color="color"
          fontSize="6"
          fontWeight="700"
          text="center"
          role="heading"
        >
          Đăng đồ dùng mới
        </Text>
        <XStack w={44} />
      </XStack>

      <ScrollView flex={1} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <YStack gap="5" pb="4">
          <Button
            w="100%"
            minH={160}
            borderWidth={1}
            borderColor="border-color"
            borderStyle="dashed"
            rounded="4"
            bg="background-hover"
            p="4"
            onPress={handlePickImages}
            aria-label={`Tải ảnh lên, đã chọn ${images.length} trên 5 ảnh`}
          >
            <YStack items="center" justify="center" gap="2">
              <Camera size={28} color={theme['color-11']?.val as string} />
              <Text color="color-11" text="center">
                {images.length > 0
                  ? `Đã chọn ${images.length}/5 ảnh · Nhấn để thêm ảnh`
                  : 'Nhấn để tải ảnh lên (Tối đa 5 ảnh)'}
              </Text>
            </YStack>
          </Button>

          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <XStack gap="2">
                {images.map((uri, index) => (
                  <YStack key={uri} position="relative">
                    <Image
                      src={uri}
                      objectFit="cover"
                      style={{ width: 96, height: 96, borderRadius: 12 }}
                      aria-label={`Ảnh đã chọn ${index + 1}`}
                    />
                    <Button
                      position="absolute"
                      t={4}
                      r={4}
                      w={28}
                      h={28}
                      circular
                      backgroundColor="background"
                      aria-label={`Xóa ảnh ${index + 1}`}
                      onPress={() => setImages((current) => current.filter((image) => image !== uri))}
                    >
                      <X size={16} color={theme.color?.val as string} />
                    </Button>
                  </YStack>
                ))}
              </XStack>
            </ScrollView>
          )}
          {imageError ? <Text color="red">{imageError}</Text> : null}

          <YStack gap="2">
            <Text color="color" fontSize="4" fontWeight="600">
              Tên đồ dùng *
            </Text>
            <Input
              value={name}
              onChangeText={setName}
              placeholder="VD: Giáo trình Giải tích 1"
              aria-label="Tên đồ dùng"
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
              aria-label="Giá tiền, đơn vị Việt Nam đồng"
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
              aria-label="Mô tả chi tiết"
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
              aria-label="Địa điểm giao dịch"
              borderColor="border-color"
              rounded="3"
              bg="background"
            />
          </YStack>

          {formError ? <Text color="red" role="alert">{formError}</Text> : null}
          <CustomButton
            mt="2"
            onPress={handleSubmit}
            disabled={isSubmitting}
            opacity={isSubmitting ? 0.7 : undefined}
            aria-label="Đăng bài ngay"
          >
            {isSubmitting ? 'Đang đăng bài...' : 'Đăng bài ngay'}
          </CustomButton>
        </YStack>
      </ScrollView>
    </YStack>
  );
}

export default CreateItemScreen;
