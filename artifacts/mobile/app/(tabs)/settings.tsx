import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useColors } from "@/hooks/useColors";

interface SettingRowProps {
  icon: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  color?: string;
}

function SettingRow({ icon, label, subtitle, onPress, right, color }: SettingRowProps) {
  const colors = useColors();
  const accentColor = color ?? colors.primary;
  return (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      disabled={!onPress && !right}
    >
      <View style={[styles.rowIcon, { backgroundColor: accentColor + "15" }]}>
        <Feather name={icon as any} size={16} color={accentColor} />
      </View>
      <View style={styles.rowInfo}>
        <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
        {subtitle != null && <Text style={[styles.rowSub, { color: colors.mutedForeground }]}>{subtitle}</Text>}
      </View>
      {right ?? (onPress != null && <Feather name="chevron-right" size={16} color={colors.mutedForeground} />)}
    </TouchableOpacity>
  );
}

export default function SettingsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { data, updateOrganization } = useData();
  const [editingOrg, setEditingOrg] = useState(false);
  const [orgName, setOrgName] = useState(data.organization.name);
  const [orgDesc, setOrgDesc] = useState(data.organization.description);
  const [target, setTarget] = useState(data.organization.target.toString());

  const topPad = Platform.OS === "web" ? insets.top + 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 36 + 78 : 78 + insets.bottom;

  const handleSaveOrg = async () => {
    await updateOrganization({
      name: orgName,
      description: orgDesc,
      target: Number(target.replace(/,/g, "")) || data.organization.target,
    });
    setEditingOrg(false);
  };

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary, paddingTop: topPad + 16 }]}>
        <Text style={styles.headerTitle}>Settings</Text>
        <Text style={styles.headerSub}>Organization & account settings</Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: bottomPad }} showsVerticalScrollIndicator={false}>
        {/* Profile */}
        <View style={[styles.profileCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" }]}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Feather name="user" size={28} color="#fff" />
          </View>
          <View>
            <Text style={[styles.username, { color: colors.foreground }]}>{user?.username}</Text>
            <View style={[styles.roleBadge, { backgroundColor: colors.accent + "20" }]}>
              <Text style={[styles.roleText, { color: colors.accent }]}>
                {user?.role?.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* Organization */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ORGANIZATION</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {editingOrg ? (
            <View style={styles.editForm}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Organization Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                value={orgName}
                onChangeText={setOrgName}
                placeholder="Organization name"
                placeholderTextColor={colors.mutedForeground}
              />
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Description</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                value={orgDesc}
                onChangeText={setOrgDesc}
                placeholder="Description"
                placeholderTextColor={colors.mutedForeground}
              />
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Collection Target ({data.organization.currency})</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                value={target}
                onChangeText={setTarget}
                placeholder="Target amount"
                placeholderTextColor={colors.mutedForeground}
                keyboardType="numeric"
              />
              <View style={styles.editBtns}>
                <TouchableOpacity
                  style={[styles.editBtn, { backgroundColor: colors.muted }]}
                  onPress={() => setEditingOrg(false)}
                >
                  <Text style={[styles.editBtnText, { color: colors.mutedForeground }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.editBtn, { backgroundColor: colors.primary }]}
                  onPress={handleSaveOrg}
                >
                  <Text style={[styles.editBtnText, { color: "#fff" }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <>
              <SettingRow
                icon="briefcase"
                label={data.organization.name}
                subtitle={data.organization.description}
                onPress={() => setEditingOrg(true)}
              />
              <SettingRow
                icon="target"
                label="Collection Target"
                subtitle={`${data.organization.currency} ${data.organization.target.toLocaleString()}`}
                onPress={() => setEditingOrg(true)}
              />
              <SettingRow
                icon="dollar-sign"
                label="Currency"
                subtitle={data.organization.currency}
              />
            </>
          )}
        </View>

        {/* Account */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>ACCOUNT</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="user" label="Username" subtitle={user?.username} />
          <SettingRow icon="shield" label="Role" subtitle={user?.role} />
          <SettingRow icon="users" label="Organization ID" subtitle={user?.organizationId} />
        </View>

        {/* App */}
        <Text style={[styles.sectionTitle, { color: colors.mutedForeground }]}>APP</Text>
        <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <SettingRow icon="info" label="Version" subtitle="1.0.0" />
          <SettingRow icon="code" label="Bossin" subtitle="Smart Finance Tracking" />
        </View>

        {/* Logout */}
        <View style={styles.logoutWrap}>
          <TouchableOpacity
            style={[styles.logoutBtn, { backgroundColor: colors.destructive + "15", borderColor: colors.destructive + "30" }]}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Feather name="log-out" size={18} color={colors.destructive} />
            <Text style={[styles.logoutText, { color: colors.destructive }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 24 },
  headerTitle: { fontSize: 22, fontFamily: "Inter_700Bold", color: "#fff", marginBottom: 2 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", color: "rgba(255,255,255,0.75)" },
  profileCard: { margin: 16, borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, borderWidth: 1 },
  avatar: { width: 60, height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center" },
  username: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 4 },
  roleBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  roleText: { fontSize: 11, fontFamily: "Inter_700Bold" },
  sectionTitle: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 1, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 },
  section: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 14, borderBottomWidth: 1 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 14, fontFamily: "Inter_500Medium", marginBottom: 1 },
  rowSub: { fontSize: 12, fontFamily: "Inter_400Regular" },
  editForm: { padding: 14, gap: 4 },
  fieldLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", marginBottom: 4, marginTop: 8 },
  input: { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
  editBtns: { flexDirection: "row", gap: 10, marginTop: 12 },
  editBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  editBtnText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  logoutWrap: { padding: 16, paddingTop: 24 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 14, borderWidth: 1 },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
