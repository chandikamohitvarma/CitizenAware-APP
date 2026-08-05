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
import { AppButton, AppInput, Header, ProgressStepper, OfficialWebsiteBanner } from '@/components/ui';
import { ALL_INDIAN_BANKS, TOP_INDIAN_BANKS } from '@/constants/banks';
import { useApplicationDraftStore } from '@/store/applicationDraftStore';

export default function BankDetailsScreen() {
  const { id } = useLocalSearchParams();
  const schemeId = String(id);
  const { getDraft, updateDraft } = useApplicationDraftStore();
  const draft = getDraft(schemeId);

  const accountNumber = draft.accountNumber;
  const confirmAccount = draft.confirmAccount;
  const ifsc = draft.ifsc;
  const bankName = draft.bankName;
  const accountType = draft.accountType || 'Savings';
  const customBankName = draft.customBankName;

  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredBanks = ALL_INDIAN_BANKS.filter((b) =>
    b.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleNext = () => {
    const finalBankName =
      bankName === 'Other / Local Co-operative Bank' ? customBankName : bankName;
    if (!accountNumber || !confirmAccount || !ifsc || !finalBankName) {
      Alert.alert('Error', 'Please fill in all required fields including bank name');
      return;
    }
    if (accountNumber !== confirmAccount) {
      Alert.alert('Error', 'Account numbers do not match');
      return;
    }
    router.push(`/apply/${schemeId}/review`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Bank Details"
        showBack
        onBackPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)'))}
      />
      <ProgressStepper currentStep={5} />

      <ScrollView style={styles.content}>
        <OfficialWebsiteBanner schemeId={schemeId} />
        <Text style={styles.sectionTitle}>Direct Benefit Transfer (DBT) Bank Info</Text>

        <Text style={styles.label}>Select Bank Name *</Text>
        <TouchableOpacity
          style={styles.bankSelectorBtn}
          onPress={() => setIsBankModalOpen(true)}
        >
          <View style={styles.bankSelectorLeft}>
            <Building2 size={18} color={bankName ? Colors.primary.blue : Colors.gray.icon} />
            <Text style={[styles.bankSelectorText, !bankName && styles.placeholder]}>
              {bankName || 'Choose your bank...'}
            </Text>
          </View>
          <ChevronDown size={18} color={Colors.gray.icon} />
        </TouchableOpacity>

        {bankName === 'Other / Local Co-operative Bank' && (
          <AppInput
            label="Enter Custom Bank Name *"
            placeholder="e.g. State Co-operative Bank"
            value={customBankName}
            onChangeText={(val) => updateDraft(schemeId, { customBankName: val })}
            required
          />
        )}


        <AppInput
          label="Account Number *"
          placeholder="Enter 9 to 18 digit bank account number"
          value={accountNumber}
          onChangeText={(val) => updateDraft(schemeId, { accountNumber: val })}
          keyboardType="numeric"
          required
        />

        <AppInput
          label="Confirm Account Number *"
          placeholder="Re-enter bank account number"
          value={confirmAccount}
          onChangeText={(val) => updateDraft(schemeId, { confirmAccount: val })}
          keyboardType="numeric"
          required
        />

        <AppInput
          label="IFSC Code *"
          placeholder="e.g. SBIN0001234 (11 characters)"
          value={ifsc}
          onChangeText={(val) => updateDraft(schemeId, { ifsc: val.toUpperCase() })}
          autoCapitalize="characters"
          maxLength={11}
          required
        />

        <Text style={styles.label}>Account Type *</Text>
        <View style={styles.typeRow}>
          {['Savings', 'Current', 'Jan Dhan'].map((t) => (
            <TouchableOpacity
              key={t}
              style={[styles.typeBtn, accountType === t && styles.typeBtnActive]}
              onPress={() => updateDraft(schemeId, { accountType: t })}
            >
              <Text style={[styles.typeText, accountType === t && styles.typeTextActive]}>
                {t}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bank Picker Modal */}
      <Modal visible={isBankModalOpen} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Your Bank</Text>
            <TouchableOpacity onPress={() => setIsBankModalOpen(false)}>
              <X size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBarContainer}>
            <Search size={18} color={Colors.gray.icon} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search 100+ Indian Banks..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <FlatList
            data={filteredBanks}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.bankItem, bankName === item && styles.bankItemActive]}
                onPress={() => {
                  updateDraft(schemeId, { bankName: item });
                  setIsBankModalOpen(false);
                }}
              >
                <Text style={[styles.bankText, bankName === item && styles.bankTextActive]}>
                  {item}
                </Text>
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
        <AppButton title="Continue to Review" onPress={handleNext} fullWidth />
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
    marginBottom: 12,
  },
  bankSelectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  bankSelectorText: { fontSize: 15, color: Colors.dark, fontWeight: '500' },
  placeholder: { color: Colors.gray.icon, fontWeight: '400' },
  quickBanksRow: { flexDirection: 'row', gap: 8, marginBottom: 16, paddingRight: 8 },
  quickBankChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  quickBankChipActive: {
    backgroundColor: Colors.primary.blue + '15',
    borderColor: Colors.primary.blue,
  },
  quickBankText: { fontSize: 12, color: Colors.dark, fontWeight: '500' },
  quickBankTextActive: { color: Colors.primary.blue, fontWeight: '700' },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  typeBtn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray.border,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: Colors.primary.blue + '15',
    borderColor: Colors.primary.blue,
  },
  typeText: { fontSize: 13, color: Colors.dark, fontWeight: '500' },
  typeTextActive: { color: Colors.primary.blue, fontWeight: '700' },
  modalContainer: { flex: 1, backgroundColor: Colors.white },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Colors.gray.border,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray.light,
    borderRadius: 10,
    margin: 16,
    paddingHorizontal: 12,
  },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 44, fontSize: 15, color: Colors.dark },
  bankItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Colors.gray.light,
  },
  bankItemActive: { backgroundColor: Colors.primary.blue + '10' },
  bankText: { fontSize: 15, color: Colors.dark },
  bankTextActive: { color: Colors.primary.blue, fontWeight: '600' },
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
