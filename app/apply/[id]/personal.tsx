import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput, Header, ProgressStepper, DatePickerInput, OfficialWebsiteBanner } from '@/components/ui';
import { useApplicationDraftStore } from '@/store/applicationDraftStore';
import { useAuthStore } from '@/store/authStore';

export default function PersonalDetailsScreen() {
  const { id } = useLocalSearchParams();
  const schemeId = String(id);
  const user = useAuthStore((state) => state.user);
  const { getDraft, updateDraft } = useApplicationDraftStore();

  const draft = getDraft(schemeId, {
    name: user?.name,
    phone: user?.phone,
    email: user?.email,
    dateOfBirth: user?.dateOfBirth,
    gender: user?.gender,
  });

  const name = draft.name;
  const dob = draft.dob;
  const gender = draft.gender || 'Male';
  const phone = draft.phone;
  const email = draft.email;

  // Track whether user attempted to submit
  const [touched, setTouched] = useState(false);

  // Initialize draft with user defaults if empty
  useEffect(() => {
    if (user) {
      const updates: Record<string, string> = {};
      if (!draft.name && user.name) updates.name = user.name;
      if (!draft.phone && user.phone) updates.phone = user.phone;
      if (!draft.email && user.email) updates.email = user.email;
      if (!draft.dob && user.dateOfBirth) updates.dob = user.dateOfBirth;
      if (!draft.gender && user.gender) updates.gender = user.gender;
      if (Object.keys(updates).length > 0) {
        updateDraft(schemeId, updates);
      }
    }
  }, [user]);

  // Compute errors inline (reactive — auto-clears when field is filled)
  const nameError = touched && !name ? 'Full name is required' : undefined;
  const dobError = touched && !dob ? 'Date of birth is required' : undefined;
  const phoneError = touched && !phone ? 'Phone number is required' : undefined;
  const genderError = touched && !gender ? 'Please select a gender' : undefined;

  const handleNext = () => {
    setTouched(true);
    if (!name || !dob || !phone || !gender) {
      // Errors will show via nameError/dobError/phoneError above
      return;
    }
    router.push(`/apply/${schemeId}/address`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Personal Details"
        showBack
        onBackPress={() => (router.canGoBack() ? router.back() : router.push('/(tabs)'))}
      />
      <ProgressStepper currentStep={1} />

      <ScrollView style={styles.content}>
        <OfficialWebsiteBanner schemeId={schemeId} />
        <Text style={styles.sectionTitle}>Personal Information</Text>

        {/* Full Name */}
        <AppInput
          label="Full Name"
          placeholder="Enter your full name"
          value={name}
          onChangeText={(val) => updateDraft(schemeId, { name: val })}
          required
          error={nameError}
        />

        {/* Date of Birth */}
        <DatePickerInput
          label="Date of Birth"
          placeholder="DD/MM/YYYY"
          value={dob}
          onChange={(val) => updateDraft(schemeId, { dob: val })}
          required
          error={dobError}
        />

        {/* Gender */}
        <Text style={[styles.label, genderError && styles.labelError]}>Gender *</Text>
        <View style={[styles.genderRow, genderError && styles.genderError]}>
          {['Male', 'Female', 'Other'].map((g) => (
            <TouchableOpacity
              key={g}
              style={[styles.genderBtn, gender === g && styles.genderBtnActive]}
              onPress={() => updateDraft(schemeId, { gender: g })}
            >
              <Text style={[styles.genderText, gender === g && styles.genderTextActive]}>
                {g}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {genderError && <Text style={styles.errorMsg}>{genderError}</Text>}

        {/* Phone Number */}
        <AppInput
          label="Phone Number"
          placeholder="+91 XXXXX XXXXX"
          value={phone}
          onChangeText={(val) => updateDraft(schemeId, { phone: val })}
          keyboardType="phone-pad"
          required
          error={phoneError}
        />

        {/* Email Address */}
        <AppInput
          label="Email Address"
          placeholder="your@email.com"
          value={email}
          onChangeText={(val) => updateDraft(schemeId, { email: val })}
          keyboardType="email-address"
        />
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
  labelError: { color: Colors.error },
  errorMsg: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
    marginBottom: 12,
    marginLeft: 4,
    fontWeight: '500',
  },
  genderRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  genderError: { /* visual indicator handled via genderError text */ },
  genderBtn: {
    flex: 1,
    padding: 14,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray.border,
    alignItems: 'center',
  },
  genderBtnActive: {
    backgroundColor: Colors.primary.blue,
    borderColor: Colors.primary.blue,
  },
  genderText: { fontWeight: '500', color: Colors.dark },
  genderTextActive: { color: Colors.white },
  footer: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.gray.border,
  },
  stepsInfo: { marginBottom: 12 },
  stepCurrent: { fontSize: 13, color: Colors.primary.blue, fontWeight: '600' },
  stepLabel: { fontSize: 16, color: Colors.dark, fontWeight: '600' },
});
