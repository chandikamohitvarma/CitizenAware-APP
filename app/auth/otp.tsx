import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { KeyRound, Sparkles, CheckCircle2 } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { AppButton, Header } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { requestPasswordReset } from '@/lib/api';

const RESET_EMAIL_KEY = 'citizenaware_password_reset_email';

export default function OTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [targetEmail, setTargetEmail] = useState('your email address');
  const [currentOtp, setCurrentOtp] = useState('654321');
  const { verifyOTP, isLoading, error } = useAuthStore();
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    AsyncStorage.getItem(RESET_EMAIL_KEY).then(async (email) => {
      if (email) {
        setTargetEmail(email);
        let stored = await AsyncStorage.getItem(`citizenaware_otp_${email}`);
        if (!stored) {
          stored = Math.floor(100000 + Math.random() * 900000).toString();
          await AsyncStorage.setItem(`citizenaware_otp_${email}`, stored);
        }
        setCurrentOtp(stored);
      }
    });
  }, []);

  const handleChange = (text: string, index: number) => {
    const cleanText = text.trim();

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

    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFill = () => {
    const digits = currentOtp.split('');
    setOtp(digits);
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

  const handleResend = async () => {
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    if (targetEmail) {
      await AsyncStorage.setItem(`citizenaware_otp_${targetEmail}`, newCode);
      requestPasswordReset(targetEmail, newCode).catch(() => {});
    }
    setCurrentOtp(newCode);
    setOtp(newCode.split(''));
    Alert.alert(
      'New Verification Code',
      `Your new 6-digit verification code is: ${newCode}`
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Verify OTP"
        showBack
        onBackPress={() =>
          router.canGoBack() ? router.back() : router.replace('/auth/forgot-password')
        }
      />

      <View style={styles.content}>
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit verification code to {'\n'}
          <Text style={{ fontWeight: '700', color: Colors.primary.blue }}>{targetEmail}</Text>
        </Text>

        {/* ── OTP Code Display Card Banner ── */}
        <View style={styles.bannerCard}>
          <View style={styles.bannerHeader}>
            <KeyRound size={18} color="#2563EB" />
            <Text style={styles.bannerTitle}>Your Verification Code</Text>
          </View>
          <Text style={styles.bannerCode}>{currentOtp}</Text>
          <TouchableOpacity
            style={styles.autoFillBtn}
            onPress={handleAutoFill}
            activeOpacity={0.85}
          >
            <Sparkles size={14} color="#FFFFFF" />
            <Text style={styles.autoFillText}>Tap to Auto-fill Code</Text>
          </TouchableOpacity>
        </View>

        {/* ── 6 Digit Input Boxes ── */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
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
            <Text style={styles.resendLink}>Resend Code</Text>
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
    paddingTop: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray.text,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },

  /* Code Banner Card */
  bannerCard: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 28,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  bannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E40AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  bannerCode: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1E3A8A',
    letterSpacing: 8,
    marginVertical: 4,
  },
  autoFillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#2563EB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 8,
  },
  autoFillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
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
    marginBottom: 20,
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
    fontWeight: '700',
    color: Colors.primary.blue,
  },
});
