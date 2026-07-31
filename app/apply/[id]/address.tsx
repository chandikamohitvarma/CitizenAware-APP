import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Search, X, MapPin, Building, ChevronDown, Check } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header, ProgressStepper } from '@/components/ui';
import { INDIAN_STATES } from '@/constants/states';
import { getDistrictsForState } from '@/constants/districts';

export default function AddressDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [street, setStreet] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Modals state
  const [isStateModalOpen, setIsStateModalOpen] = useState(false);
  const [stateSearchQuery, setStateSearchQuery] = useState('');

  const [isDistrictModalOpen, setIsDistrictModalOpen] = useState(false);
  const [districtSearchQuery, setDistrictSearchQuery] = useState('');

  const allStates = INDIAN_STATES.filter(s => s !== 'All India (Central)');
  const filteredStates = allStates.filter(s =>
    s.toLowerCase().includes(stateSearchQuery.toLowerCase())
  );

  const availableDistricts = state ? getDistrictsForState(state) : [];
  const filteredDistricts = availableDistricts.filter(d =>
    d.toLowerCase().includes(districtSearchQuery.toLowerCase())
  );

  const handleStateSelect = (selectedState: string) => {
    setState(selectedState);
    setIsStateModalOpen(false);
    setCity('');
    setDistrictSearchQuery('');
    setTimeout(() => {
      setIsDistrictModalOpen(true);
    }, 250);
  };

  const handleNext = () => {
    if (!street || !state || !city || !pincode) {
      Alert.alert('Error', 'Please fill in all required fields including state and district/city');
      return;
    }
    router.push(`/apply/${id}/income`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Address Details" showBack onBackPress={() => router.canGoBack() ? router.back() : router.push('/(tabs)')} />
      <ProgressStepper currentStep={2} />

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Residential Address</Text>

        <AppInput
          label="Street Address"
          placeholder="House No, Building, Street, Locality"
          value={street}
          onChangeText={setStreet}
          multiline
          numberOfLines={2}
          required
        />

        <Text style={styles.label}>Select State / Union Territory *</Text>
        <TouchableOpacity
          style={styles.selectorBtn}
          onPress={() => setIsStateModalOpen(true)}
        >
          <View style={styles.selectorLeft}>
            <MapPin size={18} color={state ? Colors.primary.blue : Colors.gray.icon} />
            <Text style={[styles.selectorText, !state && styles.placeholder]}>
              {state || 'Choose state in India'}
            </Text>
          </View>
          <ChevronDown size={18} color={Colors.gray.icon} />
        </TouchableOpacity>

        <Text style={styles.label}>Select City / District *</Text>
        <TouchableOpacity
          style={[styles.selectorBtn, !state && styles.selectorBtnDisabled]}
          onPress={() => {
            if (!state) {
              Alert.alert('Select State First', 'Please select your State / Union Territory first to view matching districts.');
              return;
            }
            setIsDistrictModalOpen(true);
          }}
        >
          <View style={styles.selectorLeft}>
            <Building size={18} color={city ? Colors.primary.blue : Colors.gray.icon} />
            <Text style={[styles.selectorText, !city && styles.placeholder]}>
              {city || (state ? `Choose district in ${state}` : 'Select state first')}
            </Text>
          </View>
          <ChevronDown size={18} color={Colors.gray.icon} />
        </TouchableOpacity>

        {/* Quick Select District Chips for chosen state */}
        {state && availableDistricts.length > 0 ? (
          <View style={styles.districtChipsSection}>
            <Text style={styles.chipsTitle}>Popular Districts in {state}:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsRow}>
              {availableDistricts.slice(0, 10).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, city === d && styles.chipActive]}
                  onPress={() => setCity(d)}
                >
                  <Text style={[styles.chipText, city === d && styles.chipTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}

        <AppInput
          label="Pincode"
          placeholder="6-digit postal code"
          value={pincode}
          onChangeText={setPincode}
          keyboardType="numeric"
          maxLength={6}
          required
        />
      </ScrollView>

      {/* State Picker Modal */}
      <Modal visible={isStateModalOpen} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select State / UT in India</Text>
            <TouchableOpacity onPress={() => setIsStateModalOpen(false)}>
              <X size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBarContainer}>
            <Search size={18} color={Colors.gray.icon} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search 36 States & UTs..."
              value={stateSearchQuery}
              onChangeText={setStateSearchQuery}
            />
          </View>

          <FlatList
            data={filteredStates}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.listItem, state === item && styles.listItemActive]}
                onPress={() => handleStateSelect(item)}
              >
                <Text style={[styles.listText, state === item && styles.listTextActive]}>
                  {item}
                </Text>
                {state === item && <Check size={18} color={Colors.primary.blue} />}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      {/* District / City Picker Modal */}
      <Modal visible={isDistrictModalOpen} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select District / City in {state}</Text>
            <TouchableOpacity onPress={() => setIsDistrictModalOpen(false)}>
              <X size={24} color={Colors.dark} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBarContainer}>
            <Search size={18} color={Colors.gray.icon} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder={`Search districts in ${state}...`}
              value={districtSearchQuery}
              onChangeText={setDistrictSearchQuery}
            />
          </View>

          <FlatList
            data={filteredDistricts}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.listItem, city === item && styles.listItemActive]}
                onPress={() => {
                  setCity(item);
                  setIsDistrictModalOpen(false);
                }}
              >
                <Text style={[styles.listText, city === item && styles.listTextActive]}>
                  {item}
                </Text>
                {city === item && <Check size={18} color={Colors.primary.blue} />}
              </TouchableOpacity>
            )}
          />
        </SafeAreaView>
      </Modal>

      <View style={styles.footer}>
        <View style={styles.stepsInfo}>
          <Text style={styles.stepCurrent}>Step 2 of 6</Text>
          <Text style={styles.stepLabel}>Address Details</Text>
        </View>
        <AppButton title="Continue to Income Details" onPress={handleNext} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.dark, marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.dark, marginBottom: 8, marginTop: 4 },
  selectorBtn: {
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
  selectorBtnDisabled: {
    backgroundColor: Colors.gray.light,
    borderColor: Colors.gray.border + '80',
  },
  selectorLeft: { flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 },
  selectorText: { fontSize: 15, color: Colors.dark, fontWeight: '500' },
  placeholder: { color: Colors.gray.icon, fontWeight: '400' },
  districtChipsSection: { marginBottom: 16, marginTop: -4 },
  chipsTitle: { fontSize: 12, fontWeight: '600', color: Colors.gray.text, marginBottom: 8 },
  chipsRow: { flexDirection: 'row', gap: 8, paddingRight: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.gray.border,
  },
  chipActive: {
    backgroundColor: Colors.primary.blue + '15',
    borderColor: Colors.primary.blue,
  },
  chipText: { fontSize: 12, color: Colors.dark, fontWeight: '500' },
  chipTextActive: { color: Colors.primary.blue, fontWeight: '700' },
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
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: Colors.gray.light,
  },
  listItemActive: { backgroundColor: Colors.primary.blue + '10' },
  listText: { fontSize: 16, color: Colors.dark },
  listTextActive: { color: Colors.primary.blue, fontWeight: '600' },
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
