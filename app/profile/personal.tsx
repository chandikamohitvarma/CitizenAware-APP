import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header, DatePickerInput } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { updateUserProfile } from '@/lib/api';

import { Alert } from 'react-native';

export default function PersonalInformationScreen() {
  const { user, token, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dob, setDob] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState(user?.gender || '');

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !phone.trim() || !dob.trim() || !gender.trim()) {
      Alert.alert('Required Fields Missing', 'Please fill in all mandatory profile fields (* Full Name, Email, Phone, DOB, and Gender) to save.');
      return;
    }

    // Update local store immediately
    updateProfile({ name, email, phone, dateOfBirth: dob, gender });

    // Also persist to backend if token is available
    if (token) {
      try {
        await updateUserProfile(token, {
          name,
          phone,
          date_of_birth: dob,
          gender,
        });
      } catch {
        // Backend offline is OK — local store still updated
      }
    }

    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Personal Information" showBack onBackPress={() => router.back()} />
      <ScrollView style={styles.content}>
        <AppInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          placeholder="Enter your full name"
          required
        />
        <AppInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
          required
        />
        <AppInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter 10-digit phone number"
          keyboardType="phone-pad"
          required
        />
        <DatePickerInput
          label="Date of Birth"
          value={dob}
          onChange={setDob}
          placeholder="DD/MM/YYYY"
          required
        />
        <Text style={styles.label}>
          Gender <Text style={{ color: '#EF4444', fontWeight: '800' }}>*</Text>
        </Text>
        <View style={styles.genderRow}>
          {['Male', 'Female', 'Other'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
              onPress={() => setGender(g)}
            >
              <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <AppButton title="Save Changes" onPress={handleSave} fullWidth />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: 16 },
  label: { fontSize: 14, fontWeight: '500', color: Colors.dark, marginBottom: 8 },
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  genderBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray.border,
    alignItems: 'center',
  },
  genderBtnActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  genderText: { fontWeight: '500', color: Colors.dark },
  genderTextActive: { color: Colors.white },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white },
});
