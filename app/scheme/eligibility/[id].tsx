import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { MapPin, Search, ChevronDown, Check, ShieldCheck, CircleCheck as CheckCircle2, CircleX as XCircle, AlertTriangle } from 'lucide-react-native';

import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header } from '@/components/ui';
import { useSchemeStore } from '@/store/schemeStore';
import { schemes as fallbackSchemes } from '@/constants/data';
import { INDIAN_STATES } from '@/constants/states';

export default function EligibilityCheckScreen() {
  const { id } = useLocalSearchParams();
  const user = useAuthStore((state) => state.user);
  const storeSchemes = useSchemeStore((state) => state.schemes);
  const schemesList = storeSchemes && storeSchemes.length > 0 ? storeSchemes : fallbackSchemes;
  const scheme = schemesList.find(s => s.id === id) || schemesList[0];

  const userAge = user?.dateOfBirth && !isNaN(new Date(user.dateOfBirth).getTime())
    ? String(new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear())
    : '25';

  const userIncome = user?.income?.annual
    ? String(user.income.annual)
    : (typeof user?.income === 'number' || typeof user?.income === 'string' ? String(user.income) : '250000');

  const [step, setStep] = useState(1);
  const [state, setState] = useState(user?.address?.state || 'Delhi');
  const [income, setIncome] = useState(userIncome);
  const [age, setAge] = useState(userAge);
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [category, setCategory] = useState(user?.income?.category || (user as any)?.category || 'General');
  const [isStateExpanded, setIsStateExpanded] = useState(false);
  const [searchStateQuery, setSearchStateQuery] = useState('');

  React.useEffect(() => {
    if (user) {
      setState(user.address?.state || 'Delhi');
      setIncome(
        user.income?.annual
          ? String(user.income.annual)
          : (typeof user.income === 'number' || typeof user.income === 'string' ? String(user.income) : '250000')
      );
      setAge(
        user.dateOfBirth && !isNaN(new Date(user.dateOfBirth).getTime())
          ? String(new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear())
          : '25'
      );
      setGender(user.gender || 'Male');
      setCategory(user.income?.category || (user as any)?.category || 'General');
    }
  }, [user?.id, user?.email]);

  const allStates = INDIAN_STATES.filter(s => s !== 'All India (Central)');
  const filteredStates = allStates.filter(s => s.toLowerCase().includes(searchStateQuery.toLowerCase()));

  // Dynamic live criteria matching
  const maxIncomeLimit = (scheme as any).income_limit || 600000;
  const numIncome = parseFloat(income) || 0;
  const isIncomeMatched = numIncome <= maxIncomeLimit;

  const isStateMatched = !scheme.state || scheme.state === 'All India (Central)' || state.toLowerCase() === scheme.state.toLowerCase();

  const numAge = parseInt(age, 10) || 25;
  const minAge = (scheme as any).min_age || 18;
  const maxAge = (scheme as any).max_age || 70;
  const isAgeMatched = numAge >= minAge && numAge <= maxAge;

  const isOverallEligible = isIncomeMatched && isStateMatched && isAgeMatched;

  const handleCheck = () => {
    let eligible = true;
    const reasons: string[] = [];

    // 1. State Domicile check
    if (scheme.state && scheme.state !== 'All India (Central)') {
      if (state.toLowerCase() !== scheme.state.toLowerCase()) {
        eligible = false;
        reasons.push(`State mismatch: Scheme requires domicile in ${scheme.state} (Selected: ${state})`);
      } else {
        reasons.push(`State Domicile verified: Resident of ${state}`);
      }
    } else {
      reasons.push(`Central Scheme: Open for all Indian citizens in ${state}`);
    }

    // 2. Annual Income Limit check
    if (numIncome > maxIncomeLimit) {
      eligible = false;
      reasons.push(`Annual income exceeds scheme maximum threshold (₹${numIncome.toLocaleString('en-IN')}/year exceeds limit of ₹${maxIncomeLimit.toLocaleString('en-IN')}/year)`);
    } else {
      reasons.push(`Income verified: ₹${numIncome.toLocaleString('en-IN')}/year meets limit of ₹${maxIncomeLimit.toLocaleString('en-IN')}/year`);
    }

    // 3. Age Range check
    if (numAge < minAge || numAge > maxAge) {
      eligible = false;
      reasons.push(`Age criterion not met: Requires ${minAge}-${maxAge} years (Submitted: ${numAge} years)`);
    } else {
      reasons.push(`Age verified: ${numAge} years satisfies eligibility range (${minAge}-${maxAge} years)`);
    }

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

        {/* Dynamic Required Scheme Eligibility Criteria Card */}
        <View style={[styles.reqCard, !isOverallEligible && styles.reqCardError]}>
          <View style={styles.reqHeader}>
            <ShieldCheck size={20} color={isOverallEligible ? '#1E40AF' : '#991B1B'} />
            <Text style={[styles.reqTitle, !isOverallEligible && { color: '#991B1B' }]}>
              Required Scheme Eligibility Criteria
            </Text>
          </View>

          <View style={styles.reqList}>
            {/* State Domicile Row */}
            <View style={styles.reqItem}>
              {isStateMatched ? (
                <CheckCircle2 size={16} color="#10B981" />
              ) : (
                <XCircle size={16} color="#EF4444" />
              )}
              <Text style={styles.reqText}>
                <Text style={{ fontWeight: '700' }}>State Domicile: </Text>
                {isStateMatched
                  ? (scheme.state || 'All India (Central)')
                  : `Mismatch (Requires ${scheme.state}, Selected ${state})`
                }
              </Text>
            </View>

            {/* Income Eligibility Row */}
            <View style={styles.reqItem}>
              {isIncomeMatched ? (
                <CheckCircle2 size={16} color="#10B981" />
              ) : (
                <XCircle size={16} color="#EF4444" />
              )}
              <Text style={styles.reqText}>
                <Text style={{ fontWeight: '700' }}>Income Eligibility: </Text>
                {isIncomeMatched
                  ? `Annual family income under ₹${maxIncomeLimit.toLocaleString('en-IN')}/year`
                  : `EXCEEDS LIMIT: ₹${numIncome.toLocaleString('en-IN')}/year (Max allowed: ₹${maxIncomeLimit.toLocaleString('en-IN')}/year)`
                }
              </Text>
            </View>

            {/* Age Range Row */}
            <View style={styles.reqItem}>
              {isAgeMatched ? (
                <CheckCircle2 size={16} color="#10B981" />
              ) : (
                <XCircle size={16} color="#EF4444" />
              )}
              <Text style={styles.reqText}>
                <Text style={{ fontWeight: '700' }}>Age Criteria: </Text>
                {isAgeMatched
                  ? `Required ${minAge}-${maxAge} years (Entered: ${numAge} yrs)`
                  : `OUT OF RANGE: ${numAge} years (Required: ${minAge}-${maxAge} yrs)`
                }
              </Text>
            </View>

            {/* Key Scheme Benefit Row */}
            <View style={styles.reqItem}>
              <CheckCircle2 size={16} color="#10B981" />
              <Text style={styles.reqText}>
                <Text style={{ fontWeight: '700' }}>Key Benefit: </Text>
                {scheme.benefits}
              </Text>
            </View>
          </View>
        </View>

        {/* Live Warning Banner if Ineligible */}
        {!isOverallEligible && (
          <View style={styles.warningBox}>
            <AlertTriangle size={18} color="#991B1B" style={{ marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.warningBoxTitle}>NOT ELIGIBLE FOR THIS SCHEME</Text>
              <Text style={styles.warningBoxText}>
                {!isIncomeMatched
                  ? `Your income of ₹${numIncome.toLocaleString('en-IN')}/year exceeds the maximum allowed threshold of ₹${maxIncomeLimit.toLocaleString('en-IN')}/year.`
                  : !isStateMatched
                  ? `This scheme is restricted to residents of ${scheme.state}.`
                  : `Your age (${numAge} yrs) is outside the eligible range (${minAge}-${maxAge} yrs).`
                }
              </Text>
            </View>
          </View>
        )}

        {step === 1 && (
          <View style={styles.card}>
            <Text style={styles.label}>Select Your State / UT of Residence *</Text>
            <TouchableOpacity style={styles.selectorBtn} onPress={() => setIsStateExpanded(!isStateExpanded)}>
              <View style={styles.selectorLeft}>
                <MapPin size={18} color={Colors.primary.blue} />
                <Text style={styles.selectorText}>{state}</Text>
              </View>
              <ChevronDown size={18} color={Colors.gray.icon} style={{ transform: [{ rotate: isStateExpanded ? '180deg' : '0deg' }] }} />
            </TouchableOpacity>

            {isStateExpanded && (
              <View style={styles.inlineStateBox}>
                <View style={styles.searchBar}>
                  <Search size={18} color={Colors.gray.icon} style={{ marginRight: 8 }} />
                  <TextInput
                    style={{ flex: 1, fontSize: 14 }}
                    placeholder="Search 36 States & UTs..."
                    value={searchStateQuery}
                    onChangeText={setSearchStateQuery}
                  />
                </View>
                <ScrollView style={styles.inlineStateScroll} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                  {filteredStates.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={[styles.stateItem, state === item && styles.stateItemActive]}
                      onPress={() => {
                        setState(item);
                        setIsStateExpanded(false);
                      }}
                    >
                      <Text style={[styles.stateItemText, state === item && styles.stateItemTextActive]}>{item}</Text>
                      {state === item && <Check size={18} color={Colors.primary.blue} />}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <Text style={styles.subtext}>State residence is checked against scheme eligibility rules.</Text>
          </View>
        )}

        {step === 2 && (
          <View style={styles.card}>
            <Text style={styles.label}>What is your annual family income? *</Text>
            <AppInput
              placeholder="2500000"
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
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Annual Income:</Text>
              <Text style={[styles.summaryVal, !isIncomeMatched && { color: '#DC2626', fontWeight: '800' }]}>
                ₹{numIncome.toLocaleString('en-IN')} {!isIncomeMatched && '(Exceeds Limit)'}
              </Text>
            </View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Category:</Text><Text style={styles.summaryVal}>{category}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Age & Gender:</Text><Text style={styles.summaryVal}>{age} yrs, {gender}</Text></View>
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
            title={step === 4 ? 'Evaluate Eligibility' : 'Next'}
            onPress={() => {
              if (step < 4) setStep(step + 1);
              else handleCheck();
            }}
            fullWidth
            style={!isOverallEligible && step === 4 ? { backgroundColor: '#DC2626' } : undefined}
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
  schemeCategory: { fontSize: 13, color: Colors.primary.blue, fontWeight: '600', marginBottom: 12 },
  
  reqCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  reqCardError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  reqHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  reqTitle: { fontSize: 14, fontWeight: '700', color: '#1E40AF' },
  reqList: { gap: 8 },
  reqItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  reqText: { flex: 1, fontSize: 12, color: '#1E3A8A', lineHeight: 17 },

  warningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: '#EF4444',
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
  },
  warningBoxTitle: { fontSize: 13, fontWeight: '800', color: '#991B1B', marginBottom: 2 },
  warningBoxText: { fontSize: 12, color: '#7F1D1D', lineHeight: 16 },

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
  inlineStateBox: {
    marginTop: 10,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray.border,
    padding: 10,
  },
  inlineStateScroll: { maxHeight: 220 },

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
