import { Platform } from 'react-native';

type AccessibilityRole = 'alert' | 'button' | 'link' | 'progressbar' | 'radio';

interface AccessibilityOptions {
  role?: AccessibilityRole;
  label?: string;
  checked?: boolean;
  disabled?: boolean;
  busy?: boolean;
  expanded?: boolean;
}

export function getAccessibilityProps({
  role,
  label,
  checked,
  disabled,
  busy,
  expanded,
}: AccessibilityOptions) {
  if (Platform.OS === 'web') {
    return {
      ...(role ? { role } : {}),
      ...(label ? { 'aria-label': label } : {}),
      ...(checked !== undefined ? { 'aria-checked': checked } : {}),
      ...(disabled !== undefined ? { 'aria-disabled': disabled } : {}),
      ...(busy !== undefined ? { 'aria-busy': busy } : {}),
      ...(expanded !== undefined ? { 'aria-expanded': expanded } : {}),
    };
  }

  return {
    ...(role ? { accessibilityRole: role } : {}),
    ...(label ? { accessibilityLabel: label } : {}),
    ...(checked !== undefined || disabled !== undefined || busy !== undefined || expanded !== undefined
      ? {
          accessibilityState: {
            ...(checked !== undefined ? { checked } : {}),
            ...(disabled !== undefined ? { disabled } : {}),
            ...(busy !== undefined ? { busy } : {}),
            ...(expanded !== undefined ? { expanded } : {}),
          },
        }
      : {}),
  };
}
