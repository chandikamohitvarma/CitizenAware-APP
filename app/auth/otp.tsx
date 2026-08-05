import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { safeStorage } from '@/lib/safeStorage';
import { Mail, Phone, ShieldCheck, RefreshCw, CircleCheck as CheckCircle } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { Header } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';

const RESEND_COOLDOWN = 30; // seconds

export default function OTPScreen() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [targetIdentifier, setTargetIdentifier] = useState('');
  const [isPhone, setIsPhone] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [localError, setLocalError] = useState('');

  const inputRefs = useRef<Array<TextInput | null>>([]);
  const successScale = useRef(new Animated.Value(0)).current;
  const shakeAnim   = useRef(new Animated.Value(0)).current;
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);

  const { verifyOTP, sendOTP, isLoading, error, clearError, otpTarget } = useAuthStore();

  // ── Load target on mount ────────────────────────────────────────────────────
  useEffect(() => {
    const loadTarget = async () => {
      const stored =
        otpTarget ||
        (await safeStorage.getItem('citizenaware_otp_target')) ||
        (await safeStorage.getItem('citizenaware_password_reset_email')) ||
        '';
      setTargetIdentifier(stored);
      setIsPhone(stored ? !stored.includes('@') : false);
    };
    loadTarget();
    startCountdown();
    // Focus first input
    setTimeout(() => inputRefs.current[0]?.focus(), 300);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // ── Countdown timer ─────────────────────────────────────────────────────────
  const startCountdown = useCallback(() => {
    setCanResend(false);
    setCountdown(RESEND_COOLDOWN);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── Shake animation on error ────────────────────────────────────────────────
  const shakeInputs = () => {
    Vibration.vibrate(100);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6,  duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,  duration: 60, useNativeDriver: true }),
    ]).start();
  };

  // ── Success animation ────────────────────────────────────────────────────────
  const showSuccessAnimation = () => {
    Animated.spring(successScale, {
      toValue: 1,
      friction: 5,
      tension: 80,
      useNativeDriver: true,
    }).start();
  };

  // ── OTP input handlers ──────────────────────────────────────────────────────
  const handleChange = (text: string, index: number) => {
    setLocalError('');
    clearError();

    const clean = text.trim();

    // Handle paste of 6 digits
    if (clean.length >= 6 && /^\d+$/.test(clean)) {
      const digits = clean.slice(0, 6).split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
      // Auto-submit after paste
      setTimeout(() => handleVerify(digits), 200);
      return;
    }

    const digit = clean.slice(-1);
    if (digit && !/^\d$/.test(digit)) return; // only allow digits

    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-advance to next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are filled
    if (digit && index === 5) {
      const complete = [...newOtp];
      complete[index] = digit;
      if (complete.every((d) => d !== '')) {
        setTimeout(() => handleVerify(complete), 150);
      }
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ── Verify ──────────────────────────────────────────────────────────────────
  const handleVerify = async (currentOtp?: string[]) => {
    const otpDigits = currentOtp || otp;
    const otpCode   = otpDigits.join('');

    if (otpCode.length !== 6 || otpDigits.some((d) => d === '')) {
      setLocalError('Please enter the complete 6-digit verification code.');
      shakeInputs();
      return;
    }

    const success = await verifyOTP(otpCode);

    if (success) {
      setVerifySuccess(true);
      showSuccessAnimation();
      setTimeout(() => router.replace('/auth/set-password'), 1200);
    } else {
      shakeInputs();
      // Clear OTP boxes on wrong code so user can re-enter
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  // ── Resend OTP ──────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!canResend || isResending || !targetIdentifier) return;

    setIsResending(true);
    setLocalError('');
    clearError();
    setOtp(['', '', '', '', '', '']);

    try {
      const result = await sendOTP(targetIdentifier);
      if (result.success) {
        startCountdown();
        setTimeout(() => inputRefs.current[0]?.focus(), 200);
      } else if (result.cooldown_remaining) {
        // Backend told us there's still a cooldown
        setCountdown(result.cooldown_remaining);
        setCanResend(false);
        startCountdown();
        setLocalError(result.message || `Please wait before resending.`);
      } else {
        setLocalError(result.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (err: any) {
      setLocalError(err?.message || 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  // ── Derived display error ────────────────────────────────────────────────────
  const displayError = localError || error || '';

  // ── Render ─────────────────────────────────────────────────────────────────
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

        {/* ── Title ── */}
        <Text style={styles.title}>Enter Verification Code</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.targetText}>{targetIdentifier || 'your registered contact'}</Text>
        </Text>

        {/* ── Info card ── */}
        <View style={styles.infoCard}>
          <View style={styles.infoIconBox}>
            {isPhone
              ? <Phone size={20} color="#2563EB" />
              : <Mail  size={20} color="#2563EB" />}
          </View>
          <View style={styles.infoTextBox}>
            <Text style={styles.infoTitle}>
              {isPhone ? 'Check Your SMS' : 'Check Your Email Inbox'}
            </Text>
            <Text style={styles.infoSub}>
              {isPhone
                ? 'Check your messages for the 6-digit OTP.'
                : 'Check your inbox (or spam/junk folder) for the 6-digit code.'}
            </Text>
          </View>
        </View>

        {/* ── Success overlay ── */}
        {verifySuccess && (
          <Animated.View style={[styles.successBox, { transform: [{ scale: successScale }] }]}>
            <CheckCircle size={28} color={Colors.success} />
            <Text style={styles.successText}>Verification Successful!</Text>
          </Animated.View>
        )}

        {/* ── OTP input boxes ── */}
        {!verifySuccess && (
          <Animated.View
            style={[styles.otpContainer, { transform: [{ translateX: shakeAnim }] }]}
          >
            {otp.map((digit, index) => {
              const isFocused = false; // managed by native focus
              const hasError  = !!displayError && !digit;
              return (
                <TextInput
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  style={[
                    styles.otpInput,
                    digit    && styles.otpInputFilled,
                    hasError && styles.otpInputError,
                  ]}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={6}
                  selectionColor={Colors.primary.blue}
                  textContentType="oneTimeCode"
                  autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
                />
              );
            })}
          </Animated.View>
        )}

        {/* ── Error message ── */}
        {displayError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{displayError}</Text>
          </View>
        ) : null}

        {/* ── Verify button ── */}
        {!verifySuccess && (
          <TouchableOpacity
            style={[
              styles.verifyBtn,
              (isLoading || otp.join('').length !== 6) && styles.verifyBtnDisabled,
            ]}
            onPress={() => handleVerify()}
            disabled={isLoading || otp.join('').length !== 6}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <ShieldCheck size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.verifyBtnText}>Verify Code</Text>
              </>
            )}
          </TouchableOpacity>
        )}

        {/* ── Resend section ── */}
        {!verifySuccess && (
          <View style={styles.resendContainer}>
            {canResend ? (
              <TouchableOpacity
                style={styles.resendBtn}
                onPress={handleResend}
                disabled={isResending}
                activeOpacity={0.75}
              >
                {isResending ? (
                  <ActivityIndicator size="small" color={Colors.primary.blue} />
                ) : (
                  <>
                    <RefreshCw size={15} color={Colors.primary.blue} />
                    <Text style={styles.resendBtnText}>Resend Code</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.countdownRow}>
                <Text style={styles.resendText}>Resend code in </Text>
                <View style={styles.countdownBadge}>
                  <Text style={styles.countdownText}>{countdown}s</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Security note ── */}
        {!verifySuccess && (
          <Text style={styles.securityNote}>
            🔒 Code expires in 5 minutes · Max 5 attempts
          </Text>
        )}
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
    paddingTop: 28,
  },

  // Title
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.gray.text,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  targetText: {
    fontWeight: '700',
    color: Colors.primary.blue,
  },

  // Info card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
  },
  infoIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTextBox: { flex: 1 },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E40AF',
    marginBottom: 2,
  },
  infoSub: {
    fontSize: 12,
    color: '#3B82F6',
    lineHeight: 16,
  },

  // Success
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: Colors.success + '15',
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: Colors.success + '40',
  },
  successText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.success,
  },

  // OTP boxes
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  otpInput: {
    width: 48,
    height: 58,
    backgroundColor: Colors.white,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    fontSize: 24,
    fontWeight: '800',
    color: Colors.dark,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  otpInputFilled: {
    borderColor: Colors.primary.blue,
    backgroundColor: '#EFF6FF',
    shadowColor: Colors.primary.blue,
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  otpInputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.error + '08',
  },

  // Error
  errorBox: {
    backgroundColor: Colors.error + '10',
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },

  // Verify button
  verifyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary.blue,
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 20,
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  verifyBtnDisabled: {
    opacity: 0.5,
    shadowOpacity: 0,
    elevation: 0,
  },
  verifyBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },

  // Resend
  resendContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: Colors.primary.blue + '10',
    borderWidth: 1.5,
    borderColor: Colors.primary.blue + '30',
  },
  resendBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.primary.blue,
  },
  countdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  resendText: {
    fontSize: 14,
    color: Colors.gray.text,
  },
  countdownBadge: {
    backgroundColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  countdownText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.dark,
  },

  // Security note
  securityNote: {
    fontSize: 12,
    color: Colors.gray.icon,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
  },
});
