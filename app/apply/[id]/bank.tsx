import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header, ProgressStepper } from '@/components/ui';

export default function BankDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('');

  const handleNext = () => {
    if (!accountNumber || !confirmAccount || !ifsc || !bankName) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (accountNumber !== confirmAccount) {
      Alert.alert('Error', 'Account numbers do not match');
      return;
    }
    router.push(`/apply/${id}/documents`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Bank Details" showBack onBackPress={() => router.back()} />
      <ProgressStepper currentStep={5} />

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Bank Account Information</Text>
        <AppInput label="Account Number" placeholder="Enter account number" value={accountNumber} onChangeText={setAccountNumber} keyboardType="numeric" required />
        <AppInput label="Confirm Account Number" placeholder="Re-enter account number" value={confirmAccount} onChangeText={setConfirmAccount} keyboardType="numeric" required />
        <AppInput label="IFSC Code" placeholder="Enter IFSC code" value={ifsc} onChangeText={setIfsc} autoCapitalize="characters" required />

        <Text style={styles.label}>Account Type *</Text>
        <View style={styles.typeRow}>
          {['Savings', 'Current'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, accountType === t && styles.typeBtnActive]}
              onPress={() => setAccountType(t)}
            >
              <Text style={[styles.typeText, accountType === t && styles.typeTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <AppInput label="Bank Name" placeholder="Enter bank name" value={bankName} onChangeText={setBankName} required />

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Why do we need this?</Text>
          <Text style={styles.infoText}>Your bank details are used to directly transfer scheme benefits to your account. Your information is secure with us.</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton title="Continue" onPress={handleNext} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.dark, marginBottom: 8 },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  typeBtn: { flex: 1, padding: 12, backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1, borderColor: Colors.gray.border, alignItems: 'center' },
  typeBtnActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  typeText: { fontWeight: '500', color: Colors.dark },
  typeTextActive: { color: Colors.white },
  infoBox: { backgroundColor: Colors.primary.blue + '10', borderRadius: 10, padding: 14, marginTop: 10 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: Colors.primary.blue, marginBottom: 4 },
  infoText: { fontSize: 13, color: Colors.gray.text, lineHeight: 19 },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white },
});
