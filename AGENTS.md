
# AI AGENT CODING STANDARDS & RULEThis is an Expo/React Native mobile application. Prioritize mobile-first patterns, performance, and cross-platform compatibility.

## 1. TECH STACK & STRICT UI RULES (CRITICAL)
- **Framework:** React Native with Expo SDK
- **Language:** TypeScript (Strict typing required)
- **UI & Styling:** Tamagui (STRICT REQUIREMENT)
  - **TAMAGUI ONLY:** You MUST use Tamagui components for all UI construction (`YStack`, `XStack`, `Text`, `Button`, `Card`, `Image`, `Input`).
  - **FORBIDDEN:** NEVER use `StyleSheet.create` or inline CSS styles (`style={{...}}`).
  - **FORBIDDEN:** Do NOT import UI components from `react-native` (like `View`, `Text`, `TouchableOpacity`). Always use Tamagui equivalents.
  - **Tokens:** Always utilize Tamagui design tokens (e.g., `$primary`, `$background`, padding `$4`).
- **Animations:** Use `react-native-reanimated` & `react-native-gesture-handler`.

## 2. ARCHITECTURE (MVC PATTERN)
Maintain strict separation of concerns. Do NOT use Expo Router (`src/app/`).
- **`src/models/`**: TypeScript interfaces, types, schemas. No UI logic.
- **`src/views/`**: Contains `screens/` and `components/`. Responsible ONLY for rendering UI using Tamagui. No complex business logic.
- **`src/controllers/` (or custom hooks):** Handles state management, validation, and bridging Views with Services.
- **`src/services/`**: API requests, mock data, external SDKs.

## 3. NAVIGATION & ROUTING
- We use **React Navigation** (`@react-navigation/native-stack`), NOT Expo Router.
- The entry point and main Stack Navigator are defined in `App.tsx`.
- All screens live inside `src/views/screens/`.

## 4. COMMANDS & EXPO RULES
- Expo ships breaking changes every SDK release. APIs you remember are likely renamed or removed.
- `npx expo install <package>` - ALWAYS use instead of npm/yarn/bun add to resolve SDK-compatible versions.
- `npx expo start -c` - Start dev server and clear cache (crucial for Tamagui config changes).

## 5. WORKFLOW
- Read the existing code in `App.tsx` and `tamagui.config.ts` to understand the current configuration before adding new screens.
- Prioritize using existing components in `src/views/components/` before building new ones.