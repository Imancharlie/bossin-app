import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
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
import { EmptyState } from "@/components/EmptyState";
import { SearchBar } from "@/components/SearchBar";
import { TransactionItem } from "@/components/TransactionItem";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
type FilterType = "all" | "income";

export default function TransactionsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, totalCollected, totalExpenses, deleteTransaction, refreshData } = useData();
  const org = data?.organization || { currency: "TZS" };
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 36 + 78 : 78 + insets.bottom;

  const filtered = useMemo(() => {
    let list = data.transactions;
    if (filter !== "all") {
      if (filter === "income") list = list.filter((t) => t.member !== null);
      list = list.filter((t) => t.member === null);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          (t.member_name ?? "").toLowerCase().includes(q) ||
          (t.note ?? "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [data.transactions, filter, search]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const FILTERS: { key: FilterType; label: string; color: string }[] = [
    { key: "all", label: "All", color: colors.primary },
    { key: "income", label: "Income", color: colors.success },
    { key: "expense", label: "Expense", color: colors.destructive },
    
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Transactions</Text>
            <Text style={styles.headerSub}>{data?.transactions?.length || 0} total records</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/add-transaction")}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Summary chips */}
        <View style={styles.summaryRow}>
          <View style={[styles.summaryChip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Feather name="trending-up" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={styles.summaryText}>In: {data.organization.currency} {totalCollected.toLocaleString()}</Text>
          </View>
          <View style={[styles.summaryChip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <Feather name="trending-down" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={styles.summaryText}>Out: {data.organization.currency} {totalExpenses.toLocaleString()}</Text>
          </View>
        </View>

        {/* Filter pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {FILTERS.map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFilter(f.key)}
                style={[
                  styles.filterPill,
                  filter === f.key
                    ? { backgroundColor: "#fff" }
                    : { backgroundColor: "rgba(255,255,255,0.15)" },
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === f.key ? { color: colors.primary } : { color: "rgba(255,255,255,0.9)" },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.background }]}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search transactions..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="credit-card"
            title="No transactions found"
            subtitle={search ? "Try a different search" : "Record your first transaction"}
            actionLabel={search ? undefined : "Add Transaction"}
            onAction={search ? undefined : () => router.push("/add-transaction")}
          />
        }
        renderItem={({ item }) => (
          <TransactionItem transaction={item} currency={org.currency} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 2 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  summaryRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  summaryChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  summaryText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.9)" },
  filterScroll: { marginBottom: 4 },
  filterRow: { flexDirection: "row", gap: 8, paddingBottom: 4 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
});
