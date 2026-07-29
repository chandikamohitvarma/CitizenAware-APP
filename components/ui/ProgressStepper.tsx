import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface Step {
  id: number;
  label: string;
}

interface ProgressStepperProps {
  steps?: Step[];
  currentStep: number;
}

const defaultSteps: Step[] = [
  { id: 1, label: 'Personal' },
  { id: 2, label: 'Address' },
  { id: 3, label: 'Income' },
  { id: 4, label: 'Documents' },
  { id: 5, label: 'Bank' },
  { id: 6, label: 'Review' },
];

export function ProgressStepper({ steps = defaultSteps, currentStep }: ProgressStepperProps) {
  return (
    <View style={styles.container}>
      <View style={styles.stepperContainer}>
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;

          return (
            <View key={step.id} style={styles.stepWrapper}>
              <View style={styles.stepContent}>
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
              </View>
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
    width: 50,
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
    fontWeight: '600',
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
  },
  stepLabelActive: {
    color: Colors.dark,
    fontWeight: '500',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.gray.border,
    marginHorizontal: -8,
    marginBottom: 20,
    zIndex: -1,
  },
  connectorCompleted: {
    backgroundColor: Colors.primary.green,
  },
});
