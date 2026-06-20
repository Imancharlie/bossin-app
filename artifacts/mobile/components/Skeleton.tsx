import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { borderRadius } from '@/constants/theme';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  style?: any;
  variant?: 'rect' | 'circle';
}

export function Skeleton({ width, height, style, variant = 'rect' }: SkeletonProps) {
  const colors = useColors();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(anim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const backgroundColor = anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [
      colors.muted,
      colors.muted + '80',
      colors.muted,
    ],
  });

  const borderRadiusStyle = variant === 'circle' 
    ? { borderRadius: (typeof height === 'number' ? height : 20) / 2 }
    : { borderRadius: borderRadius.md };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, backgroundColor },
        borderRadiusStyle,
        style,
      ]}
    />
  );
}

interface SkeletonCardProps {
  style?: any;
}

export function SkeletonCard({ style }: SkeletonCardProps) {
  return (
    <View style={[styles.card, style]}>
      <Skeleton width={40} height={40} variant="circle" style={styles.avatar} />
      <View style={styles.content}>
        <Skeleton width="60%" height={16} style={styles.title} />
        <Skeleton width="40%" height={12} style={styles.subtitle} />
      </View>
    </View>
  );
}

interface SkeletonListProps {
  count?: number;
  style?: any;
}

export function SkeletonList({ count = 5, style }: SkeletonListProps) {
  return (
    <View style={style}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} style={styles.item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    overflow: 'hidden',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  avatar: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: 6,
  },
  subtitle: {
    marginBottom: 4,
  },
  item: {
    marginBottom: 8,
  },
});
