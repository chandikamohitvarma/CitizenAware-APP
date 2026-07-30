import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useLocalSearchParams, router } from 'expo-router';

interface Step {
  id: number;
  label: string;
  route?: string;
}

interface ProgressStepperProps {
  steps?: Step[];
  currentStep: number;
  onStepPress?: (stepId: number) => void;
  schemeId?: string;
}

const defaultSteps: Step[] = [
  { id: 1, label: 'Personal', route: 'personal' },
  { id: 2, label: 'Address', route: 'address' },
  { id: 3, label: 'Income', route: 'income' },
  { id: 4, label: 'Documents', route: 'documents' },
  { id: 5, label: 'Bank', route: 'bank' },
  { id: 6, label: 'Review', route: 'review' },
];

export function ProgressStepper({
  steps = defaultSteps,
  currentStep,
  onStepPress,
  schemeId: customSchemeId,
}: ProgressStepperProps) {
  const params = useLocalSearchParams();
  const schemeId = customSchemeId || (params.id as string);

  const handlePress = (step: Step) => {
    if (onStepPress) {
      onStepPress(step.id);
      return;
    }

    if (schemeId && step.route) {
      router.push(`/apply/${schemeId}/${step.route}` as any);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.stepperContainer}>
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <View key={step.id} style={styles.stepWrapper}>
              <TouchableOpacity
                style={styles.stepContent}
                onPress={() => handlePress(step)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`Step ${step.id}: ${step.label}`}
              >
                <View
                  style={[
                    styles.circle,
                    isCompleted && styles.circleCompleted,
                    isCurrent && styles.circleCurrent,
                  ]}
                >
                  {isCompleted ? (
                    <Check size={14} color={Colors.white} />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        isCurrent && styles.stepNumberCurrent,
                      ]}
                    >
                      {step.id}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    (isCompleted || isCurrent) && styles.stepLabelActive,
                  ]}
                  numberOfLines={1}
                >
                  {step.label}
                </Text>
              </TouchableOpacity>

              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.connector,
                    isCompleted && styles.connectorCompleted,
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 8,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.border + '60',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  stepWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stepContent: {
    alignItems: 'center',
    width: 52,
    cursor: 'pointer',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.gray.light,
    borderWidth: 2,
    borderColor: Colors.gray.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleCompleted: {
    backgroundColor: Colors.primary.green,
    borderColor: Colors.primary.green,
  },
  circleCurrent: {
    backgroundColor: Colors.primary.blue,
    borderColor: Colors.primary.blue,
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray.text,
  },
  stepNumberCurrent: {
    color: Colors.white,
  },
  stepLabel: {
    fontSize: 10,
    color: Colors.gray.text,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  stepLabelActive: {
    color: Colors.dark,
    fontWeight: '700',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.gray.border,
    marginHorizontal: -6,
    marginBottom: 18,
    zIndex: -1,
  },
  connectorCompleted: {
    backgroundColor: Colors.primary.green,
  },
});
