import { useWindowDimensions } from 'react-native';
import { AccessibilityInfo } from 'react-native';

export function useAccessibility() {
  const [screenReaderEnabled, setScreenReaderEnabled] = React.useState(false);
  const [reduceMotionEnabled, setReduceMotionEnabled] = React.useState(false);
  const { fontScale } = useWindowDimensions();

  React.useEffect(() => {
    const checkScreenReader = async () => {
      const enabled = await AccessibilityInfo.isScreenReaderEnabled();
      setScreenReaderEnabled(enabled);
    };

    const checkReduceMotion = async () => {
      const enabled = await AccessibilityInfo.isReduceMotionEnabled();
      setReduceMotionEnabled(enabled);
    };

    checkScreenReader();
    checkReduceMotion();

    const screenReaderSubscription = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      (enabled) => setScreenReaderEnabled(enabled)
    );

    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      (enabled) => setReduceMotionEnabled(enabled)
    );

    return () => {
      screenReaderSubscription?.remove();
      reduceMotionSubscription?.remove();
    };
  }, []);

  const isLargeFont = fontScale > 1.0;

  const getAccessibilityLabel = (label: string, hint?: string) => {
    if (hint) {
      return `${label}, ${hint}`;
    }
    return label;
  };

  const getAccessibilityRole = (role: 'button' | 'link' | 'header' | 'text' | 'image' | 'search' | 'none') => {
    return role;
  };

  const getAccessibilityState = (selected?: boolean, disabled?: boolean) => {
    const state: any = {};
    if (selected !== undefined) state.selected = selected;
    if (disabled !== undefined) state.disabled = disabled;
    return state;
  };

  return {
    screenReaderEnabled,
    reduceMotionEnabled,
    isLargeFont,
    fontScale,
    getAccessibilityLabel,
    getAccessibilityRole,
    getAccessibilityState,
  };
}
