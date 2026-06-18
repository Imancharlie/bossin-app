import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Member, MemberStatus } from "@/types";

function getMemberStatus(member: Member): MemberStatus {
  if (member.paid >= member.target) return "complete";
  if (member.paid > 0) return "incomplete";
  return "not_started";
}

function getStatusConfig(status: MemberStatus, colors: ReturnType<typeof useColors>) {
  switch (status) {
    case "complete":
      return { label: "Complete", color: colors.success, bg: colors.success + "18" };
    case "incomplete":
      return { label: "Partial", color: colors.warning, bg: colors.warning + "18" };
    default:
      return { label: "Not Started", color: colors.destructive, bg: colors.destructive + "18" };
  }
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

function formatAmount(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString()}`;
}

interface MemberRowProps {
  member: Member;
  index: number;
  currency: string;
  onPress: () => void;
}

export function MemberRow({ member, index, currency, onPress }: MemberRowProps) {
  const colors = useColors();
  const status = getMemberStatus(member);
  const statusConfig = getStatusConfig(status, colors);
  const remaining = Math.max(0, member.target - member.paid);
  const progressPct = member.target > 0 ? Math.min(1, member.paid / member.target) : 0;

  const avatarColors = ["#0F766E", "#7C3AED", "#DB2777", "#D97706", "#0369A1", "#16A34A"];
  const avatarBg = avatarColors[parseInt(member.id.replace(/\D/g, "").slice(-1)) % avatarColors.length] ?? "#0F766E";

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={styles.left}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
        </View>
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={[styles.index, { color: colors.mutedForeground }]}>{index}. </Text>
            <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
              {member.name}
            </Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPct * 100}%` as any, backgroundColor: statusConfig.color },
                ]}
              />
            </View>
          </View>
          <View style={styles.amounts}>
            <Text style={[styles.paid, { color: colors.success }]}>
              {formatAmount(member.paid, currency)}
            </Text>
            <Text style={[styles.remaining, { color: colors.destructive }]}>
              -{formatAmount(remaining, currency)}
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{statusConfig.label}</Text>
        </View>
        <Feather name="chevron-right" size={14} color={colors.mutedForeground} style={{ marginTop: 6 }} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  left: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 14 },
  info: { flex: 1 },
  nameRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  index: { fontSize: 12, fontFamily: "Inter_400Regular" },
  name: { fontSize: 13, fontFamily: "Inter_600SemiBold", flex: 1 },
  progressBar: { marginBottom: 4 },
  progressTrack: { height: 3, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },
  amounts: { flexDirection: "row", gap: 10 },
  paid: { fontSize: 11, fontFamily: "Inter_500Medium" },
  remaining: { fontSize: 11, fontFamily: "Inter_500Medium" },
  right: { alignItems: "flex-end", marginLeft: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  statusText: { fontSize: 10, fontFamily: "Inter_600SemiBold" },
});
