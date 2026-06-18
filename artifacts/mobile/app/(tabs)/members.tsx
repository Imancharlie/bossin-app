import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { EmptyState } from "@/components/EmptyState";
import { MemberRow } from "@/components/MemberRow";
import { SearchBar } from "@/components/SearchBar";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

type FilterType = "all" | "complete" | "incomplete" | "not_started";

export default function MembersScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, completeCount, incompleteCount, notStartedCount, refreshData } = useData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 68 : 68 + insets.bottom;

  const filtered = useMemo(() => {
    let list = data.members;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((m) => m.name.toLowerCase().includes(q) || m.phone.includes(q));
    }
    if (filter === "complete") list = list.filter((m) => m.paid >= m.target);
    else if (filter === "incomplete") list = list.filter((m) => m.paid > 0 && m.paid < m.target);
    else if (filter === "not_started") list = list.filter((m) => m.paid === 0);
    return list;
  }, [data.members, search, filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  };

  const FILTERS: { key: FilterType; label: string; count: number; color: string }[] = [
    { key: "all", label: "All", count: data.members.length, color: colors.primary },
    { key: "complete", label: "Complete", count: completeCount, color: colors.success },
    { key: "incomplete", label: "Partial", count: incompleteCount, color: colors.warning },
    { key: "not_started", label: "Not Started", count: notStartedCount, color: colors.destructive },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 16 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Members</Text>
            <Text style={styles.headerSub}>{data.members.length} total members</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/add-member")}
            activeOpacity={0.8}
          >
            <Feather name="user-plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filter pills */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => (
            <TouchableOpacity
              key={f.key}
              onPress={() => setFilter(f.key)}
              activeOpacity={0.8}
              style={[
                styles.filterPill,
                filter === f.key
                  ? { backgroundColor: "#fff" }
                  : { backgroundColor: "rgba(255,255,255,0.15)" },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === f.key ? { color: colors.primary } : { color: "rgba(255,255,255,0.9)" },
                ]}
              >
                {f.label}
              </Text>
              <View
                style={[
                  styles.filterCount,
                  { backgroundColor: filter === f.key ? f.color + "20" : "rgba(255,255,255,0.2)" },
                ]}
              >
                <Text
                  style={[
                    styles.filterCountText,
                    { color: filter === f.key ? f.color : "rgba(255,255,255,0.9)" },
                  ]}
                >
                  {f.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.background }]}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search members..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
        ListEmptyComponent={
          <EmptyState
            icon="users"
            title={search ? "No members found" : "No members yet"}
            subtitle={search ? "Try a different search" : "Start by adding your first member"}
            actionLabel={search ? undefined : "Add Member"}
            onAction={search ? undefined : () => router.push("/add-member")}
          />
        }
        renderItem={({ item, index }) => (
          <MemberRow
            member={item}
            index={index + 1}
            currency={data.organization.currency}
            onPress={() => router.push({ pathname: "/member/[id]", params: { id: item.id } })}
          />
        )}
      />

      {/* Daily collection FAB */}
      <TouchableOpacity
        style={[styles.collectionFab, { backgroundColor: colors.accent, bottom: bottomPad + 12 }]}
        onPress={() => router.push("/daily-collection")}
        activeOpacity={0.85}
      >
        <Feather name="zap" size={18} color="#fff" />
        <Text style={styles.collectionFabText}>Daily Collection</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 2 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  filterRow: { flexDirection: "row", gap: 8 },
  filterPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 },
  filterText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  filterCount: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  filterCountText: { fontSize: 10, fontFamily: "Inter_700Bold" },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10 },
  collectionFab: {
    position: "absolute",
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 28,
    shadowColor: "#F59E0B",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  collectionFabText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
});
