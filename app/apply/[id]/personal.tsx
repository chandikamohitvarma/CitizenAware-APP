import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header, ProgressStepper } from '@/components/ui';

export default function PersonalDetailsScreen() {
  const { id } = useLocalSearchParams();
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const handleNext = () => {
    if (!name || !dob || !gender || !phone) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    router.push(`/apply/${id}/address`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Personal Details" showBack onBackPress={() => router.back()} />
      <ProgressStepper currentStep={1} />

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Personal Information</Text>
        <AppInput label="Full Name" placeholder="Enter your full name" value={name} onChangeText={setName} required />
        <AppInput label="Date of Birth" placeholder="DD/MM/YYYY" value={dob} onChangeText={setDob} required />
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
        <AppInput label="Phone Number" placeholder="+91 XXXXX XXXXX" value={phone} onChangeText={setPhone} keyboardType="phone-pad" required />
        <AppInput label="Email Address" placeholder="your@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" />
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.stepsInfo}>
          <Text style={styles.stepCurrent}>Step 1 of 6</Text>
          <Text style={styles.stepLabel}>Personal Details</Text>
        </View>
        <AppButton title="Continue" onPress={handleNext} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: Colors.dark, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.dark, marginBottom: 8 },
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  genderBtn: { flex: 1, padding: 14, backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.gray.border, alignItems: 'center' },
  genderBtnActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  genderText: { fontWeight: '500', color: Colors.dark },
  genderTextActive: { color: Colors.white },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white, borderTopWidth: 1, borderTopColor: Colors.gray.border },
  stepsInfo: { marginBottom: 12 },
  stepCurrent: { fontSize: 13, color: Colors.primary.blue, fontWeight: '600' },
  stepLabel: { fontSize: 16, color: Colors.dark, fontWeight: '600' },
});
