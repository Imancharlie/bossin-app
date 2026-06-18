import { Feather } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

type Period = "daily" | "weekly" | "monthly" | "yearly";

function BarChart({ data, color, maxVal }: { data: { label: string; value: number }[]; color: string; maxVal: number }) {
  const colors = useColors();
  return (
    <View style={bcStyles.container}>
      {data.map((item, i) => {
        const pct = maxVal > 0 ? item.value / maxVal : 0;
        return (
          <View key={i} style={bcStyles.barWrap}>
            <Text style={[bcStyles.val, { color: colors.foreground }]}>
              {item.value > 0 ? (item.value / 1000).toFixed(0) + "k" : ""}
            </Text>
            <View style={[bcStyles.track, { backgroundColor: colors.muted }]}>
              <View style={[bcStyles.fill, { height: `${pct * 100}%` as any, backgroundColor: color }]} />
            </View>
            <Text style={[bcStyles.label, { color: colors.mutedForeground }]}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
}

const bcStyles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "flex-end", gap: 8, height: 100 },
  barWrap: { flex: 1, alignItems: "center", gap: 4, height: "100%" as any, justifyContent: "flex-end" },
  val: { fontSize: 9, fontFamily: "Inter_500Medium" },
  track: { width: "100%", flex: 1, borderRadius: 4, overflow: "hidden", justifyContent: "flex-end" },
  fill: { width: "100%", borderRadius: 4 },
  label: { fontSize: 9, fontFamily: "Inter_500Medium" },
});

export default function ReportsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, totalCollected, totalExpenses, progress, completeCount } = useData();
  const [period, setPeriod] = useState<Period>("monthly");

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 68 : 68 + insets.bottom;

  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const monthlyData = useMemo(() => {
    return MONTHS.slice(0, new Date().getMonth() + 1).map((label, i) => {
      const value = data.transactions
        .filter((t) => t.type === "income" && new Date(t.date).getMonth() === i)
        .reduce((s, t) => s + t.amount, 0);
      return { label, value };
    });
  }, [data.transactions]);

  const maxMonthly = Math.max(...monthlyData.map((d) => d.value), 1);

  const topMembers = useMemo(
    () =>
      [...data.members]
        .filter((m) => m.paid > 0)
        .sort((a, b) => b.paid - a.paid)
        .slice(0, 5),
    [data.members]
  );

  const balance = totalCollected - totalExpenses;

  const PERIODS: { key: Period; label: string }[] = [
    { key: "daily", label: "Daily" },
    { key: "weekly", label: "Weekly" },
    { key: "monthly", label: "Monthly" },
    { key: "yearly", label: "Yearly" },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 16 }]}>
        <Text style={styles.headerTitle}>Reports</Text>
        <Text style={styles.headerSub}>Financial overview & analytics</Text>
        <View style={styles.filterRow}>
          {PERIODS.map((p) => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriod(p.key)}
              style={[
                styles.periodPill,
                period === p.key ? { backgroundColor: "#fff" } : { backgroundColor: "rgba(255,255,255,0.15)" },
              ]}
              activeOpacity={0.8}
            >
              <Text style={[styles.periodText, period === p.key ? { color: colors.primary } : { color: "rgba(255,255,255,0.9)" }]}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Cards */}
        <View style={styles.row}>
          <View style={[styles.summaryCard, { backgroundColor: colors.success + "15", borderColor: colors.success + "30", flex: 1 }]}>
            <Feather name="trending-up" size={20} color={colors.success} />
            <Text style={[styles.summaryValue, { color: colors.success }]}>
              {data.organization.currency} {totalCollected.toLocaleString()}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total Income</Text>
          </View>
          <View style={styles.gap} />
          <View style={[styles.summaryCard, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "30", flex: 1 }]}>
            <Feather name="trending-down" size={20} color={colors.destructive} />
            <Text style={[styles.summaryValue, { color: colors.destructive }]}>
              {data.organization.currency} {totalExpenses.toLocaleString()}
            </Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total Expenses</Text>
          </View>
        </View>

        <View style={[styles.summaryCard, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30", marginBottom: 16 }]}>
          <View style={styles.balanceRow}>
            <View>
              <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Net Balance</Text>
              <Text style={[styles.summaryValue, { color: colors.primary, fontSize: 24 }]}>
                {data.organization.currency} {balance.toLocaleString()}
              </Text>
            </View>
            <View style={[styles.progressCircle, { borderColor: colors.primary }]}>
              <Text style={[styles.progressText, { color: colors.primary }]}>{progress.toFixed(0)}%</Text>
            </View>
          </View>
          <View style={[styles.progressBar, { backgroundColor: colors.muted }]}>
            <View style={[styles.progressFill, { width: `${Math.min(100, progress)}%` as any, backgroundColor: colors.primary }]} />
          </View>
          <Text style={[styles.progressCaption, { color: colors.mutedForeground }]}>
            Target: {data.organization.currency} {data.organization.target.toLocaleString()}
          </Text>
        </View>

        {/* Monthly Chart */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Monthly Collection</Text>
          <View style={{ marginTop: 12 }}>
            <BarChart data={monthlyData} color={colors.primary} maxVal={maxMonthly} />
          </View>
        </View>

        {/* Member Stats */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Member Status</Text>
          <View style={styles.memberStats}>
            {[
              { label: "Complete", count: completeCount, color: colors.success },
              { label: "Partial", count: data.members.filter(m => m.paid > 0 && m.paid < m.target).length, color: colors.warning },
              { label: "Not Started", count: data.members.filter(m => m.paid === 0).length, color: colors.destructive },
            ].map((s) => (
              <View key={s.label} style={styles.memberStatRow}>
                <View style={styles.memberStatLeft}>
                  <View style={[styles.dot, { backgroundColor: s.color }]} />
                  <Text style={[styles.memberStatLabel, { color: colors.foreground }]}>{s.label}</Text>
                </View>
                <Text style={[styles.memberStatCount, { color: s.color }]}>{s.count}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Top Contributors */}
        {topMembers.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>Top Contributors</Text>
            {topMembers.map((m, i) => (
              <View key={m.id} style={[styles.topMemberRow, i < topMembers.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={[styles.rankBadge, { backgroundColor: i === 0 ? colors.accent : colors.muted }]}>
                  <Text style={[styles.rankText, { color: i === 0 ? "#fff" : colors.mutedForeground }]}>{i + 1}</Text>
                </View>
                <Text style={[styles.topMemberName, { color: colors.foreground, flex: 1 }]} numberOfLines={1}>{m.name}</Text>
                <Text style={[styles.topMemberAmount, { color: colors.success }]}>
                  {data.organization.currency} {m.paid.toLocaleString()}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 2 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)", marginBottom: 12 },
  filterRow: { flexDirection: "row", gap: 8 },
  periodPill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  periodText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  row: { flexDirection: "row", marginBottom: 10 },
  gap: { width: 10 },
  summaryCard: { borderRadius: 14, padding: 14, borderWidth: 1, alignItems: "flex-start", gap: 4, marginBottom: 0 },
  summaryValue: { fontSize: 18, fontFamily: "Inter_700Bold" },
  summaryLabel: { fontSize: 12, fontFamily: "Inter_400Regular" },
  balanceRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" as any, marginBottom: 8 },
  progressCircle: { width: 52, height: 52, borderRadius: 26, borderWidth: 2, alignItems: "center", justifyContent: "center" },
  progressText: { fontSize: 14, fontFamily: "Inter_700Bold" },
  progressBar: { height: 6, borderRadius: 3, overflow: "hidden", width: "100%" as any, marginBottom: 4 },
  progressFill: { height: "100%", borderRadius: 3 },
  progressCaption: { fontSize: 11, fontFamily: "Inter_400Regular" },
  card: { borderRadius: 14, padding: 16, borderWidth: 1, marginBottom: 12, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  memberStats: { marginTop: 12, gap: 10 },
  memberStatRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  memberStatLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  memberStatLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  memberStatCount: { fontSize: 16, fontFamily: "Inter_700Bold" },
  topMemberRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 10 },
  rankBadge: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  rankText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  topMemberName: { fontSize: 13, fontFamily: "Inter_500Medium" },
  topMemberAmount: { fontSize: 13, fontFamily: "Inter_700Bold" },
});
