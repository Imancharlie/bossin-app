import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { Platform, StyleSheet, View, useWindowDimensions } from "react-native";
import { useColors } from "@/hooks/useColors";

export default function TabLayout() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const { width } = useWindowDimensions();
  const isSmallScreen = width < 375;
  const isLargeScreen = width > 768;

  const tabBarHeight = isLargeScreen ? 90 : isSmallScreen ? 70 : 78;
  const paddingBottom = isLargeScreen ? 36 : isSmallScreen ? 12 : 18;
  const iconSize = isSmallScreen ? 20 : 22;
  const focusedIconSize = isSmallScreen ? 22 : 24;
  const labelFontSize = isSmallScreen ? 10 : 12;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.navBackground,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          height: Platform.OS === "web" ? tabBarHeight : tabBarHeight,
          paddingBottom: Platform.OS === "web" ? paddingBottom : paddingBottom,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: "Inter_600SemiBold",
          fontSize: labelFontSize,
        },
        tabBarActiveBackgroundColor: isIOS ? "transparent" : colors.primary + "08",
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <Feather
                name="home"
                size={focused ? focusedIconSize : iconSize}
                color={focused ? colors.primary : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="members"
        options={{
          title: "Members",
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <Feather
                name="users"
                size={focused ? focusedIconSize : iconSize}
                color={focused ? colors.primary : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <Feather
                name="credit-card"
                size={focused ? focusedIconSize : iconSize}
                color={focused ? colors.primary : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <Feather
                name="bar-chart-2"
                size={focused ? focusedIconSize : iconSize}
                color={focused ? colors.primary : color}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ focused, color }) => (
            <View style={[styles.iconContainer, focused && styles.iconActive]}>
              <Feather
                name="settings"
                size={focused ? focusedIconSize : iconSize}
                color={focused ? colors.primary : color}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  iconActive: {
    backgroundColor: "rgba(15, 118, 110, 0.1)",
  },
});
