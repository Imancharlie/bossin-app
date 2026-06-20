import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatCard } from "@/components/StatCard";
import { TransactionItem } from "@/components/TransactionItem";
import { EmptyState } from "@/components/EmptyState";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

function ProgressBar({ value, color, bg }: { value: number; color: string; bg: string }) {
  return (
    <View style={[pbStyles.track, { backgroundColor: bg }]}>
      <View style={[pbStyles.fill, { width: `${Math.min(100, value)}%` as any, backgroundColor: color }]} />
    </View>
  );
}
const pbStyles = StyleSheet.create({
  track: { height: 6, borderRadius: 3, overflow: "hidden", marginVertical: 7 },
  fill: { height: "100%", borderRadius: 3 },
});

function QuickAction({ icon, label, onPress, color }: { icon: string; label: string; onPress: () => void; color: string }) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const isNarrow = width < 380;
  return (
    <TouchableOpacity
      style={[qaStyles.btn, { backgroundColor: color + "15", borderColor: color + "30", padding: isNarrow ? 10 : 12 }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[qaStyles.icon, { backgroundColor: color + "25", width: isNarrow ? 34 : 38, height: isNarrow ? 34 : 38, borderRadius: isNarrow ? 10 : 11 }]}>
        <Feather name={icon as any} size={isNarrow ? 15 : 17} color={color} />
      </View>
      <Text style={[qaStyles.label, { color: colors.foreground, fontSize: isNarrow ? 9 : 10 }]} numberOfLines={2}>{label}</Text>
    </TouchableOpacity>
  );
}
const qaStyles = StyleSheet.create({
  btn: { alignItems: "center", gap: 6, borderRadius: 12, flex: 1, borderWidth: 1 },
  icon: { alignItems: "center", justifyContent: "center" },
  label: { fontFamily: "Inter_600SemiBold", textAlign: "center" },
});

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, totalCollected, totalExpenses, progress, completeCount, refreshData, isLoading } = useData();
  const { width } = useWindowDimensions();
  const [refreshing, setRefreshing] = React.useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;
  const isNarrow = width < 380;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  // Add safety checks for data
  const recentTx = data?.transactions?.slice(0, 5) || [];
  const org = data?.organization || { name: "Loading...", currency: "TZS" };
  const dashboardStats = data?.dashboardStats || { total_pledged: "0", target_amount: "0", total_collected: "0" };

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 36 + 78 : 78 + insets.bottom;
  const hPad = isNarrow ? 14 : 16;

  const totalPledged = parseFloat(dashboardStats?.total_pledged || "0");
  const targetAmount = parseFloat(dashboardStats?.target_amount || "0");
  const totalCollectedAmount = parseFloat(dashboardStats?.total_collected || "0");
  const balance = totalCollectedAmount - totalExpenses;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12, paddingHorizontal: hPad }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={[styles.orgName, { fontSize: isNarrow ? 14 : 16 }]} numberOfLines={1}>{org.name}</Text>
            <Text style={[styles.welcome, { fontSize: isNarrow ? 11 : 12 }]} numberOfLines={1}>Welcome back, {user?.username} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push("/notifications")}
            activeOpacity={0.8}
          >
            <Feather name="bell" size={17} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>

        {/* Balance + stat cards in header */}
        <View style={styles.balanceChip}>
          <Text style={[styles.balanceLabel, { fontSize: isNarrow ? 9 : 10 }]}>BALANCE</Text>
          <Text
            style={[styles.balanceValue, { fontSize: isNarrow ? 20 : 23 }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.6}
          >
            TZS {balance.toLocaleString()}
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad, padding: hPad, gap: 0 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Stat Cards Row */}
        <View style={[styles.statRow, { gap: isNarrow ? 7 : 9, marginBottom: 10, marginTop: 12 }]}>
          <StatCard
            label="Total Collected"
            value={`TZS ${totalCollectedAmount.toLocaleString()}`}
            color={colors.success}
            icon={<Feather name="trending-up" size={13} color={colors.success} />}
          />
          <StatCard
            label="Target Amount"
            value={`TZS ${targetAmount.toLocaleString()}`}
            color={colors.primary}
            icon={<Feather name="target" size={13} color={colors.primary} />}
          />
        </View>

        {/* Progress card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginBottom: 10 }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: colors.foreground, fontSize: isNarrow ? 13 : 14 }]}>Mission Progress</Text>
            <Text style={[styles.progressPct, { color: colors.primary, fontSize: isNarrow ? 15 : 17 }]}>{dashboardStats?.progress_percentage.toFixed(1) || 0}%</Text>
          </View>
          <ProgressBar value={dashboardStats?.progress_percentage || 0} color={colors.primary} bg={colors.muted} />
          <Text style={[styles.cardSub, { color: colors.mutedForeground, fontSize: isNarrow ? 10 : 11 }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
            TZS {totalCollectedAmount.toLocaleString()} of TZS {targetAmount.toLocaleString()} target
          </Text>
          <View style={[styles.statChipRow, { marginTop: 10 }]}>
            <View style={styles.statChip}>
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
              <Text style={[styles.chipLabel, { color: colors.mutedForeground, fontSize: isNarrow ? 10 : 11 }]}>{dashboardStats?.complete_count || 0} Done</Text>
            </View>
            <View style={styles.statChip}>
              <View style={[styles.dot, { backgroundColor: colors.warning }]} />
              <Text style={[styles.chipLabel, { color: colors.mutedForeground, fontSize: isNarrow ? 10 : 11 }]}>{dashboardStats?.incomplete_count || 0} Partial</Text>
            </View>
            <View style={styles.statChip}>
              <View style={[styles.dot, { backgroundColor: colors.destructive }]} />
              <Text style={[styles.chipLabel, { color: colors.mutedForeground, fontSize: isNarrow ? 10 : 11 }]}>{dashboardStats?.not_paid_count || 0} Pending</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: isNarrow ? 13 : 14 }]}>Quick Actions</Text>
        <View style={[styles.statRow, { gap: isNarrow ? 7 : 9, marginBottom: 14 }]}>
          <QuickAction icon="users" label={"Daily\nCollection"} onPress={() => router.push("/daily-collection")} color={colors.primary} />
          <QuickAction icon="user-plus" label={"Add\nMember"} onPress={() => router.push("/add-member")} color={colors.secondary} />
          <QuickAction icon="plus-circle" label={"Add\nTransaction"} onPress={() => router.push("/add-transaction")} color={colors.accent} />
        </View>

        {/* Recent Transactions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.foreground, fontSize: isNarrow ? 13 : 14, marginBottom: 0 }]}>Recent Transactions</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/transactions")}>
            <Text style={[styles.seeAll, { color: colors.primary, fontSize: isNarrow ? 11 : 12 }]}>See all</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginTop: 8 }}>
          {recentTx.length === 0 ? (
            <EmptyState icon="credit-card" title="No transactions yet" subtitle="Transactions you record will appear here" />
          ) : (
            recentTx.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} currency="TZS" />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingBottom: 16 },
  headerTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 12 },
  headerLeft: { flex: 1, marginRight: 10 },
  orgName: { fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 2 },
  welcome: { fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  notifBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  balanceChip: { backgroundColor: "rgba(255,255,255,0.14)", borderRadius: 12, padding: 12 },
  balanceLabel: { fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.65)", letterSpacing: 0.5, marginBottom: 3 },
  balanceValue: { fontFamily: "Inter_700Bold", color: "#fff" },
  scroll: { flex: 1 },
  statRow: { flexDirection: "row", alignItems: "stretch" },
  card: { borderRadius: 12, padding: 12, borderWidth: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontFamily: "Inter_600SemiBold" },
  progressPct: { fontFamily: "Inter_700Bold" },
  cardSub: { fontFamily: "Inter_400Regular" },
  statChipRow: { flexDirection: "row", gap: 0, justifyContent: "space-between" },
  statChip: { flexDirection: "row", alignItems: "center", gap: 4 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  chipLabel: { fontFamily: "Inter_500Medium" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sectionTitle: { fontFamily: "Inter_700Bold", marginBottom: 9, marginTop: 0 },
  seeAll: { fontFamily: "Inter_600SemiBold" },
});
