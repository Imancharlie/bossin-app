import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { AppLoader } from '@/components/AppLoader';
import { OnboardingSteps } from '@/components/OnboardingSteps';

export default function SubscriptionOnboarding() {
  const router = useRouter();
  const { user } = useAuth();
  const { data, isLoading } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      // Mark onboarding as completed
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete onboarding');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactSupport = () => {
    // Open WhatsApp or email for support
    Linking.openURL('https://wa.me/255614021404');
  };

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <OnboardingSteps currentStep={5} />
        
        <Text style={styles.title}>Subscription Setup</Text>
        <Text style={styles.subtitle}>Complete your setup and activate your subscription</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>🎉 Congratulations!</Text>
          <Text style={styles.infoText}>
            Your organization "{data.organization.name}" has been created successfully.
          </Text>
          <Text style={styles.infoText}>
            You can now start using Bossin to manage your finances.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Organization Details</Text>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Name:</Text>
              <Text style={styles.detailValue}>{data.organization.name}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Category:</Text>
              <Text style={styles.detailValue}>{data.organization.category}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status:</Text>
              <Text style={[styles.detailValue, styles.statusActive]}>
                {data.organization.subscription_status}
              </Text>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Need Help?</Text>
            <Text style={styles.helper}>
              Contact our support team for assistance with subscription or any questions.
            </Text>
            <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, styles.completeButton]}
          onPress={handleComplete}
          disabled={isSubmitting}
        >
          <Text style={styles.completeButtonText}>Go to Dashboard</Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ by KodinSoftwares
          </Text>
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
  infoBox: {
    backgroundColor: '#d4edda',
    borderWidth: 1,
    borderColor: '#c3e6cb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155724',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#155724',
    marginBottom: 4,
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
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusActive: {
    color: '#28a745',
  },
  helper: {
    fontSize: 12,
    color: '#999',
    marginBottom: 8,
  },
  supportButton: {
    backgroundColor: '#7492b9',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  supportButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  completeButton: {
    backgroundColor: '#7492b9',
  },
  completeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: '#999',
  },
});
