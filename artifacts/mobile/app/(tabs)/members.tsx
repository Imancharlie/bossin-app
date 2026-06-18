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
  useWindowDimensions,
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
  const { width } = useWindowDimensions();
  const { data, completeCount, incompleteCount, notStartedCount, refreshData } = useData();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [refreshing, setRefreshing] = useState(false);
  const isNarrow = width < 380;

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 36 + 78 : 78 + insets.bottom;

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
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 12, paddingHorizontal: isNarrow ? 14 : 16 }]}>
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { fontSize: isNarrow ? 16 : 18 }]}>Members</Text>
            <Text style={[styles.headerSub, { fontSize: isNarrow ? 11 : 12 }]}>{data.members.length} total members</Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => router.push("/add-member")}
            activeOpacity={0.8}
          >
            <Feather name="user-plus" size={16} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Filter pills — horizontal scroll so they never wrap */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
          style={{ marginHorizontal: -4 }}
        >
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
                  { fontSize: isNarrow ? 10 : 11 },
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
                    { fontSize: isNarrow ? 9 : 10 },
                    { color: filter === f.key ? f.color : "rgba(255,255,255,0.9)" },
                  ]}
                >
                  {f.count}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.background }]}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search members..." />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: isNarrow ? 12 : 14, paddingTop: 4, paddingBottom: bottomPad }}
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
        style={[styles.collectionFab, { backgroundColor: colors.accent, bottom: bottomPad + 10 }]}
        onPress={() => router.push("/daily-collection")}
        activeOpacity={0.85}
      >
        <Feather name="zap" size={15} color="#fff" />
        <Text style={[styles.collectionFabText, { fontSize: isNarrow ? 11 : 12 }]}>Daily Collection</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingBottom: 14 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  headerLeft: { flex: 1, marginRight: 10 },
  headerTitle: { fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 2 },
  headerSub: { fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  addBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  filterRow: { flexDirection: "row", gap: 7, paddingHorizontal: 4 },
  filterPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  filterText: { fontFamily: "Inter_600SemiBold" },
  filterCount: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 10 },
  filterCountText: { fontFamily: "Inter_700Bold" },
  searchWrap: { paddingHorizontal: 14, paddingVertical: 8 },
  collectionFab: {
    position: "absolute",
    right: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 26,
    shadowColor: "#F59E0B",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  collectionFabText: { color: "#fff", fontFamily: "Inter_700Bold" },
});
