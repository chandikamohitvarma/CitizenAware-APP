import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header } from '@/components/ui';
import { schemes } from '@/constants/data';

export default function EligibilityCheckScreen() {
  const { id } = useLocalSearchParams();
  const scheme = schemes.find(s => s.id === id) || schemes[0];

  const [step, setStep] = useState(1);
  const [income, setIncome] = useState('');
  const [education, setEducation] = useState('');
  const [category, setCategory] = useState('');
  const [age, setAge] = useState('');

  const handleSubmit = () => {
    router.push('/scheme/eligibility-result');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Check Eligibility" showBack onBackPress={() => router.back()} />
      <View style={styles.progress}>
        <Text style={styles.stepText}>Step {step} of 4</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${step * 25}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {step === 1 && (
          <View>
            <Text style={styles.label}>What is your annual family income?</Text>
            <AppInput
              placeholder="Enter income (in INR)"
              value={income}
              onChangeText={setIncome}
              keyboardType="numeric"
            />
          </View>
        )}
        {step === 2 && (
          <View>
            <Text style={styles.label}>Select your education level</Text>
            {['10th Pass', '12th Pass', 'Graduate', 'Post Graduate'].map((edu) => (
              <TouchableOpacity
                key={edu}
                style={[styles.option, education === edu && styles.optionSelected]}
                onPress={() => setEducation(edu)}
              >
                <Text style={[styles.optionText, education === edu && styles.optionTextSelected]}>{edu}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {step === 3 && (
          <View>
            <Text style={styles.label}>Select your category</Text>
            {['General', 'OBC', 'SC', 'ST', 'EWS'].map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.option, category === cat && styles.optionSelected]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.optionText, category === cat && styles.optionTextSelected]}>{cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        {step === 4 && (
          <View>
            <Text style={styles.label}>What is your age?</Text>
            <AppInput
              placeholder="Enter your age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backBtn}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.nextBtn}>
          <AppButton
            title={step === 4 ? 'Check Eligibility' : 'Next'}
            onPress={() => {
              if (step < 4) setStep(step + 1);
              else handleSubmit();
            }}
            fullWidth
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  progress: { padding: 16, backgroundColor: Colors.white },
  stepText: { fontSize: 13, color: Colors.gray.text, marginBottom: 8 },
  progressBar: { height: 4, backgroundColor: Colors.gray.border, borderRadius: 2 },
  progressFill: { height: '100%', backgroundColor: Colors.primary.blue, borderRadius: 2 },
  content: { flex: 1, padding: 16 },
  label: { fontSize: 16, fontWeight: '600', color: Colors.dark, marginBottom: 16 },
  option: {
    padding: 16,
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  optionSelected: { backgroundColor: Colors.primary.blue + '15', borderColor: Colors.primary.blue },
  optionText: { fontSize: 15, color: Colors.dark },
  optionTextSelected: { color: Colors.primary.blue, fontWeight: '600' },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.border,
  },
  backBtn: { justifyContent: 'center', paddingHorizontal: 16 },
  backText: { fontSize: 16, color: Colors.gray.text },
  nextBtn: { flex: 1 },
});
