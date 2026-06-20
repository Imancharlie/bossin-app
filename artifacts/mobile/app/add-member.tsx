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
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

export default function AddMemberScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { addMember, updateMember, data } = useData();
  const org = data?.organization || { currency: "TZS" };
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const editing = data.members.find((m) => m.id === editId);

  const [name, setName] = useState(editing?.name ?? "");
  const [phone, setPhone] = useState(editing?.phone ?? "");
  const [course, setCourse] = useState(editing?.course ?? "");
  const [year, setYear] = useState(editing?.year?.toString() ?? "1");
  const [pledge, setPledge] = useState(editing?.pledge?.toString() ?? "100000");
  const [saving, setSaving] = useState(false);

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 + 16 : insets.bottom + 16;

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Member name is required");
      return;
    }
    const pledgeNum = Number(pledge.replace(/,/g, "")) || 100000;
    setSaving(true);
    try {
      if (editing) {
        await updateMember(editing.id, {
          name: name.trim(),
          phone: phone.trim(),
          course: course.trim(),
          year: year,
          pledge: pledgeNum.toString(),
        });
      } else {
        await addMember({
          name: name.trim(),
          phone: phone.trim(),
          course: course.trim(),
          year: year,
          pledge: pledgeNum.toString(),
        });
      }
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      router.back();
    } catch (error) {
      console.error('[AddMember] Error saving member:', error);
      Alert.alert("Error", "Failed to save member. Please check your connection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 16 }]}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.7}>
              <Feather name="arrow-left" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{editing ? "Edit Member" : "Add Member"}</Text>
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
          {/* Name */}
          <Text style={[styles.label, { color: colors.foreground }]}>Full Name *</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="user" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={name}
              onChangeText={setName}
              placeholder="Enter full name"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Phone */}
          <Text style={[styles.label, { color: colors.foreground }]}>Phone Number</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="phone" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+255 7XX XXX XXX"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="phone-pad"
              returnKeyType="next"
            />
          </View>

          {/* Course */}
          <Text style={[styles.label, { color: colors.foreground }]}>Course (optional)</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="book" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={course}
              onChangeText={setCourse}
              placeholder="e.g., Computer Science"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Year */}
          <Text style={[styles.label, { color: colors.foreground }]}>Year</Text>
          <View style={styles.yearRow}>
            {[1, 2, 3, 4, 5].map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => setYear(y.toString())}
                style={[
                  styles.yearBtn,
                  {
                    backgroundColor: year === y.toString() ? colors.primary : colors.card,
                    borderColor: year === y.toString() ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text style={[styles.yearText, { color: year === y.toString() ? "#fff" : colors.foreground }]}>
                  Year {y}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Pledge */}
          <Text style={[styles.label, { color: colors.foreground }]}>
            Pledge Amount ({org.currency})
          </Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Feather name="target" size={16} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground }]}
              value={pledge}
              onChangeText={setPledge}
              placeholder="100000"
              placeholderTextColor={colors.mutedForeground}
              keyboardType="numeric"
              returnKeyType="done"
            />
          </View>

          {/* Presets */}
          <View style={styles.presetRow}>
            {["50000", "100000", "150000", "200000"].map((p) => (
              <TouchableOpacity
                key={p}
                onPress={() => setPledge(p)}
                style={[
                  styles.presetBtn,
                  {
                    backgroundColor: pledge === p ? colors.primary + "20" : colors.muted,
                    borderColor: pledge === p ? colors.primary : colors.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text style={[styles.presetText, { color: pledge === p ? colors.primary : colors.mutedForeground }]}>
                  {(Number(p) / 1000).toFixed(0)}k
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Save button */}
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: colors.primary, opacity: saving ? 0.7 : 1 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            <Feather name={saving ? "loader" : editing ? "save" : "user-plus"} size={18} color="#fff" />
            <Text style={styles.primaryBtnText}>
              {saving ? "Saving..." : editing ? "Update Member" : "Add Member"}
            </Text>
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
  label: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 6, marginTop: 12 },
  inputWrap: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderRadius: 12, borderWidth: 1 },
  input: { flex: 1, fontSize: 15, fontFamily: "Inter_400Regular", padding: 0 },
  yearRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  yearBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  yearText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  presetRow: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  presetBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  presetText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  primaryBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 15, borderRadius: 14, marginTop: 24, shadowColor: "#0F766E", shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_700Bold" },
});
