import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useCallback, useRef } from "react";
import {
  Animated,
  FlatList,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  track: { height: 8, borderRadius: 4, overflow: "hidden", marginVertical: 8 },
  fill: { height: "100%", borderRadius: 4 },
});

function QuickAction({ icon, label, onPress, color }: { icon: string; label: string; onPress: () => void; color: string }) {
  const colors = useColors();
  return (
    <TouchableOpacity style={[qaStyles.btn, { backgroundColor: color + "15", borderColor: color + "30" }]} onPress={onPress} activeOpacity={0.75}>
      <View style={[qaStyles.icon, { backgroundColor: color + "25" }]}>
        <Feather name={icon as any} size={18} color={color} />
      </View>
      <Text style={[qaStyles.label, { color: colors.foreground }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const qaStyles = StyleSheet.create({
  btn: { alignItems: "center", gap: 8, padding: 14, borderRadius: 14, flex: 1, borderWidth: 1 },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", textAlign: "center" },
});

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { data, totalCollected, totalExpenses, progress, completeCount, refreshData, isLoading } = useData();
  const [refreshing, setRefreshing] = React.useState(false);
  const scrollY = useRef(new Animated.Value(0)).current;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  const recentTx = data.transactions.slice(0, 5);
  const balance = totalCollected - totalExpenses;
  const { organization: org } = data;

  const headerBg = scrollY.interpolate({ inputRange: [0, 60], outputRange: [colors.primary, colors.primary], extrapolate: "clamp" });

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 68 : 68 + insets.bottom;

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Animated.View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.orgName}>{org.name}</Text>
            <Text style={styles.welcome}>Welcome back, {user?.username} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.notifBtn}
            onPress={() => router.push("/daily-collection")}
            activeOpacity={0.8}
          >
            <Feather name="bell" size={20} color="rgba(255,255,255,0.9)" />
          </TouchableOpacity>
        </View>
        {/* Balance chip */}
        <View style={styles.balanceChip}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceValue}>
            {org.currency} {balance.toLocaleString()}
          </Text>
        </View>
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Stat Cards */}
        <View style={styles.section}>
          <View style={styles.row}>
            <StatCard
              label="Total Collected"
              value={`${org.currency} ${totalCollected.toLocaleString()}`}
              color={colors.success}
              icon={<Feather name="trending-up" size={16} color={colors.success} />}
            />
            <View style={styles.gap} />
            <StatCard
              label="Expenses"
              value={`${org.currency} ${totalExpenses.toLocaleString()}`}
              color={colors.destructive}
              icon={<Feather name="trending-down" size={16} color={colors.destructive} />}
            />
          </View>

          {/* Progress */}
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>Mission Progress</Text>
              <Text style={[styles.progressPct, { color: colors.primary }]}>{progress.toFixed(1)}%</Text>
            </View>
            <ProgressBar value={progress} color={colors.primary} bg={colors.muted} />
            <Text style={[styles.cardSub, { color: colors.mutedForeground }]}>
              {org.currency} {totalCollected.toLocaleString()} / {org.currency} {org.target.toLocaleString()}
            </Text>
            <View style={[styles.row, { marginTop: 12 }]}>
              <View style={styles.statChip}>
                <View style={[styles.dot, { backgroundColor: colors.success }]} />
                <Text style={[styles.chipLabel, { color: colors.mutedForeground }]}>{completeCount} Complete</Text>
              </View>
              <View style={styles.statChip}>
                <View style={[styles.dot, { backgroundColor: colors.warning }]} />
                <Text style={[styles.chipLabel, { color: colors.mutedForeground }]}>{data.members.filter(m => m.paid > 0 && m.paid < m.target).length} Partial</Text>
              </View>
              <View style={styles.statChip}>
                <View style={[styles.dot, { backgroundColor: colors.destructive }]} />
                <Text style={[styles.chipLabel, { color: colors.mutedForeground }]}>{data.members.filter(m => m.paid === 0).length} Not Started</Text>
              </View>
            </View>
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
          <View style={styles.row}>
            <QuickAction icon="users" label="Daily Collection" onPress={() => router.push("/daily-collection")} color={colors.primary} />
            <View style={styles.gap} />
            <QuickAction icon="user-plus" label="Add Member" onPress={() => router.push("/add-member")} color={colors.secondary} />
            <View style={styles.gap} />
            <QuickAction icon="plus-circle" label="Add Transaction" onPress={() => router.push("/add-transaction")} color={colors.accent} />
          </View>

          {/* Recent Transactions */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/transactions")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>

          {recentTx.length === 0 ? (
            <EmptyState icon="credit-card" title="No transactions yet" subtitle="Transactions you record will appear here" />
          ) : (
            recentTx.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} currency={org.currency} />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  headerTop: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 },
  orgName: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 2 },
  welcome: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  balanceChip: { backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 14 },
  balanceLabel: { fontSize: 11, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 },
  balanceValue: { fontSize: 26, fontFamily: "Inter_700Bold", color: "#fff" },
  scroll: { flex: 1 },
  section: { padding: 16 },
  row: { flexDirection: "row", alignItems: "stretch" },
  gap: { width: 10 },
  card: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  progressPct: { fontSize: 18, fontFamily: "Inter_700Bold" },
  cardSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  statChip: { flexDirection: "row", alignItems: "center", gap: 5, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  chipLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12, marginTop: 4 },
  seeAll: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
});
