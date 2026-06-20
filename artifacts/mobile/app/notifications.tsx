import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { useColors } from "@/hooks/useColors";

type NotificationType = "info" | "success" | "warning" | "danger";
type FilterTab = "all" | "payments" | "members";

const NOTIFICATIONS = [
  {
    id: 1,
    title: "New member added",
    message: "John Doe has been added to the organization.",
    time: "2h ago",
    type: "info" as NotificationType,
    filter: "members" as FilterTab,
    read: false,
  },
  {
    id: 2,
    title: "Payment received",
    message: "Jane Smith paid TZS 50,000.",
    time: "5h ago",
    type: "success" as NotificationType,
    filter: "payments" as FilterTab,
    badge: "TZS 50,000",
    read: false,
    section: "Today",
  },
  {
    id: 3,
    title: "Pledge reminder",
    message: "3 members haven't paid their pledges yet.",
    time: "1d ago",
    type: "warning" as NotificationType,
    filter: "members" as FilterTab,
    badge: "3 pending",
    read: false,
    section: "Yesterday",
  },
];

const TYPE_CONFIG: Record<NotificationType, { icon: string; bg: string; color: string }> = {
  info:    { icon: "info",           bg: "primary",    color: "primary" },
  success: { icon: "check-circle",   bg: "success",   color: "success" },
  warning: { icon: "alert-triangle", bg: "warning",   color: "warning" },
  danger:  { icon: "alert-octagon",  bg: "destructive", color: "destructive" },
};

const BADGE_CONFIG: Record<NotificationType, { bg: string; color: string }> = {
  info:    { bg: "primary",    color: "primary" },
  success: { bg: "success",   color: "success" },
  warning: { bg: "warning",   color: "warning" },
  danger:  { bg: "destructive", color: "destructive" },
};

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isNarrow = width < 380;

  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 36 + 78 : 78 + insets.bottom;

  const filtered = activeTab === "all"
    ? notifications
    : notifications.filter((n) => n.filter === activeTab);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: number) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  // Group by section label
  const today = filtered.filter((n) => n.time.includes("h ago"));
  const yesterday = filtered.filter((n) => n.time.includes("d ago"));

  const TABS: { key: FilterTab; label: string }[] = [
    { key: "all",      label: "All" },
    { key: "payments", label: "Payments" },
    { key: "members",  label: "Members" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.primary,
            paddingTop: topPad + 16,
            paddingHorizontal: isNarrow ? 14 : 16,
            paddingBottom: 14,
          },
        ]}
      >
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { fontSize: isNarrow ? 18 : 20 }]}>
              Notifications
            </Text>
            <Text style={styles.headerSub}>
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </Text>
          </View>
          {unreadCount > 0 && (
            <TouchableOpacity style={styles.markAllBtn} onPress={markAllRead}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Filter tabs */}
        <View style={styles.tabs}>
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.tabActive,
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab.key && { color: colors.primary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingBottom: bottomPad,
          padding: isNarrow ? 14 : 16,
          gap: 4,
        }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <EmptyState icon="bell" title="No notifications" message="You're all caught up!" />
        ) : (
          <>
            {today.length > 0 && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>
                  Today
                </Text>
                {today.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    colors={colors}
                    isNarrow={isNarrow}
                    onPress={() => markRead(n.id)}
                  />
                ))}
              </>
            )}
            {yesterday.length > 0 && (
              <>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: colors.mutedForeground, marginTop: today.length > 0 ? 12 : 0 },
                  ]}
                >
                  Yesterday
                </Text>
                {yesterday.map((n) => (
                  <NotificationCard
                    key={n.id}
                    notification={n}
                    colors={colors}
                    isNarrow={isNarrow}
                    onPress={() => markRead(n.id)}
                  />
                ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function NotificationCard({ notification, colors, isNarrow, onPress }: any) {
  const cfg = TYPE_CONFIG[notification.type as NotificationType];
  const badgeCfg = BADGE_CONFIG[notification.type as NotificationType];

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: notification.read ? colors.card : colors.card + "FF",
          borderColor: notification.read ? colors.border : colors.primary + "30",
          borderLeftColor: notification.read ? colors.border : colors.primary,
          borderLeftWidth: notification.read ? 1 : 4,
          marginBottom: 8,
          shadowColor: notification.read ? "transparent" : colors.primary + "20",
          shadowOpacity: notification.read ? 0 : 0.15,
          shadowRadius: notification.read ? 0 : 8,
          shadowOffset: { width: 0, height: 2 },
          elevation: notification.read ? 0 : 2,
        },
      ]}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
      )}

      {/* Icon */}
      <View style={[styles.iconWrap, { backgroundColor: colors[cfg.bg as keyof typeof colors] + "15" }]}>
        <Feather name={cfg.icon as any} size={16} color={colors[cfg.color as keyof typeof colors]} />
      </View>

      {/* Content */}
      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text
            style={[
              styles.cardTitle,
              {
                color: colors.foreground,
                fontSize: isNarrow ? 13 : 14,
                fontFamily: notification.read ? "Inter_400Regular" : "Inter_600SemiBold",
              },
            ]}
          >
            {notification.title}
          </Text>
          <Text
            style={[
              styles.cardTime,
              { color: colors.mutedForeground, fontSize: isNarrow ? 10 : 11 },
            ]}
          >
            {notification.time}
          </Text>
        </View>

        <Text
          style={[
            styles.cardMsg,
            { color: colors.mutedForeground, fontSize: isNarrow ? 11 : 12 },
          ]}
        >
          {notification.message}
        </Text>

        {notification.badge && (
          <View
            style={[
              styles.badge,
              { backgroundColor: colors[badgeCfg.bg as keyof typeof colors] + "15" },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors[badgeCfg.color as keyof typeof colors] }]}>
              {notification.badge}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {},
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerCenter: { flex: 1 },
  headerTitle: { fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 2 },
  headerSub: { fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)", fontSize: 12 },
  markAllBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
  },
  markAllText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  tabs: { flexDirection: "row", gap: 8 },
  tab: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 22,
  },
  tabActive: { backgroundColor: "#fff" },
  tabText: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_600SemiBold" },
  sectionLabel: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  card: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    position: "relative",
  },
  unreadDot: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  cardContent: { flex: 1 },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 3,
  },
  cardTitle: { flex: 1 },
  cardTime: { fontFamily: "Inter_400Regular", flexShrink: 0 },
  cardMsg: { fontFamily: "Inter_400Regular", lineHeight: 17 },
  badge: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});