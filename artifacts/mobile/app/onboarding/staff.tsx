import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { AppLoader } from '@/components/AppLoader';
import { OnboardingSteps } from '@/components/OnboardingSteps';

export default function StaffOnboarding() {
  const router = useRouter();
  const { data, isLoading } = useData();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roleOptions = [
    { value: 'staff', label: 'Staff (Can record transactions)' },
    { value: 'admin', label: 'Admin (Can manage staff)' },
    { value: 'viewer', label: 'Viewer (Read-only access)' },
  ];

  const handleAddStaff = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement staff creation API call
      Alert.alert('Success', 'Staff member added successfully');
      setUsername('');
      setPassword('');
    } catch (error) {
      Alert.alert('Error', 'Failed to add staff member');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    router.push('/onboarding/import');
  };

  const handleSkip = () => {
    router.push('/onboarding/import');
  };

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <OnboardingSteps currentStep={3} />
        
        <Text style={styles.title}>Staff Management</Text>
        <Text style={styles.subtitle}>Add team members to your organization (optional)</Text>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              autoCapitalize="none"
            />
            <Text style={styles.helper}>Unique username for the staff member</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Temporary Password</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Enter temporary password"
              secureTextEntry
            />
            <Text style={styles.helper}>They can change this after login</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Role</Text>
            <View style={styles.roleContainer}>
              {roleOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.roleButton,
                    role === option.value && styles.roleButtonActive,
                  ]}
                  onPress={() => setRole(option.value)}
                >
                  <Text
                    style={[
                      styles.roleButtonText,
                      role === option.value && styles.roleButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, styles.addButton]}
            onPress={handleAddStaff}
            disabled={isSubmitting}
          >
            <Text style={styles.addButtonText}>Add Staff Member</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={handleSkip}
            disabled={isSubmitting}
          >
            <Text style={styles.skipButtonText}>Skip</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={handleNext}
            disabled={isSubmitting}
          >
            <Text style={styles.nextButtonText}>Next: Import</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  form: {
    marginBottom: 32,
  },
  formGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  helper: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  roleContainer: {
    gap: 8,
  },
  roleButton: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  roleButtonActive: {
    backgroundColor: '#7492b9',
    borderColor: '#7492b9',
  },
  roleButtonText: {
    fontSize: 14,
    color: '#666',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButton: {
    backgroundColor: '#7492b9',
    marginTop: 16,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  skipButton: {
    flex: 1,
    backgroundColor: '#e0e0e0',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#7492b9',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
