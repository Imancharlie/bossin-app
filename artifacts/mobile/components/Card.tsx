import React, { useRef } from 'react';
import {
  Animated,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import { useColors } from '@/hooks/useColors';
import { spacing, borderRadius, shadows } from '@/constants/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  padding?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
  margin?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | number;
  elevation?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'default' | 'outlined' | 'elevated';
}

export function Card({
  children,
  style,
  onPress,
  disabled = false,
  padding = 'md',
  margin = 0,
  elevation = 'md',
  variant = 'default',
}: CardProps) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  };

  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: borderRadius[variant === 'outlined' ? 'md' : 'lg'],
      padding: spacing[padding],
      margin: typeof margin === 'number' ? margin : spacing[margin],
    };

    if (variant === 'outlined') {
      baseStyle.borderWidth = 1;
      baseStyle.borderColor = colors.border;
    } else if (variant === 'elevated') {
      Object.assign(baseStyle, shadows[elevation]);
    } else {
      Object.assign(baseStyle, shadows.sm);
    }

    return baseStyle;
  };

  const cardContent = (
    <Animated.View
      style={[
        styles.card,
        getCardStyle(),
        { transform: [{ scale: scaleAnim }] },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );

  if (onPress && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
        disabled={disabled}
      >
        {cardContent}
      </TouchableOpacity>
    );
  }

  return cardContent;
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
  },
});
