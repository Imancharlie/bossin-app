import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useColors } from '@/hooks/useColors';
import { iconSizes, touchTarget } from '@/constants/theme';

export type IconName = keyof typeof Feather.glyphMap;

interface IconProps {
  name: IconName;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  color?: string;
  weight?: 'regular' | 'bold';
  align?: 'left' | 'center' | 'right';
  style?: any;
}

export function Icon({ 
  name, 
  size = 'md', 
  color, 
  weight = 'regular',
  align = 'center',
  style 
}: IconProps) {
  const colors = useColors();
  const iconColor = color || colors.foreground;
  const iconSize = iconSizes[size];

  const getContainerStyle = () => {
    const baseStyle = {
      minWidth: touchTarget.min,
      minHeight: touchTarget.min,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    };

    if (align === 'left') {
      return { ...baseStyle, alignItems: 'flex-start' };
    } else if (align === 'right') {
      return { ...baseStyle, alignItems: 'flex-end' };
    }
    
    return baseStyle;
  };

  return (
    <View style={[getContainerStyle(), style]}>
      <Feather 
        name={name} 
        size={iconSize} 
        color={iconColor} 
        strokeWidth={weight === 'bold' ? 2.5 : 1.5}
      />
    </View>
  );
}

// Pre-sized icon components for convenience
export function IconXs(props: Omit<IconProps, 'size'>) {
  return <Icon {...props} size="xs" />;
}

export function IconSm(props: Omit<IconProps, 'size'>) {
  return <Icon {...props} size="sm" />;
}

export function IconMd(props: Omit<IconProps, 'size'>) {
  return <Icon {...props} size="md" />;
}

export function IconLg(props: Omit<IconProps, 'size'>) {
  return <Icon {...props} size="lg" />;
}

export function IconXl(props: Omit<IconProps, 'size'>) {
  return <Icon {...props} size="xl" />;
}

export function Icon2xl(props: Omit<IconProps, 'size'>) {
  return <Icon {...props} size="2xl" />;
}
