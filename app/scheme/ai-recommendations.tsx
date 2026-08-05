import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Modal,
  Switch,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  MapPin,
  Search,
  X,
  Check,
  Calendar,
  User,
  Banknote,
  Briefcase,
  GraduationCap,
  Shield,
  Building2,
} from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { checkAIEligibility } from '@/lib/api';
import { evaluateProfileLocally } from '@/lib/aiEngine';
import { INDIAN_STATES, STATE_DISTRICTS, getDistrictsForState } from '@/constants/states';

interface OptionItem {
  label: string;
  value: string;
  sublabel?: string;
}

const SafeIcon = ({
  icon: IconComp,
  size = 16,
  color = Colors.primary.blue,
}: {
  icon: any;
  size?: number;
  color?: string;
}) => {
  if (typeof IconComp === 'function') {
    return <IconComp size={size} color={color} />;
  }
  return <MapPin size={size} color={color} />;
};

export default function AIRecommendationsScreen() {
  const user = useAuthStore((state) => state.user);

  const userAge = user?.dateOfBirth && !isNaN(new Date(user.dateOfBirth).getTime())
    ? String(new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear())
    : '';

  const userIncome = user?.income?.annual
    ? String(user.income.annual)
    : (typeof user?.income === 'number' || typeof user?.income === 'string' ? String(user.income) : '');

  // 10 Attribute Form State initialized from current logged-in user profile
  const [age, setAge] = useState(userAge || '25');
  const [gender, setGender] = useState(user?.gender || 'Male');
  const [income, setIncome] = useState(userIncome || '150000');
  const [occupation, setOccupation] = useState((user as any)?.occupation || 'Salaried');
  const [stateName, setStateName] = useState(user?.address?.state || 'Delhi');
  const [district, setDistrict] = useState(user?.address?.city || 'New Delhi');
  const [category, setCategory] = useState(user?.income?.category || (user as any)?.category || 'General');
  const [disability, setDisability] = useState(Boolean((user as any)?.disability));
  const [education, setEducation] = useState((user as any)?.education || 'Graduate');
  const [farmerStatus, setFarmerStatus] = useState((user as any)?.farmerStatus ?? false);

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<any | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeHelpField, setActiveHelpField] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      const calculatedAge = user.dateOfBirth && !isNaN(new Date(user.dateOfBirth).getTime())
        ? String(new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear())
        : '';
      const calculatedIncome = user.income?.annual
        ? String(user.income.annual)
        : (typeof user.income === 'number' || typeof user.income === 'string' ? String(user.income) : '');

      setAge(calculatedAge || '25');
      setGender(user.gender || 'Male');
      setIncome(calculatedIncome || '150000');
      setOccupation((user as any).occupation || 'Salaried');
      setStateName(user.address?.state || 'Delhi');
      setDistrict(user.address?.city || 'New Delhi');
      setCategory(user.income?.category || (user as any).category || 'General');
      setDisability(Boolean((user as any).disability));
      setEducation((user as any).education || 'Graduate');
      setFarmerStatus((user as any).farmerStatus ?? false);
      setResults(null);
    } else {
      setAge('25');
      setGender('Male');
      setIncome('150000');
      setOccupation('Salaried');
      setStateName('Delhi');
      setDistrict('New Delhi');
      setCategory('General');
      setDisability(false);
      setEducation('Graduate');
      setFarmerStatus(false);
      setResults(null);
    }
  }, [user?.id, user?.email]);

  // Column Dropdown Modal State
  const [activePicker, setActivePicker] = useState<{
    title: string;
    fieldKey: string;
    options: OptionItem[];
    currentValue: string;
    onSelect: (val: string) => void;
    hasCustomInput?: boolean;
    hasSearch?: boolean;
  } | null>(null);

  const [customInputValue, setCustomInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const openDistrictPicker = (targetState: string, currentDist: string) => {
    setSearchQuery('');
    const dists = getDistrictsForState(targetState);
    const opts: OptionItem[] = dists.map((d) => ({
      label: d,
      value: d,
      sublabel: `${targetState} District`,
    }));
    setActivePicker({
      title: `Select District (${targetState})`,
      fieldKey: 'District',
      options: opts,
      currentValue: currentDist,
      hasCustomInput: false,
      hasSearch: true,
      onSelect: (val) => {
        setDistrict(val);
        setActiveHelpField('District');
      },
    });
  };

  const handleSelectState = (s: string) => {
    setStateName(s);
    setActiveHelpField('State Domicile');
    setSearchQuery('');
    const available = getDistrictsForState(s);
    const defaultDist = available && available.length > 0 ? available[0] : '';
    setDistrict(defaultDist);

    // Smoothly transition activePicker directly to District picker for the selected state
    openDistrictPicker(s, defaultDist);
  };

  useEffect(() => {
    runEligibilityCheck();
  }, [age, gender, income, occupation, stateName, district, category, disability, education, farmerStatus]);

  const runEligibilityCheck = async () => {
    setLoading(true);
    const profile = {
      age: parseInt(age) || 25,
      gender,
      income: parseFloat(income) || 250000,
      occupation,
      state: stateName,
      district,
      category,
      disability,
      education,
      farmer_status: farmerStatus,
    };

    try {
      const data = await checkAIEligibility(profile);
      if (data && (data.eligible_schemes || data.matching_schemes)) {
        setResults(data);
      } else {
        setResults(evaluateProfileLocally(profile));
      }
    } catch (err) {
      console.warn('AI eligibility check warning:', err);
      setResults(evaluateProfileLocally(profile));
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // Pre-defined Column Options
  const AGE_OPTIONS: OptionItem[] = [
    { label: '18 Years', value: '18', sublabel: 'Youth & Higher Education Grants' },
    { label: '21 Years', value: '21', sublabel: 'Skill Training & Employment' },
    { label: '25 Years', value: '25', sublabel: 'General Welfare & Business Credit' },
    { label: '30 Years', value: '30', sublabel: 'Self-Employment & Startup Grants' },
    { label: '45 Years', value: '45', sublabel: 'Women Empowerment & Housing' },
    { label: '60 Years', value: '60', sublabel: 'Senior Citizen Old Age Pensions' },
    { label: '70 Years', value: '70', sublabel: 'Ayushman Bharat Senior Expansion' },
  ];

  const GENDER_OPTIONS: OptionItem[] = [
    { label: 'Male', value: 'Male', sublabel: 'General Welfare Schemes' },
    { label: 'Female', value: 'Female', sublabel: 'Women Reserved Welfare & Subsidies' },
    { label: 'Transgender / Other', value: 'Other', sublabel: 'Transgender Security Grants' },
    { label: 'All / Any Gender', value: 'All', sublabel: 'Universal Central Schemes' },
  ];

  const INCOME_OPTIONS: OptionItem[] = [
    { label: 'Below ₹1.5 Lakh', value: '150000', sublabel: 'BPL / Antyodaya Category' },
    { label: '₹2.5 Lakh', value: '250000', sublabel: 'EWS Threshold & NSP Fee Exemption' },
    { label: '₹4.5 Lakh', value: '450000', sublabel: 'Middle Income Class Subsidies' },
    { label: '₹6.0 Lakh', value: '600000', sublabel: 'PM Awas Housing Limit' },
    { label: '₹8.0 Lakh', value: '800000', sublabel: 'OBC Non-Creamy Layer Cutoff' },
    { label: 'Above ₹12.0 Lakh', value: '1200000', sublabel: 'General Sector Subsidies' },
  ];

  const OCCUPATION_OPTIONS: OptionItem[] = [
    { label: 'Farmer / Agriculture', value: 'Farmer', sublabel: 'PM-Kisan, Rythu Bharosa, Solar Pumps' },
    { label: 'Artisan / Craftsperson', value: 'Artisan', sublabel: 'PM Vishwakarma Toolkit Grant' },
    { label: 'Student / Scholar', value: 'Student', sublabel: 'NSP Scholarships & Vidyalaxmi Loan' },
    { label: 'Unemployed Youth', value: 'Unemployed', sublabel: 'Skill India & Self-Employment' },
    { label: 'Self-Employed / Business', value: 'Self-Employed', sublabel: 'MUDRA & PMEGP Business Credit' },
    { label: 'Salaried / Private Employee', value: 'Salaried', sublabel: 'Housing & Tax Relief' },
    { label: 'Daily Wage / Construction', value: 'Daily Wage', sublabel: 'e-Shram Labour Board' },
  ];

  const CATEGORY_OPTIONS: OptionItem[] = [
    { label: 'General', value: 'General', sublabel: 'Open Category Merit Schemes' },
    { label: 'OBC', value: 'OBC', sublabel: 'Other Backward Classes Quotas' },
    { label: 'SC', value: 'SC', sublabel: 'Scheduled Caste Development Grants' },
    { label: 'ST', value: 'ST', sublabel: 'Scheduled Tribe Welfare Schemes' },
    { label: 'EWS', value: 'EWS', sublabel: 'Economically Weaker Section 10% Quota' },
  ];

  const EDUCATION_OPTIONS: OptionItem[] = [
    { label: 'Primary School (Class 1-8)', value: 'Primary', sublabel: 'PM POSHAN & School Uniforms' },
    { label: 'Secondary (Class 9-10)', value: 'Secondary', sublabel: 'Pre-Matric Scholarship Grants' },
    { label: 'Higher Secondary (11-12)', value: 'Higher Sec', sublabel: 'Post-Matric Scholarship & Free Laptop' },
    { label: 'Graduate (Bachelor Degree)', value: 'Graduate', sublabel: 'Higher Education & UPSC Coaching' },
    { label: 'Post-Graduate / PhD', value: 'Post-Grad', sublabel: 'Overseas Research Fellowships' },
  ];

  // Render State-Domicile Styled Selector Column Box
  const renderStateStyledColumn = (
    label: string,
    displayVal: string,
    IconComponent: any,
    onPressColumn: () => void,
    fieldHelpKey: string
  ) => (
    <View style={styles.formCol}>
      <TouchableOpacity style={styles.labelRow} onPress={() => setActiveHelpField(fieldHelpKey)}>
        <Text style={styles.label}>{label} <Text style={{ color: '#EF4444' }}>*</Text></Text>
        <Text style={styles.infoIconText}>ℹ</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.stateDropdownSelectBox}
        onPress={onPressColumn}
        activeOpacity={0.8}
      >
        <View style={styles.dropdownLeftRow}>
          <SafeIcon icon={IconComponent} size={16} color={Colors.primary.blue} />
          <Text style={styles.stateDropdownText} numberOfLines={1}>
            {displayVal}
          </Text>
        </View>
        <SafeIcon icon={ChevronDown} size={16} color={Colors.gray.icon} />
      </TouchableOpacity>
    </View>
  );

  const renderSchemeTierCard = (item: any, tierType: 'eligible' | 'nearly' | 'not') => {
    const isExpanded = expandedId === item.id;
    const badgeBg = tierType === 'eligible' ? '#DCFCE7' : tierType === 'nearly' ? '#FEF3C7' : '#FEE2E2';
    const badgeText = tierType === 'eligible' ? '#15803D' : tierType === 'nearly' ? '#B45309' : '#B91C1C';
    const borderCol = tierType === 'eligible' ? '#86EFAC' : tierType === 'nearly' ? '#FDE68A' : '#FCA5A5';
    const TierIcon = tierType === 'eligible' ? CheckCircle2 : tierType === 'nearly' ? AlertCircle : XCircle;

    return (
      <View key={item.id} style={[styles.schemeCard, { borderColor: borderCol }]}>
        <TouchableOpacity style={styles.cardHeader} onPress={() => toggleExpand(item.id)} activeOpacity={0.8}>
          <View style={styles.titleBox}>
            <Text style={styles.schemeName}>{item.name}</Text>
            <Text style={styles.categoryText}>{item.category} • {item.state || 'Central'}</Text>
          </View>

          <View style={[styles.tierBadge, { backgroundColor: badgeBg }]}>
            <SafeIcon icon={TierIcon} size={14} color={badgeText} />
            <Text style={[styles.tierBadgeText, { color: badgeText }]}>
              {tierType === 'eligible' ? '100% Eligible' : tierType === 'nearly' ? 'Nearly Eligible' : 'Not Eligible'}
            </Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

        <TouchableOpacity style={styles.expandToggle} onPress={() => toggleExpand(item.id)}>
          <Text style={styles.expandToggleText}>
            {isExpanded ? 'Hide Eligibility Rule Analysis' : 'View AI Criteria Match Analysis'}
          </Text>
          <SafeIcon icon={isExpanded ? ChevronUp : ChevronDown} size={16} color={Colors.primary.blue} />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.analysisBox}>
            <Text style={styles.analysisHeader}>AI Criteria Verification Breakdown:</Text>
            {item.matched_reasons?.map((m: string, idx: number) => (
              <View key={`m-${idx}`} style={styles.reasonRow}>
                <SafeIcon icon={CheckCircle2} size={13} color="#10B981" />
                <Text style={styles.matchReasonText}>{m}</Text>
              </View>
            ))}
            {item.mismatch_reasons?.map((mm: string, idx: number) => (
              <View key={`mm-${idx}`} style={styles.reasonRow}>
                <SafeIcon icon={XCircle} size={13} color="#EF4444" />
                <Text style={styles.mismatchReasonText}>{mm}</Text>
              </View>
            ))}

            <View style={styles.geminiBox}>
              <View style={styles.geminiHeader}>
                <SafeIcon icon={Sparkles} size={14} color={Colors.primary.blue} />
                <Text style={styles.geminiTitle}>Gemini AI Explanation</Text>
              </View>
              <Text style={styles.geminiText}>
                {item.ai_explanation || (
                  tierType === 'eligible'
                    ? `Eligible because your annual family income (₹${(isNaN(parseInt(income)) ? 250000 : parseInt(income)).toLocaleString('en-IN')}) is under the maximum threshold and your residence state (${stateName}) satisfies domicile requirements.`
                    : tierType === 'nearly'
                    ? `Nearly eligible. Income meets threshold but additional category certificates or state residency verification are required to qualify.`
                    : `Not eligible due to state domicile mismatch (${stateName} vs ${item.state || 'Central'}) or income threshold exceeding scheme limits.`
                )}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.applyBtn, tierType === 'not' && { backgroundColor: '#64748B' }]}
              onPress={() => router.push(`/scheme/${item.id}`)}
            >
              <Text style={styles.applyBtnText}>
                {tierType === 'eligible' ? 'View Scheme Details & Apply' : tierType === 'nearly' ? 'View Required Changes & Apply' : 'View Scheme Details'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="AI Eligibility Engine" showBack onBackPress={() => router.back()} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Header Banner */}
        <LinearGradient colors={['#2563EB', '#1D4ED8']} style={styles.heroCard}>
          <View style={styles.sparkleIcon}>
            <SafeIcon icon={Sparkles} size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.heroTitle}>Multi-Attribute AI Scheme Matcher</Text>
          <Text style={styles.heroSubtitle}>
            Tap any criteria column below to select options exactly like State Domicile.
          </Text>
        </LinearGradient>

        {/* 10 Attribute Form Panel */}
        <View style={styles.formPanel}>
          <Text style={styles.formPanelTitle}>Select Criteria Columns (Tap ℹ for Requirements)</Text>

          {activeHelpField && (
            <View style={styles.helpGuideBox}>
              <View style={styles.helpHeaderRow}>
                <Text style={styles.helpTitle}>Requirement Info for {activeHelpField}:</Text>
                <TouchableOpacity onPress={() => setActiveHelpField(null)}>
                  <Text style={styles.helpCloseText}>✕</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.helpBodyText}>
                {activeHelpField === 'Age' && 'Age Requirement: 18-60 years for general welfare/loan schemes. Special ranges apply for senior citizen cards (70+) or child savings (<10).'}
                {activeHelpField === 'Gender' && 'Gender Requirement: Select Male, Female, or All. Specific central/state schemes are reserved exclusively for female applicants.'}
                {activeHelpField === 'Income' && 'Income Threshold: Enter annual household income in ₹. Maximum eligibility limits range from ₹2.5 Lakh (EWS/BPL) to ₹6 Lakh (PM Awas).'}
                {activeHelpField === 'Occupation' && 'Occupation Requirement: Specify Farmer, Artisan, Student, Salaried, Unemployed, or Micro-Enterprise to match targeted credit & toolkits.'}
                {activeHelpField === 'State Domicile' && 'State Domicile Requirement: State of permanent residence. Central schemes apply nationwide; state schemes require local state domicile.'}
                {activeHelpField === 'District' && 'District Requirement: Your native home district. Used to verify localized municipal welfare and regional direct benefit transfer.'}
                {activeHelpField === 'Social Category' && 'Social Category: Specify General, OBC, SC, ST, or EWS. Quotas and fee concessions apply for reserved social categories.'}
                {activeHelpField === 'Education' && 'Education Level: Select Primary, Secondary, Higher Secondary, Graduate, or Post-Graduate for NSP educational scholarship eligibility.'}
                {activeHelpField === 'Farmer Status' && 'Farmer Requirement: Toggle ON if holding registered agricultural land to qualify for PM-Kisan 23rd Installment & Rythu Bandhu.'}
                {activeHelpField === 'Disability Status' && 'Disability Requirement: Toggle ON if holding an official PwD certificate for national disability pension and assistive grants.'}
              </Text>
            </View>
          )}

          {/* Row 1: Age & Gender */}
          <View style={styles.formRow}>
            {renderStateStyledColumn(
              'Age (Years)',
              `${age} Years`,
              Calendar,
              () => {
                setActivePicker({
                  title: 'Select Age (Years)',
                  fieldKey: 'Age',
                  options: AGE_OPTIONS,
                  currentValue: age,
                  hasCustomInput: true,
                  onSelect: (val) => setAge(val),
                });
              },
              'Age'
            )}

            {renderStateStyledColumn(
              'Gender',
              gender,
              User,
              () => {
                setActivePicker({
                  title: 'Select Gender',
                  fieldKey: 'Gender',
                  options: GENDER_OPTIONS,
                  currentValue: gender,
                  onSelect: (val) => setGender(val),
                });
              },
              'Gender'
            )}
          </View>

          {/* Row 2: Annual Income & Occupation */}
          <View style={styles.formRow}>
            {renderStateStyledColumn(
              'Annual Income (₹)',
              `₹${(isNaN(parseInt(income)) ? 250000 : parseInt(income)).toLocaleString('en-IN')}`,
              Banknote,
              () => {
                setActivePicker({
                  title: 'Select Annual Household Income',
                  fieldKey: 'Income',
                  options: INCOME_OPTIONS,
                  currentValue: income,
                  hasCustomInput: true,
                  onSelect: (val) => setIncome(val),
                });
              },
              'Income'
            )}

            {renderStateStyledColumn(
              'Occupation',
              occupation,
              Briefcase,
              () => {
                setActivePicker({
                  title: 'Select Occupation',
                  fieldKey: 'Occupation',
                  options: OCCUPATION_OPTIONS,
                  currentValue: occupation,
                  onSelect: (val) => setOccupation(val),
                });
              },
              'Occupation'
            )}
          </View>

          {/* Row 3: State Domicile & District */}
          <View style={styles.formRow}>
            {renderStateStyledColumn(
              'State Domicile',
              stateName,
              MapPin,
              () => {
                const opts: OptionItem[] = INDIAN_STATES.map((s) => {
                  const count = s === 'All India (Central)' ? 0 : (getDistrictsForState(s) || []).length;
                  return {
                    label: s,
                    value: s,
                    sublabel: count > 0 ? `${count} Districts` : 'Central Domicile',
                  };
                });
                setActivePicker({
                  title: 'Select State Domicile',
                  fieldKey: 'State Domicile',
                  options: opts,
                  currentValue: stateName,
                  hasSearch: true,
                  onSelect: (val) => handleSelectState(val),
                });
              },
              'State Domicile'
            )}

            {renderStateStyledColumn(
              'District',
              district,
              Building2,
              () => {
                openDistrictPicker(stateName, district);
              },
              'District'
            )}
          </View>

          {/* Row 4: Social Category & Education */}
          <View style={styles.formRow}>
            {renderStateStyledColumn(
              'Social Category',
              category,
              Shield,
              () => {
                setActivePicker({
                  title: 'Select Social Category',
                  fieldKey: 'Social Category',
                  options: CATEGORY_OPTIONS,
                  currentValue: category,
                  onSelect: (val) => setCategory(val),
                });
              },
              'Social Category'
            )}

            {renderStateStyledColumn(
              'Education',
              education,
              GraduationCap,
              () => {
                setActivePicker({
                  title: 'Select Education Level',
                  fieldKey: 'Education',
                  options: EDUCATION_OPTIONS,
                  currentValue: education,
                  onSelect: (val) => setEducation(val),
                });
              },
              'Education'
            )}
          </View>

          {/* Toggles */}
          <TouchableOpacity style={styles.switchRow} onPress={() => setFarmerStatus(!farmerStatus)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Registered Landholding Farmer ℹ</Text>
              <Text style={styles.switchSublabel}>Qualifies for PM-Kisan 23rd Installment & Rythu Bandhu</Text>
            </View>
            <Switch value={farmerStatus} onValueChange={setFarmerStatus} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.switchRow} onPress={() => setDisability(!disability)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.switchLabel}>Disability Status (PwD) ℹ</Text>
              <Text style={styles.switchSublabel}>Official 40%+ Disability Certificate for PwD Pensions</Text>
            </View>
            <Switch value={disability} onValueChange={setDisability} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.evalBtn} onPress={runEligibilityCheck} disabled={loading}>
            {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.evalBtnText}>Evaluate AI Eligibility</Text>}
          </TouchableOpacity>
        </View>

        {/* 3 Tier Results */}
        {results && (
          <View style={styles.resultsContainer}>
            <Text style={[styles.tierHeader, { color: '#059669' }]}>
              Eligible Schemes ({results.eligible_schemes?.length || 0})
            </Text>
            {results.eligible_schemes?.map((s: any) => renderSchemeTierCard(s, 'eligible'))}

            <Text style={[styles.tierHeader, { color: '#D97706', marginTop: 16 }]}>
              Nearly Eligible Schemes ({results.nearly_eligible_schemes?.length || 0})
            </Text>
            {results.nearly_eligible_schemes?.map((s: any) => renderSchemeTierCard(s, 'nearly'))}

            <Text style={[styles.tierHeader, { color: '#DC2626', marginTop: 16 }]}>
              Not Eligible Schemes ({results.not_eligible_schemes?.length || 0})
            </Text>
            {results.not_eligible_schemes?.map((s: any) => renderSchemeTierCard(s, 'not'))}
          </View>
        )}
      </ScrollView>

      {/* Interactive Dropdown Picker Modal for All Columns */}
      <Modal
        visible={activePicker !== null}
        animationType="slide"
        transparent={true}
        onRequestClose={() => { setActivePicker(null); setSearchQuery(''); }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{activePicker?.title}</Text>
              <TouchableOpacity onPress={() => { setActivePicker(null); setSearchQuery(''); }} style={styles.modalCloseBtn}>
                <SafeIcon icon={X} size={20} color={Colors.gray.text} />
              </TouchableOpacity>
            </View>

            {activePicker?.hasSearch && (
              <View style={styles.modalSearchBox}>
                <SafeIcon icon={Search} size={18} color={Colors.gray.icon} />
                <TextInput
                  style={styles.modalSearchInput}
                  placeholder={`Search ${activePicker.fieldKey}...`}
                  placeholderTextColor={Colors.gray.icon}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            )}

            {activePicker?.hasCustomInput && (
              <View style={styles.customInputRow}>
                <TextInput
                  style={styles.customInputField}
                  placeholder={`Or enter custom ${activePicker.fieldKey}...`}
                  placeholderTextColor={Colors.gray.icon}
                  keyboardType="numeric"
                  value={customInputValue}
                  onChangeText={setCustomInputValue}
                />
                <TouchableOpacity
                  style={styles.customInputApplyBtn}
                  onPress={() => {
                    if (customInputValue.trim()) {
                      activePicker.onSelect(customInputValue.trim());
                      setActivePicker(null);
                      setCustomInputValue('');
                      setSearchQuery('');
                    }
                  }}
                >
                  <Text style={styles.customInputApplyText}>Set</Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView style={styles.stateList} showsVerticalScrollIndicator={false}>
              {(() => {
                const filtered = (activePicker?.options || []).filter((opt) =>
                  activePicker?.hasSearch && searchQuery
                    ? opt.label.toLowerCase().includes(searchQuery.toLowerCase())
                    : true
                );

                if (filtered.length === 0) {
                  return (
                    <View style={{ padding: 24, alignItems: 'center' }}>
                      <Text style={{ fontSize: 14, color: Colors.gray.text, textAlign: 'center' }}>
                        No options found matching "{searchQuery}"
                      </Text>
                    </View>
                  );
                }

                return filtered.map((opt) => {
                  const isSelected = activePicker?.currentValue === opt.value;
                  const isStatePicker = activePicker?.fieldKey === 'State Domicile';

                  return (
                    <TouchableOpacity
                      key={opt.value}
                      style={[styles.pickerOptionCard, isSelected && styles.pickerOptionCardActive]}
                      onPress={() => {
                        const onSel = activePicker?.onSelect;
                        if (onSel) {
                          onSel(opt.value);
                        }
                        if (!isStatePicker) {
                          setActivePicker(null);
                          setSearchQuery('');
                        }
                      }}
                      activeOpacity={0.75}
                    >
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.pickerOptionLabel, isSelected && styles.pickerOptionLabelActive]}>
                          {opt.label}
                        </Text>
                        {opt.sublabel ? (
                          <Text style={styles.pickerOptionSublabel}>{opt.sublabel}</Text>
                        ) : null}
                      </View>
                      {isSelected && <SafeIcon icon={CheckCircle2} size={18} color={Colors.primary.blue} />}
                    </TouchableOpacity>
                  );
                });
              })()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: 16 },
  heroCard: { borderRadius: 16, padding: 18, marginBottom: 16 },
  sparkleIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  heroTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: '700', marginBottom: 4 },
  heroSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 12, lineHeight: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 12, fontWeight: '700', color: '#1E293B' },
  infoIconText: { fontSize: 12, color: '#2563EB', fontWeight: '700' },
  formPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  formPanelTitle: { fontSize: 14, fontWeight: '700', color: '#0F172A', marginBottom: 14 },
  formRow: { flexDirection: 'row', gap: 12, marginBottom: 14 },
  formCol: { flex: 1 },

  // State Domicile Styled Dropdown Select Box (Identical for ALL Columns)
  stateDropdownSelectBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownLeftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  stateDropdownText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
  },

  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  switchLabel: { fontSize: 13, fontWeight: '700', color: '#1E293B' },
  switchSublabel: { fontSize: 11, color: '#64748B', marginTop: 2 },

  evalBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 12,
  },
  evalBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },

  helpGuideBox: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  helpHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  helpTitle: { fontSize: 13, fontWeight: '700', color: '#1E40AF' },
  helpCloseText: { fontSize: 14, color: '#1E40AF', fontWeight: '700' },
  helpBodyText: { fontSize: 13, color: '#334155', lineHeight: 18 },

  resultsContainer: { marginTop: 8 },
  tierHeader: { fontSize: 16, fontWeight: '700', marginBottom: 10 },
  schemeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  titleBox: { flex: 1, marginRight: 8 },
  schemeName: { fontSize: 15, fontWeight: '700', color: '#0F172A', marginBottom: 2 },
  categoryText: { fontSize: 12, color: '#64748B' },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  tierBadgeText: { fontSize: 11, fontWeight: '700' },
  description: { fontSize: 13, color: '#334155', lineHeight: 18, marginBottom: 10 },
  expandToggle: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  expandToggleText: { fontSize: 12, fontWeight: '700', color: '#2563EB' },
  analysisBox: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#E2E8F0' },
  analysisHeader: { fontSize: 12, fontWeight: '700', color: '#334155', marginBottom: 6 },
  reasonRow: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  matchReasonText: { fontSize: 12, color: '#059669', flex: 1 },
  mismatchReasonText: { fontSize: 12, color: '#DC2626', flex: 1 },
  geminiBox: { backgroundColor: '#F0F9FF', borderColor: '#BAE6FD', borderWidth: 1, borderRadius: 10, padding: 10, marginVertical: 10 },
  geminiHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  geminiTitle: { fontSize: 12, fontWeight: '700', color: '#0369A1' },
  geminiText: { fontSize: 12, color: '#0C4A6E', lineHeight: 16 },
  applyBtn: { backgroundColor: '#2563EB', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 6 },
  applyBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },

  /* Modal Picker */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#0F172A' },
  modalCloseBtn: { padding: 4 },
  modalSearchBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#F1F5F9', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  modalSearchInput: { flex: 1, fontSize: 14, color: '#0F172A' },
  stateList: { marginTop: 4 },

  pickerOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
  },
  pickerOptionCardActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
  },
  pickerOptionLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B' },
  pickerOptionLabelActive: { color: '#1E3DA8' },
  pickerOptionSublabel: { fontSize: 12, color: '#64748B', marginTop: 2 },

  customInputRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  customInputField: { flex: 1, backgroundColor: '#F1F5F9', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 13, color: '#0F172A' },
  customInputApplyBtn: { backgroundColor: '#2563EB', borderRadius: 10, paddingHorizontal: 16, justifyContent: 'center' },
  customInputApplyText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
});
