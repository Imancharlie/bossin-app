import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { AppLoader } from '@/components/AppLoader';
import { OnboardingSteps } from '@/components/OnboardingSteps';

export default function FinancialOnboarding() {
  const router = useRouter();
  const { data, isLoading, updateOrganization } = useData();
  const [defaultPledge, setDefaultPledge] = useState(data.organization.theme?.default_pledge_amount || '70000');
  const [targetAmount, setTargetAmount] = useState(data.organization.theme?.target_amount || '210000');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNext = async () => {
    if (!defaultPledge || !targetAmount) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateOrganization({
        theme: {
          ...data.organization.theme,
          default_pledge_amount: defaultPledge,
          target_amount: targetAmount,
        }
      });
      router.push('/onboarding/branding');
    } catch (error) {
      Alert.alert('Error', 'Failed to save financial settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/subscription');
  };

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <OnboardingSteps currentStep={1} />
        
        <Text style={styles.title}>Financial Settings</Text>
        <Text style={styles.subtitle}>Configure default financial targets for your organization</Text>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Default Pledge Amount</Text>
            <TextInput
              style={styles.input}
              value={defaultPledge}
              onChangeText={setDefaultPledge}
              placeholder="70000"
              keyboardType="numeric"
            />
            <Text style={styles.helper}>The default contribution amount for new members</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Target Collection Amount</Text>
            <TextInput
              style={styles.input}
              value={targetAmount}
              onChangeText={setTargetAmount}
              placeholder="210000"
              keyboardType="numeric"
            />
            <Text style={styles.helper}>Your organization's target collection amount</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={handleSkip}
            disabled={isSubmitting}
          >
            <Text style={styles.skipButtonText}>Skip All</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={handleNext}
            disabled={isSubmitting}
          >
            <Text style={styles.nextButtonText}>Next: Branding</Text>
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: '#e0e0e0',
  },
  skipButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: '#7492b9',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
