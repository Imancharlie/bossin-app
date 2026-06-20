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
import { authService, RegisterRequest } from "@/services";

export default function RegisterScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgDescription, setOrgDescription] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSmall = height < 700;
  const isNarrow = width < 380;

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim() || !firstName.trim() || !lastName.trim() || !orgName.trim()) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters");
      return;
    }
    if (!acceptTerms) {
      Alert.alert("Error", "You must accept the Terms & Conditions");
      return;
    }
    setLoading(true);
    try {
      const registerData: RegisterRequest = {
        username: username.trim(),
        email: email.trim(),
        password,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        organization_name: orgName.trim(),
        organization_description: orgDescription.trim(),
        accept_terms: acceptTerms,
      };
      
      const response = await authService.register(registerData);
      
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {}
      
      Alert.alert(
        "Registration Successful",
        "Your account has been created! You can now log in.",
        [
          { text: "OK", onPress: () => router.replace("/login") }
        ]
      );
    } catch (error: any) {
      console.error('[Register] Error:', error);
      console.error('[Register] Error response:', error?.response?.data);
      try { await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error); } catch {}
      
      // Handle API errors
      let errorMessage = "An error occurred. Please try again.";
      if (error?.response?.data) {
        const responseData = error.response.data;
        // Backend returns { success: false, data: null, error: { field: [messages] } }
        if (responseData.error && typeof responseData.error === 'object') {
          const errorMessages = Object.values(responseData.error).flat();
          if (errorMessages.length > 0) {
            errorMessage = Array.isArray(errorMessages[0]) ? errorMessages[0][0] : errorMessages[0];
          }
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        } else if (responseData.error && typeof responseData.error === 'string') {
          errorMessage = responseData.error;
        }
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Registration Failed", errorMessage);
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
            Create your account
          </Text>
        </View>

        {/* Form Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground, fontSize: isNarrow ? 16 : 18 }]}>
            Sign Up
          </Text>
          <Text style={[styles.cardSub, { color: colors.mutedForeground, fontSize: isNarrow ? 11 : 12 }]}>
            Create an account and organization
          </Text>

          {/* Username */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontSize: isNarrow ? 11 : 12 }]}>
            Username *
          </Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="user" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontSize: isNarrow ? 13 : 14 }]}
              value={username}
              onChangeText={setUsername}
              placeholder="Choose a username"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              returnKeyType="next"
            />
          </View>

          {/* Email */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontSize: isNarrow ? 11 : 12 }]}>
            Email *
          </Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="mail" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontSize: isNarrow ? 13 : 14 }]}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter your email"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="none"
              keyboardType="email-address"
              returnKeyType="next"
            />
          </View>

          {/* First Name */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontSize: isNarrow ? 11 : 12 }]}>
            First Name *
          </Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="user" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontSize: isNarrow ? 13 : 14 }]}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter your first name"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Last Name */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontSize: isNarrow ? 11 : 12 }]}>
            Last Name *
          </Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="user" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontSize: isNarrow ? 13 : 14 }]}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter your last name"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Organization Name */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontSize: isNarrow ? 11 : 12 }]}>
            Organization Name *
          </Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="briefcase" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontSize: isNarrow ? 13 : 14 }]}
              value={orgName}
              onChangeText={setOrgName}
              placeholder="Enter organization name"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="words"
              returnKeyType="next"
            />
          </View>

          {/* Organization Description */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontSize: isNarrow ? 11 : 12 }]}>
            Organization Description
          </Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="file-text" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontSize: isNarrow ? 13 : 14 }]}
              value={orgDescription}
              onChangeText={setOrgDescription}
              placeholder="Describe your organization (optional)"
              placeholderTextColor={colors.mutedForeground}
              autoCapitalize="sentences"
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontSize: isNarrow ? 11 : 12 }]}>
            Password *
          </Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="lock" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontSize: isNarrow ? 13 : 14 }]}
              value={password}
              onChangeText={setPassword}
              placeholder="Create a password (min 8 characters)"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              returnKeyType="next"
            />
          </View>

          {/* Confirm Password */}
          <Text style={[styles.fieldLabel, { color: colors.foreground, fontSize: isNarrow ? 11 : 12 }]}>
            Confirm Password *
          </Text>
          <View style={[styles.inputWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Feather name="lock" size={14} color={colors.mutedForeground} />
            <TextInput
              style={[styles.input, { color: colors.foreground, fontSize: isNarrow ? 13 : 14 }]}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm your password"
              placeholderTextColor={colors.mutedForeground}
              secureTextEntry
              returnKeyType="next"
            />
          </View>

          {/* Terms & Conditions */}
          <TouchableOpacity
            style={styles.termsContainer}
            onPress={() => setAcceptTerms(!acceptTerms)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, { borderColor: colors.border, backgroundColor: acceptTerms ? colors.primary : colors.muted }]}>
              {acceptTerms && <Feather name="check" size={12} color="#fff" />}
            </View>
            <Text style={[styles.termsText, { color: colors.mutedForeground, fontSize: isNarrow ? 11 : 12 }]}>
              I accept the Terms & Conditions *
            </Text>
          </TouchableOpacity>

          {/* Register button */}
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: colors.primary, paddingVertical: isSmall ? 12 : 14 }, loading && { opacity: 0.7 }]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="user-plus" size={15} color="#fff" />
                <Text style={[styles.loginText, { fontSize: isNarrow ? 14 : 15 }]}>Create Account</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Back to login */}
        <TouchableOpacity style={styles.signupContainer} onPress={() => router.back()} activeOpacity={0.7}>
          <Text style={[styles.signupText, { color: colors.mutedForeground, fontSize: isNarrow ? 11 : 12 }]}>
            Already have an account?{" "}
            <Text style={{ color: colors.primary, fontFamily: "Inter_600SemiBold" }}>Sign in</Text>
          </Text>
        </TouchableOpacity>
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
    marginBottom: 12,
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
  signupContainer: { alignItems: "center", marginTop: 8 },
  signupText: { fontFamily: "Inter_400Regular" },
  termsContainer: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  termsText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1 },
});
