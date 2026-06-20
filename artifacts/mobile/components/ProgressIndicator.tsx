import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { spacing } from '@/constants/theme';

interface ProgressIndicatorProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
}

export function ProgressIndicator({ size = 'large', color, text }: ProgressIndicatorProps) {
  const colors = useColors();
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color || colors.primary} />
      {text && <Text style={[styles.text, { color: colors.mutedForeground }]}>{text}</Text>}
    </View>
  );
}

interface ProgressBarProps {
  progress: number;
  color?: string;
  height?: number;
  showPercentage?: boolean;
}

export function ProgressBar({ progress, color, height = 8, showPercentage = false }: ProgressBarProps) {
  const colors = useColors();
  const progressColor = color || colors.primary;
  const clampedProgress = Math.min(100, Math.max(0, progress));
  
  return (
    <View style={styles.progressBarContainer}>
      <View style={[styles.progressBarTrack, { height }]}>
        <View 
          style={[
            styles.progressBarFill, 
            { 
              width: `${clampedProgress}%`, 
              backgroundColor: progressColor,
              height 
            }
          ]} 
        />
      </View>
      {showPercentage && (
        <Text style={[styles.percentageText, { color: colors.mutedForeground }]}>
          {Math.round(clampedProgress)}%
        </Text>
      )}
    </View>
  );
}

interface LoadingOverlayProps {
  visible: boolean;
  text?: string;
}

export function LoadingOverlay({ visible, text }: LoadingOverlayProps) {
  const colors = useColors();
  
  if (!visible) return null;
  
  return (
    <View style={[styles.overlay, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
      <View style={[styles.overlayContent, { backgroundColor: colors.card }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        {text && <Text style={[styles.overlayText, { color: colors.foreground }]}>{text}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  text: {
    marginTop: spacing.md,
    fontSize: 14,
  },
  progressBarContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarTrack: {
    width: '100%',
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    borderRadius: 4,
  },
  percentageText: {
    marginTop: spacing.sm,
    fontSize: 12,
    fontWeight: '600',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  overlayContent: {
    padding: spacing.xl,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
  },
  overlayText: {
    marginTop: spacing.md,
    fontSize: 14,
    fontWeight: '500',
  },
});
