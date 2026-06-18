import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TransactionItem } from "@/components/TransactionItem";
import { EmptyState } from "@/components/EmptyState";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function MemberDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, deleteMember, addTransaction } = useData();

  const member = data.members.find((m) => m.id === id);
  const [payAmount, setPayAmount] = useState("");
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 16 : insets.bottom + 16;

  if (!member) {
    return (
      <View style={[styles.root, { backgroundColor: colors.background, paddingTop: topPad + 16 }]}>
        <EmptyState icon="user-x" title="Member not found" subtitle="This member may have been deleted" />
        <TouchableOpacity onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
          <Text style={{ color: "#fff", fontFamily: "Inter_600SemiBold" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const remaining = Math.max(0, member.target - member.paid);
  const progress = member.target > 0 ? Math.min(1, member.paid / member.target) : 0;
  const memberTx = data.transactions.filter((t) => t.memberId === member.id);
  const { currency } = data.organization;

  const isComplete = member.paid >= member.target;
  const statusColor = isComplete ? colors.success : member.paid > 0 ? colors.warning : colors.destructive;
  const statusLabel = isComplete ? "Complete" : member.paid > 0 ? "Partial" : "Not Started";

  const avatarColors = ["#0F766E", "#7C3AED", "#DB2777", "#D97706", "#0369A1", "#16A34A"];
  const avatarBg = avatarColors[parseInt(member.id.replace(/\D/g, "").slice(-1)) % avatarColors.length] ?? "#0F766E";

  const getInitials = (name: string) =>
    name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();

  const handleQuickPay = async () => {
    const amount = Number(payAmount.replace(/,/g, ""));
    if (!amount || amount <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      await addTransaction({
        memberId: member.id,
        memberName: member.name,
        type: "income",
        amount,
        category: "Contribution",
        description: `Payment from ${member.name}`,
        date: new Date().toISOString().split("T")[0],
        recordedBy: "staff",
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setPayAmount("");
      Alert.alert("Success", `${currency} ${amount.toLocaleString()} recorded successfully`);
    } catch {
      Alert.alert("Error", "Failed to record payment");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Member",
      `Delete ${member.name}? This will also remove all their transactions.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteMember(member.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: bottomPad }}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 16 }]}>
            <View style={styles.headerTop}>
              <TouchableOpacity onPress={() => router.back()} style={styles.backCircle} activeOpacity={0.7}>
                <Feather name="arrow-left" size={20} color="#fff" />
              </TouchableOpacity>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={() => router.push({ pathname: "/add-member", params: { editId: member.id } })} style={styles.headerBtn} activeOpacity={0.7}>
                  <Feather name="edit-2" size={17} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.headerBtn} activeOpacity={0.7}>
                  <Feather name="trash-2" size={17} color="rgba(255,255,255,0.8)" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.profileSection}>
              <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
                <Text style={styles.avatarText}>{getInitials(member.name)}</Text>
              </View>
              <Text style={styles.memberName}>{member.name}</Text>
              <Text style={styles.memberPhone}>{member.phone} · Year {member.yearOfStudy}</Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor + "30" }]}>
                <Text style={[styles.statusText, { color: statusColor === colors.success ? "#fff" : statusColor }]}>{statusLabel}</Text>
              </View>
            </View>
          </View>

          <View style={styles.content}>
            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.success + "10", borderColor: colors.success + "25" }]}>
                <Text style={[styles.statValue, { color: colors.success }]}>{currency} {member.paid.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Paid</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.destructive + "10", borderColor: colors.destructive + "25" }]}>
                <Text style={[styles.statValue, { color: colors.destructive }]}>{currency} {remaining.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Remaining</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
                <Text style={[styles.statValue, { color: colors.primary }]}>{currency} {member.target.toLocaleString()}</Text>
                <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Target</Text>
              </View>
            </View>

            {/* Progress */}
            <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Progress</Text>
                <Text style={[styles.progressPct, { color: colors.primary }]}>{(progress * 100).toFixed(0)}%</Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` as any, backgroundColor: statusColor }]} />
              </View>
            </View>

            {/* Quick Payment */}
            {!isComplete && (
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.cardTitle, { color: colors.foreground }]}>Quick Payment</Text>
                <View style={[styles.payRow, { borderColor: colors.border, backgroundColor: colors.muted }]}>
                  <Text style={[styles.currencyLabel, { color: colors.primary }]}>{currency}</Text>
                  <TextInput
                    style={[styles.payInput, { color: colors.foreground, fontFamily: "Inter_700Bold" }]}
                    value={payAmount}
                    onChangeText={setPayAmount}
                    placeholder="Enter amount"
                    placeholderTextColor={colors.mutedForeground}
                    keyboardType="numeric"
                    returnKeyType="done"
                  />
                  <TouchableOpacity
                    style={[styles.payBtn, { backgroundColor: colors.primary }, (saving || !payAmount) && { opacity: 0.5 }]}
                    onPress={handleQuickPay}
                    disabled={saving || !payAmount}
                    activeOpacity={0.8}
                  >
                    <Feather name={saving ? "loader" : "check"} size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
                {remaining > 0 && (
                  <TouchableOpacity onPress={() => setPayAmount(remaining.toString())} activeOpacity={0.7}>
                    <Text style={[styles.fillRemaining, { color: colors.primary }]}>
                      Pay full remaining ({currency} {remaining.toLocaleString()})
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Transactions */}
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              Payment History ({memberTx.length})
            </Text>
            {memberTx.length === 0 ? (
              <EmptyState icon="clock" title="No payments yet" subtitle="Payments will appear here" />
            ) : (
              memberTx.map((tx) => (
                <TransactionItem key={tx.id} transaction={tx} currency={currency} />
              ))
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 28 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  backCircle: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerActions: { flexDirection: "row", gap: 8 },
  headerBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center" },
  profileSection: { alignItems: "center", gap: 8 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  avatarText: { color: "#fff", fontFamily: "Inter_700Bold", fontSize: 26 },
  memberName: { fontSize: 20, fontFamily: "Inter_700Bold", color: "#fff" },
  memberPhone: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.8)" },
  statusBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  statusText: { fontSize: 12, fontFamily: "Inter_700Bold" },
  content: { padding: 16 },
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCard: { flex: 1, borderRadius: 12, padding: 10, borderWidth: 1, alignItems: "center" },
  statValue: { fontSize: 13, fontFamily: "Inter_700Bold", marginBottom: 2 },
  statLabel: { fontSize: 10, fontFamily: "Inter_400Regular" },
  card: { borderRadius: 14, padding: 14, borderWidth: 1, marginBottom: 12 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  cardTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  progressPct: { fontSize: 16, fontFamily: "Inter_700Bold" },
  progressTrack: { height: 8, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 4 },
  payRow: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingLeft: 12, marginTop: 10, marginBottom: 8, overflow: "hidden" },
  currencyLabel: { fontSize: 15, fontFamily: "Inter_700Bold", marginRight: 6 },
  payInput: { flex: 1, fontSize: 18, paddingVertical: 12 },
  payBtn: { width: 50, height: 50, alignItems: "center", justifyContent: "center" },
  fillRemaining: { fontSize: 12, fontFamily: "Inter_500Medium", textDecorationLine: "underline" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 10, marginTop: 4 },
  backBtn: { margin: 20, padding: 14, borderRadius: 12, alignItems: "center" },
});
