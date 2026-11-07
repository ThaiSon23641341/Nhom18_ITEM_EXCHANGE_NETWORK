import { Card, Text, YStack, type CardProps } from 'tamagui';
import { useColorScheme } from 'react-native';

export interface ItemCardProps extends Omit<CardProps, 'children'> {
  title: string;
  description: string;
}

export function ItemCard({ title, description, ...cardProps }: ItemCardProps) {
  const isDark = useColorScheme() === 'dark';
  const foregroundColor = isDark ? '#F3F4F6' : '#172033';
  const descriptionColor = isDark ? '#D1D5DB' : '#475467';

  return (
    <Card
      backgroundColor="background"
      borderColor="border-color"
      borderWidth={1}
      rounded="4"
      p="4"
      {...cardProps}
    >
      <YStack gap="2">
        <Text color={foregroundColor} fontSize="5" fontWeight="700">
          {title}
        </Text>
        <Text color={descriptionColor} fontSize="3">
          {description}
        </Text>
      </YStack>
    </Card>
  );
}

export default ItemCard;
