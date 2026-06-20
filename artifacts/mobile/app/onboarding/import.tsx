import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useData } from '@/contexts/DataContext';
import { AppLoader } from '@/components/AppLoader';
import { OnboardingSteps } from '@/components/OnboardingSteps';

export default function ImportOnboarding() {
  const router = useRouter();
  const { data, isLoading } = useData();
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePickFile = () => {
    // TODO: Implement file picker when expo-document-picker is available
    Alert.alert('Info', 'File picker will be implemented in a future update');
  };

  const handleImport = async () => {
    if (!fileName) {
      Alert.alert('Error', 'Please select a file to import');
      return;
    }

    setIsSubmitting(true);
    try {
      // TODO: Implement file upload API call
      Alert.alert('Success', 'Members imported successfully');
      router.push('/onboarding/subscription');
    } catch (error) {
      Alert.alert('Error', 'Failed to import members');
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
        <OnboardingSteps currentStep={4} />
        
        <Text style={styles.title}>Import Members</Text>
        <Text style={styles.subtitle}>Import your members from an Excel file (optional)</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How to Import</Text>
          <Text style={styles.infoText}>• Prepare an Excel file with member data</Text>
          <Text style={styles.infoText}>• Include columns: Name, Phone, Email, Pledge Amount</Text>
          <Text style={styles.infoText}>• Upload the file to add all members at once</Text>
          <Text style={styles.infoText}>• You can always add members manually later</Text>
        </View>

        <View style={styles.form}>
          <TouchableOpacity style={styles.filePicker} onPress={handlePickFile}>
            <Text style={styles.filePickerText}>
              {fileName || 'Select Excel File'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.helper}>
            Supported formats: Excel (.xlsx, .xls) or CSV
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.skipButton]}
            onPress={handleSkip}
            disabled={isSubmitting}
          >
            <Text style={styles.skipButtonText}>Skip & Go to Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.importButton]}
            onPress={handleImport}
            disabled={isSubmitting || !fileName}
          >
            <Text style={styles.importButtonText}>Import Members</Text>
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
  infoBox: {
    backgroundColor: '#e7f3ff',
    borderWidth: 1,
    borderColor: '#b3d9ff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0056b3',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  form: {
    marginBottom: 32,
  },
  helper: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  filePicker: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  filePickerText: {
    fontSize: 16,
    color: '#999',
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
  importButton: {
    backgroundColor: '#7492b9',
  },
  importButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
