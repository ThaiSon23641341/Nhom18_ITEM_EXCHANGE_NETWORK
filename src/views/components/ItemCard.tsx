import { Card, Text, YStack, type CardProps } from 'tamagui';

export interface ItemCardProps extends Omit<CardProps, 'children'> {
  title: string;
  description: string;
}

export function ItemCard({ title, description, ...cardProps }: ItemCardProps) {
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
        <Text color="color" fontSize="5" fontWeight="700">
          {title}
        </Text>
        <Text color="color" opacity={0.75} fontSize="3">
          {description}
        </Text>
      </YStack>
    </Card>
  );
}

export default ItemCard;
