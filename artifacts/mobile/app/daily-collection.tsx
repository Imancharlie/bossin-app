import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SearchBar } from "@/components/SearchBar";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { Member } from "@/types";

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

interface CollectionRowProps {
  member: Member;
  index: number;
  currency: string;
  onSave: (amount: number) => void;
  saved: boolean;
}

function CollectionRow({ member, index, currency, onSave, saved }: CollectionRowProps) {
  const colors = useColors();
  const [amount, setAmount] = useState("");
  const inputRef = useRef<TextInput>(null);
  const remaining = Math.max(0, member.target - member.paid);

  const avatarColors = ["#0F766E", "#7C3AED", "#DB2777", "#D97706", "#0369A1", "#16A34A"];
  const avatarBg = avatarColors[parseInt(member.id.replace(/\D/g, "").slice(-1)) % avatarColors.length] ?? "#0F766E";

  const handleSave = () => {
    const num = Number(amount.replace(/,/g, ""));
    if (!num || num <= 0) {
      Alert.alert("Error", "Enter a valid amount");
      return;
    }
    onSave(num);
    setAmount("");
  };

  return (
    <View
      style={[
        styles.collRow,
        {
          backgroundColor: saved ? colors.success + "10" : colors.card,
          borderColor: saved ? colors.success + "40" : colors.border,
        },
      ]}
    >
      <View style={[styles.collAvatar, { backgroundColor: avatarBg }]}>
        <Text style={styles.collAvatarText}>{getInitials(member.name)}</Text>
      </View>
      <View style={styles.collInfo}>
        <Text style={[styles.collIndex, { color: colors.mutedForeground }]}>{index}.</Text>
        <View style={styles.collDetails}>
          <Text style={[styles.collName, { color: colors.foreground }]} numberOfLines={1}>
            {member.name}
          </Text>
          <View style={styles.collMeta}>
            <Text style={[styles.collPaid, { color: colors.success }]}>
              {currency} {member.paid.toLocaleString()}
            </Text>
            <Text style={[styles.collRemaining, { color: remaining > 0 ? colors.destructive : colors.mutedForeground }]}>
              -{currency} {remaining.toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      {saved ? (
        <View style={[styles.savedBadge, { backgroundColor: colors.success + "20" }]}>
          <Feather name="check-circle" size={20} color={colors.success} />
        </View>
      ) : (
        <View style={styles.collInput}>
          <TextInput
            ref={inputRef}
            style={[styles.amountInput, { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.muted }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="numeric"
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
          <TouchableOpacity
            onPress={handleSave}
            style={[styles.saveBtn, { backgroundColor: remaining > 0 ? colors.primary : colors.muted }]}
            disabled={remaining === 0}
            activeOpacity={0.8}
          >
            <Feather name="check" size={16} color={remaining > 0 ? "#fff" : colors.mutedForeground} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

export default function DailyCollectionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, recordCollection } = useData();
  const [search, setSearch] = useState("");
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [totalSaved, setTotalSaved] = useState(0);

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 16 : insets.bottom + 16;

  const filteredMembers = useMemo(() => {
    const q = search.toLowerCase();
    let list = data.members.filter((m) => m.paid < m.target);
    if (q) list = list.filter((m) => m.name.toLowerCase().includes(q) || m.phone.includes(q));
    return list;
  }, [data.members, search]);

  const handleSave = async (member: Member, amount: number) => {
    try {
      await recordCollection({
        memberId: member.id,
        memberName: member.name,
        amount,
        date: new Date().toISOString().split("T")[0],
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSavedIds((prev) => new Set(prev).add(member.id));
      setTotalSaved((prev) => prev + amount);
    } catch {
      Alert.alert("Error", "Failed to record collection");
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 16 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
            <Feather name="arrow-left" size={20} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Daily Collection</Text>
            <Text style={styles.headerDate}>{today}</Text>
          </View>
          <View style={styles.savedChip}>
            <Text style={styles.savedCount}>{savedIds.size}</Text>
          </View>
        </View>

        {/* Today's summary */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryChip}>
            <Feather name="users" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={styles.summaryText}>{filteredMembers.length} Pending</Text>
          </View>
          <View style={styles.summaryChip}>
            <Feather name="check-circle" size={13} color="rgba(255,255,255,0.8)" />
            <Text style={styles.summaryText}>{savedIds.size} Collected</Text>
          </View>
          {totalSaved > 0 && (
            <View style={styles.summaryChip}>
              <Feather name="trending-up" size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.summaryText}>{data.organization.currency} {totalSaved.toLocaleString()}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.background }]}>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search members..." />
      </View>

      {/* Tip */}
      <View style={[styles.tipBar, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}>
        <Feather name="zap" size={13} color={colors.accent} />
        <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
          Enter amount and tap ✓ — no need to return to dashboard
        </Text>
      </View>

      <FlatList
        data={filteredMembers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: bottomPad }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Feather name="check-circle" size={40} color={colors.success} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
              {search ? "No members found" : "All members collected!"}
            </Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              {search ? "Try a different search" : "Great work! All pending members have been collected."}
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <CollectionRow
            member={item}
            index={index + 1}
            currency={data.organization.currency}
            saved={savedIds.has(item.id)}
            onSave={(amount) => handleSave(item, amount)}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 16 },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center", marginRight: 12 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontFamily: "Inter_700Bold", color: "#fff" },
  headerDate: { fontSize: 12, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.7)" },
  savedChip: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  savedCount: { fontSize: 16, fontFamily: "Inter_700Bold", color: "#fff" },
  summaryRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  summaryChip: { flexDirection: "row", alignItems: "center", gap: 5, backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  summaryText: { fontSize: 12, fontFamily: "Inter_500Medium", color: "rgba(255,255,255,0.9)" },
  searchWrap: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 4 },
  tipBar: { flexDirection: "row", alignItems: "center", gap: 7, marginHorizontal: 16, marginBottom: 8, padding: 10, borderRadius: 10, borderWidth: 1 },
  tipText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
  collRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderRadius: 14, borderWidth: 1, marginBottom: 8 },
  collAvatar: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  collAvatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 13 },
  collInfo: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6, overflow: "hidden" },
  collIndex: { fontSize: 11, fontFamily: "Inter_400Regular", flexShrink: 0 },
  collDetails: { flex: 1, overflow: "hidden" },
  collName: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
  collMeta: { flexDirection: "row", gap: 8 },
  collPaid: { fontSize: 11, fontFamily: "Inter_500Medium" },
  collRemaining: { fontSize: 11, fontFamily: "Inter_500Medium" },
  collInput: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 0 },
  amountInput: { width: 70, paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, borderWidth: 1, fontSize: 14, fontFamily: "Inter_700Bold", textAlign: "center" },
  saveBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  savedBadge: { width: 38, height: 38, borderRadius: 19, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  emptyWrap: { alignItems: "center", paddingVertical: 48, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", maxWidth: 260 },
});
