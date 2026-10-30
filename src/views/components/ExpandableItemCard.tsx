import { useCallback, useState } from 'react';
import { Text, YStack } from 'tamagui';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { ItemCard } from './ItemCard';

export interface ExpandableItemCardProps {
  title: string;
  description: string;
  details: string;
  expandedHeight?: number;
}

const ANIMATION_DURATION_MS = 240;
const DEFAULT_EXPANDED_HEIGHT = 112;

export function ExpandableItemCard({
  title,
  description,
  details,
  expandedHeight = DEFAULT_EXPANDED_HEIGHT,
}: ExpandableItemCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const animatedHeight = useSharedValue(0);
  const animatedOpacity = useSharedValue(0);

  const detailStyle = useAnimatedStyle(() => ({
    height: animatedHeight.value,
    opacity: animatedOpacity.value,
    overflow: 'hidden',
  }));

  const toggleExpanded = useCallback(() => {
    const nextExpanded = !isExpanded;
    setIsExpanded(nextExpanded);
    // Reanimated shared values are intentionally mutated to drive UI-thread animations.
    // eslint-disable-next-line react-hooks/immutability
    animatedHeight.value = withTiming(nextExpanded ? expandedHeight : 0, {
      duration: ANIMATION_DURATION_MS,
    });
    // eslint-disable-next-line react-hooks/immutability
    animatedOpacity.value = withTiming(nextExpanded ? 1 : 0, {
      duration: ANIMATION_DURATION_MS,
    });
  }, [animatedHeight, animatedOpacity, expandedHeight, isExpanded]);

  return (
    <YStack>
      <ItemCard
        title={title}
        description={description}
        onPress={toggleExpanded}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        accessibilityLabel={`${title}, ${isExpanded ? 'collapse' : 'expand'} details`}
      />
      <Animated.View
        style={detailStyle}
        pointerEvents={isExpanded ? 'auto' : 'none'}
        accessibilityElementsHidden={!isExpanded}
        importantForAccessibility={isExpanded ? 'auto' : 'no-hide-descendants'}
      >
        <YStack
          backgroundColor="background"
          borderColor="border-color"
          borderBottomLeftRadius="4"
          borderBottomRightRadius="4"
          px="4"
          pb="3"
          gap="2"
        >
          <Text color="color" fontWeight="700">
            Details
          </Text>
          <Text color="color" opacity={0.8}>
            {details}
          </Text>
        </YStack>
      </Animated.View>
    </YStack>
  );
}

export default ExpandableItemCard;
