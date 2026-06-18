import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface StatCardProps {
  label: string;
  value: string;
  subtitle?: string;
  color?: string;
  icon?: React.ReactNode;
  flex?: number;
}

export function StatCard({ label, value, subtitle, color, icon, flex = 1 }: StatCardProps) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const anim = useRef(new Animated.Value(0)).current;

  const isNarrow = width < 380;

  useEffect(() => {
    Animated.spring(anim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 8 }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
          flex,
          padding: isNarrow ? 10 : 12,
          transform: [
            { scale: anim },
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) },
          ],
          opacity: anim,
        },
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[styles.label, { color: colors.mutedForeground, fontSize: isNarrow ? 9 : 10 }]}
          numberOfLines={2}
        >
          {label}
        </Text>
        {icon && (
          <View style={[styles.iconBg, { backgroundColor: (color ?? colors.primary) + "18" }]}>
            {icon}
          </View>
        )}
      </View>
      <Text
        style={[styles.value, { color: color ?? colors.foreground, fontSize: isNarrow ? 13 : 15 }]}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.55}
      >
        {value}
      </Text>
      {subtitle != null && (
        <Text style={[styles.subtitle, { color: colors.mutedForeground }]} numberOfLines={1}>
          {subtitle}
        </Text>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 6,
    gap: 4,
  },
  label: {
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    flex: 1,
    lineHeight: 13,
  },
  iconBg: {
    width: 26,
    height: 26,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  value: {
    fontFamily: "Inter_700Bold",
    marginBottom: 1,
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
});
