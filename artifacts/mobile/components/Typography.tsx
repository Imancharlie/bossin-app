import React from 'react';
import { StyleSheet, Text, TextStyle } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { typography } from '@/constants/theme';

interface TypographyProps {
  children: React.ReactNode;
  style?: TextStyle;
  color?: string;
  numberOfLines?: number;
  onPress?: () => void;
}

// Display Text Components
export function DisplayLarge({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.displayLarge, { color: color || colors.foreground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

export function DisplayMedium({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.displayMedium, { color: color || colors.foreground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

export function DisplaySmall({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.displaySmall, { color: color || colors.foreground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

// Title Text Components
export function TitleLarge({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.titleLarge, { color: color || colors.foreground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

export function TitleMedium({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.titleMedium, { color: color || colors.foreground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

export function TitleSmall({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.titleSmall, { color: color || colors.foreground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

// Heading Text Components
export function HeadingLarge({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.headingLarge, { color: color || colors.foreground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

export function HeadingMedium({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.headingMedium, { color: color || colors.foreground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

export function HeadingSmall({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.headingSmall, { color: color || colors.foreground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

// Card Title
export function CardTitle({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.cardTitle, { color: color || colors.foreground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

// Body Text Components
export function BodyLarge({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.bodyLarge, { color: color || colors.foreground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

export function BodyMedium({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.bodyMedium, { color: color || colors.foreground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

export function BodySmall({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.bodySmall, { color: color || colors.foreground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

// Secondary Text Components
export function SecondaryLarge({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.secondaryLarge, { color: color || colors.mutedForeground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

export function SecondaryMedium({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.secondaryMedium, { color: color || colors.mutedForeground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

export function SecondarySmall({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.secondarySmall, { color: color || colors.mutedForeground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

// Caption
export function Caption({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.caption, { color: color || colors.mutedForeground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}

// Label (uppercase, small)
export function Label({ children, style, color, numberOfLines, onPress }: TypographyProps) {
  const colors = useColors();
  return (
    <Text
      style={[typography.label, { color: color || colors.mutedForeground }, style]}
      numberOfLines={numberOfLines}
      onPress={onPress}
    >
      {children}
    </Text>
  );
}
