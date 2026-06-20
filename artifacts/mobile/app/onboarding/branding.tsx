import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { AppLoader } from '@/components/AppLoader';
import { OnboardingSteps } from '@/components/OnboardingSteps';

export default function BrandingOnboarding() {
  const router = useRouter();
  const { data, isLoading, updateOrganization } = useData();
  const [category, setCategory] = useState(data.organization.category || 'organization');
  const [navbarTitle, setNavbarTitle] = useState(data.organization.theme?.navbar_title || data.organization.name);
  const [watermarkText, setWatermarkText] = useState(data.organization.theme?.watermark_text || 'Bossin');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categoryOptions = [
    { value: 'organization', label: 'Organization' },
    { value: 'church', label: 'Church' },
    { value: 'school', label: 'School' },
    { value: 'sacco', label: 'SACCO' },
    { value: 'chama', label: 'Chama' },
    { value: 'club', label: 'Club' },
  ];

  const handleNext = async () => {
    if (!navbarTitle) {
      Alert.alert('Error', 'Please enter a navbar title');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateOrganization({
        category,
        theme: {
          ...data.organization.theme,
          navbar_title: navbarTitle,
          watermark_text: watermarkText,
        }
      });
      router.push('/onboarding/staff');
    } catch (error) {
      Alert.alert('Error', 'Failed to save branding settings');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/staff');
  };

  if (isLoading) {
    return <AppLoader />;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <OnboardingSteps currentStep={2} />
        
        <Text style={styles.title}>Organization Branding</Text>
        <Text style={styles.subtitle}>Customize your organization's appearance</Text>

        <View style={styles.form}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Organization Category</Text>
            <View style={styles.categoryContainer}>
              {categoryOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.categoryButton,
                    category === option.value && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(option.value)}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === option.value && styles.categoryButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Navbar Title</Text>
            <TextInput
              style={styles.input}
              value={navbarTitle}
              onChangeText={setNavbarTitle}
              placeholder="Your organization name"
            />
            <Text style={styles.helper}>This appears in the navigation bar</Text>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Report Watermark Text</Text>
            <TextInput
              style={styles.input}
              value={watermarkText}
              onChangeText={setWatermarkText}
              placeholder="Bossin"
            />
            <Text style={styles.helper}>Text that appears on exported reports</Text>
          </View>
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
            <Text style={styles.nextButtonText}>Next: Staff</Text>
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
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  categoryButtonActive: {
    backgroundColor: '#7492b9',
    borderColor: '#7492b9',
  },
  categoryButtonText: {
    fontSize: 12,
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
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
