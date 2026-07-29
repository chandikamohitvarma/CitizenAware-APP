import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

export default function PersonalInformationScreen() {
  const { user, updateProfile } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [dob, setDob] = useState(user?.dateOfBirth || '');
  const [gender, setGender] = useState(user?.gender || '');

  const handleSave = () => {
    updateProfile({ name, email, phone, dateOfBirth: dob, gender });
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
        />
        <AppInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter email"
          keyboardType="email-address"
        />
        <AppInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter phone"
          keyboardType="phone-pad"
        />
        <AppInput
          label="Date of Birth"
          value={dob}
          onChangeText={setDob}
          placeholder="DD/MM/YYYY"
        />
        <Text style={styles.label}>Gender</Text>
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
  genderBtn: { flex: 1, padding: 14, backgroundColor: Colors.white, borderRadius: 12, borderWidth: 1, borderColor: Colors.gray.border, alignItems: 'center' },
  genderBtnActive: { backgroundColor: Colors.primary.blue, borderColor: Colors.primary.blue },
  genderText: { fontWeight: '500', color: Colors.dark },
  genderTextActive: { color: Colors.white },
  footer: { padding: 16, paddingBottom: 40, backgroundColor: Colors.white },
});
