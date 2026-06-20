import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

interface OnboardingStepsProps {
  currentStep: number;
}

const steps = [
  { number: 1, name: 'Financial', route: '/onboarding/financial' },
  { number: 2, name: 'Branding', route: '/onboarding/branding' },
  { number: 3, name: 'Staff', route: '/onboarding/staff' },
  { number: 4, name: 'Import', route: '/onboarding/import' },
  { number: 5, name: 'Subscription', route: '/onboarding/subscription' },
];

export function OnboardingSteps({ currentStep }: OnboardingStepsProps) {
  const router = useRouter();

  const handleStepPress = (step: typeof steps[0]) => {
    if (step.number <= currentStep) {
      router.push(step.route as any);
    }
  };

  return (
    <View style={styles.container}>
      {steps.map((step) => (
        <TouchableOpacity
          key={step.number}
          style={[
            styles.step,
            step.number === currentStep && styles.stepActive,
            step.number < currentStep && styles.stepCompleted,
          ]}
          onPress={() => handleStepPress(step)}
          disabled={step.number > currentStep}
          activeOpacity={step.number <= currentStep ? 0.7 : 1}
        >
          <View
            style={[
              styles.stepNumber,
              step.number === currentStep && styles.stepNumberActive,
              step.number < currentStep && styles.stepNumberCompleted,
            ]}
          >
            {step.number < currentStep ? '✓' : step.number}
          </View>
          <Text
            style={[
              styles.stepLabel,
              step.number === currentStep && styles.stepLabelActive,
              step.number < currentStep && styles.stepLabelCompleted,
            ]}
          >
            {step.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
    paddingHorizontal: 8,
  },
  step: {
    flex: 1,
    alignItems: 'center',
    opacity: 0.5,
  },
  stepActive: {
    opacity: 1,
  },
  stepCompleted: {
    opacity: 1,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepNumberActive: {
    backgroundColor: '#7492b9',
  },
  stepNumberCompleted: {
    backgroundColor: '#28a745',
  },
  stepLabel: {
    fontSize: 10,
    color: '#999',
    fontWeight: '600',
  },
  stepLabelActive: {
    color: '#7492b9',
  },
  stepLabelCompleted: {
    color: '#28a745',
  },
});
