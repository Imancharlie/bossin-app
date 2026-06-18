import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const { login } = useAuth();
  const [username, setUsername] = useState("bossin");
  const [password, setPassword] = useState("bossin123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSmall = height < 700;
  const isNarrow = width < 380;

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }
    setLoading(true);
    try {
      const success = await login(username.trim(), password.trim());
      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace("/(tabs)");
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Login Failed", "Invalid username or password.\n\nDemo: bossin / bossin123");
      }
    } finally {
      setLoading(false);
    }
  };

  const logoSize = isSmall ? 52 : isNarrow ? 58 : 64;
  const iconSize = isSmall ? 22 : 26;
  const logoRadius = isSmall ? 14 : 17;
  const hPad = isNarrow ? 18 : 22;

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          {
            paddingTop: insets.top + (isSmall ? 20 : 32),
            paddingBottom: insets.bottom + 20,
            paddingHorizontal: hPad,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={[styles.logoSection, { marginBottom: isSmall ? 20 : 28 }]}>
          <View
            style={[
              styles.logoCircle,
              {
                backgroundColor: colors.primary,
                width: logoSize,
                height: logoSize,
                borderRadius: logoRadius,
                marginBottom: isSmall ? 10 : 12,
              },
            ]}
          >
            <Feather name="shield" size={iconSize} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.foreground, fontSize: isSmall ? 22 : isNarrow ? 24 : 26 }]}>
            Bossin
          </Text>
          <Text style={[styles.tagline, { color: colors.mutedForeground, fontSize: isNarrow ? 11 : 12 }]}>
            Smart Finance Tracking for Organizations
          </Text>
        </View>

        {/* Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              padding: isNarrow ? 18 : 22,
              marginBottom: 14,
            },
          ]}
        >
          <Text style={[styles.cardTitle, { color: colors.foreground, fontSize: isNarrow ? 16 : 18 }]}>
            Welcome back
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground, fontSize: isNarrow ? 11 : 12, marginBottom: isSmall ? 16 : 20 }]}>
            Sign in to your organization account
          </Text>

          {/* Username */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontSize: isNarrow ? 11 : 12 }]}>Username</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border, paddingVertical: isSmall ? 10 : 12, marginBottom: 13 }]}>
            <Feather name="user" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontSize: isNarrow ? 13 : 14 }]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontSize: isNarrow ? 11 : 12 }]}>Password</Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border, paddingVertical: isSmall ? 10 : 12, marginBottom: 14 }]}>
            <Feather name="lock" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontSize: isNarrow ? 13 : 14 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry={!showPassword}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Feather name={showPassword ? "eye-off" : "eye"} size={14} color={colors.mutedForeground} />
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary, paddingVertical: isSmall ? 12 : 14 }, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="log-in" size={15} color="#fff" />
                <Text style={[styles.loginText, { fontSize: isNarrow ? 14 : 15 }]}>Sign In</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Demo hint */}
        <View style={[styles.demoBox, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}>
          <Feather name="info" size={12} color={colors.accent} />
          <Text style={[styles.demoText, { color: colors.mutedForeground, fontSize: isNarrow ? 11 : 12 }]}>
            Demo:{" "}
            <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>bossin</Text>
            {" / "}
            <Text style={{ color: colors.foreground, fontFamily: "Inter_600SemiBold" }}>bossin123</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flexGrow: 1 },
  logoSection: { alignItems: "center" },
  logoCircle: {
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0F766E",
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  appName: { fontFamily: "Inter_700Bold", marginBottom: 4 },
  tagline: { fontFamily: "Inter_400Regular", textAlign: "center" },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardTitle: { fontFamily: "Inter_700Bold", marginBottom: 3 },
  cardSub: { fontFamily: "Inter_400Regular" },
  fieldLabel: { fontFamily: "Inter_600SemiBold", marginBottom: 5 },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    paddingHorizontal: 12,
    borderRadius: 11,
    borderWidth: 1,
  },
  input: { flex: 1, fontFamily: "Inter_400Regular", padding: 0 },
  loginBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 12,
    shadowColor: "#0F766E",
    shadowOpacity: 0.28,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  loginText: { color: "#fff", fontFamily: "Inter_700Bold" },
  demoBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    padding: 11,
    borderRadius: 10,
    borderWidth: 1,
  },
  demoText: { fontFamily: "Inter_400Regular" },
});
