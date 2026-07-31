import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';
import { AppButton, Header } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

const RESET_EMAIL_KEY = 'citizenaware_password_reset_email';

export default function OTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [targetEmail, setTargetEmail] = useState('your email address');
  const { verifyOTP, isLoading, error } = useAuthStore();
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    AsyncStorage.getItem(RESET_EMAIL_KEY).then((email) => {
      if (email) setTargetEmail(email);
    });
  }, []);

  const handleChange = (text: string, index: number) => {
    const cleanText = text.trim();

    // If user pastes full 6 digit code
    if (cleanText.length >= 6 && /^\d+$/.test(cleanText)) {
      const digits = cleanText.slice(0, 6).split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      return;
    }

    const digit = cleanText.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto advance to next box if digit entered
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP code');
      return;
    }
    const success = await verifyOTP(otpCode);
    if (success) {
      router.replace('/auth/set-password');
    }
  };

  const handleResend = () => {
    Alert.alert('Verification Code Sent', `A new 6-digit verification code has been sent to ${targetEmail}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Verify OTP" showBack onBackPress={() => (router.canGoBack() ? router.back() : router.replace('/auth/forgot-password'))} />

      <View style={styles.content}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit verification code to {'\n'}
          <Text style={{ fontWeight: '700', color: Colors.primary.blue }}>{targetEmail}</Text>
        </Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              style={styles.otpInput}
              value={digit}
              onChangeText={(text) => handleChange(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={6}
              selectionColor={Colors.primary.blue}
            />
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <AppButton
          title="Verify"
          onPress={handleVerify}
          loading={isLoading}
          fullWidth
          style={styles.verifyButton}
        />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Didn't receive the code? </Text>
          <TouchableOpacity onPress={handleResend}>
            <Text style={styles.resendLink}>Resend</Text>
          </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.gray.text,
    textAlign: 'center',
    marginBottom: 40,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 56,
    backgroundColor: Colors.white,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    fontSize: 22,
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  verifyButton: {
    marginBottom: 24,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  resendText: {
    fontSize: 14,
    color: Colors.gray.text,
  },
  resendLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary.blue,
  },
});
