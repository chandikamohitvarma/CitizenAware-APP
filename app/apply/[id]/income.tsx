import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header, ProgressStepper, OfficialWebsiteBanner } from '@/components/ui';
import { useApplicationDraftStore } from '@/store/applicationDraftStore';

export default function IncomeDetailsScreen() {
  const { id } = useLocalSearchParams();
  const schemeId = String(id);
  const { getDraft, updateDraft } = useApplicationDraftStore();
  const draft = getDraft(schemeId);

  const annualIncome = draft.annualIncome;
  const incomeSource = draft.incomeSource || 'Salaried';
  const incomeCategory = draft.incomeCategory || 'APL';
  const bplCardNumber = draft.bplCardNumber;
  const incomeCertNumber = draft.incomeCertNumber;

  const handleNext = () => {
    if (!annualIncome) {
      Alert.alert('Error', 'Please enter your annual family income');
      return;
    }
    router.push(`/apply/${schemeId}/documents`);
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
      <Header
        title="Income Details"
        showBack
        onBackPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)'))}
      />
      <ProgressStepper currentStep={3} />

      <ScrollView style={styles.content}>
        <OfficialWebsiteBanner schemeId={schemeId} />
        <Text style={styles.sectionTitle}>Income & Category Information</Text>

        <AppInput
          label="Annual Family Income (₹) *"
          placeholder="250000"
          value={annualIncome}
          onChangeText={(val) => updateDraft(schemeId, { annualIncome: val })}
          keyboardType="numeric"
          required
        />

        <Text style={styles.label}>Primary Income Source *</Text>
        <View style={styles.chipGrid}>
          {sources.map((src) => (
            <TouchableOpacity
              key={src}
              style={[styles.chip, incomeSource === src && styles.chipActive]}
              onPress={() => updateDraft(schemeId, { incomeSource: src })}
            >
              <Text style={[styles.chipText, incomeSource === src && styles.chipTextActive]}>
                {src}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Economic Category *</Text>
        <View style={styles.categoryList}>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.code}
              style={[styles.catCard, incomeCategory === cat.code && styles.catCardActive]}
              onPress={() => updateDraft(schemeId, { incomeCategory: cat.code })}
            >
              <View style={styles.radioOuter}>
                {incomeCategory === cat.code && <View style={styles.radioInner} />}
              </View>
              <Text
                style={[styles.catLabel, incomeCategory === cat.code && styles.catLabelActive]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {incomeCategory === 'BPL' && (
          <AppInput
            label="BPL Card Number"
            placeholder="Enter BPL card number"
            value={bplCardNumber}
            onChangeText={(val) => updateDraft(schemeId, { bplCardNumber: val })}
          />
        )}

        <AppInput
          label="Income Certificate Number (Optional)"
          placeholder="e.g. INC/2026/XXXXX"
          value={incomeCertNumber}
          onChangeText={(val) => updateDraft(schemeId, { incomeCertNumber: val })}
        />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.stepsInfo}>
          <Text style={styles.stepCurrent}>Step 3 of 6</Text>
          <Text style={styles.stepLabel}>Income Details</Text>
        </View>
        <AppButton title="Continue to Document Upload" onPress={handleNext} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.dark, marginBottom: 8, marginTop: 12 },
  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  chipActive: {
    backgroundColor: Colors.primary.blue + '15',
    borderColor: Colors.primary.blue,
  },
  chipText: { fontSize: 13, color: Colors.dark, fontWeight: '500' },
  chipTextActive: { color: Colors.primary.blue, fontWeight: '700' },
  categoryList: { gap: 8, marginBottom: 16 },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray.border,
    gap: 12,
  },
  catCardActive: {
    borderColor: Colors.primary.blue,
    backgroundColor: Colors.primary.blue + '08',
  },
  radioOuter: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: Colors.gray.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary.blue,
  },
  catLabel: { fontSize: 14, color: Colors.dark, fontWeight: '500' },
  catLabelActive: { color: Colors.primary.blue, fontWeight: '700' },
  footer: {
    padding: 16,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.border,
  },
  stepsInfo: { marginBottom: 8 },
  stepCurrent: { fontSize: 12, color: Colors.primary.blue, fontWeight: '600' },
  stepLabel: { fontSize: 14, fontWeight: '700', color: Colors.dark },
});
