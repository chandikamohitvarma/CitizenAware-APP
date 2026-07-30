import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Building2, Search, X, ChevronDown, Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header, ProgressStepper } from '@/components/ui';
import { ALL_INDIAN_BANKS, TOP_INDIAN_BANKS } from '@/constants/banks';

export default function BankDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccount, setConfirmAccount] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountType, setAccountType] = useState('Savings');
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customBankName, setCustomBankName] = useState('');

  const filteredBanks = ALL_INDIAN_BANKS.filter(b =>
    b.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = () => {
    const finalBankName = bankName === 'Other / Local Co-operative Bank' ? customBankName : bankName;
    if (!accountNumber || !confirmAccount || !ifsc || !finalBankName) {
      Alert.alert('Error', 'Please fill in all required fields including bank name');
      return;
    }
    if (accountNumber !== confirmAccount) {
      Alert.alert('Error', 'Account numbers do not match');
      return;
    }
    router.push(`/apply/${id}/review`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Bank Details" showBack onBackPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)')} />
      <ProgressStepper currentStep={5} />

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Direct Benefit Transfer (DBT) Bank Info</Text>

        <Text style={styles.label}>Select Bank Name *</Text>
        <TouchableOpacity style={styles.bankSelectorBtn} onPress={() => setIsBankModalOpen(true)}>
          <View style={styles.bankSelectorLeft}>
            <Building2 size={18} color={bankName ? Colors.primary.blue : Colors.gray.icon} />
            <Text style={[styles.bankSelectorText, !bankName && styles.placeholder]}>
              {bankName || 'Choose your bank in India'}
            </Text>
          </View>
          <ChevronDown size={18} color={Colors.gray.icon} />
        </TouchableOpacity>

        {bankName === 'Other / Local Co-operative Bank' && (
          <AppInput
            label="Enter Custom Bank / Co-operative Bank Name"
            placeholder="Type your local bank name"
            value={customBankName}
            onChangeText={setCustomBankName}
            required
          />
        )}

        <AppInput
          label="Account Number"
          placeholder="Enter bank account number"
          value={accountNumber}
          onChangeText={setAccountNumber}
          keyboardType="numeric"
          required
        />
        <AppInput
          label="Confirm Account Number"
          placeholder="Re-enter account number"
          value={confirmAccount}
          onChangeText={setConfirmAccount}
          keyboardType="numeric"
          required
        />
        <AppInput
          label="IFSC Code"
          placeholder="SBIN0001234"
          value={ifsc}
          onChangeText={setIfsc}
          autoCapitalize="characters"
          required
        />

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

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Secure Direct Benefit Transfer (DBT)</Text>
          <Text style={styles.infoText}>
            Your bank details will be linked to Aadhaar for Direct Benefit Transfer. All monetary scheme benefits will be credited directly to this account.
          </Text>
        </View>
      </ScrollView>

      {/* Searchable Bank Picker Modal */}
      <Modal visible={isBankModalOpen} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Your Bank in India</Text>
            <TouchableOpacity onPress={() => setIsBankModalOpen(false)}>
              <X size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <Search size={18} color={Colors.gray.icon} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search 50+ Indian Banks (SBI, HDFC, PNB...)..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredBanks}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.bankListItem, bankName === item && styles.bankListItemActive]}
                onPress={() => {
                  setBankName(item);
                  setIsBankModalOpen(false);
                }}
              >
                <View style={styles.bankItemLeft}>
                  <Building2 size={18} color={bankName === item ? Colors.primary.blue : Colors.gray.icon} />
                  <Text style={[styles.bankListText, bankName === item && styles.bankListTextActive]}>
                    {item}
                  </Text>
                </View>
                {bankName === item && <Check size={18} color={Colors.primary.blue} />}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      <View style={styles.footer}>
        <View style={styles.stepsInfo}>
          <Text style={styles.stepCurrent}>Step 5 of 6</Text>
          <Text style={styles.stepLabel}>Bank Details</Text>
        </View>
        <AppButton title="Continue to Review & Submit" onPress={handleNext} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.dark, marginBottom: 8, marginTop: 4 },
  bankSelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.gray.border,
    marginBottom: 16,
  },
  bankSelectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  bankSelectorText: { fontSize: 15, color: Colors.dark, fontWeight: '500' },
  placeholder: { color: Colors.gray.icon, fontWeight: '400' },
  quickBankSection: { marginBottom: 16 },
  quickTitle: { fontSize: 13, fontWeight: '500', color: Colors.gray.text, marginBottom: 8 },
  quickBanksRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  bankChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: Colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  bankChipActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  bankChipText: { fontSize: 13, color: Colors.dark, fontWeight: '500' },
  bankChipTextActive: { color: Colors.white },
  typeRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  typeBtn: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.gray.border,
    alignItems: 'center',
  },
  typeBtnActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  typeText: { fontWeight: '500', color: Colors.dark },
  typeTextActive: { color: Colors.white },
  infoBox: { backgroundColor: Colors.primary.blue + '10', borderRadius: 12, padding: 14, marginTop: 10, marginBottom: 24 },
  infoTitle: { fontSize: 14, fontWeight: '600', color: Colors.primary.blue, marginBottom: 4 },
  infoText: { fontSize: 13, color: Colors.gray.text, lineHeight: 18 },
  modalContainer: { flex: 1, backgroundColor: Colors.white, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray.light,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  searchInput: { flex: 1, fontSize: 15, color: Colors.dark },
  bankListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray.border,
  },
  bankListItemActive: { backgroundColor: Colors.primary.blue + '10' },
  bankItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  bankListText: { fontSize: 15, color: Colors.dark },
  bankListTextActive: { fontWeight: '700', color: Colors.primary.blue },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray.border },
  stepsInfo: { marginBottom: 12 },
  stepCurrent: { fontSize: 13, color: Colors.primary.blue, fontWeight: '600' },
  stepLabel: { fontSize: 16, color: Colors.dark, fontWeight: '600' },
});
