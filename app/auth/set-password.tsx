import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import { Colors } from '@/constants/colors';
import { AppButton, AppInput } from '@/components/ui';
import { supabase } from '@/lib/supabase';

export default function SetPasswordScreen() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const requirements = [
    { id: 1, label: 'At least 6 characters', valid: password.length >= 6 },
    { id: 2, label: 'Contains a number', valid: /\d/.test(password) },
    { id: 3, label: 'Contains uppercase letter', valid: /[A-Z]/.test(password) },
    { id: 4, label: 'Passwords match', valid: password === confirmPassword && password.length > 0 },
  ];

  const allValid = requirements.every(r => r.valid) && password.length > 0;

  const handleSetPassword = async () => {
    if (!allValid) {
      Alert.alert('Error', 'Please meet all password requirements');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        Alert.alert('Error', updateError.message || 'Failed to set password');
        setIsSubmitting(false);
        return;
      }
      Alert.alert('Success', 'Your password has been set successfully', [
        { text: 'OK', onPress: () => router.replace('/(tabs)') },
      ]);
    } catch {
      Alert.alert('Error', 'An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Lock size={32} color={Colors.primary.blue} />
          </View>
          <Text style={styles.title}>Set Your Password</Text>
          <Text style={styles.subtitle}>Create a secure password for your account</Text>
        </View>

        <View style={styles.form}>
          <AppInput
            label="New Password"
            placeholder="Enter new password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            icon={<Lock size={20} color={Colors.gray.icon} />}
          />

          <AppInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            icon={<Lock size={20} color={Colors.gray.icon} />}
          />

          <View style={styles.requirements}>
            {requirements.map((req) => (
              <View key={req.id} style={styles.requirementItem}>
                <View style={[styles.checkIcon, req.valid && styles.checkIconValid]}>
                  <Check size={12} color={Colors.white} />
                </View>
                <Text style={[styles.requirementText, req.valid && styles.requirementTextValid]}>
                  {req.label}
                </Text>
              </View>
            ))}
          </View>

          <AppButton
            title="Set Password"
            onPress={handleSetPassword}
            disabled={!allValid}
            loading={isSubmitting}
            fullWidth
            style={styles.submitButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary.blue + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray.text,
    textAlign: 'center',
  },
  form: {
    marginBottom: 24,
  },
  requirements: {
    marginTop: 16,
    gap: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.gray.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkIconValid: {
    backgroundColor: Colors.success,
  },
  requirementText: {
    fontSize: 14,
    color: Colors.gray.text,
  },
  requirementTextValid: {
    color: Colors.success,
  },
  submitButton: {
    marginTop: 32,
  },
});
