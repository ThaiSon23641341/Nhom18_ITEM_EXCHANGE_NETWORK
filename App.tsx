import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TamaguiProvider, Theme } from 'tamagui';
import { config } from './tamagui.config';
import { LoginScreen } from './src/views/screens/LoginScreen';

type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const isLoggedIn = false;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <TamaguiProvider config={config} defaultTheme="light">
        <Theme name="light">
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={isLoggedIn ? 'Main' : 'Login'}
              screenOptions={{ headerShown: false }}
            >
              <Stack.Screen name="Login" component={LoginScreen} />
            </Stack.Navigator>
          </NavigationContainer>
          <StatusBar style="auto" />
        </Theme>
      </TamaguiProvider>
    </GestureHandlerRootView>
  );
}
