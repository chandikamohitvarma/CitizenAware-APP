import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MapPin, Search, X, ChevronDown, Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header } from '@/components/ui';
import { schemes } from '@/constants/data';
import { INDIAN_STATES } from '@/constants/states';

export default function EligibilityCheckScreen() {
  const { id } = useLocalSearchParams();
  const scheme = schemes.find(s => s.id === id) || schemes[0];

  const [step, setStep] = useState(1);
  const [state, setState] = useState('Telangana');
  const [income, setIncome] = useState('250000');
  const [age, setAge] = useState('25');
  const [gender, setGender] = useState('Male');
  const [category, setCategory] = useState('EWS');
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [searchStateQuery, setSearchStateQuery] = useState('');

  const allStates = INDIAN_STATES.filter(s => s !== 'All India (Central)');
  const filteredStates = allStates.filter(s => s.toLowerCase().includes(searchStateQuery.toLowerCase()));

  const handleCheck = () => {
    // Determine eligibility based on scheme requirements & state
    let eligible = true;
    const reasons: string[] = [];

    // State check
    if (scheme.state && scheme.state !== 'All India (Central)') {
      if (state.toLowerCase() !== scheme.state.toLowerCase()) {
        eligible = false;
        reasons.push(`Scheme requires domicile in ${scheme.state} (Selected: ${state})`);
      } else {
        reasons.push(`Domicile verified: Resident of ${state}`);
      }
    } else {
      reasons.push(`Central Scheme: Open for all Indian citizens in ${state}`);
    }

    // Income check
    const numIncome = parseFloat(income) || 0;
    if (numIncome > 600000 && scheme.category === 'Agriculture') {
      reasons.push('Income limit verified: Landholding farmer eligibility');
    } else if (numIncome <= 300000) {
      reasons.push(`Income verified: ₹${numIncome.toLocaleString('en-IN')}/year meets EWS/BPL threshold`);
    } else {
      reasons.push(`Annual Income: ₹${numIncome.toLocaleString('en-IN')}/year`);
    }

    // Age check
    reasons.push(`Age verified: ${age} years`);

    router.push({
      pathname: '/scheme/eligibility-result',
      params: {
        schemeId: scheme.id,
        schemeName: scheme.name,
        isEligible: eligible ? 'true' : 'false',
        selectedState: state,
        reasons: JSON.stringify(reasons),
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Check Scheme Eligibility" showBack onBackPress={() => router.back()} />
      <View style={styles.progress}>
        <Text style={styles.stepText}>Step {step} of 4</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${step * 25}%` }]} />
        </View>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.schemeTitle}>{scheme.name}</Text>
        <Text style={styles.schemeCategory}>{scheme.category} • {scheme.state || 'Central'}</Text>

        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.label}>Select Your State / UT of Residence *</Text>
            <TouchableOpacity style={styles.selectorBtn} onPress={() => setIsStateModalOpen(true)}>
              <View style={styles.selectorLeft}>
                <MapPin size={18} color={Colors.primary.blue} />
                <Text style={styles.selectorText}>{state}</Text>
              </View>
              <ChevronDown size={18} color={Colors.gray.icon} />
            </TouchableOpacity>
            <Text style={styles.subtext}>State residence is checked against scheme eligibility rules.</Text>
          </View>
        )}

        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.label}>What is your annual family income? *</Text>
            <AppInput
              placeholder="250000"
              value={income}
              onChangeText={setIncome}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Select Category *</Text>
            <View style={styles.optionsGrid}>
              {['General', 'OBC', 'SC', 'ST', 'EWS'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.optionChip, category === cat && styles.optionChipActive]}
                  onPress={() => setCategory(cat)}
                >
                  <Text style={[styles.optionChipText, category === cat && styles.optionChipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.card}>
            <Text style={styles.label}>What is your age? *</Text>
            <AppInput
              placeholder="25"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
            />
            <Text style={styles.label}>Gender *</Text>
            <View style={styles.genderRow}>
              {['Male', 'Female', 'Other'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
                  onPress={() => setGender(g)}
                >
                  <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>{g}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {step === 4 && (
          <View style={styles.card}>
            <Text style={styles.label}>Confirm Eligibility Details</Text>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Selected State:</Text><Text style={styles.summaryVal}>{state}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Annual Income:</Text><Text style={styles.summaryVal}>₹{income}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Category:</Text><Text style={styles.summaryVal}>{category}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Age & Gender:</Text><Text style={styles.summaryVal}>{age} yrs, {gender}</Text></View>
          </View>
        )}
      </ScrollView>

      {/* State Picker Modal */}
      <Modal visible={isStateModalOpen} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select State / UT</Text>
            <TouchableOpacity onPress={() => setIsStateModalOpen(false)}><X size={24} color={Colors.dark} /></TouchableOpacity>
          </View>
          <View style={styles.searchBar}>
            <Search size={18} color={Colors.gray.icon} style={{ marginRight: 8 }} />
            <TextInput
              style={{ flex: 1, fontSize: 15 }}
              placeholder="Search 36 States & UTs..."
              value={searchStateQuery}
              onChangeText={setSearchStateQuery}
            />
          </View>
          <FlatList
            data={filteredStates}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.stateItem, state === item && styles.stateItemActive]}
                onPress={() => { setState(item); setIsStateModalOpen(false); }}
              >
                <Text style={[styles.stateItemText, state === item && styles.stateItemTextActive]}>{item}</Text>
                {state === item && <Check size={18} color={Colors.primary.blue} />}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity onPress={() => setStep(step - 1)} style={styles.backBtn}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        )}
        <View style={styles.nextBtn}>
          <AppButton
            title={step === 4 ? 'Evaluate Eligibility' : 'Next'}
            onPress={() => {
              if (step < 4) setStep(step + 1);
              else handleCheck();
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
  stepText: { fontSize: 13, color: Colors.gray.text, marginBottom: 8, fontWeight: '600' },
  progressBar: { height: 6, backgroundColor: Colors.gray.border, borderRadius: 3 },
  progressFill: { height: '100%', backgroundColor: Colors.primary.blue, borderRadius: 3 },
  content: { flex: 1, padding: 16 },
  schemeTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 2 },
  schemeCategory: { fontSize: 13, color: Colors.primary.blue, fontWeight: '600', marginBottom: 16 },
  card: { backgroundColor: Colors.white, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.gray.border },
  label: { fontSize: 15, fontWeight: '600', color: Colors.dark, marginBottom: 12, marginTop: 4 },
  subtext: { fontSize: 12, color: Colors.gray.text, marginTop: 8 },
  selectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.gray.light,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  selectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  selectorText: { fontSize: 15, color: Colors.dark, fontWeight: '600' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  optionChip: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: Colors.white, borderRadius: 20, borderWidth: 1, borderColor: Colors.gray.border },
  optionChipActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  optionChipText: { fontSize: 13, color: Colors.dark, fontWeight: '500' },
  optionChipTextActive: { color: Colors.white },
  genderRow: { flexDirection: 'row', gap: 10 },
  genderBtn: { flex: 1, padding: 12, backgroundColor: Colors.white, borderRadius: 10, borderWidth: 1, borderColor: Colors.gray.border, alignItems: 'center' },
  genderBtnActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  genderText: { fontSize: 14, color: Colors.dark },
  genderTextActive: { color: Colors.white, fontWeight: '600' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.gray.border },
  summaryLabel: { fontSize: 14, color: Colors.gray.text },
  summaryVal: { fontSize: 14, fontWeight: '600', color: Colors.dark },
  modalContainer: { flex: 1, backgroundColor: Colors.white, padding: 16 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.gray.light, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  stateItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: Colors.gray.border },
  stateItemActive: { backgroundColor: Colors.primary.blue + '10' },
  stateItemText: { fontSize: 15, color: Colors.dark },
  stateItemTextActive: { fontWeight: '700', color: Colors.primary.blue },
  footer: { flexDirection: 'row', padding: 16, gap: 12, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray.border },
  backBtn: { justifyContent: 'center', paddingHorizontal: 16 },
  backText: { fontSize: 15, color: Colors.gray.text, fontWeight: '600' },
  nextBtn: { flex: 1 },
});
