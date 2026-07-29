import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header, ProgressStepper } from '@/components/ui';

export default function AddressDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const handleNext = () => {
    if (!street || !city || !state || !pincode) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    router.push(`/apply/${id}/bank`);
  };

  const states = ['Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal'];

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Address Details" showBack onBackPress={() => router.back()} />
      <ProgressStepper currentStep={2} />

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Residential Address</Text>
        <AppInput label="Street Address" placeholder="House No, Street, Locality" value={street} onChangeText={setStreet} multiline numberOfLines={2} required />
        <AppInput label="City/Town" placeholder="Enter city" value={city} onChangeText={setCity} required />
        <View style={styles.row}>
          <View style={styles.flex1}>
            <Text style={styles.label}>State *</Text>
            <View style={styles.stateContainer}>
              <Text style={[styles.stateText, !state && styles.placeholder]}>{state || 'Select State'}</Text>
            </View>
          </View>
          <View style={styles.flex1}>
            <AppInput label="Pincode" placeholder="6-digit pincode" value={pincode} onChangeText={setPincode} keyboardType="numeric" maxLength={6} required />
          </View>
        </View>
        <View style={styles.stateList}>
          <Text style={styles.statesTitle}>Quick Select States</Text>
          <View style={styles.statesRow}>
            {states.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.stateChip, state === s && styles.stateChipActive]}
                onPress={() => setState(s)}
              >
                <Text style={[styles.stateChipText, state === s && styles.stateChipTextActive]}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton title="Continue" onPress={handleNext} fullWidth />
      </View>
    </SafeAreaView>
  );
}

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark, marginBottom: 16 },
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.dark, marginBottom: 8 },
  stateContainer: { backgroundColor: Colors.gray.light, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.gray.border },
  stateText: { fontSize: 16, color: Colors.dark },
  placeholder: { color: Colors.gray.icon },
  stateList: { marginTop: 16 },
  statesTitle: { fontSize: 14, fontWeight: '500', color: Colors.gray.text, marginBottom: 12 },
  statesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stateChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: Colors.white, borderRadius: 20, borderWidth: 1, borderColor: Colors.gray.border },
  stateChipActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  stateChipText: { fontSize: 13, color: Colors.dark },
  stateChipTextActive: { color: Colors.white },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white },
});
