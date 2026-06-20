import { Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="financial" />
      <Stack.Screen name="branding" />
      <Stack.Screen name="staff" />
      <Stack.Screen name="import" />
      <Stack.Screen name="subscription" />
    </Stack>
  );
}
