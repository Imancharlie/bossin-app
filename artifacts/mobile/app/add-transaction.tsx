import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
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
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";
import { TransactionType } from "@/types";

const INCOME_CATEGORIES = ["Contribution", "Daily Collection", "Donation", "Grant", "Other Income"];
const EXPENSE_CATEGORIES = ["Operations", "Transport", "Food", "Utilities", "Salaries", "Other Expense"];

export default function AddTransactionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { data, addTransaction } = useData();

  const [type, setType] = useState<TransactionType>("income");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Contribution");
  const [description, setDescription] = useState("");
  const [memberId, setMemberId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showMemberPicker, setShowMemberPicker] = useState(false);
  const [memberSearch, setMemberSearch] = useState("");

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 16 : insets.bottom + 16;

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const selectedMember = data.members.find((m) => m.id === memberId);
  const filteredMembers = data.members.filter((m) =>
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  const handleSave = async () => {
    const amountNum = Number(amount.replace(/,/g, ""));
    if (!amountNum || amountNum <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    setSaving(true);
    try {
      await addTransaction({
        memberId: type === "income" ? memberId : null,
        memberName: type === "income" ? (selectedMember?.name ?? null) : null,
        type,
        amount: amountNum,
        category,
        description: description.trim() || category,
        date: new Date().toISOString().split("T")[0],
        recordedBy: "staff",
      });
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch {
      Alert.alert("Error", "Failed to save transaction");
    } finally {
      setSaving(false);
    }
  };

  const TYPE_OPTIONS: { key: TransactionType; label: string; icon: string; color: string }[] = [
    { key: "income", label: "Income", icon: "trending-up", color: colors.success },
    { key: "expense", label: "Expense", icon: "trending-down", color: colors.destructive },
    { key: "transfer", label: "Transfer", icon: "repeat", color: colors.info },
  ];

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 16 }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <Feather name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Transaction</Text>
            <TouchableOpacity
              onPress={handleSave}
              disabled={saving}
              style={[styles.saveBtn, { opacity: saving ? 0.6 : 1 }]}
              activeOpacity={0.8}
            >
              <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.form, { paddingBottom: bottomPad }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Type selector */}
          <View style={styles.typeRow}>
            {TYPE_OPTIONS.map((t) => (
              <TouchableOpacity
                key={t.key}
                onPress={() => {
                  setType(t.key);
                  setCategory(t.key === "income" ? INCOME_CATEGORIES[0] : EXPENSE_CATEGORIES[0]);
                }}
                style={[
                  styles.typeBtn,
                  {
                    backgroundColor: type === t.key ? t.color : colors.card,
                    borderColor: type === t.key ? t.color : colors.border,
                    flex: 1,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Feather name={t.icon as any} size={16} color={type === t.key ? "#fff" : colors.mutedForeground} />
                <Text style={[styles.typeBtnText, { color: type === t.key ? "#fff" : colors.foreground }]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount */}
          <Text style={[styles.label, { color: colors.foreground }]}>Amount ({data.organization.currency})</Text>
          <View style={[styles.amountWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.currencyLabel, { color: colors.primary }]}>{data.organization.currency}</Text>
            <TextInput
              style={[styles.amountInput, { color: colors.foreground }]}
              value={amount}
              onChangeText={setAmount}
              placeholder="0"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          {/* Category */}
          <Text style={[styles.label, { color: colors.foreground }]}>Category</Text>
          <View style={styles.categoryGrid}>
            {categories.map((c) => (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  styles.categoryBtn,
                  {
                    backgroundColor: category === c ? colors.primary + "20" : colors.card,
                    borderColor: category === c ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text style={[styles.categoryText, { color: category === c ? colors.primary : colors.foreground }]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Member (for income) */}
          {type === "income" && (
            <>
              <Text style={[styles.label, { color: colors.foreground }]}>Member (optional)</Text>
              <TouchableOpacity
                onPress={() => setShowMemberPicker(!showMemberPicker)}
                style={[styles.memberPicker, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.8}
              >
                <Feather name="user" size={16} color={colors.mutedForeground} />
                <Text style={[styles.memberPickerText, { color: selectedMember ? colors.foreground : colors.mutedForeground }]}>
                  {selectedMember?.name ?? "Select member..."}
                </Text>
                <Feather name={showMemberPicker ? "chevron-up" : "chevron-down"} size={15} color={colors.mutedForeground} />
              </TouchableOpacity>

              {showMemberPicker && (
                <View style={[styles.memberDropdown, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.memberSearch, { color: colors.foreground, backgroundColor: colors.muted, fontFamily: "Inter_400Regular" }]}
                    value={memberSearch}
                    onChangeText={setMemberSearch}
                    placeholder="Search members..."
                    placeholderTextColor={colors.mutedForeground}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => { setMemberId(null); setShowMemberPicker(false); }}
                    style={[styles.memberOption, { borderBottomColor: colors.border }]}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.memberOptionText, { color: colors.mutedForeground }]}>No member</Text>
                  </TouchableOpacity>
                  {filteredMembers.slice(0, 10).map((m) => (
                    <TouchableOpacity
                      key={m.id}
                      onPress={() => { setMemberId(m.id); setShowMemberPicker(false); setMemberSearch(""); }}
                      style={[styles.memberOption, { borderBottomColor: colors.border }]}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.memberOptionText, { color: colors.foreground }]}>{m.name}</Text>
                      <Text style={[styles.memberOptionSub, { color: colors.mutedForeground }]}>
                        Remaining: {data.organization.currency} {(m.target - m.paid).toLocaleString()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </>
          )}

          {/* Description */}
          <Text style={[styles.label, { color: colors.foreground }]}>Description (optional)</Text>
          <TextInput
            style={[styles.descInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add a note..."
            placeholderTextColor={colors.mutedForeground}
            multiline
            numberOfLines={3}
          />

          {/* Save */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Feather name="check" size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>{saving ? "Saving..." : "Record Transaction"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 20 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Inter_700Bold", color: "#fff" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)" },
  saveBtnText: { color: "#fff", fontFamily: "Inter_600SemiBold", fontSize: 14 },
  form: { padding: 20, gap: 4 },
  typeRow: { flexDirection: "row", gap: 8, marginBottom: 4 },
  typeBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 8, borderRadius: 12, borderWidth: 1, justifyContent: "center" },
  typeBtnText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 14 },
  amountWrap: { flexDirection: "row", alignItems: "center", borderRadius: 12, borderWidth: 1, paddingLeft: 14, overflow: "hidden" },
  currencyLabel: { fontSize: 16, fontFamily: "Inter_700Bold", marginRight: 6 },
  amountInput: { flex: 1, fontSize: 24, fontFamily: "Inter_700Bold", paddingVertical: 14, padding: 0 },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  categoryBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  categoryText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  memberPicker: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 12, borderWidth: 1 },
  memberPickerText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  memberDropdown: { borderRadius: 12, borderWidth: 1, overflow: "hidden", maxHeight: 260 },
  memberSearch: { padding: 10, margin: 8, borderRadius: 8, fontSize: 13 },
  memberOption: { paddingHorizontal: 14, paddingVertical: 10, borderBottomWidth: 1 },
  memberOptionText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  memberOptionSub: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 1 },
  descInput: { borderRadius: 12, borderWidth: 1, padding: 12, minHeight: 80, fontSize: 14, fontFamily: "Inter_400Regular", textAlignVertical: "top" },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 14, marginTop: 24, shadowColor: "#0F766E", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
