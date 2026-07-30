import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header, ProgressStepper } from '@/components/ui';

export default function IncomeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [annualIncome, setAnnualIncome] = useState('');
  const [incomeSource, setIncomeSource] = useState('Salaried');
  const [incomeCategory, setIncomeCategory] = useState('APL');
  const [bplCardNumber, setBplCardNumber] = useState('');
  const [incomeCertNumber, setIncomeCertNumber] = useState('');

  const handleNext = () => {
    if (!annualIncome) {
      Alert.alert('Error', 'Please enter your annual family income');
      return;
    }
    router.push(`/apply/${id}/documents`);
  };

  const sources = ['Salaried', 'Self-Employed', 'Agriculture', 'Business', 'Daily Wage', 'Pensioner'];
  const categories = [
    { code: 'BPL', label: 'BPL (Below Poverty Line)' },
    { code: 'EWS', label: 'EWS (Economically Weaker)' },
    { code: 'LIG', label: 'LIG (Low Income Group)' },
    { code: 'MIG', label: 'MIG (Middle Income Group)' },
    { code: 'APL', label: 'General / APL' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Income Details" showBack onBackPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)')} />
      <ProgressStepper currentStep={3} />

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Income & Category Information</Text>

        <AppInput
          label="Annual Family Income (₹) *"
          placeholder="250000"
          value={annualIncome}
          onChangeText={setAnnualIncome}
          keyboardType="numeric"
          required
        />

        <Text style={styles.label}>Primary Income Source *</Text>
        <View style={styles.chipGrid}>
          {sources.map((src) => (
            <TouchableOpacity
              key={src}
              style={[styles.chip, incomeSource === src && styles.chipActive]}
              onPress={() => setIncomeSource(src)}
            >
              <Text style={[styles.chipText, incomeSource === src && styles.chipTextActive]}>{src}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Economic Category *</Text>
        <View style={styles.categoryList}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.code}
              style={[styles.catCard, incomeCategory === cat.code && styles.catCardActive]}
              onPress={() => setIncomeCategory(cat.code)}
            >
              <View style={[styles.radioDot, incomeCategory === cat.code && styles.radioDotActive]} />
              <Text style={[styles.catText, incomeCategory === cat.code && styles.catTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <AppInput
          label="Income Certificate Number (Optional)"
          placeholder="INC/2026/987654"
          value={incomeCertNumber}
          onChangeText={setIncomeCertNumber}
        />

        <AppInput
          label="Ration / BPL Card Number (Optional)"
          placeholder="RAT123456789"
          value={bplCardNumber}
          onChangeText={setBplCardNumber}
        />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Verification Note</Text>
          <Text style={styles.infoText}>
            Income details are verified with state civil supplies and income certificate documents uploaded in the next step.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.stepsInfo}>
          <Text style={styles.stepCurrent}>Step 3 of 6</Text>
          <Text style={styles.stepLabel}>Income Details</Text>
        </View>
        <AppButton title="Continue to Documents" onPress={handleNext} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.dark, marginTop: 12, marginBottom: 8 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  chipActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  chipText: { fontSize: 13, color: Colors.dark, fontWeight: '500' },
  chipTextActive: { color: Colors.white },
  categoryList: { gap: 8, marginBottom: 16 },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  catCardActive: { borderColor: Colors.primary.blue, backgroundColor: Colors.primary.blue + '08' },
  radioDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.gray.border,
    marginRight: 12,
  },
  radioDotActive: { borderColor: Colors.primary.blue, backgroundColor: Colors.primary.blue },
  catText: { fontSize: 14, color: Colors.dark, fontWeight: '500' },
  catTextActive: { color: Colors.primary.blue, fontWeight: '600' },
  infoBox: { backgroundColor: Colors.primary.blue + '10', borderRadius: 12, padding: 14, marginTop: 12, marginBottom: 24 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: Colors.primary.blue, marginBottom: 4 },
  infoText: { fontSize: 13, color: Colors.gray.text, lineHeight: 18 },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray.border },
  stepsInfo: { marginBottom: 12 },
  stepCurrent: { fontSize: 13, color: Colors.primary.blue, fontWeight: '600' },
  stepLabel: { fontSize: 16, color: Colors.dark, fontWeight: '600' },
});
