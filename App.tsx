import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TamaguiProvider, Theme, YStack, Text } from 'tamagui';
import { config } from './tamagui.config';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={config} defaultTheme="light">
        <Theme name="light">
          <YStack flex={1} backgroundColor="background" items="center" justify="center">
            <Text color="color">Open up App.tsx to start working on your app!</Text>
            <StatusBar style="auto" />
          </YStack>
        </Theme>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
